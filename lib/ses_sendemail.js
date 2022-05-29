import { SESClient } from "@aws-sdk/client-ses";
// Set the AWS Region.
const REGION = "us-east-2"; //e.g. "us-east-1"
// Create SES service object.
const sesClient = new SESClient({
  region: REGION,
  apiVersion: "latest",
  credentials: {
    accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
  },
});
export { sesClient };
