import { createContext } from "react";

const AuthContext = createContext({
  user: null,
  claims: [],
});
export default AuthContext;
