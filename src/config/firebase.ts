import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import "dotenv/config";

if (!process.env.FIREBASE_PRIVATE_KEY) {
  throw new Error('FIREBASE_PRIVATE_KEY is not defined in the environment variables.');
}

console.log(process.env.FIREBASE_PRIVATE_KEY)
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/^"|"$/g, ''),
};
console.log(serviceAccount.privateKey)
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
export const db = getFirestore();
export const auth = admin.auth();
