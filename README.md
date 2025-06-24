# 💡 FormPilot

[![Node.js](https://img.shields.io/badge/Node.js-20%2B-brightgreen?logo=node.js&logoColor=white)](https://nodejs.org) [![Firebase](https://img.shields.io/badge/Firebase-Firestore-yellow?logo=firebase&logoColor=white)](https://firebase.google.com) [![Gemini API Docs](https://img.shields.io/badge/Gemini-gemini.2.5.flash-blue?logo=googlegemini&logoColor=white)](https://ai.google.dev/gemini-api/docs) [![Genkit](https://img.shields.io/badge/Genkit-googleai-purple)](https://github.com/genkit-dev/genkit)

**FormPilot** is an intelligent Genkit-powered agent setup that auto-fills form fields using Google Gemini and a RAG architecture with Firebase for vector search. It streamlines data entry for forms like reports, applications, and internal submissions — by retrieving relevant past examples and generating context-aware suggestions.

---

## 🚀 Features

- 🔁 Retrieval-augmented generation with Gemini 1.5 Flash
- 🔍 Fetch relevant prior forms for context
- ⚡ Gemini + Genkit + Firebase powered workflow
- 🌱 Designed to be adaptive — learn from saved forms over time

---

## 📙 Requirements

Before starting, make sure you have the following:

- Node.js 20+
- Firebase project (Firestore + Service Account Key)
- Gemini API key
- GCP CLI
- Genkit CLI

---

## ⚙️ .env Setup

Create a `.env` file at the root with the following:

```env
GEMINI_API_KEY=your_google_gemini_api_key
FIREBASE_PROJECT_ID=your_firebase_project_id
```

---

## 🔐 Firestore Setup

You’ll need a Firebase service account key to use Firestore.

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Navigate to **Project Settings > Service Accounts**
3. Click **Generate new private key**
4. Download the JSON file and rename/save it as `serviceAccountKey.json` in your project root

---

## 📜 Scripts

| Command         | Description                               |
| --------------- | ----------------------------------------- |
| `npm install`   | Install dependencies                      |
| `npm run dev`   | Start Genkit in dev mode with live reload |


## 📝 License

ISC
