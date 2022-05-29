var firebaseAdmin = require("firebase-admin");

var serviceAccount = require("YOUR_SERVICE_ACCOUNT_FILE");

if (!firebaseAdmin.apps.length) {
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
  });
}
export { firebaseAdmin };
