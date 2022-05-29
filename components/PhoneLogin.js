import React, { useState, useEffect } from "react";

import styled from "styled-components";

export default function PhoneLogin({ showLoginForm }) {
  const [loginFormClass, setLoginFormClass] = useState(
    "login-form login-form-hide"
  );
  useEffect(() => {
    if (showLoginForm) {
      setLoginFormClass("login-form");
    } else {
      setLoginFormClass("login-form login-form-hide");
    }
  }, [showLoginForm]);
  return (
    <Container className={loginFormClass}>
      <h1>Please confirm your phone</h1>
      <form action="" method="POST">
        <input type="text" name="phone" placeholder="Phone number" />
        <input type="submit" value="Verify" />
      </form>
      <p>
        You will be sent an OTP on this number, do not share the OTP with
        anyone.
      </p>
    </Container>
  );
}

const Container = styled.div`
  padding: 1em;
  color: var(--text-primary);
  background: var(--theme-white);
  text-align: center;
  font-size: 1.25rem;
  max-width: 30rem;
  h1 {
    margin-bottom: 1em;
  }

  form {
    display: flex;
    flex-direction: column;
    input {
      margin-bottom: 0.5em;
      font-size: 1.25rem;
      padding: 0.25em;
    }
    input[type="submit"] {
      color: var(--theme-white);
      background: var(--theme-primary);
      border: none;
      padding: 0.25em;
      font-size: 1.25rem;
      width: 100%;
      max-width: 35rem;
      cursor: pointer;
    }
  }
  &.login-form-hide {
    display: none;
  }
`;
