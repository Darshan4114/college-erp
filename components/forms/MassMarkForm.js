import {
  React,
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import styled from "styled-components";
import styl from "styl/MassMarkForm.module.css";
import formStyl from "styl/Forms.module.css";
import { useForm, Controller } from "react-hook-form";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import DateTimePicker from "@mui/lab/DateTimePicker";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import { Timestamp } from "firebase/firestore/lite";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

import groupBy from "util/groupBy";
import { debounce } from "debounce";

import cAddDoc from "crud-lite/cAddDoc";
import cGetDocs from "crud-lite/cGetDocs";
import cUpdateDoc from "crud-lite/cUpdateDoc";
import { toastOptions } from "comp/constants";
import { toast } from "react-toastify";
import { connectStorageEmulator } from "firebase/storage";
import { reauthenticateWithCredential } from "firebase/auth";

const MassMarkForm = (props, ref) => {
  const [course, setCourse] = useState(null);
  const [mode, setMode] = useState("internal");
  const [showForm, setShowForm] = useState(false);
  const [marksheetList, setMarksheetList] = useState([]);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [numberOfSubjects, setNumberOfSubjects] = useState(0);
  const [modifiedMarksheets, setModifiedMarksheets] = useState([]);
  const [semesterList, setSemesterList] = useState([]);
  const [studentList, setStudentList] = useState([]);

  const hide = () => setShowForm(false);
  const unhide = () => setShowForm(true);

  useImperativeHandle(ref, () => ({
    setNumberOfSubjects,
    setCourse,
    setMode,
    hide,
    unhide,
    confirmUpdate,
    resetState,
  }));

  //   Getting all marksheets for course and setting them
  useEffect(() => {
    (async () => {
      if (!course) return;
      console.log("course ===", course);
      let marksheets = await cGetDocs({
        collectionPath: ["marksheets"],
        conditions: [
          { field: "exam.courseId", operator: "==", value: course.id },
        ],
      });
      console.log("mks out = ", marksheets);

      //Creating list of subjects from semesters of course
      let semesters = await cGetDocs({
        collectionPath: ["semesters"],
        conditions: [{ field: "courseId", operator: "==", value: course.id }],
      });
      setSemesterList(semesters);
      console.log("semesters = ", semesters);

      //Filter marksheets by mode
      if (mode === "internal") {
        marksheets = marksheets.filter((mks) => mks.exam.isExternal === false);
      } else {
        marksheets = marksheets.filter((mks) => mks.exam.isExternal === true);
      }
      console.log("ungrouped marksheets = ", marksheets);

      //Grouping marksheets
      /**
       * Grouping structure - Student -> Semester -> [internalMarksheet, externalMarksheet]
       */
      let studentList = marksheets.reduce((acc, mks) => {
        if (!acc[mks.student.id]) {
          acc[mks.student.id] = [];
        }
        // if (!acc[mks.student.id][mks.exam.semesterId]) {
        //   acc[mks.student.id][mks.exam.semesterId] = [];
        // }

        acc[mks.student.id].push(mks);
        // acc[mks.student.id][mks.exam.semesterId].push(mks);
        return acc;
      }, {});

      setStudentList(studentList);

      console.log("grouped studentList = ", studentList);

      setMarksheetList(marksheets);
    })();
  }, [course, mode]);

  function resetState() {
    setStudentList([]);
    setMarksheetList([]);
    setModifiedMarksheets([]);
    setUnsavedChanges(false);
  }

  /**
   *
   * @param {*} marksheet
   * @param {*} subject
   * @param {*} marks
   * @param {*} subjectType - "subjects" or "electives"
   */
  async function handleMarkChange(
    marksheet,
    subject,
    marks,
    isElective = false
  ) {
    let subjectType;
    if (isElective) {
      subjectType = "electives";
    } else {
      subjectType = "subjects";
    }
    setUnsavedChanges(true);
    console.log("handling mark change", marksheet, subject, marks);
    //Inner vars
    let mks = marksheet;
    let mkList = marksheetList;

    //Inserting new marks
    mks.exam[subjectType].filter((sub) => sub.id === subject.id)[0].marks =
      marks;
    console.log("new mks  = ", mks);

    //Replace the marksheet in the marksheet list
    mkList = mkList.map((marksheet) =>
      marksheet.id === mks.id ? mks : marksheet
    );
    console.log("new mkList  = ", mkList);

    //If a marksheet is edited twice replacing it from the update list, to include only the latest version.
    let newModifiedMarksheets = [...modifiedMarksheets, mks].map((m) => {
      if (m.id === mks.id) return mks;
      return m;
    });
    console.log("newModifiedMarksheets  = ", newModifiedMarksheets);

    setMarksheetList(mkList);
    setModifiedMarksheets(newModifiedMarksheets);
  }
  function getTotalMarks(mksList) {
    let total = 0;
    mksList.forEach((mks) => {
      [...mks.exam.subjects, ...mks.exam.electives].forEach(
        (sub) => (total += parseInt(sub.marks))
      );
    });
    return total;
  }

  function confirmUpdate(mksList) {
    console.log("confirmed mass update", mksList);
    //Updating modified marksheets
    mksList.forEach((mks) => {
      cUpdateDoc({ collectionPath: ["marksheets"], docData: mks });
    });
    resetState();
    hide();
  }

  const onSubmit = (e) => {
    e.preventDefault();
    props.checkMassMarkUpdateConfirmation(modifiedMarksheets);
  };

  return (
    <>
      {showForm ? (
        <div
          className={formStyl.modalContainer}
          data-name="modalContainer"
          onClick={(e) => {
            if (
              e.target?.dataset?.name === "modalContainer" &&
              !unsavedChanges
            ) {
              resetState();
              hide();
            }
          }}
        >
          <form className={styl.form}>
            <h2>
              {mode} marks for {course?.courseName}
            </h2>
            <div className={styl.examData}>
              <div className={styl.group}>
                <p className={styl.label}>Course name</p>
                <p>{course?.courseName}</p>
              </div>
            </div>

            {/* Mark table */}
            <section className={styl.markSection}>
              <div className={styl.tableContainer}>
                <table
                  cellSpacing={0}
                  className={styl.markTable}
                  // style={{ "--number-of-subjects": numberOfSubjects }}
                >
                  <thead>
                    <th>Student</th>
                    {/* <th key={selectedSubject.id}>
                      {selectedSubject.subjectName}
                    </th> */}
                    {semesterList &&
                      semesterList.map((sem) => {
                        return (
                          <>
                            {sem.subjects &&
                              sem.subjects.map((s) => (
                                <th key={s.id}>{s.subjectName}</th>
                              ))}
                            {sem?.electives &&
                              sem?.electives?.map((elec) => (
                                <th key={elec.id}>{elec.subjectName}</th>
                              ))}
                          </>
                        );
                      })}
                    <th>Total</th>
                  </thead>
                  {/* {JSON.stringify(Object.entries(studentList))} */}

                  <tbody>
                    {/* {JSON.stringify(studentList)} */}
                    {Object.entries(studentList)?.length &&
                      Object.entries(studentList)?.map(
                        ([studentId, mksList]) => (
                          <>
                            <tr
                              key={studentId}
                              // className={
                              //   modifiedMarksheets
                              //     .map((mks) => mks.id)
                              //     .some(mksList.map((mks) => mks.id)) &&
                              //   styl.unsaved
                              // }
                            >
                              <td key={studentId}>
                                {mksList[0].student.roll} -
                                {mksList[0].student.displayName}
                              </td>
                              {/* {JSON.stringify(mksList)} */}
                              {mksList.map((mks) =>
                                [
                                  ...mks.exam.subjects,
                                  ...mks.exam.electives,
                                ].map((sub) => (
                                  <td className={styl.subject} key={sub?.id}>
                                    <input
                                      type="text"
                                      onChange={debounce((e) => {
                                        console.log("check mod");
                                        console.log(
                                          "check mod",
                                          modifiedMarksheets,
                                          mks.id
                                        );
                                        handleMarkChange(
                                          mks,
                                          sub,
                                          e.target.value,
                                          sub.isElective
                                        );
                                      }, 500)}
                                      defaultValue={
                                        [
                                          ...mks.exam.subjects,
                                          ...mks.exam.electives,
                                        ].filter((s) => s.id === sub.id)[0]
                                          ?.marks
                                      }
                                    />
                                  </td>
                                ))
                              )}
                              <td>{getTotalMarks(mksList)}</td>
                            </tr>
                          </>
                        )
                      )}
                  </tbody>
                </table>
              </div>
            </section>

            {unsavedChanges ? (
              <div margin="normal" className={styl.actionBtnGrp}>
                <button onClick={onSubmit} className={styl.submit}>
                  Submit
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    props.checkMarkUpdateCancel();
                  }}
                  value="cancel"
                  className={styl.cancel}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  resetState();
                  hide();
                }}
                value="cancel"
                className={styl.cancel}
              >
                Close
              </button>
            )}
          </form>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default forwardRef(MassMarkForm);
