import { getFirestore, doc, getDoc } from "firebase/firestore/lite";
import app from "../clientApp";

const db = getFirestore(app);

export default async function cGetDoc({ collectionPath, docId }) {
  const docRef = doc(db, ...collectionPath, docId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    return null;
  }
}
