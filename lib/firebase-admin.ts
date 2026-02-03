import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

function getPrivateKey() {
  const raw = process.env.FIREBASE_PRIVATE_KEY;
  if (!raw) return "";
  return raw.replace(/\\n/g, "\n");
}

function ensureFirebaseConfig() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = getPrivateKey();
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

  if (!projectId || !clientEmail || !privateKey || !storageBucket) {
    throw new Error("Firebase environment variables are missing.");
  }

  return { projectId, clientEmail, privateKey, storageBucket };
}

export function getFirebaseAdmin() {
  if (!getApps().length) {
    const { projectId, clientEmail, privateKey, storageBucket } = ensureFirebaseConfig();
    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
      storageBucket,
    });
  }

  const app = getApp();
  return {
    auth: getAuth(app),
    firestore: getFirestore(app),
    storage: getStorage(app),
  };
}
