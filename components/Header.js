import Link from "next/link";
import styled from "styled-components";

import Logo from "./Logo";

const Header = (props) => {
  return (
    <StyledHeader>
      {/* <Link href="/">
        <a>
          <Logo />
        </a>
      </Link> */}
      {props.title && <h1>{props.title}</h1>}

      {/* {props.displayName && (
        <div className="displayName">
          <p> {props.displayName}</p>
        </div>
      )} */}
    </StyledHeader>
  );
};

export default Header;

const StyledHeader = styled.header`
  width: 100vw;
  /* height: 3rem; */
  padding: 0 0 0 1em;
  /* z-index: 1000; */
  position: fixed;
  left: 0;
  top: 0;
  /* box-shadow: rgba(27, 31, 35, 0.04) 0px 1px 0px,
    rgba(255, 255, 255, 0.25) 0px 1px 0px inset;
  background: var(--theme-white); */
  /* display: flex; */
  h1 {
    font-size: 1.2rem;
    text-align: center;
    margin-top: -1.75rem;
    color: var(--text-primary);
  }
  .pill {
    text-align: center;
    padding: 0.1em 0.5em;
    background: #777;
    color: #fff;
    border-radius: 1em;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
  }
  .displayName p {
    display: inline-block;
    white-space: nowrap;
    max-width: 8rem;

    overflow: hidden;
    text-overflow: ellipsis;

    position: absolute;
    top: 0.7em;
    right: 0.5em;
  }
`;
