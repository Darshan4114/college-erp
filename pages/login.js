import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  sendSignInLinkToEmail,
  GoogleAuthProvider,
} from "firebase/auth";

import styled from "styled-components";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Button, FormControl, Input, InputLabel } from "@material-ui/core";

import app from "../firebase/clientApp";
import { toastOptions } from "../components/constants";
import Logo from "../components/Logo";
import cAddUser from "crud-lite/cAddUser";
import cGetDoc from "crud-lite/cGetDoc";
import cUpdateDoc from "crud-lite/cUpdateDoc";
import checkAuth from "util/checkAuth";

const googleProvider = new GoogleAuthProvider();

export const getServerSideProps = async (ctx) => {
  return checkAuth({ ctx });
};
const auth = getAuth(app);
auth.useDeviceLanguage();

function resendVerificationMail() {
  const actionCodeSettings = {
    // URL you want to redirect back to. The domain (www.example.com) for this
    // URL must be in the authorized domains list in the Firebase Console.
    // Requires https
    url: "https://localhost:3000/",
    // This must be true.
    handleCodeInApp: true,
    iOS: {
      bundleId: "com.example.ios",
    },
    android: {
      packageName: "com.example.android",
      installApp: true,
      minimumVersion: "12",
    },
    dynamicLinkDomain: "kabbie.page.link",
  };
  sendSignInLinkToEmail(
    auth,
    window.localStorage.getItem("email"),
    actionCodeSettings
  )
    .then(() => {
      const email = window.localStorage.getItem("email");
      toast.success(
        `Resent verification mail, please check your inbox ${email}`,
        toastOptions
      );
    })
    .catch((error) => {
      toast.error(`Error during sending sign in link ${error}`, toastOptions);
    });
}

const ResendVerificationMessage = ({ resendVerificationMail, email }) => {
  window.localStorage.setItem("email", email);
  return (
    <div>
      Please verify your email address. Verification mail sent to {email}
      <p>
        Didn&apos;t get the mail?
        <span>
          <button onClick={resendVerificationMail}> RESEND </button>
        </span>
      </p>
    </div>
  );
};

export default function Login({ loginRedirectUrl }) {
  //Instantiating router
  const router = useRouter();
  //Hook for storing user in local storage

  //Instantiating form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const signInWithGoogle = () => {
    signInWithPopup(auth, googleProvider)
      .then(async (result) => {
        console.log("GOOGLE user. ", result.user);
        // Creating user / Updating user
        const user = await cGetDoc({
          collectionPath: ["users"],
          docId: result.user.uid,
        });
        console.log("userfrom firebase,", user);
        if (user) {
          // await cUpdateDoc({
          //   collectionPath: ["users"],
          //   docId: result.user.uid,
          //   docData: {
          //     displayName: result.user.displayName,
          //     email: result.user.email,
          //     profilePicURL: result.user.photoURL,
          //     phone: result.user.phoneNumber,
          //   },
          // });
        } else {
          await cAddUser(result.user.uid, {
            displayName: result.user.displayName,
            email: result.user.email,
            profilePicURL: result.user.photoURL,
            phone: result.user.phoneNumber,
            status: "customer",
          });
        }
        // Redirecting after login
        if (loginRedirectUrl) {
          router.push(loginRedirectUrl);
        } else {
          router.push("/");
        }
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        toast.error(`${errorCode}, ${errorMessage}`, toastOptions);
      });
  };

  function onSubmit(data) {
    //Signing in
    signInWithEmailAndPassword(auth, data.email, data.password)
      .then((userCredential) => {
        const user = userCredential.user;
        //signing out if email not verified
        if (!user.emailVerified) {
          toast.error(
            <ResendVerificationMessage
              email={user.email}
              resendVerificationMail={resendVerificationMail}
            />,
            toastOptions
          );
          signOut(auth)
            .then(() => {
              router.push("/login");
            })
            .catch((error) => {
              toast.error(`Error during logout ${error}`, toastOptions);
            });
          return;
        }
        //Logged in successfully
        toast.success(`Logged in as ${user.displayName}`, toastOptions);
        //Redirecting after login
        if (loginRedirectUrl) {
          router.push(loginRedirectUrl);
        }
        router.push("/");
      })
      .catch((error) => {
        //Handling login errors
        const errorCode = error.code;
        //ERROR: wrong password
        if (errorCode === "auth/wrong-password") {
          toast.error(`Invalid Password ${error.message}`, toastOptions);
        }
        //ERROR: user not found
        if (errorCode === "auth/user-not-found") {
          toast.error(`User does not exist ${error.message}`, toastOptions);
        }
      });
  }

  return (
    <Container>
      <div className="logo">
        <Logo />
      </div>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <h1>Login </h1>
        <FormControl margin="normal">
          <InputLabel htmlFor="name">Email</InputLabel>
          <Input
            id="email"
            name="email"
            type="email"
            {...register("email", { required: true })}
          />
          {errors.email && "Email is required"}
        </FormControl>
        <FormControl margin="normal">
          <InputLabel htmlFor="info">Password</InputLabel>
          <Input
            id="password"
            name="password"
            type="password"
            {...register("password", { required: true })}
          />
          {errors.password && "Password is required"}
        </FormControl>
        <FormControl margin="normal">
          <button type="submit" value="submit">
            Login
          </button>
        </FormControl>
      </Form>{" "}
      <p>or login with</p>
      <div className="socialGroup">
        <button onClick={signInWithGoogle}>
          <Image
            src="/img/google.svg"
            height="28"
            width="28"
            alt="Google login"
          />{" "}
          <p>Google</p>
        </button>
      </div>
      <p style={{ textAlign: "center", marginBottom: "0.25em" }}>
        Don&apos;t have an account{" "}
        <span
          style={{ textDecoration: "underline", color: "var(--theme-primary)" }}
        >
          <Link href="/register"> Register </Link>
        </span>
      </p>
      <p style={{ textAlign: "center", marginBottom: "0.25em" }}>
        Forgot Password{" "}
        <span
          style={{ textDecoration: "underline", color: "var(--theme-primary)" }}
        >
          <Link href="/forgot-password"> Reset password </Link>
        </span>
      </p>
    </Container>
  );
}

const Container = styled.div`
  text-align: center;
  padding-bottom: 3em;
  width: 20rem;
  margin: 0 auto;

  .logo {
    width: 125px;
    margin: 4em auto 0;
  }
  .socialGroup {
    padding: 1em;
    button {
      position: relative;
      border: none;
      background: none;
      box-shadow: rgba(0, 0, 0, 0.02) 0px 1px 3px 0px,
        rgba(27, 31, 35, 0.15) 0px 0px 0px 1px;
      border-radius: 0.5em;
      cursor: pointer;
      display: flex;
      align-items: center;
      width: 100%;
      padding: 1em;
      font-weight: bold;
      p {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translateX(-50%) translateY(-50%);
      }
    }
  }
`;
const Form = styled.form`
  display: flex;
  flex-direction: column;
  max-width: 20rem;
  padding: 1em;
  margin: 1em auto 1em auto;
  border-radius: 0.5em;
  text-align: center;
  width: 20rem;
  h1 {
    font-size: 1.25rem;
  }
  button {
    background: var(--theme-primary);
    padding: 0.5em 0;
    font-size: 1.25rem;
    color: var(--theme-white);
    border: none;
    border-radius: 0.25em;
    cursor: pointer;
  }
`;
