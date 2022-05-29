import { Timestamp } from "firebase/firestore/lite";

/**
 * @description This utility scans array of objects for timestamps of structure {seconds:... , }
 * and replaces them with Firebase Timestamp objects.
 */

export default function secondsToFirebaseTimestamp(objArr) {
  return objArr.map((obj) => {
    for (const prop in obj) {
      if (obj[prop] && obj[prop].seconds) {
        obj[prop] = Timestamp.fromDate(new Date(obj[prop].seconds * 1000));
      }
    }
    return obj;
  });
}
