import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore/lite";
import app from "../clientApp";

const db = getFirestore(app);

export async function addUser(userId, userData) {
  return await setDoc(doc(db, "users", userId), userData);
}

export async function updateUser(userId, userData) {
  const docRef = await updateDoc(doc(db, "users", userId), userData);
  return docRef;
}

export async function getUser(userId) {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return { id: userSnap.id, ...userSnap.data() };
  } else {
    return null;
  }
}
