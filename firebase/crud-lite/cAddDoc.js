import { getFirestore, addDoc, collection } from "firebase/firestore/lite";
import app from "../clientApp";

const db = getFirestore(app);

export default async function cAddDoc({ collectionPath, docData }) {
  const docRef = await addDoc(collection(db, ...collectionPath), docData);
  return docRef;
}
