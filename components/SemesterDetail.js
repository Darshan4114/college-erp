import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import ButtonIcon from "comp/ButtonIcon";
import cGetDocs from "crud-lite/cGetDocs";
import Ripple from "comp/Ripple";
import ExamSwitcher from "comp/ExamSwitcher";
import generateHallTickets from "util/generateHallTickets";
import cleanTimestamp from "util/cleanTimestamp";
import Image from "next/image";
import styl from "styl/SemesterDetail.module.css";
import StudentList from "comp/StudentList";

import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { toast } from "react-toastify";
import { toastOptions } from "./constants";

function SemesterDetail(props, ref) {
  const [semester, setSemester] = useState(null);
  const [internalExam, setInternalExam] = useState(null);
  const [externalExam, setExternalExam] = useState(null);
  const [exam, setExam] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const studentList = useRef(null);

  const hide = () => setShowForm(false);
  const unhide = () => setShowForm(true);

  useImperativeHandle(ref, () => ({
    setSemester: (semester) => {
      console.log("setting semester to ", semester);
      setSemester(semester);
      console.log("default values", [
        ...semester.subjects,
        ...semester.electives,
      ]);
    },
    hide,
    unhide,
    setExams: (exams) => {
      const intExam = exams.filter((ex) => ex.isExternal === false)[0];
      const extExam = exams.filter((ex) => ex.isExternal === true)[0];
      setInternalExam(intExam);
      setExternalExam(extExam);
      setExam(intExam);
      console.log("INT=  ", intExam);
      console.log("EXT=  ", extExam);
    },
    setExam,
    reFetchStudents: () => {
      studentList.current?.reFetch();
    },
  }));
  useEffect(() => {
    //CHECK: remove later
    // handlePredictionInputChange();
  }, []);

  function getDateTime(d) {
    if (!d) return "";
    // const dateTimeStr = new Date(d.seconds * 1000).toString().split(" GMT")[0];
    // return dateTimeStr.slice(0, dateTimeStr.length - 3);

    const date = new Date(d.seconds * 1000)
      .toLocaleString()
      .split(",")[0]
      .toString();

    const timeString = new Date(d.seconds * 1000)
      .toLocaleString("en-IN", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      })
      .toUpperCase();
    const paddedHours = timeString.split(":")[0].padStart(2, "0");
    const time = paddedHours + ":" + timeString.split(":")[1];
    return date + " " + time;
  }
  async function downloadHallTickets() {
    console.log("searching students = ", semester);
    const students = await cGetDocs({
      collectionPath: ["users"],
      conditions: [
        { field: "status", operator: "==", value: "student" },
        { field: "isDeleted", operator: "!=", value: true },
        { field: "courseId", operator: "==", value: semester.courseId },
        {
          field: "courseYear",
          operator: "==",
          value: semester.year.toString(),
        },
      ],
      orderByFields: ["isDeleted", "displayName"],
    });
    console.log("students", students);
    if (!students || !students.length)
      toast.error("No students found associated with the course", toastOptions);
    const hallTickets = generateHallTickets({
      students: cleanTimestamp(students, "date"),
      exam,
    });
  }

  async function downloadMarksheet() {}

  function handleExamSwitch(examType) {
    if (examType === "internal") {
      setExam(internalExam);
    } else if (examType === "external") {
      setExam(externalExam);
    }
  }

  return (
    <>
      {showForm && exam ? (
        <div className={styl.container}>
          <section className={styl.exams}>
            <h3 className={styl.sectionHeader}>Exam</h3>

            <div className={styl.examData}>
              <div className={styl.group}>
                <p className={styl.label}>Exam name</p>
                <p>{exam?.examName}</p>
              </div>

              <div className={styl.group}>
                <p className={styl.label}>Status</p>
                <p>{exam?.status}</p>
              </div>
              <div className={styl.examSwitcher}>
                <ExamSwitcher
                  isExternal={exam.isExternal}
                  handleExamSwitch={handleExamSwitch}
                />
              </div>
            </div>
          </section>
          <section className={styl.timeTableSection}>
            <h3 className={styl.sectionHeader}>Timetable</h3>
            {semester?.subjects?.length || semester?.electives?.length ? (
              <div className={styl.timetable}>
                {/* <div className={styl.editTimetableBtn}>
                  <ButtonIcon
                    onClick={() => {
                      hide();
                      props.handleTimetableEdit(exam);
                    }}
                  >
                    <Image
                      src="/img/edit.svg"
                      height="22"
                      width="22"
                      alt="edit"
                    />
                  </ButtonIcon>
                </div> */}
                <div className={styl.timeTableHeading}>
                  <div className={styl.group}>
                    <p className={styl.label}>Code</p>
                  </div>
                  <div className={styl.group}>
                    <p className={styl.label}>Subject</p>
                  </div>
                  <div className={styl.group}>
                    <p className={styl.label}>Date-time</p>
                  </div>
                  <div className={styl.group}></div>
                  <div className={styl.group}></div>
                  <div className={styl.group}></div>
                </div>
                {semester?.subjects?.map((sub) => (
                  <div className={styl.subject} key={sub.id}>
                    <p>{sub.subjectCode}</p>
                    <p>{sub.subjectName}</p>
                    <p>
                      {getDateTime(
                        exam.subjects.filter((s) => s.id === sub.id)[0]
                          ?.dateTime
                      )}
                    </p>
                    {/* {exam.subjects.filter((s) => s.id === sub.id)[0]
                      ?.marksLocked !== true ? ( */}
                    <ButtonIcon
                      onClick={() => {
                        props.enterMarks(exam, sub);
                      }}
                    >
                      <Image
                        src="/img/check.png"
                        alt="check"
                        height="22"
                        width="22"
                      />
                    </ButtonIcon>
                    {/* ) : (
                      <div></div>
                    )} */}

                    <ButtonIcon
                      onClick={() =>
                        props.lockMarks({
                          exam,
                          subject: sub,
                          subjectType: "subjects",
                        })
                      }
                    >
                      <Image
                        src={`/img/${
                          exam.subjects.filter((s) => s.id === sub.id)[0]
                            ?.marksLocked !== true
                            ? "unlock.png"
                            : "lock.png"
                        }`}
                        alt="are marks locked"
                        height="22"
                        width="22"
                      />
                    </ButtonIcon>
                    <ButtonIcon
                      onClick={() =>
                        props.handleGenerateSubjectMarksheet({
                          exam,
                          subject: sub,
                        })
                      }
                    >
                      <Image
                        src="/img/pdf.png"
                        alt="pdf"
                        height="22"
                        width="22"
                      />
                    </ButtonIcon>
                    <ButtonIcon
                      onClick={() =>
                        props.handleGenerateEmptySubjectMarksheet({
                          exam,
                          subject: sub,
                        })
                      }
                    >
                      <Image
                        src="/img/pdf.png"
                        alt="pdf"
                        height="22"
                        width="22"
                      />
                    </ButtonIcon>
                  </div>
                ))}
                {semester?.electives?.map((elec) => (
                  <div className={styl.subject} key={elec.id}>
                    <p>{elec.subjectCode}</p>
                    <p>
                      {elec.subjectName}
                      <span className={styl.elective}> (E) </span>
                    </p>
                    <p>
                      {getDateTime(
                        exam.electives.filter((e) => e.id === elec.id)[0]
                          ?.dateTime
                      )}
                    </p>
                    {/* {exam.electives.filter((e) => e.id === elec.id)[0]
                      ?.marksLocked !== true ? ( */}
                    <ButtonIcon onClick={() => props.enterMarks(exam, elec)}>
                      <Image
                        src="/img/check.png"
                        alt="check"
                        height="22"
                        width="22"
                      />
                    </ButtonIcon>
                    {/* ) : (
                      <div></div>
                    )} */}
                    <ButtonIcon
                      onClick={() =>
                        props.lockMarks({
                          exam,
                          subject: elec,
                          subjectType: "electives",
                        })
                      }
                    >
                      <Image
                        src={`/img/${
                          exam.electives.filter((e) => e.id === elec.id)[0]
                            ?.marksLocked !== true
                            ? "unlock.png"
                            : "lock.png"
                        }`}
                        alt="are marks locked"
                        height="22"
                        width="22"
                      />
                    </ButtonIcon>
                    <ButtonIcon onClick={() => {}}>
                      <Image
                        src="/img/pdf.png"
                        alt="pdf"
                        height="22"
                        width="22"
                      />
                    </ButtonIcon>
                    <ButtonIcon
                      onClick={() =>
                        props.handleGenerateEmptySubjectMarksheet({
                          exam,
                          subject: sub,
                        })
                      }
                    >
                      <Image
                        src="/img/pdf.png"
                        alt="pdf"
                        height="22"
                        width="22"
                      />
                    </ButtonIcon>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styl.noSubjectChip}>
                <Chip
                  key="No subjects found"
                  label="No subjects found"
                  variant="outlined"
                />
              </div>
            )}
          </section>
          {/* <section className={styl.subjects}>
            <h3 className={styl.sectionHeader}> Semester Subjects</h3>
            <div className={styl.chips}>
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                {semester?.subjects?.length || semester?.electives?.length ? (
                  <>
                    {semester.subjects.map((s) => (
                      <Chip
                        sx={{ marginBottom: "0.35em" }}
                        key={s.id}
                        label={s.subjectName}
                        variant="outlined"
                      />
                    ))}
                    {semester?.electives?.map((elec) => (
                      <Chip
                        sx={{ marginBottom: "0.35em" }}
                        key={elec.id}
                        label={elec.subjectName}
                        variant="outlined"
                      />
                    ))}
                  </>
                ) : (
                  <Chip
                    key="No subjects found"
                    label="No subjects found"
                    variant="outlined"
                  />
                )}
              </Stack>
            </div>
          </section> */}

          <section className={styl.actions}>
            <h3 className={styl.sectionHeader}>Actions</h3>
            <div className={styl.actionBtnGrp}>
              <Ripple>
                <button
                  className={styl.actionBtn}
                  onClick={downloadHallTickets}
                >
                  Download hall tickets
                </button>
              </Ripple>
              {/* <Ripple>
                <button className={styl.actionBtn} onClick={downloadMarksheet}>
                  Download Marksheet
                </button>
              </Ripple> */}
              {/* <Ripple>
                <button
                  className={styl.actionBtn}
                  onClick={() => props.enterMarks(exam)}
                >
                  Enter marks
                </button>
              </Ripple> */}
            </div>
          </section>
          <section className={styl.actions}>
            <h3 className={styl.sectionHeader}>Students</h3>
            <StudentList
              ref={studentList}
              semesterId={semester?.id}
              courseId={semester?.courseId}
              handleInfoClick={props.handleStudentInfoClick}
              handleAddStudent={props.handleAddStudent}
            />
          </section>

          <div className={styl.editBtn}>
            <ButtonIcon
              onClick={() => {
                hide();
                props.handleEdit(semester);
              }}
            >
              <Image src="/img/edit.svg" height="22" width="22" alt="edit" />
            </ButtonIcon>
          </div>
          {/* <div className={styl.deleteBtn}>
            <ButtonIcon
              onClick={() => {
                hide();
                props.handleDelete(semester);
              }}
            >
              <Image
                src="/img/delete.svg"
                height="22"
                width="22"
                alt="delete"
              />
            </ButtonIcon>
          </div> */}
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
export default forwardRef(SemesterDetail);
