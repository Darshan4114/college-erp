import { useState } from "react";
import styled from "styled-components";
import Image from "next/image";
import { Popover } from "react-tiny-popover";

import ButtonIcon from "./ButtonIcon";
import styl from "styl/User.module.css";

const Exam = ({ data, ...props }) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  // console.log("dt", data, props);
  return (
    <UserContainer key={data.id}>
      <div className="userData">
        <div className="cardHeading">
          <div className="name">
            {/* <p className="title">Name </p> */}
            {data.examName && (
              <p className={styl.displayName}>{data.displayName}</p>
            )}
          </div>
          <div className="actions">
            <div className="phone">
              <ButtonIcon>
                <button className="iconBtn">
                  <Image
                    src="/img/phone.png"
                    height="30"
                    width="30"
                    alt="phone"
                  />
                </button>
              </ButtonIcon>
            </div>

            <Popover
              isOpen={isPopoverOpen}
              onClickOutside={() => setIsPopoverOpen(false)}
              reposition={false}
              padding={10}
              containerClassName="userPopoverContainer"
              positions={["left", "bottom"]} // preferred positions by priority
              content={
                <div className="popoverNav">
                  <ul>
                    <li>
                      {!data.isAdmin && (
                        <button
                          className="promoteBtn"
                          onClick={() =>
                            props.handlePromote({
                              userId: data.id,
                              userName: data.firstName + " " + data.lastName,
                              status: "admin",
                            })
                          }
                        >
                          Promote to Admin
                        </button>
                      )}
                    </li>
                    <li>
                      {!data.isDriver && (
                        <button
                          className="promoteBtn"
                          onClick={() => {
                            // console.log("handling driver promote");
                            props.handlePromote({
                              userId: data.id,
                              userName: data.firstName + " " + data.lastName,
                              status: "driver",
                            });
                          }}
                        >
                          Promote to Driver
                        </button>
                      )}
                    </li>
                  </ul>
                </div>
              }
            >
              <ButtonIcon onClick={() => setIsPopoverOpen(!isPopoverOpen)}>
                <button className="menu iconBtn">
                  <Image
                    src="/img/info.svg"
                    height="30"
                    width="30"
                    alt="info"
                  />
                </button>
              </ButtonIcon>
            </Popover>
          </div>
        </div>

        {/* <div className="group">
          <p className="title">Phone </p>
          <p>{data.phone}</p>
        </div> */}
        {/* {data.email && (
          <div className="group">
            <p>{data.email}</p>
          </div>
        )}

        <div className="group">
          <p>{data.address} </p>
        </div> */}
      </div>

      {/* <button className="edit" onClick={() => props.handleEdit(data)}>
          <Image src="/img/edit.svg" height="25" width="25" />
        </button> */}
    </UserContainer>
  );
};

export default Exam;

const UserContainer = styled.div`
  width: 22rem;
  height: 4rem;
  max-width: calc(100vw - 2rem);
  margin: 0em auto;
  /* box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px; */
  border-bottom: 1px solid #dedede;
  display: flex;
  align-items: flex-start;
  position: relative;
  .userData {
    margin: 1em 1em 1em 0;
    .cardHeading {
      width: 16rem;
      display: flex;
      justify-content: space-between;
      .name {
        margin-right: 1em;
      }
      .actions {
        display: flex;
        .iconBtn {
          margin: 0 0.25em;
        }
      }
    }
  }
  .group {
    margin-bottom: 0.5em;
    word-wrap: break-word;
  }
  .title {
    font-size: 0.9rem;
    color: var(--theme-dark);
    margin-bottom: -0.2em;
  }
  .edit,
  .delete {
    position: absolute;
    right: 1em;
    cursor: pointer;
    background: none;
    border: none;
  }
  .edit {
    top: 3.25em;
  }

  .delete {
    top: 4em;
  }
  .promoteBtn {
    padding: 0.5em;
    margin: 0 0.25em;
    border: none;
    border-radius: 0.25em;
    cursor: pointer;
    flex: 1;
    background: var(--theme-primary);
    color: var(--theme-white);
  }
  .iconBtn {
    cursor: pointer;
    background: none;
    border: none;
    height: 30px;
    width: 30px;
  }
`;
