import sys, joblib
model, vectorizer = joblib.load("mood_classifier.pkl")
input_text = sys.argv[1]
X = vectorizer.transform([input_text])
pred = model.predict(X)
print(pred[0])
