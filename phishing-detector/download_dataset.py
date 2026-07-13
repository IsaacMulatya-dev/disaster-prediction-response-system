from kaggle.api.kaggle_api_extended import KaggleApi

# Authenticate with the API
api = KaggleApi()
api.authenticate()

# Dataset you want to download
dataset_id = "naserabdullahalam/phishing-email-dataset"

# Download and unzip it to data_raw folder
api.dataset_download_files(dataset_id, path="data_raw", unzip=True)

print("✅ Dataset downloaded and extracted to data_raw/")
