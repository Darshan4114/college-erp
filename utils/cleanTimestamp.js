/**
 * @description This utility scans array of objects for timestamps of structure {seconds:... , nanoseconds:... }
 * and replaces them with date strings. This helps us use the array to map to react components
 */

export default function cleanTimestamp(
  objArr,
  stringType = "date",
  datename,
  timename
) {
  if (!objArr || !typeof objArr === "Array" || !objArr.length) return [];
  return objArr.map((obj) => {
    for (const prop in obj) {
      if (obj[prop] && obj[prop].seconds) {
        if (stringType === "date") {
          obj[prop] = new Date(obj[prop].seconds * 1000).toDateString();
        } else if (stringType === "datetime") {
          obj[prop] = new Date(obj[prop].seconds * 1000).toString();
        } else if (stringType === "datetimeLocal") {
          obj[prop]["date"] = new Date(obj[prop].seconds * 1000)
            .toLocaleString()
            .split(",")[0]
            .toString();
          const timeString = new Date(obj[prop].seconds * 1000)
            .toLocaleString("en-IN", {
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            })
            .toUpperCase();
          const paddedHours = timeString.split(":")[0].padStart(2, "0");
          obj[prop]["time"] = paddedHours + ":" + timeString.split(":")[1];
          console.log("TIME = ", obj[prop]["time"]);
          obj[prop]["dateTime"] = obj[prop]["date"] + " " + obj[prop]["time"];
          // delete obj[prop]["seconds"];
          // delete obj[prop]["nanoseconds"];
        } else if (stringType === "datetimeDmt12h") {
          const date = new Date(obj[prop].seconds * 1000)
            .toDateString()
            .slice(0, -4);
          let time = new Date(obj[prop].seconds * 1000).toLocaleString(
            "en-IN",
            {
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            }
          );
          obj[prop] = date + time;
        }
      }
    }
    return obj;
  });
}
