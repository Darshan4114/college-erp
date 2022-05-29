import { getFirestore, doc, updateDoc } from "firebase/firestore/lite";
import app from "../clientApp";

const db = getFirestore(app);

export default async function cUpdateDoc({ collectionPath, docId, docData }) {
  if (!docId) {
    docId = docData.id;
  }
  const docRef = await updateDoc(doc(db, ...collectionPath, docId), docData);
  return docRef;
}
