from flask import Flask, request, jsonify
import numpy as np
import joblib
import traceback
import os
from flask_cors import CORS
app = Flask(__name__)
CORS(app) 
# Load saved files
model = joblib.load(r"C:\Users\Noor Mustafa Chohan\Documents\PROJECTS\Wisconsin Breast Cancer\backend\best_model.pkl")
scaler = joblib.load(r"C:\Users\Noor Mustafa Chohan\Documents\PROJECTS\Wisconsin Breast Cancer\backend\scaler.pkl")

# Load label encoder if exists
try:
    le = joblib.load(r"C:\Users\Noor Mustafa Chohan\Documents\PROJECTS\Wisconsin Breast Cancer\backend\label_encoder.pkl")
    label_encoding = True
except:
    label_encoding = False

@app.route("/")
def home():
    return "Breast Cancer Prediction API is running!"

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        features = np.array(data["features"]).reshape(1, -1)

        # Scale features
        features_scaled = scaler.transform(features)

        # Model prediction
        prediction = model.predict(features_scaled)

        # Decode label
        if label_encoding:
            prediction = le.inverse_transform(prediction)

        return jsonify({"prediction": str(prediction[0])})

    except Exception as e:
        return jsonify({"error": str(e), "trace": traceback.format_exc()})
    

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
