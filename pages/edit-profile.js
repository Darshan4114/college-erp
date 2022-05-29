import React, { useState, useEffect } from "react";

import TextField from "@mui/material/TextField";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import DatePicker from "@mui/lab/DatePicker";
import Icon from "@mui/material/Icon";
import { Fab, Button } from "@material-ui/core";

import { getAuth, updateProfile } from "firebase/auth";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import Image from "next/image";
import { useRouter } from "next/router";
import { useFieldArray, useForm, useWatch, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import styled from "styled-components";
import cGetDoc from "crud-lite/cGetDoc";
import cUpdateDoc from "crud-lite/cUpdateDoc";
import { uploadImage, verifyFile } from "../utils/imageUtils";
import CropperModal from "../components/CropperModal";
import app from "../firebase/clientApp";
import Header from "../components/Header";
import cleanTimestamp from "../utils/cleanTimestamp";
import checkAuth from "util/checkAuth";

import { toastOptions, acceptedFileTypesArray } from "../components/constants";

const storage = getStorage(app);
const auth = getAuth();

export const getServerSideProps = async (ctx) => {
  return await checkAuth({ ctx });
};

export default function EditUserDetails({ userId, userName, claims }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  //Cropped image, i.e. output of the cropper that will be uploaded as the profile pic
  const [croppedImage, setCroppedImage] = useState(null);
  //URL of the profile pic
  //setProfilePicUrl is passed to CropperModal to set the PFP on save click on modal.
  const [profilePicUrl, setProfilePicUrl] = useState(null);

  //Inputs to the cropper
  const [imgSrc, setImgSrc] = useState(null);
  const [imgName, setImgName] = useState(null);
  const [imgExtension, setImgExtension] = useState(null);

  //The image to be uploaded as the uncropped image,
  // the uncropped image is useful when we have to recrop the existinf PFP
  const [ogImage, setOgImage] = useState(null);

  //Show/hide cropper modal
  const [showCropper, setShowCropper] = useState(false);
  const [dob, setDob] = React.useState(null);

  useEffect(() => {
    (async function () {
      const user = cleanTimestamp([
        await cGetDoc({ collectionPath: ["users"], docId: userId }),
      ])[0];
      console.log("user = ", user);
      if (!user) return;
      if (user.profilePic) {
        getDownloadURL(ref(storage, user.profilePic)).then((url) => {
          setProfilePicUrl(url);
        });
      }
      setUser(user);
      reset(user);
    })();
  }, [userId]);

  //Initializing react hook form
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: user,
  });
  // const dobValue = getValues("dob");

  // //Registering dob, we handle mui datepicker and react-hook-forms like its done here -
  // // https://dev.to/rexebin/use-material-ui-pickers-with-react-hook-form-kph
  // useEffect(() => {
  //   register("dob");
  // }, [register]);

  // useEffect(() => {
  //   setDob(dobValue || null);
  // }, [setDob, dobValue]);

  //Setting base64 image data in imgSrc
  const handleFileSelect = (event) => {
    setImgSrc(null);
    const files = event.target.files;
    if (files && files.length > 0) {
      if (verifyFile(files)) {
        // imageBase64Data
        const currentFile = files[0];
        setOgImage(currentFile);
        setImgName(currentFile.name);
        setImgExtension(currentFile.name.split(".").pop());
        const myFileItemReader = new FileReader();
        myFileItemReader.addEventListener(
          "load",
          (c) => {
            const base64img = myFileItemReader.result;
            setImgSrc(base64img);
            setShowCropper(true);
          },
          false
        );
        myFileItemReader.readAsDataURL(currentFile);
      }
    }
  };

  //Handling change of photo during crop
  const handleChangePhoto = () => {
    const fileInput = document.querySelector("#fileInput");
    fileInput.click();
  };

  const reCrop = (e) => {
    e.preventDefault();
    //If the user has an uncropped PFP
    if (user.uncroppedProfilePic) {
      //Getting download URL
      getDownloadURL(ref(storage, user.uncroppedProfilePic)).then((url) => {
        //setting required vars for cropper
        setImgSrc(url);
        setImgName("recrop." + user.uncroppedProfilePic.split(".").pop());
        setImgExtension(user.uncroppedProfilePic.split(".").pop());
        setShowCropper(true);
      });
    } else {
      toast.error(
        `Full image not available to re-crop, please upload another image`,
        toastOptions
      );
    }
  };
  /**
   *
   * @param {*} data
   * @description This function handles on submit for edit-user, first we update user with the
   * given data. Then we check if the PFP was changed, if yes, we upload the new uncropped PFP,
   * and the new cropped PFP. If the PFP was recropped, we update only the cropped PFP.
   *
   * We use 2 promises to upload the cropped and uncropped PFPs and then with a Promise.all(), we
   * get the profilePicURL of the user after the 2 promises have resolved. Finally we redirect to
   * /user-profile/{user-id}
   */
  const onSubmit = async (data) => {
    //Update user
    cUpdateDoc({
      collectionPath: ["users"],
      docId: userId,
      docData: { ...data, displayName: data.firstName + " " + data.lastName },
    });
    if (!user) return;
    updateProfile(auth.currentUser, {
      phoneNumber: data.phone,
      displayName: data.firstName + " " + data.lastName,
    });
    //ogImage is null, if image not changed on edit
    const uploadUncroppedImage = new Promise((res) => {
      if (ogImage !== null) {
        uploadImage(
          ogImage,
          `users/${userId}/`,
          `${userId}.${imgExtension}`
        ).then((snapshot) => {
          res(snapshot);
        });
      } else {
        res(null);
      }
    });

    const uploadCroppedImage = new Promise((res) => {
      if (croppedImage !== null) {
        uploadImage(
          croppedImage,
          `users/${userId}`,
          `${userId}___cropped.${imgExtension}`
        )
          .then((snapshot) => {
            res(snapshot);
          })

          .catch((err) => {
            toast.error(err, toastOptions);
          });
      } else {
        res(null);
      }
    });

    //Uploading image to gallery
    // const uploadGalleryImage = new Promise((res) => {
    //   if (ogImage !== null) {
    //     uploadImage(
    //       ogImage,
    //       `users/${userId}/photos`,
    //       `${imgName}.${imgExtension}`
    //     ).then((snapshot) => {
    //       res(snapshot);
    //     });
    //   } else {
    //     res(null);
    //   }
    // });

    Promise.all([uploadUncroppedImage, uploadCroppedImage])
      .then((results) => {
        let userData = {};

        if (results[0] !== null) {
          userData.uncroppedProfilePic = results[0].metadata.fullPath;
        }
        if (results[1] !== null) {
          userData.profilePic = results[1].metadata.fullPath;
        }
        if (!results.includes(null)) {
          getDownloadURL(
            ref(storage, `users/${userId}/${userId}___cropped.${imgExtension}`)
          )
            .then((downloadURL) => {
              console.log("download url 12 =  ", downloadURL);
              console.log("userData =  ", userData);
              userData.profilePicURL = downloadURL;

              cUpdateDoc({
                collectionPath: ["users"],
                docId: userId,
                docData: userData,
              }).then(() => {
                router.push(`/my-profile`);
              });
            })
            .catch((err) => {
              toast.error(err, toastOptions);
            });
          //   getDownloadURL(ref(storage, results[2].metadata.fullPath)).then(
          //     (url) => {
          //       addPhoto(userId, userId, url);
          //     }
          //   );
        }
        router.push(`/my-profile`);
      })
      .catch((err) => {
        toast.error(err, toastOptions);
      });
  };

  const cancelEdit = () => {
    router.push(`/user/${user.id}`);
  };

  return (
    <>
      <Header claims={claims} displayName={userName} />
      <CropperModal
        rawImg={imgSrc}
        imgName={imgName}
        show={showCropper}
        setShow={setShowCropper}
        setCroppedImage={setCroppedImage}
        setCroppedImageUrl={setProfilePicUrl}
        handleChangePhoto={handleChangePhoto}
      />
      <FormContainer>
        {/* <FormTitle>Edit user</FormTitle> */}
        {user ? (
          <>
            <Form className="logoForm">
              <label
                htmlFor="fileInput"
                type="button"
                className="profilePicLabel"
              >
                <div className="profilePicContainer">
                  {profilePicUrl ? (
                    <>
                      <ProfilePic
                        src={profilePicUrl}
                        layout="fill"
                        objectFit="cover"
                        alt=" Profile Pic"
                        showEditIcon="true"
                      />
                    </>
                  ) : (
                    <div>
                      <ProfilePic
                        src="/img/profilePic.svg"
                        layout="fill"
                        objectFit="contain"
                        alt="Profile Pic"
                      />
                    </div>
                  )}
                </div>
                {/* <p>Profile Pic</p> */}
                <a>
                  <div className="imageEdit crop-icon" onClick={reCrop}>
                    <Image
                      src="/img/crop.svg"
                      height="22"
                      width="22"
                      alt="crop image"
                    />
                  </div>
                </a>
                {/* <Link href="/"> */}
                <a>
                  <div className="imageEdit edit-icon">
                    <Image
                      src="/img/edit.svg"
                      height="22"
                      width="22"
                      alt="change image"
                    />
                  </div>
                </a>
                {/* </Link> */}
              </label>
              <input
                name="photo"
                id="fileInput"
                accept="image/*"
                type="file"
                value=""
                className="d-none"
                onChange={handleFileSelect}
                style={{ visibility: "hidden" }}
              />
            </Form>

            <Form onSubmit={handleSubmit(onSubmit)}>
              <TextField
                label="First Name"
                variant="outlined"
                name="firstName"
                className="formInput"
                defaultValue={user.firstName}
                {...register("firstName", { required: true })}
              />
              <TextField
                label="Last Name"
                variant="outlined"
                name="lastName"
                className="formInput"
                defaultValue={user.lastName}
                {...register("lastName", { required: true })}
              />

              <TextField
                label="Phone"
                variant="outlined"
                name="phone"
                className="formInput"
                defaultValue={user.phone}
                {...register("phone", { required: true })}
              />

              <TextField
                label="Email"
                variant="outlined"
                name="email"
                className="formInput"
                defaultValue={user.email}
                type="email"
                {...register("email", { required: true })}
              />

              <TextField
                label="Address"
                variant="outlined"
                name="address"
                defaultValue={user.address}
                className="formInput"
                {...register("address", { required: true })}
              />
              {/* <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date of Birth"
                  value={dob}
                  onChange={(date) => {
                    setValue("dob", date, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      className="formInput"
                      {...register("dob", { required: true })}
                    />
                  )}
                />
              </LocalizationProvider> */}
              {/* <label htmlFor="uploadID">
                <input
                  style={{ display: "none" }}
                  id="uploadID"
                  name="uploadID"
                  type="file"
                />
                Upload ID Proof
              </label> */}
              <button type="submit">Update Profile</button>
            </Form>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </FormContainer>
    </>
  );
}

const Form = styled.form`
  width: 20rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  text-align: center;
  button[type="submit"] {
    background: var(--theme-primary);
    padding: 0.5em 0;
    font-size: 1.25rem;
    color: var(--theme-white);
    border: none;
    cursor: pointer;
  }
  h3 {
    margin-top: 1em;
  }
  .removeHealthInfo {
    position: absolute;
    overflow: hidden;
    right: -4.5rem;
    top: 1.5rem;
  }
  .formInput {
    margin-bottom: 1em;
  }
`;
const FormTitle = styled.h1`
  font-size: 1.5rem;
  padding-top: 1em;
  text-align: center;
  color: var(--primary-text-color);
`;
const FormContainer = styled.div`
  background: #fff;
  padding: 1em;
  border-radius: 0.5em;
  /* margin: 3em 0 1em; */
  padding: 3em 0 0;
  overflow: hidden;
  .profilePicContainer {
    height: 6rem;
    width: 6rem;
    position: relative;
    border-radius: 50%;
    overflow: hidden;
    margin: 1em auto -2em;
  }
  .logoForm {
    margin-bottom: 1em;
    label {
      display: flex;
      flex-direction: column;
      pointer-events: none;
      align-items: center;
      position: relative;
      margin-bottom: 1.5em;
      width: 100px;
      margin: 0 auto;
      margin-bottom: 2em;
      p {
        position: absolute;
        bottom: -3.75rem;
      }
      .imageEdit {
        pointer-events: auto;
        background: #fff;
        border-radius: 50%;
        overflow: hidden;
        padding: 0.25em;
      }
      .crop-icon {
        position: absolute;
        left: 0;
        bottom: -3rem;
        box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
      }
      .edit-icon {
        position: absolute;
        right: 0;
        bottom: -3rem;
        box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
      }
    }
  }
`;
const ProfilePic = styled(Image)`
  width: 100%;
  position: absolute;
  left: 0;
  top: 0;
`;
const HealthInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  .healthGroup {
    display: flex;
    align-items: flex-end;
  }
  .addHealthInfo {
    margin-top: 1em;
  }
`;
