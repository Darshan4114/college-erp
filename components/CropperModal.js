import React, { useState } from "react";
import Cropper from "react-easy-crop";
import styled, { css } from "styled-components";
import getCroppedImg from "../utils/cropImage";

const Modal = styled.div`
  display: none;
  height: 100%;
  margin: 0 auto;
  border-radius: 0.5em;
  overflow: hidden;
  background: #fff;
  box-shadow: rgb(0 0 0 / 35%) 0px 5px 15px;
  padding: 2em;
  text-align: center;
  width: 25rem;
  /* max-width: calc(100% - 1em); */
  margin: 0 auto;
  z-index: 50;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  .cropper-container {
    position: relative;
    width: 25rem;
    height: 25rem;
    border-radius: 0.5em;
    overflow: hidden;
    max-width: 100%;
  }
  .footer {
    bottom: 0;
    left: 0;
    position: absolute;
    width: 100%;
    background: #efefef;
    height: 3.5rem;
    padding: 0.25em 0.5em;
    display: flex;
    flex-direction: row-reverse;
    button {
      border: 0;
      border-radius: 0.25em;
      background: none;
      color: #fff;
      margin: 0.5em;
      width: 5rem;
    }
    .btn-cancel {
      background: #ff4242;
    }
    .btn-save {
      background: #1b8bff;
    }
  }
  .btn-change-pic {
    background: none;
    border: 0;
    color: #1b8bff;
    margin: 0.25em;
  }
  ${(props) =>
    props.show &&
    css`
      display: block;
    `}
`;
const CropperModal = (props) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImg, setCroppedImg] = useState(null);
  const [croppedImgUrl, setCroppedImgUrl] = useState(null);

  const onCropComplete = async (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
    try {
      const imageAndUrl = await getCroppedImg(
        props.rawImg,
        props.imgName,
        croppedAreaPixels,
        rotation
      );
      //This is the local state of the "CropperModal" component. croppedImg stores the cropped img after crop is complete
      // i.e. the user has stopped changing the crop. The image is set in the parent's state on save.
      setCroppedImg(imageAndUrl[0]);
      setCroppedImgUrl(imageAndUrl[1]);
    } catch (e) {
      console.error(e);
    }
  };

  //Saving the croppedImage, setting it in parent state
  const handleSave = () => {
    if (croppedImg !== null) {
      props.setCroppedImage(croppedImg);
      props.setCroppedImageUrl(croppedImgUrl);
      props.setShow(false);
      resetState();
    } else {
      alert("Please select an image to save");
    }
  };

  const handleCancel = () => {
    resetState();
    props.setShow(false);
  };

  //   Changing selected photo
  const handleChangePhoto = () => {
    resetState();
    props.handleChangePhoto();
  };

  //   Reesetting state
  const resetState = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
    setCroppedImg(null);
  };

  return (
    <Modal key={props.show} show={props.show}>
      <div className="cropper-container">
        <Cropper
          image={props.rawImg}
          crop={crop}
          zoom={zoom}
          aspect={1 / 1}
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
        />
      </div>
      <button onClick={handleChangePhoto} className="btn-change-pic">
        Change photo
      </button>
      <div className="footer">
        <button onClick={handleSave} className="btn-save">
          Save
        </button>
        <button onClick={handleCancel} className="btn-cancel">
          Cancel
        </button>
      </div>
    </Modal>
  );
};

export default CropperModal;
