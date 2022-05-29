import { createContext, useState, useEffect } from "react";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import nookies from "nookies";
import jwt_decode from "jwt-decode";
import cGetDoc from "crud-lite/cGetDoc";

import app from "../firebase/clientApp";
import AuthContext from "./AuthContext";

const auth = getAuth(app);
//Storing auth state for long term, explicit sign out required
setPersistence(auth, browserLocalPersistence);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [claims, setClaims] = useState([]);
  const [userInDb, setUserInDb] = useState(null);

  useEffect(() => {
    // onIdTokenChanged is triggered when User is signed in or token is refreshed.
    const unsubscribe = auth.onIdTokenChanged(async (user) => {
      if (!user) {
        setUser(null);
        nookies.set(undefined, "token", "", { path: "/" });
      } else {
        const userInDb = await cGetDoc({
          collectionPath: ["users"],
          docId: user.uid,
        });
        setUserInDb(userInDb);

        setUser(user);
        const token = await user.getIdToken();
        const jwt = await jwt_decode(token);
        let claimList = [];

        if (jwt.admin === true) claimList.push("admin");
        if (jwt.coordinator === true) claimList.push("coordinator");

        if (jwt.caap === true) claimList.push("caap");
        if (jwt.student === true) claimList.push("student");
        setClaims(claimList);
        if (jwt.superadmin) claimList.push("superadmin");
        nookies.set(undefined, "token", token, { path: "/" });
      }
    });
    return unsubscribe;
  }, []);

  // force refresh the token every 10 minutes
  useEffect(() => {
    const handle = setInterval(async () => {
      const user = auth.currentUser;
      if (user) await user.getIdToken(true);
    }, 10 * 60 * 1000);

    // clean up setInterval
    return () => clearInterval(handle);
  }, []);

  return (
    <AuthContext.Provider value={{ user, claims, userInDb }}>
      {children}
    </AuthContext.Provider>
  );
}
