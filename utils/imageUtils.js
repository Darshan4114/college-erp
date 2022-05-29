import { getStorage, ref, uploadString, uploadBytes } from "firebase/storage";
import app from "../firebase/clientApp";
import { acceptedFileTypesArray } from "../components/constants";

const storage = getStorage(app);

export async function uploadImage(dataUrl, folder, filename) {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, `${folder}/${filename}`);
    uploadBytes(storageRef, dataUrl)
      .then((snapshot) => {
        resolve(snapshot);
        console.log("Uploaded a blob or file!", snapshot);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

//Validating file type and size
export function verifyFile(files) {
  const imageMaxSize = 10000000; // 10MB

  if (files && files.length > 0) {
    const currentFile = files[0];
    const currentFileType = currentFile.type;
    const currentFileSize = currentFile.size;
    if (currentFileSize > imageMaxSize) {
      return {
        errors:
          "This file is not allowed. " +
          currentFileSize +
          " bytes is too large",
      };
    }
    if (!acceptedFileTypesArray.includes(currentFileType)) {
      return {
        errors: "This file is not allowed. Only jpg/png images are allowed.",
      };
    }
    return { success: true };
  }
}

export async function uploadProfilePic({
  image,
  userId,
  imgExtension,
  isCropped,
}) {
  return new Promise((resolve, reject) => {
    if (image === null || image === undefined)
      reject("Image null or undefined");
    let fileName = `${userId}.${imgExtension}`;
    if (isCropped) fileName = `${userId}___cropped.${imgExtension}`;
    uploadImage(image, `users/${userId}`, fileName)
      .then((snapshot) => {
        resolve(snapshot);
      })
      .catch((error) => {
        reject(error);
      });
  });
}
