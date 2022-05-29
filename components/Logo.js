import Image from "next/image";
import styled from "styled-components";

export default function Logo({ mode }) {
  return (
    <Container>
      <div className="imageContainer">
        <Image
          src="/img/logo.png"
          layout="fill"
          objectFit="contain"
          alt="logo"
        />
      </div>

      {/* <p>DPU</p> */}
    </Container>
  );
}

const Container = styled.div`
  display: inline-flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.25rem;
  width: 120px;
  height: 2.5rem;
  padding: 0.25em;
  color: #ff0000;
  text-transform: uppercase;
  font-size: 1.2rem;
  /* margin: 0 1em; */
  font-weight: bold;
  .imageContainer {
    width: 120px;
    height: 1.5rem;
    position: relative;
  }
  p {
    /* visibility: hidden; */
    display: inline-block;
  }
  ${(props) =>
    props.mode === "vertical" &&
    css`
      flex-direction: column;
    `};
  /* @media screen and (min-width: 500px) {
    p {
      visibility: visible;
    }
  } */
`;
