const Handlebars = require("handlebars");
import { SendEmailCommand } from "@aws-sdk/client-ses";
import { sesClient } from "../../lib/ses_sendemail";

export default async function handler(req, res) {
  const { to, textContent, htmlContent, subject, emailData } = req.body;

  const bodyHtml = Handlebars.compile(textContent)(emailData);
  const bodyText = Handlebars.compile(htmlContent)(emailData);

  // Setting email params
  const params = {
    Destination: {
      CcAddresses: [],
      ToAddresses: to,
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: bodyHtml,
        },
        Text: {
          Charset: "UTF-8",
          Data: bodyText,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
    },
    Source: "support@darshandev.tech",
    ReplyToAddresses: ["darshan@darshandev.tech"],
  };
  try {
    await sesClient.send(new SendEmailCommand(params));
    console.log("sent transac mail");
    res.send({ email: to.join(", ") });
  } catch (err) {
    console.log("error in send transac mail", err);
    res.send({ error: err });
  }
}
