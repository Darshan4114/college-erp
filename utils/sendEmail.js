import { toast } from "react-toastify";
import { toastOptions } from "../components/constants";
export default async function sendEmail({
  to,
  subject,
  textContent,
  htmlContent,
  emailData,
  successMsg = "Sent email!",
  failureMsg = "Error while sending email",
}) {
  console.log("subject in sendEmail", subject);
  fetch("/api/sendTransacEmail", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to,
      textContent,
      htmlContent,
      subject,
      emailData,
    }),
  })
    .then((res) => res.json())
    .then((res) => {
      toast.success(successMsg, toastOptions);
    })
    .catch((err) => {
      console.log("Error in sendEmail ", err);
      toast.error(failureMsg, toastOptions);
    });
}
