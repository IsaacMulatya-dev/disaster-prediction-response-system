import os

path = r'C:\Users\John Muhia\Downloads\Video\phishing-detector\credentials.json'

print("Exists:", os.path.exists(path))
print("Absolute path is valid:", os.path.isabs(path))
print("Is file:", os.path.isfile(path))
