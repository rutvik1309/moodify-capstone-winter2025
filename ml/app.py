# app.py (Flask backend to serve ML model)
from flask import Flask, request, jsonify
import pickle
from sklearn.feature_extraction.text import CountVectorizer
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load model and vectorizer
model = pickle.load(open("emotion_model.pkl", "rb"))
vectorizer = pickle.load(open("emotion_vectorizer.pkl", "rb"))

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        text = data.get("text", "")
        if not text:
            return jsonify({"error": "No input text provided."}), 400

        X_input = vectorizer.transform([text])
        prediction = model.predict(X_input)[0]
        return jsonify({"mood": prediction})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5001, debug=True)
