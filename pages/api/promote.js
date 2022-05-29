import { firebaseAdmin } from "../../firebase/adminApp";
export default async function handler(req, res) {
  const { uid, desg } = req.body;
  console.log("handling, promote", uid, desg);
  // Get user claims
  const user = await firebaseAdmin.auth().getUser(uid);
  let claims = {};
  claims[desg] = true;
  console.log("claims = ", claims);
  firebaseAdmin.auth().setCustomUserClaims(uid, claims);
  res.send({ uid: uid, desg: desg });
  return;
}
