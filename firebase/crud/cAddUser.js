import { getFirestore, doc, setDoc } from "firebase/firestore";
import app from "../clientApp";
const db = getFirestore(app);
export default async function addUser(userId, userData) {
  return await setDoc(doc(db, "users", userId), userData);
}
