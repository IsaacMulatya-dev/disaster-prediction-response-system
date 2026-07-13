import joblib
import os

def load_model_and_vectorizer():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    model_path = os.path.join(base_dir, "data_models", "model.pkl")
    vectorizer_path = os.path.join(base_dir, "data_models", "vectorizer.pkl")

    model = joblib.load(model_path)
    vectorizer = joblib.load(vectorizer_path)

    return model, vectorizer

def predict_email(text, model, vectorizer):
    features = vectorizer.transform([text])
    prediction = model.predict(features)[0]
    return prediction

def predict_batch(text_list, model, vectorizer):
    features = vectorizer.transform(text_list)
    predictions = model.predict(features)
    return predictions
