def save_model(model, vectorizer, model_path="../data_models/model.pkl", vectorizer_path="../data_models/vectorizer.pkl"):
    import os
    os.makedirs("../data_models", exist_ok=True)
    import joblib
    joblib.dump(model, model_path)
    joblib.dump(vectorizer, vectorizer_path)
