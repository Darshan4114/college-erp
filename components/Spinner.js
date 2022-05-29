import styled, { css } from "styled-components";
export default function Spinner(props) {
  return (
    <SpinnerContainer place={props.place}>
      <div className="loader">Loading...</div>
    </SpinnerContainer>
  );
}
const SpinnerContainer = styled.div`
  .loader,
  .loader:after {
    border-radius: 50%;
    width: 3em;
    height: 3em;
  }
  .loader {
    margin: 60px auto;
    font-size: 10px;
    position: relative;
    text-indent: -9999em;
    border-top: 0.5em solid rgba(50, 151, 224, 0.5);
    border-right: 0.5em solid rgba(50, 151, 224, 0.5);
    border-bottom: 0.5em solid rgba(50, 151, 224, 0.5);
    border-left: 0.5em solid #ffffff;
    -webkit-transform: translateZ(0);
    -ms-transform: translateZ(0);
    transform: translateZ(0);
    -webkit-animation: load8 1.1s infinite linear;
    animation: load8 1.1s infinite linear;
  }
  ${(props) =>
    props.place === "button" &&
    css`
      .loader {
        margin: 0 auto;
      }
    `}
  @-webkit-keyframes load8 {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
  @keyframes load8 {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
`;
