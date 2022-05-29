import { getFirestore, doc, deleteDoc } from "firebase/firestore";
import app from "../clientApp";

const db = getFirestore(app);

export default async function cDeleteDoc(collectionPath, docId) {
  console.log("deleting doc, ", collectionPath, docId);
  const res = await deleteDoc(doc(db, ...collectionPath, docId));
  console.log("res = ", res);
  return;
}
