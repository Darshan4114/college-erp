import { getFirestore, doc, updateDoc } from "firebase/firestore";
import app from "../clientApp";

const db = getFirestore(app);

export default async function cUpdateDoc({ collectionPath, docId, docData }) {
  const docRef = await updateDoc(doc(db, ...collectionPath, docId), docData);
  return docRef;
}
