import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import "dotenv/config";

const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/^"|"$/g, '');
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey
};
console.log("Original", process.env.FIREBASE_PRIVATE_KEY)
console.log("Formatted", privateKey)
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
export const db = getFirestore();
export const auth = admin.auth();
