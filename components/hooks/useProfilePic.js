import {
  getStorage,
  ref as firebaseStorageRef,
  getDownloadURL,
} from "firebase/storage";
import { uploadImage } from "util/imageUtils";
const storage = getStorage();

export default async function useProfilePic({
  ogImage,
  croppedImage,
  folderPath,
  imageName,
  imageExtension,
}) {
  return new Promise((resolve, reject) => {
    //Uploading full image for re-crop
    const uploadUncroppedImage = new Promise((resolve, reject) => {
      if (ogImage !== null) {
        uploadImage(ogImage, folderPath, `${imageName}.${imageExtension}`)
          .then((snapshot) => {
            console.log("uncrop snapshot", snapshot);
            resolve(snapshot.metadata.fullPath);
          })
          .catch((err) => {
            console.error(err);
            reject(err);
          });
      } else {
        console.log("uncropped img null");

        resolve(null);
      }
    });

    //Uploading cropped image
    const uploadCroppedImage = new Promise((resolve, reject) => {
      if (croppedImage !== null) {
        uploadImage(
          croppedImage,
          folderPath,
          `${imageName}___cropped.${imageExtension}`
        )
          .then((snapshot) => {
            console.log("crop snapshot", snapshot);
            getDownloadURL(
              firebaseStorageRef(
                storage,
                snapshot.metadata.fullPath //Image name
              )
            ).then((downloadURL) => {
              resolve(downloadURL);
            });
          })
          .catch((err) => {
            console.error(err);
            reject(err);
          });
      } else {
        console.log("cropped img null");
        resolve(null);
      }
    });

    //Awaiting
    Promise.all([uploadUncroppedImage, uploadCroppedImage])
      .then((results) => {
        console.log("results = ", results);
        let objectData = {};
        if (results[0] !== null) {
          objectData.uncroppedProfilePic = results[0];
        }
        if (results[1] !== null) {
          objectData.profilePicURL = results[1];
        }
        resolve(objectData);
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
}
