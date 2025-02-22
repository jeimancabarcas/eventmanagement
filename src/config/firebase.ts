import { initializeApp, cert, getApps, ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import * as dotenv from "dotenv";

// Carga variables de entorno
dotenv.config();

const firebaseConfigString = process.env.FIREBASE_CONFIG_ACCOUNT || "{}";

const firebaseConfig = JSON.parse(firebaseConfigString)as ServiceAccount;

// Evita inicializar Firebase más de una vez
if (!getApps().length) {
  initializeApp(firebaseConfig)
}

// Exporta Firestore y Auth
export const db = getFirestore();
export const auth = getAuth();

//import * as admin from "firebase-admin";
//import { getFirestore } from "firebase-admin/firestore";
//import "dotenv/config";
//
////const serviceAccount = {
////  projectId: process.env.FIREBASE_PROJECT_ID,
////  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
////  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
////};
//const firebaseConfigString = process.env.FIREBASE_CONFIG_ACCOUNT;
//if (!firebaseConfigString) {
//  throw new Error('Undefine var');
//}
//const firebaseConfig = (JSON.parse(firebaseConfigString) as admin.ServiceAccount);
//admin.initializeApp(firebaseConfig);
//export const db = getFirestore();
//export const Auth = admin.auth();
