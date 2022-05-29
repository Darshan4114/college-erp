import {
  getAuth,
  sendEmailVerification,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";
import Link from "next/link";
import styled from "styled-components";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
// import { Button, FormControl, Input, InputLabel } from "@material-ui/core";

import app from "../firebase/clientApp";
import cAddUser from "crud-lite/cAddUser";
import Header from "comp/Header";
import { toastOptions } from "comp/constants";
import Logo from "comp/Logo";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";

const auth = getAuth(app);

export default function Register() {
  //Initializing router
  const router = useRouter();
  //Initializing form from react-hook-forms
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  function onSubmit(data) {
    //Validating if passwords match
    if (data.password !== data.password2) {
      toast.error("Passwords don't match", toastOptions);
      return;
    }
    //Creating user with given email and password
    createUserWithEmailAndPassword(auth, data.email, data.password)
      .then((userCredential) => {
        //Registered user
        const user = userCredential.user;
        //Updating profile with given displayName
        updateProfile(user, {
          displayName: data.name,
          //put photo url
        });
        //Inserting user into firestore database
        cAddUser(user.uid, {
          displayName: data.name,
          email: data.email,
          status: "student",
          isDeleted: false,
        });

        //Sending email verification
        sendEmailVerification(user).then(() => {
          toast.success(
            `Verification mail sent to ${user.email}, please check your inbox`,
            toastOptions
          );
          //Firebase signs in user automatically after registration,
          //Since we want to verify the user's email before letting the user in, we log the user out
          signOut(auth)
            .then(() => {
              router.push("/login");
            })
            .catch((error) => {
              toast.error(`Error during logout ${error}`, toastOptions);
            });
        });
      })
      .catch((error) => {
        //Registration not successful, checking errorCode and toasting proper error
        const errorCode = error.code;
        //ERROR: Weak password.
        if (errorCode === "auth/weak-password") {
          toast.error(
            `Weak password. Minimum 6 characters required. ${error.message}`,
            toastOptions
          );
        }
        //ERROR: Email already in use.
        if (errorCode === "auth/email-already-in-use") {
          toast.error(
            `Email address already in use, please use another email address. ${error.message}`,
            toastOptions
          );
        }
      });
  }

  return (
    <Container>
      <div className="logo">
        <Logo />
      </div>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <h1>Register</h1>

        <FormControl margin="normal">
          <TextField
            id="name"
            name="name"
            type="name"
            label="Name"
            {...register("name", { required: true })}
          />
          {errors.name && "Name is required"}
        </FormControl>

        <FormControl margin="normal">
          <TextField
            id="phone"
            name="phone"
            type="phone"
            label="phone"
            {...register("phone", { required: true })}
          />
          {errors.phone && "Phone is required"}
        </FormControl>
        <FormControl margin="normal">
          <TextField
            id="email"
            name="email"
            type="email"
            label="Email"
            {...register("email", { required: true })}
          />
          {errors.email && "Email is required"}
        </FormControl>
        <FormControl margin="normal">
          <TextField
            id="address"
            name="address"
            type="address"
            label="Address"
            {...register("address", { required: true })}
          />
          {errors.address && "Address is required"}
        </FormControl>
        <FormControl margin="normal">
          <TextField
            id="password"
            name="password"
            type="password"
            label="Password"
            {...register("password", { required: true })}
          />
          {errors.password && "Password is required"}
        </FormControl>
        <FormControl margin="normal">
          <TextField
            id="password2"
            name="password2"
            type="password"
            label="Repeat Password"
            {...register("password2", { required: true })}
          />
          {errors.password && "Please repeat password"}
        </FormControl>
        <FormControl margin="normal">
          <button type="submit" value="submit">
            Register
          </button>
        </FormControl>
      </Form>
      <p style={{ textAlign: "center" }}>
        Already have an account{" "}
        <span
          style={{ textDecoration: "underline", color: "var(--theme-primary)" }}
        >
          <Link href="/login"> Login </Link>
        </span>
      </p>
    </Container>
  );
}

const Container = styled.div`
  text-align: center;
  padding: 0 0 4em;
  .logo {
    width: 125px;
    margin: 2em auto 0;
  }
`;
const Form = styled.form`
  display: flex;
  flex-direction: column;
  max-width: 20rem;
  padding: 1em;
  margin: 1em auto 1em auto;
  border-radius: 0.5em;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
  text-align: center;
  button {
    background: var(--theme-dark);
    padding: 0.5em 0;
    font-size: 1.25rem;
    color: var(--theme-white);
    border: none;
    border-radius: 0.25em;
    cursor: pointer;
  }
`;
