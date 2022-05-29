import styled from "styled-components";
import { useState, useEffect, useCallback } from "react";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

import ProfilePic from "comp/ProfilePic";
// import Gallery from "comp/Gallery";
import Header from "comp/Header";
import Spinner from "comp/Spinner";
import app from "fire/clientApp";
import cGetDoc from "crud-lite/cGetDoc";
import checkAuth from "util/checkAuth";
import cleanTimestamp from "util/cleanTimestamp";
const storage = getStorage(app);

export const getServerSideProps = async (ctx) => {
  return await checkAuth({ ctx, requireLogin: true });
};

export default function UserProfile({ userId, claims, userName }) {
  const [user, setUser] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState(null);
  const updateUserProfilePic = useCallback((url) => {
    setProfilePicUrl(url);
  }, []);
  useEffect(() => {
    cGetDoc({ collectionPath: ["users"], docId: userId }).then((user) => {
      console.log("uuser = s", user);
      setUser(cleanTimestamp([user])[0]);
      if (user.profilePic) {
        getDownloadURL(ref(storage, user.profilePic)).then((url) => {
          setProfilePicUrl(url);
        });
      }
    });
  }, [userId]);

  return (
    <>
      <Header claims={claims} displayName={userName} />
      {/* <Nav userId={userId} /> */}

      <Container>
        {user ? (
          <>
            <ProfilePic
              userId={user.id}
              nickname={user.firstName}
              imgSrc={user.profilePicURL}
              editUrl="/edit-profile"
            />
            <div className="info">
              <div className="group">
                <p className="title">Name</p>
                <p>
                  {user.displayName || user.firstName + " " + user.lastName}
                </p>
              </div>
              <div className="group">
                <p className="title">Phone</p>
                <p>{user.phone}</p>
              </div>
              <div className="group">
                <p className="title">Email</p>
                <p>{user.email}</p>
              </div>
              <div className="group">
                <p className="title">Address</p>
                <p>{user.address}</p>
              </div>
              <div className="group">
                <p className="title">Status</p>
                <p>{user.status[0].toUpperCase() + user.status.substring(1)}</p>
              </div>
              {/* {claims.includes("admin") && (
                <div className="group">
                  <p className="title">Is Admin?</p>
                  {claims.includes("admin") ? <p>Yes</p> : <p>No</p>}
                </div>
              )} */}
            </div>
            {/* <Hr /> */}
          </>
        ) : (
          <Spinner />
        )}
      </Container>
    </>
  );
}

const Hr = styled.hr`
  width: 19rem;
  margin: 1em;
  border: 0;
  height: 1px;
  background: #333;
  background-image: -webkit-linear-gradient(left, #ccc, #3f4d67, #ccc);
  background-image: -moz-linear-gradient(left, #ccc, #3f4d67, #ccc);
  background-image: -ms-linear-gradient(left, #ccc, #3f4d67, #ccc);
  background-image: -o-linear-gradient(left, #ccc, #3f4d67, #ccc);
`;
const Container = styled.div`
  max-width: 20rem;
  padding: 4em 0 0;
  margin: 0 auto;
  height: 100vh;
  overflow-x: hidden;
  ul {
    list-style: none;
  }
  .info {
    margin-left: 2em;
  }
  .group {
    margin-bottom: 0.5em;
  }
  .title {
    font-size: 0.9rem;
    color: var(--theme-primary);
    margin-bottom: -0.2em;
  }
`;
