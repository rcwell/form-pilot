import { defineFirestoreRetriever } from "@genkit-ai/firebase";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { ai, embedder } from "../ai";

const app = initializeApp({
  projectId: process.env.FIREBASE_PROJECT_ID,
  credential: cert("./serviceAccountKey.json"),
});

const firestore = getFirestore(app);

const indexConfig = {
  contentField: "text",
  vectorField: "embedding",
  collection: "vector_forms",
  rawCollection: "forms",
  embedder,
};

const retriever = defineFirestoreRetriever(ai, {
  embedder,
  firestore,
  name: "vectorRetriever",
  distanceMeasure: "COSINE",
  metadataFields: ["domain"],
  collection: indexConfig.collection,
  vectorField: indexConfig.vectorField,
  // contentField: indexConfig.contentField,
  contentField(snap) {
    const { [indexConfig.contentField]: objectId, timestamp } = snap.data();
    return [
      {
        text: objectId,
      },
      {
        text: `${timestamp.toMillis()}`,
      },
    ];
  },
});

export { retriever, firestore, indexConfig };
