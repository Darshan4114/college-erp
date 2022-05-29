import {
  getFirestore,
  getDocs,
  collection,
  query,
  where,
  orderBy,
} from "firebase/firestore/lite";
import app from "../clientApp";

const db = getFirestore(app);

export default async function cGetDocs({
  collectionPath,
  conditions,
  orderByFields = [],
}) {
  // console.log("cpath = ", collectionPath);
  let q = query(collection(db, ...collectionPath));
  if (conditions instanceof Array && conditions.length > 0) {
    let conditionList = conditions.map((condition) => {
      if (!condition.field || !condition.operator || !condition.value) {
        return;
      }
      return where(condition?.field, condition?.operator, condition?.value);
    });
    // console.log("conditions inside =", conditions);
    if (conditionList.length > 1 && !orderByFields.length) {
      throw new Error(
        "orderByFields arg is required for queries with more than 1 where clause."
      );
    }

    try {
      if (orderByFields.length) {
        q = query(
          collection(db, ...collectionPath),
          ...conditionList,
          orderBy(...orderByFields)
        );
      } else {
        q = query(collection(db, ...collectionPath), ...conditionList);
      }

      // console.log("getDocs query,", q);
    } catch (e) {
      console.log("cGetDocs err", e);
    }
  }
  try {
    const docsSnap = await getDocs(q);
    return docsSnap.docs.map((doc) => {
      return { id: doc.id, ...doc.data() };
    });
  } catch (err) {
    console.log("getDocs error: ", err);
  }
}
