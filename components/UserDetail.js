import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import ButtonIcon from "comp/ButtonIcon";
import Image from "next/image";
import styl from "styl/UserDetail.module.css";

function UserDetail(props, ref) {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const hide = () => setShowForm(false);
  const unhide = () => setShowForm(true);
  useImperativeHandle(ref, () => ({
    setUser: (s) => {
      // console.log("S", s);
      setUser(s);
    },
    hide,
    unhide,
  }));

  function getDateTime(d) {
    if (!d) return "";
    const dateTimeStr = new Date(d.seconds * 1000).toString().split(" GMT")[0];
    return dateTimeStr.slice(0, dateTimeStr.length - 3);
  }

  return (
    <>
      {showForm ? (
        <div className={styl.container}>
          {user.status === "student" && (
            <>
              <h3>Primary Details</h3>
              <div className={styl.userData}>
                <div className={styl.group}>
                  <p className={styl.label}>Full name</p>
                  <p>{user?.displayName}</p>
                </div>
                <div className={styl.group}>
                  <p className={styl.label}>Course</p>
                  <p>{user?.courseName}</p>
                </div>
                <div className={styl.group}>
                  <p className={styl.label}>Phone</p>
                  <p>{user?.phone}</p>
                </div>
                <div className={styl.group}>
                  <p className={styl.label}>Elective group</p>
                  <p>
                    {user?.electives?.map((elec) => (
                      <p key={elec.id}>{elec.subjectName}, </p>
                    ))}
                  </p>
                </div>
                <div className={styl.group}>
                  <p className={styl.label}>Current address</p>
                  <p>{user?.address}</p>
                </div>
                <div className={styl.group}>
                  <p className={styl.label}>Father&apos;s name</p>
                  <p>{user?.fatherName}</p>
                </div>
                <div className={styl.group}>
                  <p className={styl.label}>Mother&apos;s name</p>
                  <p>{user?.motherName}</p>
                </div>
                <div className={styl.group}>
                  <p className={styl.label}>Gender</p>
                  <p>{user?.gender}</p>
                </div>
                <div className={styl.group}>
                  <p className={styl.label}>DOB</p>
                  <p>{new Date(user?.dob).toDateString()}</p>
                </div>

                <div className={styl.group}>
                  <p className={styl.label}>Pincode</p>
                  <p>{user?.pincode}</p>
                </div>

                <div className={styl.group}>
                  <p className={styl.label}>Alt. Phone</p>
                  <p>{user?.phone2}</p>
                </div>
                <div className={styl.group}>
                  <p className={styl.label}>Parent&apos;s Phone</p>
                  <p>{user?.parentPhone}</p>
                </div>
              </div>

              <hr />

              <h3>Secondary Details</h3>
              <div className={styl.userData}>
                <div className={styl.group}>
                  <p className={styl.label}>Permanent address</p>
                  <p>{user?.permanentAddress}</p>
                </div>
                <div className={styl.group}>
                  <p className={styl.label}>Nationality</p>
                  <p>{user?.nationality}</p>
                </div>
                <div className={styl.group}>
                  <p className={styl.label}>State</p>
                  <p>{user?.state}</p>
                </div>
                <div className={styl.group}>
                  <p className={styl.label}>Religion</p>
                  <p>{user?.religion}</p>
                </div>
                <div className={styl.group}>
                  <p className={styl.label}>Caste</p>
                  <p>{user?.caste}</p>
                </div>
                <div className={styl.group}>
                  <p className={styl.label}>Sub caste</p>
                  <p>{user?.subCaste}</p>
                </div>
                <div className={styl.group}>
                  <p className={styl.label}>Category</p>
                  <p>{user?.category}</p>
                </div>
              </div>
            </>
          )}
          {(user.status === "admin" ||
            user.status === "coordinator" ||
            user.status === "caap") && (
            <div className={styl.userData}>
              <div className={styl.group}>
                <p className={styl.label}>Full name</p>
                <p>{user?.displayName}</p>
              </div>
              {user.status === "coordinator" && (
                <div className={styl.group}>
                  <p className={styl.label}>Courses</p>
                  <p>{user?.courses?.map((c) => c.courseName).join(", ")}</p>
                </div>
              )}

              <div className={styl.group}>
                <p className={styl.label}>Phone</p>
                <p>{user?.phone}</p>
              </div>
              <div className={styl.group}>
                <p className={styl.label}>Current address</p>
                <p>{user?.address}</p>
              </div>
            </div>
          )}

          <hr />

          <h3>Access level</h3>
          <div className="">
            <div className={styl.accessLevelWrapper}>
              <input
                type="radio"
                className={styl.accessLevel}
                name="accessLevel"
                id="button1"
                checked={user.status === "student"}
                onChange={() => {}}
              />
              <label
                htmlFor="button1"
                onClick={() => {
                  if (user.status === "student") return;
                  props.handlePromote({
                    status: "student",
                    userName: user.displayName,
                    userId: user.id,
                  });
                }}
              >
                Student
              </label>
              <input
                type="radio"
                className={styl.accessLevel}
                name="accessLevel"
                id="button2"
                checked={user.status === "coordinator"}
                onChange={() => {}}
              />
              <label
                htmlFor="button2"
                onClick={() => {
                  if (user.status === "coordinator") return;
                  props.handlePromote({
                    status: "coordinator",
                    userName: user.displayName,
                    userId: user.id,
                  });
                }}
              >
                Coordinator
              </label>
              <input
                type="radio"
                className={styl.accessLevel}
                name="accessLevel"
                id="button2"
                checked={user.status === "caap"}
                onChange={() => {}}
              />
              <label
                htmlFor="button2"
                onClick={() => {
                  if (user.status === "caap") return;
                  props.handlePromote({
                    status: "caap",
                    userName: user.displayName,
                    userId: user.id,
                  });
                }}
              >
                CAAP
              </label>
              <input
                type="radio"
                className={styl.accessLevel}
                name="accessLevel"
                id="button3"
                checked={user.status === "admin"}
                onChange={() => {}}
              />
              <label
                htmlFor="button3"
                onClick={() => {
                  if (user.status === "admin") return;
                  props.handlePromote({
                    status: "admin",
                    userName: user.displayName,
                    userId: user.id,
                  });
                }}
              >
                Admin
              </label>
            </div>
          </div>

          <div className={styl.editBtn}>
            <ButtonIcon
              onClick={() => {
                hide();
                props.handleEdit(user);
              }}
            >
              <Image src="/img/edit.svg" height="22" width="22" alt="edit" />
            </ButtonIcon>
          </div>
          <div className={styl.deleteBtn}>
            <ButtonIcon
              onClick={() => {
                hide();
                props.handleDelete(user);
              }}
            >
              <Image
                src="/img/delete.svg"
                height="22"
                width="22"
                alt="delete"
              />
            </ButtonIcon>
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
export default forwardRef(UserDetail);
