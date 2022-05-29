import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import cGetDocs from "fire/crud-lite/cGetDocs";
import styl from "styl/AdminList.module.css";
import cleanTimestamp from "util/cleanTimestamp";
import ProfilePic from "comp/ProfilePic";
import ButtonIcon from "comp/ButtonIcon";
import Link from "next/link";
import Image from "next/image";

function AdminList(props, ref) {
  const [adminList, setAdminList] = useState([]);
  const [selectedUser, setSelectedUser] = useState([]);

  useEffect(() => {
    reFetch();
  }, []);
  useImperativeHandle(ref, () => ({
    reFetch,
  }));

  async function reFetch() {
    const users = await cGetDocs({
      collectionPath: ["users"],
      conditions: [
        { field: "status", operator: "==", value: "caap" },
        { field: "isDeleted", operator: "!=", value: true },
      ],
      orderByFields: ["isDeleted", "displayName"],
    });
    // console.log("fetched users = ", users);
    setAdminList(cleanTimestamp(users, "date"));
  }
  return (
    <table className={styl.userTable}>
      <tr>
        <th>&nbsp;</th>
        <th>&nbsp;</th>
        <th>Full Name</th>

        <th>&nbsp;</th>
        <th>&nbsp;</th>
        <th>&nbsp;</th>
      </tr>

      {adminList &&
        adminList.map((user) => {
          // console.log("USER + ", user);
          return (
            <tr
              key={user.id}
              className={`${selectedUser === user.id && styl.selected}`}
            >
              <td>{adminList.indexOf(user) + 1}</td>
              <td>
                <ProfilePic
                  imgSrc={user.profilePicURL}
                  showEditIcon={false}
                  defaultImg="empty.png"
                  size="36"
                  shape="circle"
                />
              </td>

              <td>{user.displayName}</td>

              <td className={styl.phoneIcon}>
                <ButtonIcon
                  onClick={() => {
                    setSelectedUser(user.id);
                  }}
                  disabled={user.phone !== undefined && user.phone !== null}
                >
                  <Link href={`tel:${user.phone}`}>
                    <a>
                      <Image
                        src="/img/phone.svg"
                        height="22"
                        width="22"
                        alt="phone"
                      />
                    </a>
                  </Link>
                </ButtonIcon>
              </td>
              <td className={styl.phoneIcon}>
                <ButtonIcon
                  onClick={() => {
                    setSelectedUser(user.id);
                  }}
                  disabled={user.email !== undefined && user.email !== null}
                >
                  <Link href={`mailto:${user.email}`}>
                    <a>
                      <Image
                        src="/img/mail.svg"
                        height="22"
                        width="22"
                        alt="mail"
                      />
                    </a>
                  </Link>
                </ButtonIcon>
              </td>
              <td className={styl.phoneIcon}>
                <ButtonIcon
                  onClick={() => {
                    setSelectedUser(user.id);
                    props.handleInfoClick(user);
                  }}
                >
                  <Image
                    src="/img/info.svg"
                    height="22"
                    width="22"
                    alt="mail"
                  />
                </ButtonIcon>
              </td>
            </tr>
          );
        })}
    </table>
  );
}
export default forwardRef(AdminList);
