import streamlit as st
import os
import sys
import base64
from datetime import datetime
from bs4 import BeautifulSoup
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
import pandas as pd
import re
import io
import magic
import PyPDF2
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from difflib import SequenceMatcher
import tldextract

sys.path.append("src")
from data_preprocessing import clean_email_text
from predict import load_model_and_vectorizer

model, vectorizer = load_model_and_vectorizer()
SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

known_domains = ["paypal.com", "apple.com", "amazon.com", "microsoft.com", "google.com"]

st.set_page_config(page_title="Phishing Email Detector", layout="centered")

if "emails" not in st.session_state:
    st.session_state.emails = []
    st.session_state.predictions = []

def authenticate_gmail():
    creds = None
    credentials_path = os.path.join("src", "credentials.json")
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(credentials_path, SCOPES)
            creds = flow.run_local_server(port=0)
        with open('token.json', 'w') as token:
            token.write(creds.to_json())
    return creds

def extract_domain(sender):
    match = re.search(r"<([^>]+)>", sender)
    email = match.group(1) if match else sender
    ext = tldextract.extract(email)
    domain = f"{ext.domain}.{ext.suffix}".lower() if ext.suffix else ext.domain.lower()
    return domain

def is_similar(a, b, threshold=0.8):
    return SequenceMatcher(None, a, b).ratio() > threshold

def check_domain(domain):
    for legit in known_domains:
        if domain == legit:
            return "✔️ Trusted Domain"
        if is_similar(domain, legit):
            return f"⚠️ Suspicious: Looks like {legit}"
    return "❓ Unknown Domain"

def extract_urls(text):
    url_regex = r"https?://[^\s]+"
    return re.findall(url_regex, text)

def check_urls(urls):
    suspicious = []
    for url in urls:
        domain = tldextract.extract(url)
        full_domain = f"{domain.domain}.{domain.suffix}".lower()
        for legit in known_domains:
            if full_domain == legit:
                continue
            if is_similar(full_domain, legit):
                suspicious.append((url, legit))
    return suspicious

def clean_html_content(html):
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script", "style", "head", "meta", "title", "link"]):
        tag.decompose()
    text = soup.get_text(separator="\n")
    lines = [line.strip() for line in text.splitlines()]
    return "\n".join(line for line in lines if line)

def decode_email_body(parts, payload):
    body = ""
    if parts:
        for part in parts:
            mime_type = part['mimeType']
            if mime_type == 'text/plain' and 'data' in part['body']:
                body = base64.urlsafe_b64decode(part['body']['data']).decode('utf-8')
                break
            elif mime_type == 'text/html' and 'data' in part['body']:
                html = base64.urlsafe_b64decode(part['body']['data']).decode('utf-8')
                body = clean_html_content(html)
                break
    elif 'data' in payload['body']:
        mime_type = payload.get('mimeType', '')
        if mime_type == 'text/plain':
            body = base64.urlsafe_b64decode(payload['body']['data']).decode('utf-8')
        elif mime_type == 'text/html':
            html = base64.urlsafe_b64decode(payload['body']['data']).decode('utf-8')
            body = clean_html_content(html)
    return body

def scan_attachments(parts, service, message_id):
    attachments_text = ""
    if parts:
        for part in parts:
            filename = part.get('filename')
            if filename:
                att_body = part.get('body', {})
                data = None
                if 'data' in att_body:
                    data = base64.urlsafe_b64decode(att_body['data'])
                elif 'attachmentId' in att_body:
                    try:
                        attachment = service.users().messages().attachments().get(
                            userId='me', messageId=message_id, id=att_body['attachmentId']
                        ).execute()
                        data = base64.urlsafe_b64decode(attachment['data'])
                    except Exception as e:
                        st.warning(f"Could not fetch attachment: {filename} - {e}")
                        continue
                if data:
                    content_type = magic.from_buffer(data, mime=True)
                    if 'pdf' in content_type:
                        try:
                            pdf_reader = PyPDF2.PdfReader(io.BytesIO(data))
                            for page in pdf_reader.pages:
                                text = page.extract_text()
                                if text:
                                    attachments_text += text + "\n"
                        except Exception as e:
                            attachments_text += f"[Could not read PDF: {e}]\n"
                    elif 'text' in content_type or 'plain' in content_type:
                        attachments_text += data.decode('utf-8', errors='ignore') + "\n"
    return attachments_text

def fetch_recent_emails(max_results=50):
    creds = authenticate_gmail()
    service = build('gmail', 'v1', credentials=creds)
    results = service.users().messages().list(
        userId='me',
        labelIds=['INBOX'],
        maxResults=max_results
    ).execute()
    messages = results.get('messages', [])
    emails = []
    progress = st.progress(0)

    for i, msg in enumerate(messages):
        try:
            msg_data = service.users().messages().get(userId='me', id=msg['id'], format='full').execute()
            payload = msg_data['payload']
            headers = payload['headers']
            subject = next((h['value'] for h in headers if h['name'] == 'Subject'), "(No Subject)")
            sender = next((h['value'] for h in headers if h['name'] == 'From'), "(No Sender)")
            date = next((h['value'] for h in headers if h['name'] == 'Date'), "")
            try:
                parsed_date = datetime.strptime(date[:25], "%a, %d %b %Y %H:%M:%S")
                formatted_date = parsed_date.strftime("%Y-%m-%d %H:%M")
            except:
                formatted_date = date[:16]

            body = decode_email_body(payload.get('parts'), payload)
            attachment_text = scan_attachments(payload.get('parts'), service, msg['id'])

            emails.append({
                "subject": subject,
                "sender": sender,
                "date": formatted_date,
                "body": body[:2000],
                "attachment": attachment_text[:2000]
            })
        except Exception as e:
            st.warning(f"Could not process email: {e}")

        progress.progress((i + 1) / max_results)
    return emails

def cluster_emails(email_texts, n_clusters=3):
    tfidf = TfidfVectorizer(stop_words='english', max_features=1000)
    X = tfidf.fit_transform(email_texts)
    km = KMeans(n_clusters=n_clusters, random_state=42, n_init='auto')
    labels = km.fit_predict(X)
    return labels

st.title("📨 Phishing Email Detector")
st.markdown("Choose how many recent emails to fetch and analyze them for phishing.")

email_count = st.selectbox("How many emails to fetch?", [10, 25, 50, 100], index=2)

if st.button("Fetch Emails"):
    with st.spinner("Fetching emails..."):
        st.session_state.emails = fetch_recent_emails(email_count)
        st.success(f"Fetched {len(st.session_state.emails)} emails.")

if st.session_state.emails:
    subjects = [f"{i+1}. {email['subject']} — {email['sender']} — {email['date']}" for i, email in enumerate(st.session_state.emails)]
    selected = st.selectbox("Select an Email", subjects)
    index = subjects.index(selected)
    email = st.session_state.emails[index]
    full_text = email['body'] + "\n" + email['attachment']
    st.text_area("Email Body + Attachment", full_text, height=200, disabled=True)
    domain = extract_domain(email['sender'])
    domain_check = check_domain(domain)
    st.markdown(f"**Sender Domain Check**: {domain_check}")

    if st.button("Scan Selected Email"):
        cleaned = clean_email_text(full_text)
        vectorized = vectorizer.transform([cleaned])
        proba = model.predict_proba(vectorized)[0]
        confidence = round(max(proba) * 100, 2)
        label = model.predict(vectorized)[0]

        urls = extract_urls(full_text)
        suspicious_urls = check_urls(urls)
        if suspicious_urls:
            st.markdown("#### ⚠️ Suspicious Links Detected:")
            for link, similar in suspicious_urls:
                st.write(f"- {link} *(looks like {similar})*")
        else:
            st.markdown("✅ No suspicious URLs found.")

        result = {
            "Subject": email['subject'],
            "Sender": email['sender'],
            "Date": email['date'],
            "Prediction": "Phishing" if label == 1 else "Legit",
            "Confidence": f"{confidence}%",
            "Domain Check": domain_check
        }
        df = pd.DataFrame([result])
        st.dataframe(df)
        buffer = io.BytesIO()
        df.to_excel(buffer, index=False, engine='openpyxl')
        st.download_button(
            label="📅 Download Report (Excel)",
            data=buffer.getvalue(),
            file_name="single_email_report.xlsx",
            mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )

    if st.button("Scan All Fetched Emails"):
        results = []
        for e in st.session_state.emails:
            text = e['body'] + "\n" + e['attachment']
            cleaned = clean_email_text(text)
            vectorized = vectorizer.transform([cleaned])
            label = model.predict(vectorized)[0]
            proba = model.predict_proba(vectorized)[0]
            domain = extract_domain(e['sender'])
            results.append({
                "Subject": e['subject'],
                "Sender": e['sender'],
                "Date": e['date'],
                "Prediction": "Phishing" if label == 1 else "Legit",
                "Confidence": f"{round(max(proba)*100, 2)}%",
                "Domain Check": check_domain(domain)
            })
        df = pd.DataFrame(results)
        st.dataframe(df)
        buffer = io.BytesIO()
        df.to_excel(buffer, index=False, engine='openpyxl')
        st.download_button(
            label="📅 Download Report (Excel)",
            data=buffer.getvalue(),
            file_name="email_scan_report.xlsx",
            mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )

    st.markdown("### 📊 Cluster Similar Emails")
    if st.button("Cluster Emails"):
        all_texts = [email['body'] + "\n" + email['attachment'] for email in st.session_state.emails]
        clusters = cluster_emails(all_texts, n_clusters=3)
        df_cluster = pd.DataFrame({
            "Subject": [e["subject"] for e in st.session_state.emails],
            "Sender": [e["sender"] for e in st.session_state.emails],
            "Date": [e["date"] for e in st.session_state.emails],
            "Cluster": clusters
        })
        st.dataframe(df_cluster)
        buffer = io.BytesIO()
        df_cluster.to_excel(buffer, index=False, engine='openpyxl')
        st.download_button(
            label="📅 Download Clustering Report (Excel)",
            data=buffer.getvalue(),
            file_name="email_clusters.xlsx",
            mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )

st.markdown("---")
st.markdown("### 📝 Manual Email Input")
email_manual = st.text_area("Paste email content here")
if st.button("Scan Manual Email"):
    if email_manual.strip():
        cleaned = clean_email_text(email_manual)
        vectorized = vectorizer.transform([cleaned])
        proba = model.predict_proba(vectorized)[0]
        confidence = round(max(proba) * 100, 2)
        label = model.predict(vectorized)[0]
        if label == 1:
            st.error(f"🛑 Phishing Email Detected! (Confidence: {confidence}%)")
        else:
            st.success(f"✅ Legitimate Email (Confidence: {confidence}%)")
    else:
        st.warning("Please paste email content first.")
