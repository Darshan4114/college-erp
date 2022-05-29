import {
  getFirestore,
  query,
  where,
  collection,
  onSnapshot,
  orderBy,
} from "firebase/firestore";

import app from "../clientApp";

const db = getFirestore(app);

export default async function cMonitorChanges({
  collectionPath,
  conditions,
  orderings,
  callback,
}) {
  let q = query(collection(db, ...collectionPath));
  let queryParams = [];
  if (conditions instanceof Array && conditions.length > 0) {
    let conditionList = conditions.map((condition) => {
      if (!condition.field || !condition.operator || !condition.value) {
        return;
      }
      return where(condition?.field, condition?.operator, condition?.value);
    });
    queryParams = [...queryParams, ...conditionList];
  }
  if (orderings instanceof Array && orderings.length > 0) {
    let orderingList = orderings.map((ordering) => {
      if (!ordering.field) {
        return;
      }
      if (ordering.order) return orderBy(ordering?.field, ordering?.order);
      return orderBy(ordering?.field);
    });
    queryParams = [...queryParams, ...orderingList];
  }
  if (queryParams && queryParams.length)
    q = query(collection(db, ...collectionPath), ...queryParams);
  const unsubscribe = onSnapshot(q, (snapshot) => {
    callback(snapshot);
  });
  return unsubscribe;
}
