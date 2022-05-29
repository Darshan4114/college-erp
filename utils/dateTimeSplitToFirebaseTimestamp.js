import { Timestamp } from "firebase/firestore/lite";

/**
 * @description This utility scans array of objects for timestamps of structure {date:... , time:... }
 * and replaces them with date + time strings. This helps us use the array to map to react components
 */

export default function dateTimeSplitToFirebaseTimestamp(objArr) {
  return objArr.map((obj) => {
    for (const prop in obj) {
      if (obj[prop] && obj[prop].date && obj[prop].time) {
        console.log("date time object", obj[prop].date, obj[prop].time);
        const day = obj[prop].date.slice(0, 2);
        const month = obj[prop].date.slice(3, 5);
        const year = obj[prop].date.slice(6, 10);
        const ampm = obj[prop].time.split(" ")[1];
        const hours = obj[prop].time
          .split(" ")[0]
          .split(":")[0]
          .padStart(2, "0");
        const minutes = obj[prop].time
          .split(" ")[0]
          .split(":")[1]
          .padStart(2, "0");
        const dateTimeString = `${year}-${month}-${day}T${hours}:${minutes}:00`;
        console.log("dateTimeString", dateTimeString);
        obj[prop] = Timestamp.fromDate(new Date(dateTimeString));
      }
    }
    return obj;
  });
}
