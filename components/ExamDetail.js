import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import ButtonIcon from "comp/ButtonIcon";
import cGetDocs from "crud-lite/cGetDocs";
import Ripple from "comp/Ripple";
import generateHallTickets from "util/generateHallTickets";
import cleanTimestamp from "util/cleanTimestamp";
import Image from "next/image";
import styl from "styl/ExamDetail.module.css";

function ExamDetail(props, ref) {
  const [exam, setExam] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const hide = () => setShowForm(false);
  const unhide = () => setShowForm(true);
  useImperativeHandle(ref, () => ({
    setExam: (exam) => {
      // console.log("setting exam to ", exam);
      setExam(exam);
    },
    hide,
    unhide,
  }));
  useEffect(() => {}, []);

  function getDateTime(d) {
    if (!d) return "";
    const dateTimeStr = new Date(d.seconds * 1000).toString().split(" GMT")[0];
    return dateTimeStr.slice(0, dateTimeStr.length - 3);
  }
  async function downloadHallTickets() {
    const students = await cGetDocs({
      collectionPath: ["users"],
      conditions: [
        { field: "status", operator: "==", value: "student" },
        { field: "isDeleted", operator: "!=", value: true },
        { field: "courseId", operator: "==", value: exam.courseId },
      ],
      orderByFields: ["isDeleted", "displayName"],
    });
    // console.log("students", students);
    const hallTickets = generateHallTickets({
      students: cleanTimestamp(students, "date"),
      exam,
    });
  }

  return (
    <>
      {showForm ? (
        <div className={styl.container}>
          <div className={styl.examData}>
            <div className={styl.group}>
              <p className={styl.label}>Exam name</p>
              <p>{exam?.examName}</p>
            </div>
            <div className={styl.group}>
              <p className={styl.label}>Course</p>
              <p>{exam?.courseName}</p>
            </div>
            <div className={styl.group}>
              <p className={styl.label}>Status</p>
              <p>{exam?.status}</p>
            </div>
          </div>
          <div className={styl.subjects}>
            <div className={styl.timeTableHeading}>
              <div className={styl.group}>
                <p className={styl.label}>Subject</p>
              </div>
              <div className={styl.group}>
                <p className={styl.label}>Date-time</p>
              </div>
            </div>
            {exam?.subjects?.map((sub) => (
              <div className={styl.subject} key={sub.id}>
                <p>{sub.subjectName}</p>
                <p>{getDateTime(sub.dateTime)}</p>
              </div>
            ))}
            {exam?.electives?.map((elec) => (
              <div className={styl.subject} key={elec.id}>
                <p>
                  {elec.subjectName}{" "}
                  <span className={styl.elective}> (E) </span>
                </p>
                <p>{getDateTime(elec.dateTime)}</p>
              </div>
            ))}
          </div>
          <div className={styl.editBtn}>
            <ButtonIcon
              onClick={() => {
                hide();
                props.handleEdit(exam);
              }}
            >
              <Image src="/img/edit.svg" height="22" width="22" alt="edit" />
            </ButtonIcon>
          </div>
          <div className={styl.deleteBtn}>
            <ButtonIcon
              onClick={() => {
                hide();
                props.handleDelete(exam);
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
          <div className={styl.hallTicketList}>
            <Ripple>
              <button
                className={styl.downloadHallTicketBtn}
                onClick={downloadHallTickets}
              >
                Download Hall Tickets
              </button>
            </Ripple>
            <Ripple>
              <button
                className={styl.downloadHallTicketBtn}
                onClick={() => props.enterMarks(exam)}
              >
                Enter marks
              </button>
            </Ripple>
            <Ripple>
              <button className={styl.downloadHallTicketBtn}>
                Download Marksheets
              </button>
            </Ripple>
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
export default forwardRef(ExamDetail);
