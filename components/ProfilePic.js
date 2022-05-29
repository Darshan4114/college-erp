import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import styled, { css } from "styled-components";

const ImageContainer = styled.div`
  padding: 0.5em;
  text-align: center;
  font-weight: bold;
  display: grid;
  place-items: center;
  .image {
    border-radius: 50%;
    overflow: hidden;
    height: 100px;
    width: 100px;
    ${(props) =>
      props.shape === "square" &&
      css`
        border-radius: 0.25em;
      `}
  }
  .nickname {
    display: flex;
    margin-top: 0.5em;
  }
  ${(props) =>
    props.size &&
    css`
      .image {
        height: ${props.size}px;
        width: ${props.size}px;
      }
    `}
`;

export default function ProfilePic({
  entityId = "",
  nickname = "",
  imgSrc,
  showEditIcon = false,
  size,
  shape,
  editUrl = "",
  detailUrl = "",
  defaultImg,
  isLink = false,
}) {
  const [source, setSource] = useState(imgSrc);
  const showIcon = Boolean(showEditIcon);
  // console.log("showicon = ", showIcon);
  useEffect(() => {
    if (imgSrc !== null && imgSrc !== undefined && imgSrc !== "") {
      // console.log("setting image source to", imgSrc);
      setSource(imgSrc);
    } else if (
      defaultImg !== null &&
      defaultImg !== undefined &&
      defaultImg !== ""
    ) {
      setSource(`/img/${defaultImg}`);
    } else {
      setSource("/img/profile.svg");
    }
  }, [imgSrc, defaultImg]);
  // console.log("source = ", source, "imgSrc= ", imgSrc);

  return (
    <ImageContainer size={size} shape={shape}>
      {isLink ? (
        <Link href={`/${detailUrl}/${entityId}`}>
          <a>
            {source && (
              <div className="image">
                <Image
                  src={source}
                  width="100"
                  height="100"
                  alt="profile pic"
                />
              </div>
            )}
            {/* <p>{nickname}</p> */}
          </a>
        </Link>
      ) : (
        <a>
          {source && (
            <div className="image">
              <Image src={source} width="100" height="100" alt="profile pic" />
            </div>
          )}
          {/* <p>{nickname}</p> */}
        </a>
      )}

      {showIcon && (
        <Link href={`/${editUrl}/${entityId}`}>
          <a>
            <div className="nickname">
              <p>{nickname}</p>
              <Image
                src="/img/edit.svg"
                width="22"
                height="22"
                alt="Edit profile"
              />
            </div>
          </a>
        </Link>
      )}
    </ImageContainer>
  );
}
