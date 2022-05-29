import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";
import { v4 as uuidv4 } from "uuid";
import styled from "styled-components";

import cGetDoc from "crud-lite/cGetDoc";
import cUpdateDoc from "crud-lite/cUpdateDoc";
import cAddDoc from "crud-lite/cAddDoc";
import CropperModal from "./CropperModal";
import { uploadImage, verifyFile } from "../utils/imageUtils";

import app from "../firebase/clientApp";
import { toast } from "react-toastify";
import { toastOptions, acceptedFileTypesArray } from "./constants";

const db = getFirestore(app);
const storage = getStorage(app);

export default function Gallery({
  userId,
  vehicleId,
  updatevehicleProfilePic,
}) {
  const router = useRouter();
  //Cropper
  const [showCropper, setShowCropper] = useState(false);
  const [croppedImage, setCroppedImage] = useState(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState(null);
  const [cropperMode, setCropperMode] = useState("photo");
  const [imgSrc, setImgSrc] = useState("");
  const [imgName, setImgName] = useState("");
  const [ogImage, setOgImage] = useState(null);
  const [imgExtension, setImgExtension] = useState("");
  const [galleryUrls, setGalleryUrls] = useState([]);
  const [vehicle, setVehicle] = useState(null);

  useEffect(() => {
    (async function () {
      const vehicle = await cGetDoc({
        collectionPath: ["vehicles"],
        docId: vehicleId,
      });
      setVehicle(vehicle);
      if (!vehicle) return;
      const q = query(
        collection(db, "users", userId, "vehicles", vehicleId, "photos")
      );
      const querySnapshot = await getDocs(q);
      console.log("gall", querySnapshot.docs);
      setGalleryUrls(
        querySnapshot.docs.map((doc) => {
          return { id: uuidv4(), url: doc.data().url };
        })
      );
    })();
  }, [userId, vehicleId]);

  //Setting base64 image data in imgSrc
  const handleFileSelect = (event) => {
    setImgSrc(null);
    const files = event.target.files;
    if (files && files.length > 0) {
      if (verifyFile(files)) {
        // imageBase64Data
        const currentFile = files[0];
        console.log(files[0]);
        setImgName(currentFile.name);
        setImgExtension(currentFile.name.split(".").pop());
        const myFileItemReader = new FileReader();
        myFileItemReader.addEventListener(
          "load",
          (c) => {
            console.log(myFileItemReader, c);
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
  const handleSave = async (data) => {
    if (cropperMode === "profilePic") {
      handleProfilePicSave(data);
    } else {
      handlePhotoSave(data);
    }
  };

  const handlePhotoSave = async (data) => {
    const q = query(
      collection(db, "users", userId, "vehicles", vehicleId, "photos")
    );

    const snapshotOfUpload = await uploadImage(
      data,
      `users/${userId}/vehicles/${vehicleId}/photos`,
      `${uuidv4()}.${imgExtension}`
    );
    getDownloadURL(ref(storage, snapshotOfUpload.metadata.fullPath)).then(
      (url) => {
        cAddDoc({ collectionPath: ["vehicles", vehicleId], docData: url });
      }
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          setGalleryUrls([
            ...galleryUrls,
            { id: uuidv4(), url: change.doc.data().url },
          ]);
          console.log("New photo: ", change.doc.data());
        }
        if (change.type === "modified") {
          console.log("Modified photo: ", change.doc.data());
        }
        if (change.type === "removed") {
          console.log("Removed photo: ", change.doc.data());
        }
      });
    });

    // resetGallery();

    console.log("snapshot of upload = ", snapshotOfUpload);
  };

  const handleProfilePicSave = async (data) => {
    let vehicleData = {};
    if (!vehicle) return;
    let snapshotOfUncroppedUpload;
    let snapshotOfCroppedUpload;
    //ogImage is null, if image not changed on edit
    if (ogImage !== null) {
      snapshotOfUncroppedUpload = await uploadImage(
        ogImage,
        `users/${userId}/vehicles/${vehicleId}`,
        `${vehicleId}.${imgExtension}`
      );
      vehicleData.uncroppedProfilePic =
        snapshotOfUncroppedUpload.metadata.fullPath;
    }
    if (data !== null) {
      uploadImage(
        data,
        `users/${userId}/vehicles/${vehicleId}`,
        `${vehicle.id}___cropped.${imgExtension}`
      ).then((snapshot) => {
        snapshotOfCroppedUpload = snapshot;
        getDownloadURL(
          ref(
            storage,
            `users/${userId}/vehicles/${vehicleId}/${vehicleId}___cropped.${imgExtension}`
          )
        ).then((downloadURL) => {
          console.log(
            "snapshotOfCroppedUpload = ",
            snapshotOfCroppedUpload.metadata.fullPath,
            "download url = ",
            downloadURL
          );
          cUpdateDoc({
            collectionPath: ["vehicles"],
            docId: vehicleId,
            docData: {
              profilePic: snapshotOfCroppedUpload.metadata.fullPath,
              profilePicURL: downloadURL,
              uncroppedProfilePic: snapshotOfUncroppedUpload.metadata.fullPath,
            },
          }).then(() => {
            updateVehicleProfilePic(downloadURL);
            router.push(`/vehicle-profile/${vehicleId}`);
          });
        });
      });
    }
  };

  const [lightbox, setLightBox] = useState({
    photoIndex: 0,
    isOpen: false,
    mainSrc: null,
    nextSrc: null,
    prevSrc: null,
  });

  const handleSetDefault = (id, url) => {
    setLightBox({ ...lightbox, isOpen: false });
    setImgName(id);
    setImgSrc(url);
    fetch(url)
      .then((res) => res.blob())
      .then((blob) => {
        setOgImage(blob);
      });
    if (url.includes("png")) setImgExtension("png");
    else if (url.includes("jpg")) setImgExtension("jpg");
    else if (url.includes("jpeg")) setImgExtension("jpeg");

    setCropperMode("profilePic");
    setShowCropper(true);
  };

  return (
    <>
      <strong>{/* <h2>Gallery</h2> */}</strong>
      <CropperModalContainer>
        <CropperModal
          rawImg={imgSrc}
          imgName={imgName}
          show={showCropper}
          setShow={setShowCropper}
          setCroppedImage={setCroppedImage}
          setCroppedImageUrl={setCroppedImageUrl}
          handleChangePhoto={handleChangePhoto}
          handleSave={handleSave}
        />
      </CropperModalContainer>

      <GalleryContainer>
        <form>
          <label htmlFor="fileInput" type="button">
            <div className="">
              <div>
                <Image
                  src="/img/upload.png"
                  height="40"
                  width="40"
                  alt="vehicle Photo"
                />
              </div>
              <p>New Photo</p>
            </div>
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
        </form>
        {galleryUrls ? (
          galleryUrls.map((photo) => {
            return (
              <div key={photo.id} className="photoContainer">
                <Image
                  src={photo.url}
                  height="150"
                  width="150"
                  alt="Photo in vehicle's gallery"
                  onClick={() =>
                    setLightBox({
                      ...lightbox,
                      isOpen: true,
                      photoIndex: galleryUrls.indexOf(photo),
                    })
                  }
                />
              </div>
            );
          })
        ) : (
          <p>Loading...</p>
        )}
        {lightbox.isOpen && (
          <Lightbox
            mainSrc={galleryUrls[lightbox.photoIndex].url}
            nextSrc={
              galleryUrls[(lightbox.photoIndex + 1) % galleryUrls.length].url
            }
            prevSrc={
              galleryUrls[
                (lightbox.photoIndex + galleryUrls.length - 1) %
                  galleryUrls.length
              ].url
            }
            onCloseRequest={() => setLightBox({ ...lightbox, isOpen: false })}
            onMovePrevRequest={() =>
              setLightBox({
                ...lightbox,
                photoIndex:
                  (lightbox.photoIndex + galleryUrls.length - 1) %
                  galleryUrls.length,
              })
            }
            onMoveNextRequest={() =>
              setLightBox({
                ...lightbox,
                photoIndex: (lightbox.photoIndex + 1) % galleryUrls.length,
              })
            }
            toolbarButtons={[
              <button
                key={galleryUrls[lightbox.photoIndex].id}
                style={{
                  color: "#fff",
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  background: "var(--theme-primary)",
                  border: "none",
                  borderRadius: "0.25em",
                  position: "fixed",
                  bottom: "2rem",
                  right: "2rem",
                  height: "2.5rem",
                  padding: "0 0.5em",
                  textAlign: "center",
                }}
                onClick={() => {
                  handleSetDefault(
                    galleryUrls[lightbox.photoIndex].id,
                    galleryUrls[lightbox.photoIndex].url
                  );
                }}
              >
                Set as Default
              </button>,
            ]}
          />
        )}
      </GalleryContainer>
    </>
  );
}

const GalleryContainer = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 30%);
  gap: 1em;
  max-width: 20rem;
  .photoContainer,
  form {
    border-radius: 0.5em;
    overflow: hidden;
    height: 100px;
    width: 100px;

    text-align: center;
    box-shadow: rgba(0, 0, 0, 0.02) 0px 1px 3px 0px,
      rgba(27, 31, 35, 0.15) 0px 0px 0px 1px;
  }
  input[type="file"] {
    display: none;
  }
  label {
    display: grid;
    place-items: center;
    height: 100%;
    width: 100%;
  }
`;
const CropperModalContainer = styled.div`
  position: fixed;
  z-index: 5;
  top: 4rem;
  left: 0;
`;
