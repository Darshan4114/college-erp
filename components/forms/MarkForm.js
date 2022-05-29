import {
  React,
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import styled from "styled-components";
import styl from "styl/MarkForm.module.css";
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
import { debounce } from "debounce";

import cAddDoc from "crud-lite/cAddDoc";
import cGetDocs from "crud-lite/cGetDocs";
import cUpdateDoc from "crud-lite/cUpdateDoc";
import { toastOptions } from "comp/constants";
import { toast } from "react-toastify";
import { connectStorageEmulator } from "firebase/storage";

const MarkForm = (props, ref) => {
  console.log("rendering mark form, ");
  const [showForm, setShowForm] = useState(false);
  const [exam, setExam] = useState(null);
  const [marksheetList, setMarksheetList] = useState([]);
  const [numberOfSubjects, setNumberOfSubjects] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [modifiedMarksheets, setModifiedMarksheets] = useState([]);

  const hide = () => setShowForm(false);
  const unhide = () => setShowForm(true);

  useImperativeHandle(ref, () => ({
    setMarksheetList: (mkl) => {
      console.log("setting mks = ", mkl);
      const mkList = mkl.sort(
        (a, b) => (a?.student?.roll > b?.student?.roll ? 1 : -1),
        {}
      );
      setMarksheetList(mkList);
    },
    setNumberOfSubjects,
    setExam,
    setSelectedSubject,
    hide,
    unhide,
    confirmUpdate,
    resetState,
  }));

  function resetState() {
    setExam(null);
    setMarksheetList([]);
    setSelectedSubject(null);
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
  async function handleMarkChange(marksheet, subject, marks, subjectType) {
    setUnsavedChanges(true);
    console.log("handling mark change", marksheet, subject, marks);
    //Inner vars
    let mks = marksheet;
    let mkList = marksheetList;

    //Inserting new marks
    mks.exam[subjectType].filter((sub) => sub.id === subject.id)[0].marks =
      marks;
    mks.total = getTotalMarks(mks.exam);
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
    setModifiedMarksheets([...newModifiedMarksheets]);
  }
  function getTotalMarks(exam) {
    return [...exam.subjects, ...exam.electives]
      .map((s) => s.marks)
      .reduce((prev, curr) => {
        if (curr === undefined) curr = 0;
        return parseInt(prev) + parseInt(curr);
      });
  }

  function confirmUpdate(mksList) {
    //Updating modified marksheets
    mksList.forEach((mks) => {
      cUpdateDoc({ collectionPath: ["marksheets"], docData: mks });
    });
    resetState();
    hide();
  }

  const onSubmit = (e) => {
    e.preventDefault();
    props.checkMarkUpdateConfirmation(modifiedMarksheets);
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
            <h2>Marks for {exam.examName}</h2>
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
            {selectedSubject ? (
              <div className={styl.group}>
                <p className={styl.label}>Subject</p>
                <p>{selectedSubject.subjectName}</p>
              </div>
            ) : (
              <FormControl margin="normal">
                <InputLabel>Subject</InputLabel>
                <Select
                  label="Subject"
                  style={{ width: "23rem" }}
                  onChange={(e) =>
                    setSelectedSubject(
                      [...exam.subjects, ...exam.electives].filter(
                        (s) => s.id === e.target.value
                      )[0]
                    )
                  }
                  disabled={unsavedChanges}
                >
                  {[...exam.subjects, ...exam.electives].map((sub) => (
                    <MenuItem key={sub.id} value={sub.id}>
                      {sub.subjectName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Mark table */}
            {selectedSubject && (
              <section className={styl.markSection}>
                <div className={styl.tableContainer}>
                  <table
                    cellSpacing={0}
                    className={styl.markTable}
                    // style={{ "--number-of-subjects": numberOfSubjects }}
                  >
                    <thead>
                      <th>Student</th>
                      <th key={selectedSubject.id}>
                        {selectedSubject.subjectName}
                      </th>

                      {/* {exam.subjects &&
                        exam.subjects.map((s) => (
                          <th key={s.id}>{s.subjectName}</th>
                        ))}
                      {exam?.electives &&
                        exam?.electives?.map((elec) => (
                          <th key={elec.id}>{elec.subjectName}</th>
                        ))}
                      <th>Total</th> */}
                    </thead>
                    {marksheetList?.map((mks) => (
                      <tr
                        key={mks.id}
                        className={
                          modifiedMarksheets
                            .map((mks) => mks.id)
                            .includes(mks.id) && styl.unsaved
                        }
                      >
                        <td>
                          <p className={styl.studentName}>
                            {mks?.student?.roll} - {mks?.student?.displayName}
                          </p>
                        </td>
                        <td className={styl.subject} key={selectedSubject?.id}>
                          <input
                            type="text"
                            disabled={
                              exam[
                                selectedSubject.isElective
                                  ? "electives"
                                  : "subjects"
                              ].filter((s) => s.id === selectedSubject.id)[0]
                                .marksLocked
                            }
                            onChange={debounce((e) => {
                              console.log("check mod");
                              console.log(
                                "check mod",
                                modifiedMarksheets,
                                mks.id
                              );
                              handleMarkChange(
                                mks,
                                selectedSubject,
                                e.target.value,
                                selectedSubject.isElective
                                  ? "electives"
                                  : "subjects"
                              );
                            }, 500)}
                            defaultValue={
                              [
                                ...mks?.exam?.subjects,
                                ...mks?.exam?.electives,
                              ].filter((s) => s.id === selectedSubject.id)[0]
                                ?.marks
                            }
                          />
                        </td>
                        {/* {mks.exam &&
                          mks.exam.subjects.map((subject) => (
                            <td className={styl.subject} key={subject.id}>
                              <input
                                type="text"
                                onChange={debounce(
                                  (e) =>
                                    handleMarkChange(
                                      mks,
                                      subject,
                                      e.target.value,
                                      "subjects"
                                    ),
                                  500
                                )}
                                defaultValue={subject.marks}
                              />
                            </td>
                          ))}
                        {mks.exam?.electives &&
                          mks.exam?.electives?.map((elective) => (
                            <td className={styl.subject} key={elective.id}>
                              {mks.student?.electives?.filter(
                                (elec) => elective.id === elec.id
                              ).length ? (
                                <input
                                  type="text"
                                  onChange={debounce(
                                    (e) =>
                                      handleMarkChange(
                                        mks,
                                        elective,
                                        e.target.value,
                                        "electives"
                                      ),
                                    500
                                  )}
                                  defaultValue={elective.marks}
                                />
                              ) : (
                                <input
                                  className={styl.disabledInput}
                                  type="text"
                                  value={"------------"}
                                  disabled
                                />
                              )}
                            </td>
                          ))}
                        <td>{mks.total}</td> */}
                      </tr>
                    ))}
                  </table>
                </div>
              </section>
            )}
            {unsavedChanges && (
              <div margin="normal" className={styl.actionBtnGrp}>
                <button onClick={onSubmit} className={styl.submit}>
                  Submit
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    // resetState();
                    props.checkMarkUpdateCancel();
                    // hide();
                  }}
                  value="cancel"
                  className={styl.cancel}
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default forwardRef(MarkForm);
