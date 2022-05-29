import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import ButtonIcon from "comp/ButtonIcon";
import Image from "next/image";
import styl from "styl/CourseDetail.module.css";

function CourseDetail(props, ref) {
  const [course, setCourse] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const hide = () => setShowForm(false);
  const unhide = () => setShowForm(true);
  useImperativeHandle(ref, () => ({
    setCourse,
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
          <div className={styl.courseData}>
            <div className={styl.group}>
              <p className={styl.label}>Course name</p>
              <p>{course?.courseName}</p>
            </div>
            <div className={styl.group}>
              <p className={styl.label}>Subjects</p>
              {course?.subjects?.map((sub) => (
                <p key={sub.id}>{sub.subjectName}</p>
              ))}
            </div>
          </div>
          {/* <div className={styl.subjects}>
            <div className={styl.timeTableHeading}>
              <div className={styl.group}>
                <p className={styl.label}>Subject</p>
              </div>
              <div className={styl.group}>
                <p className={styl.label}>Date-time</p>
              </div>
            </div>
            {course?.subjects.map((sub) => (
              <div className={styl.subject}>
                <p>{sub}</p>
                <p>{getDateTime(sub.dateTime)}</p>
              </div>
            ))}
          </div> */}
          <div className={styl.editBtn}>
            <ButtonIcon
              onClick={() => {
                hide();
                props.handleEdit(course);
              }}
            >
              <Image src="/img/edit.svg" height="22" width="22" alt="edit" />
            </ButtonIcon>
          </div>
          <div className={styl.deleteBtn}>
            <ButtonIcon
              onClick={() => {
                hide();
                props.handleDelete(course);
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
export default forwardRef(CourseDetail);
