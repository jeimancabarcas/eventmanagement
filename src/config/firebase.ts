import * as admin from "firebase-admin";
import "dotenv/config";

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  /* istanbul ignore next */
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  /* istanbul ignore next */
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  /* istanbul ignore next */
};
/* istanbul ignore next */
// 🔹 Verificar que `admin.apps` está definido antes de acceder a `length`
if (typeof admin.apps !== "undefined" && admin.apps.length === 0 && process.env.NODE_ENV !== "test") {
  /* istanbul ignore next */
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const db = admin.firestore();
export const Auth = admin.auth();
