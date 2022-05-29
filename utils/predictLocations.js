export default function predictLocations(textVal) {
  return new Promise(async (resolve, reject) => {
    const response = await fetch("/api/autosuggest", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ place: textVal }),
    });
    if (!response.ok) {
      const error = new Error("An error occurred while fetching the data.");
      // Attach extra info to the error object.
      error.info = await response.json();
      error.status = response.status;
      //   throw error;
      reject(error);
    }
    response.json().then((res) => {
      console.log("predictions response = ", res);
      const options = res.suggestions.predictions.map((loc) => ({
        label: loc.description,
        value: loc.place_id,
        ...loc,
      }));
      console.log("before resolve, ", options);
      resolve(options);
    });
  });
}
