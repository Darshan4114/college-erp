import React, { useEffect, useState, useContext } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

import styled, { css } from "styled-components";
import styl from "styl/Nav.module.css";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

import { getAuth, signOut } from "firebase/auth";
// import { getFirestore, getDocs, collection } from "firebase/firestore";
// import { getStorage, ref, getDownloadURL } from "firebase/storage";
import app from "../firebase/clientApp";

import AuthContext from "./AuthContext";

const auth = getAuth(app);
// const db = getFirestore(app);
const storage = getStorage(app);

export default function Nav() {
  // console.log("render nav");
  const router = useRouter();
  const [navState, setNavState] = useState(null);
  const [tabValue, setTabValue] = useState(router.asPath);
  const [profilePic, setProfilePic] = useState(null);
  const { claims, user, userInDb } = useContext(AuthContext);

  function handleChange() {}
  useEffect(() => {
    setTabValue(router.asPath);
  }, [router.asPath]);

  useEffect(() => {
    (async () => {
      if (userInDb?.profilePic) {
        getDownloadURL(ref(storage, userInDb?.profilePic)).then((url) => {
          setProfilePic(url);
        });
      }
    })();
  }, [userInDb]);

  const validTabValues = [
    "/logout",
    "/my-profile",
    "/",
    "/estimate-form",
    "/confirmed",
    "/vehicles",
    "/customers",
    "/drivers",
    "/settings",
    "/rate-packages",
    "/rate-cards",
    // "/map-manager",
  ];

  // const handleChange = (event, newValue) => {
  //   console.log("handling chage, nav", newValue);
  //   if (validTabValues.includes(newValue)) {
  //   setTabValue(newValue);
  //   }
  // };
  function logout() {
    toggleNav();
    signOut(auth)
      .then(() => {
        router.push("/login");
      })
      .catch((error) => {
        // console.log("Error during logout");
      });
  }

  function toggleNav() {
    setNavState(!navState);
  }

  useEffect(() => {
    const nav = document.querySelector("ul");
    const openBtn = document.querySelector(".openNavBtn");
    if (navState) {
      openBtn.style.display = "flex";
      openBtn.classList.remove("invisible");
      nav.classList.remove("visible");
    } else {
      nav.style.display = "block";
      openBtn.classList.add("invisible");
      nav.classList.add("visible");
      nav.classList.remove("ellipse-close-active");
    }
  }, [navState]);
  const Ham = () => {
    return (
      <button className="openNavBtn" onClick={toggleNav}>
        <Image src="/img/ham.png" height="32" width="32" alt="Open nav" />{" "}
        {/* <p>Menu</p> */}
      </button>
    );
  };

  return (
    <>
      {claims &&
      (claims.includes("admin") ||
        claims.includes("coordinator") ||
        claims.includes("caap")) ? (
        <StyledTabs
          value={tabValue}
          centered
          onChange={handleChange}
          aria-label="Navigation"
        >
          {" "}
          <Tab label="Student" value="/students" />
          <Tab label="Course" value="/courses" />
          <Tab label="Settings" value="/settings" />
          <Ham />
        </StyledTabs>
      ) : (
        <StyledTabs
          value={tabValue}
          centered
          onChange={handleChange}
          aria-label="Navigation"
        >
          {/* <Tab label="Trips" value="/trips" /> */}
          <Tab label="Home" value="/" />
          <Tab label="New" value="/estimate-form" />

          <Ham />
        </StyledTabs>
      )}

      <StyledNav close={!navState} open={navState}>
        <div className={styl.logo}>
          <Link href="/">
            <a>
              <Image
                src="/img/logo_v.png"
                style={{ transform: "rotate(90deg)" }}
                layout="fill"
                objectFit="cover"
                alt="Home"
              />
            </a>
          </Link>
        </div>

        <ul>
          <li
            onClick={logout}
            className={`${tabValue === "/logout" && "selected"}`}
          >
            <Image src="/img/logout.svg" height="32" width="32" alt="logout" />
            <p> Logout </p>
          </li>
          {claims &&
            (claims.includes("admin") ||
              claims.includes("coordinator") ||
              claims.includes("caap")) && (
              <>
                <Link href="/">
                  <a>
                    <li
                      onClick={toggleNav}
                      className={`${tabValue === "/" && "selected"}`}
                    >
                      <Image
                        src="/img/course.svg"
                        height="32"
                        width="32"
                        alt="courses"
                      />
                      <p> Courses</p>
                    </li>
                  </a>
                </Link>
                <Link href="/users">
                  <a>
                    <li
                      onClick={toggleNav}
                      className={`${tabValue === "/users" && "selected"}`}
                    >
                      <Image
                        src="/img/users.svg"
                        height="36"
                        width="36"
                        alt="users"
                      />
                      <p> Users</p>
                    </li>
                  </a>
                </Link>

                {/* <Link href="/subjects">
                  <a>
                    <li
                      onClick={toggleNav}
                      className={`${tabValue === "/subjects" && "selected"}`}
                    >
                      <Image
                        src="/img/subject.svg"
                        height="32"
                        width="32"
                        alt="subjects"
                      />
                      <p> Subjects</p>
                    </li>
                  </a>
                </Link> */}

                {/* <Link href="/settings">
                <a>
                  <li
                    onClick={toggleNav}
                    className={`${tabValue === "/settings" && "selected"}`}
                  >
                    <Image
                      src="/img/settings.svg"
                      height="32"
                      width="32"
                      alt="settings"
                    />
                    <p> Settings</p>
                  </li>
                </a>
              </Link> */}
              </>
            )}
        </ul>
        <div className={styl.desg}>
          <p className={`${styl.pill}`}>{userInDb?.status}</p>
        </div>
        <div className={styl.profile}>
          <Link href="/my-profile">
            <a>
              <div className={styl.imgContainer}>
                {/* profilePic is a string */}
                {profilePic?.length > 0 ? (
                  <Image
                    src={profilePic}
                    objectFit="cover"
                    layout="fill"
                    alt="my-profile"
                  />
                ) : (
                  <Image
                    src="/img/user.png"
                    objectFit="cover"
                    layout="fill"
                    alt="my-profile"
                  />
                )}
              </div>
            </a>
          </Link>
        </div>
      </StyledNav>
    </>
  );
}

const StyledTabs = styled(Tabs)`
  z-index: 101;
  padding-bottom: 0;
  width: 100%;
  margin: 0 auto;
  position: fixed;
  left: 0;
  bottom: 0;
  background: #ffffff;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  .openNavBtn {
    border: none;
    background: none;
    margin-left: 2em;
    cursor: pointer;
    transition: all 0.5s;
    display: grid;
    place-items: center;
  }
  @media screen and (min-width: 750px) {
    display: none !important;
  }
`;

const StyledNav = styled.nav`
  min-height: 100vh;
  z-index: 100;
  overflow: hidden;
  color: var(--theme-text);
  background: var(--theme-white);
  font-size: 1rem;
  font-weight: bold;
  padding: 1em 0 0;
  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
  clip-path: inset(0px -15px 0px -15px);
  position: absolute;
  top: 0;
  right: -20rem;

  /* height: 100vh; */
  width: 4rem;
  transition: width 0.2s ease-out;
  /* &:hover {
    width: 14rem;
    li p {
      display: block;
      opacity: 100%;
    }
  } */

  li {
    position: relative;
    height: 2.8rem;
    cursor: pointer;
    width: 100%;
    padding: 0.5em;
    padding-left: 1em;
    background: #fff;
    transition: background 0.2s ease-in-out;
    overflow: hidden;
    :hover {
      background: #efefef;
    }
    &.selected {
      background: #efefef;
    }
    p {
      // display: none;
      position: absolute;
      white-space: nowrap;
      left: 4em;
      top: 0.5em;
      opacity: 0%;
      transition: opacity 0.3s ease-out;
    }
  }
  ${(props) =>
    props.close &&
    css`
      animation: closeAnimation 0.35s ease-out;
      -webkit-animation-fill-mode: forwards;
      animation-fill-mode: forwards;
    `};
  ${(props) =>
    props.open &&
    css`
      animation: openAnimation 0.35s ease-in;
      -webkit-animation-fill-mode: forwards;
      animation-fill-mode: forwards;
      ul {
        opacity: 1;
      }
    `};

  @keyframes openAnimation {
    0% {
      /* clip-path: ellipse(11% 11% at 100% 100%); */
      right: -20rem;
    }
    100% {
      /* clip-path: ellipse(42% 58% at 91% 69%); */
      right: 0;
    }
  }
  @keyframes closeAnimation {
    100% {
      /* clip-path: ellipse(0% 0% at 100% 100%); */
      right: -20rem;
    }
    0% {
      /* clip-path: ellipse(42% 58% at 91% 69%); */
      right: 0;
    }
  }

  ul {
    list-style: none;
    li {
      display: flex;
      align-items: center;
      cursor: pointer;
      p {
        margin-left: 0.5em;
      }
    }
  }
  .children {
    display: flex;
    width: 12rem;
    justify-content: flex-start;
    height: 1.5rem;
    margin-bottom: 3.5rem;
    a {
      margin-right: 0.25em;
    }
  }
  .onlyLarge {
    display: none;
  }
  @media screen and (min-width: 750px) {
    /* clip-path: inset(0px -15px 0px 0px); */
    box-shadow: unset;
    border-right: 1px solid #efefef;
    // margin: 3em 0;
    // padding: 1em 0 0;
    left: 0;
    right: unset;
    .onlyLarge {
      display: block;
    }
  }
`;
