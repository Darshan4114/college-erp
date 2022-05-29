import {
  getFirestore,
  getDocs,
  collection,
  query,
  where,
} from "firebase/firestore";
import app from "../clientApp";

const db = getFirestore(app);

export default async function cGetDocs({ collectionPath, conditions }) {
  let q = query(collection(db, ...collectionPath));
  if (conditions instanceof Array && conditions.length > 0) {
    let conditionList = conditions.map((condition) => {
      if (!condition.field || !condition.operator || !condition.value) {
        return;
      }
      return where(condition?.field, condition?.operator, condition?.value);
    });
    q = query(collection(db, ...collectionPath), ...conditionList);
  }
  const docsSnap = await getDocs(q);
  return docsSnap.docs.map((doc) => {
    return { id: doc.id, ...doc.data() };
  });
}
