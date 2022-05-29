import { useState, forwardRef, useImperativeHandle } from "react";

import Image from "next/image";
import cGetDocs from "crud-lite/cGetDocs";
import cUpdateDoc from "crud-lite/cUpdateDoc";
import styl from "styl/SemesterForm.module.css";
import { useForm, Controller } from "react-hook-form";

import { debounce } from "debounce";
import { toast } from "react-toastify";

import cleanTimestamp from "util/cleanTimestamp";

import ButtonIcon from "comp/ButtonIcon";
import ExamSwitcher from "comp/ExamSwitcher";
import { toastOptions } from "comp/constants";

import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import DateTimePicker from "@mui/lab/DateTimePicker";
import Autocomplete from "@mui/material/Autocomplete";
import LocalizationProvider from "@mui/lab/LocalizationProvider";

import { Timestamp } from "firebase/firestore/lite";

const SemesterForm = (props, ref) => {
  /**
   * State description:
   * 1. Semester subjects, common in internal and external exams
   * 2. Exam type, internal/external
   * 3. Timetable state - subjects electives, only one exam timetable(int/ext) can be edited at once
   */
  const [showForm, setShowForm] = useState(false);

  const [subjectPredictions, setSubjectPredictions] = useState([]);

  const [semester, setSemester] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [electives, setElectives] = useState([]);

  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [unsavedArray, setUnsavedArray] = useState([]);

  const [internalExam, setInternalExam] = useState(null);
  const [externalExam, setExternalExam] = useState(null);
  const [exam, setExam] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm();

  const hide = () => setShowForm(false);
  const unhide = () => setShowForm(true);

  useImperativeHandle(ref, () => ({
    setSemester: (semester) => {
      reset({
        subjects: [],
        electives: [],
      });

      setSemester(semester);
      reset(semester);
      console.log("setting semester = ", semester);
    },
    setExams: (exams) => {
      const intExam = exams.filter((ex) => ex.isExternal === false)[0];
      const extExam = exams.filter((ex) => ex.isExternal === true)[0];
      setInternalExam(intExam);
      setExternalExam(extExam);
      setExam(intExam);
      // console.log("setting subs to ", cleanTimestamp(intExam.subjects, "datetime"))
      // console.log("setting elecs to ", cleanTimestamp(intExam.electives, "datetime"))
      setSubjects(intExam.subjects);
      setElectives(intExam.electives);
      console.log("INT=  ", intExam);
      console.log("EXT=  ", extExam);
    },
    hide,
    unhide,
    confirmUpdate,
    clearForm: () =>
      reset({
        subjects: [],
        electiveGroups: [],
      }),

    setExam,
  }));

  async function updateExams({ semesterId, semesterSubs, semesterElecs }) {
    const examList = await cGetDocs({
      collectionPath: ["exams"],
      conditions: [{ field: "semesterId", operator: "==", value: semesterId }],
    });
    examList?.forEach((exam) => {
      cUpdateDoc({
        collectionPath: ["exams"],
        docData: {
          id: exam.id,
          subjects: semesterSubs.map((sub) => ({
            ...sub,
            dateTime: getDateTime(sub, exam, "subjects"),
          })),
          electives: semesterElecs?.map((elec) => ({
            ...elec,
            dateTime: getDateTime(elec, exam, "electives"),
          })),
        },
      });
    });
  }

  function getDateTime(subject, exam, subjectType) {
    console.log("getting datetime ", exam[subjectType]);

    let sub = exam[subjectType].filter((s) => s.id === subject.id);
    console.log("getting datetime for sub", sub);
    sub = sub[0];

    if (sub?.dateTime) return sub.dateTime;
    else return null;
  }

  async function updateMarksheets({ semesterId, semesterSubs, semesterElecs }) {
    const marksheetList = await cGetDocs({
      collectionPath: ["marksheets"],
      conditions: [{ field: "semesterId", operator: "==", value: semesterId }],
    });
    marksheetList?.forEach((mks) => {
      cUpdateDoc({
        collectionPath: ["marksheets"],
        docData: {
          id: mks.id,
          exam: {
            subjects: semesterSubs.map((sub) => ({
              ...sub,
              marks: getMarks(sub, mks, "subjects"),
            })),
            electives: semesterElecs?.map((elec) => ({
              ...elec,
              marks: getMarks(elec, mks, "electives"),
            })),
          },
        },
      });
    });
  }

  function getMarks(subject, marksheet, subjectType) {
    const sub = marksheet.semester[subjectType].filter(
      (s) => s.id === subject.id
    )[0];
    if (sub) return sub.marks;
    else return null;
  }

  async function confirmUpdate({ semester, internalExam, externalExam }) {
    console.log(
      "updating sem with data = ",
      semester,
      internalExam,
      externalExam
    );

    await cUpdateDoc({
      collectionPath: ["semesters"],
      docData: semester,
    });

    await updateMarksheets({
      semesterId: semester.id,
      subjects: semester.subjects,
      electives: semester.electives,
    });

    //Updating exams
    cUpdateDoc({
      collectionPath: ["exams"],
      docData: {
        ...externalExam,
        subjects: toFirebaseTimestamp(externalExam.subjects, "dateTime"),
        electives: toFirebaseTimestamp(externalExam.electives, "dateTime"),
      },
    });
    cUpdateDoc({
      collectionPath: ["exams"],
      docData: {
        ...internalExam,
        subjects: toFirebaseTimestamp(internalExam.subjects, "dateTime"),
        electives: toFirebaseTimestamp(internalExam.electives, "dateTime"),
      },
    });

    setUnsavedChanges(false);
    toast.success("Updated semester and exams successfully!", toastOptions);
  }

  function toFirebaseTimestamp(objArr, field) {
    return objArr.map((obj) => {
      console.log("OBJ FLD + ", obj[field]);
      if (obj[field]) obj[field] = Timestamp.fromDate(new Date(obj[field]));
      return obj;
    });
  }

  async function handlePredictionInputChange(val) {
    const subjects = await cGetDocs({
      collectionPath: ["subjects"],
      conditions: [{ field: "isDeleted", operator: "!=", value: true }],
    });
    setSubjectPredictions(subjects);
  }

  async function handleSubjectChange(e, val) {
    setUnsavedChanges(true);
    const subs = val.filter((s) => s.isElective === false);
    const elecs = val.filter((s) => s.isElective === true);
    console.log("subelecs", subs, elecs);

    //Resetting timetable state vars for subs and elecs
    setSubjects(
      subs.map((sub) => {
        let subject = subjects.filter((s) => s.id === sub.id);
        if (subject.length) {
          subject = subject[0];
          return subject;
        } else {
          return sub;
        }
      })
    );
    setElectives(
      elecs.map((elec) => {
        let elective = electives.filter((e) => e.id === elec.id);
        if (elective.length) {
          elective = elective[0];
          return elective;
        } else {
          return elec;
        }
      })
    );
    console.log("int subjeCCts", {
      ...internalExam,
      subjects: subs?.map((sub) => ({
        ...sub,
        dateTime: getDateTime(sub, internalExam, "subjects"),
      })),
      electives: elecs?.map((elec) => ({
        ...elec,
        dateTime: getDateTime(elec, internalExam, "electives"),
      })),
    });
    console.log("ext subjeCCts", {
      ...externalExam,
      subjects: subs?.map((sub) => ({
        ...sub,
        dateTime: getDateTime(sub, externalExam, "subjects"),
      })),
      electives: elecs?.map((elec) => ({
        ...elec,
        dateTime: getDateTime(elec, externalExam, "electives"),
      })),
    });

    //Adding subject to internal exam
    setInternalExam({
      ...internalExam,
      subjects: subs?.map((sub) => ({
        ...sub,
        dateTime: getDateTime(sub, internalExam, "subjects"),
      })),
      electives: elecs?.map((elec) => ({
        ...elec,
        dateTime: getDateTime(elec, internalExam, "electives"),
      })),
    });

    //Adding subject to external exam
    setExternalExam({
      ...externalExam,
      subjects: subs?.map((sub) => ({
        ...sub,
        dateTime: getDateTime(sub, externalExam, "subjects"),
      })),
      electives: elecs?.map((elec) => ({
        ...elec,
        dateTime: getDateTime(elec, externalExam, "electives"),
      })),
    });

    setValue("semesterSubjects", val);
  }

  function handleDateTimeChange(sub, dateTime) {
    setUnsavedChanges(true);
    setUnsavedArray([...unsavedArray, sub]);

    //Setting subjectList (replacing the modified subject)
    setSubjects(
      subjects.map((s) => {
        if (s.id === sub.id) return { ...s, dateTime };
        return s.id !== sub.id ? s : sub;
      })
    );

    //Setting subjectList (replacing the modified subject) on the state var of selected exam type
    if (exam.isExternal) {
      setExternalExam({
        ...externalExam,
        subjects: externalExam.subjects.map((subject) => {
          if (subject.id === sub.id) return { ...subject, dateTime };
          return subject;
        }),
      });
    } else {
      console.log("SETTING INTERNAL DT TO", {
        ...internalExam,
        subjects: internalExam.subjects.map((subject) => {
          if (subject.id === sub.id) return { ...subject, dateTime };
          return subject;
        }),
      });
      console.log("matchX");

      setInternalExam({
        ...internalExam,
        subjects: internalExam.subjects.map((subject) => {
          if (subject.id === sub.id) return { ...subject, dateTime };
          return subject;
        }),
      });
    }
  }

  function handleElectiveDateTimeChange(elec, dateTime) {
    setUnsavedChanges(true);
    setUnsavedArray([...unsavedArray, elec]);

    console.log(
      "setting ELEX = ",
      electives,
      electives.map((elective) => {
        if (elective.id === elec.id) return { ...elective, dateTime };
        elective.id !== elec.id ? elective : elec;
      })
    );
    //Setting electiveList (replacing the modified elective)
    setElectives(
      electives.map((elective) => {
        if (elective.id === elec.id) return { ...elective, dateTime };
        return elective.id !== elec.id ? elective : elec;
      })
    );

    //Setting subjectList (replacing the modified subject) on the state var of selected exam type
    if (exam.isExternal) {
      setExternalExam({
        ...externalExam,
        electives: externalExam.electives.map((elective) => {
          if (elective.id === elec.id) return { ...elective, dateTime };
          return elective;
        }),
      });
    } else {
      setInternalExam({
        ...internalExam,
        electives: internalExam.electives.map((elective) => {
          if (elective.id === elec.id) return { ...elective, dateTime };
          return elective;
        }),
      });
    }
  }

  // function handleSubjectChange(e) {
  //   console.log("e.target.value", e.target.value);
  //   const selectedSubs = e.target.value;
  //   const subs = selectedSubs.map((sub) => {
  //     const subject = subjectList.filter((s) => s.id === sub)[0];
  //     return { id: subject.id, subjectName: subject.subjectName };
  //   });
  //   setValue("subjects", subs, {
  //     shouldValidate: true,
  //     shouldDirty: true,
  //   });
  //   console.log("subjects", subjects);
  // }
  // function handleElectiveGroupChange(idx, electiveGroup, selectedElectives) {
  //   const newElectiveList = selectedElectives.map((ele) => {
  //     const elective = electiveList.filter((e) => e.id === ele)[0];
  //     return { id: elective.id, subjectName: elective.subjectName };
  //   });
  //   update(idx, {
  //     ...electiveGroup,
  //     electives: newElectiveList,
  //   });
  // }

  function handleExamSwitch(examType) {
    if (unsavedChanges) {
      toast.warning("Please save or cancel changes first.", toastOptions);
      return;
    }
    if (examType === "internal") {
      setExam(internalExam);
      setSubjects(internalExam.subjects);
      setElectives(internalExam.electives);
    } else if (examType === "external") {
      setExam(externalExam);
      setSubjects(externalExam.subjects);
      setElectives(externalExam.electives);
    }
  }

  const onSubmit = async (data) => {
    //Update confirmation
    console.log("updating CHK with data = ", {
      semester: {
        ...semester,
        subjects: data.semesterSubjects
          ? data.semesterSubjects.filter((s) => s.isElective === false)
          : semester.subjects,
        electives: data.semesterSubjects
          ? data.semesterSubjects.filter((s) => s.isElective === true)
          : semester.electives,
      },
      internalExam,
      externalExam,
    });
    props.checkUpdateConfirmation({
      semester: {
        ...semester,
        subjects: data.semesterSubjects
          ? data.semesterSubjects.filter((s) => s.isElective === false)
          : semester.subjects,
        electives: data.semesterSubjects
          ? data.semesterSubjects.filter((s) => s.isElective === true)
          : semester.electives,
      },
      internalExam,
      externalExam,
    });

    props.handleSubmit(data);
  };
  return (
    <>
      {showForm ? (
        <form className={styl.container} onSubmit={handleSubmit(onSubmit)}>
          {/* <Controller
            render={() => (
              <Autocomplete
                multiple
                name="subjects"
                options={subjectPredictions}
                className={styl.subjectAutocomplete}
                defaultValue={
                  semester ? [...semester.subjects, ...semester.electives] : []
                }
                onInputChange={debounce(
                  (e, val) => handlePredictionInputChange(val),
                  500
                )}
                // isOptionEqualToValue={(option, value) => option.id === value.id}
                getOptionLabel={(option) => option.subjectName}
                onChange={handleSubjectChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    // multiline rows={3}
                    label="Subjects"
                  />
                )}
              />
            )}
            name={"subjects"}
            // label="Subjects"
            control={control}
          /> */}

          <div className={`${styl.flexEnds} ${styl.m1em}`}>
            <div className={styl.group}>
              <p className={styl.label}>Exam</p>
              <p>{exam?.examName}</p>
            </div>
            <div className={styl.examSwitcher}>
              <ExamSwitcher
                isExternal={exam.isExternal}
                handleExamSwitch={handleExamSwitch}
              />
            </div>
          </div>

          {/* <FormControl margin="normal">
            <TextField
              label="Exam Name"
              name="examName"
              type="text"
              variant="outlined"
              {...register("examName", { required: true })}
            />

            <p className="error">
              {errors.examName && "Exam name is required"}
            </p>
          </FormControl>
          <FormControl margin="normal">
            <FormControlLabel
              control={
                <Controller
                  name="isExternal"
                  control={control}
                  render={({ field: props }) => (
                    <Checkbox {...props} checked={!!props.value} />
                  )}
                />
              }
              label="Is external?"
            />
          </FormControl> */}
          {/* <FormControl>
            <InputLabel>Course</InputLabel>
            <Select
              onChange={handleCourseChange}
              value={exam?.courseId}
              label="Course"
            >
              {courseList.map((course) => (
                <MenuItem key={course.id} value={course.id}>
                  {course.courseName}
                </MenuItem>
              ))}
            </Select>
          </FormControl> */}
          <div className={styl.subjects}>
            {subjects.length > 0 &&
              subjects.map((sub) => {
                return (
                  <div key={sub.id}>
                    <div className={styl.subject} key={sub.id}>
                      <p className={styl.subjectName}>{sub.subjectCode}</p>
                      <p className={styl.subjectName}>{sub.subjectName}</p>
                      <div
                        className={`${styl.dateTime} ${
                          unsavedArray.map((sub) => sub.id).includes(sub.id) &&
                          styl.unsaved
                        }`}
                      >
                        <FormControl margin="normal">
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DateTimePicker
                              label="Date Time"
                              value={
                                cleanTimestamp([sub], "datetime")[0].dateTime
                              }
                              onChange={(datetime) => {
                                handleDateTimeChange(sub, datetime);
                              }}
                              inputFormat="dd/MM/yyyy HH:mm"
                              mask="__/__/____ __:__"
                              renderInput={(params) => (
                                <TextField {...params} className="formInput" />
                              )}
                            />
                          </LocalizationProvider>
                        </FormControl>
                      </div>
                      <ButtonIcon
                        onClick={(e) => {
                          e.preventDefault();
                          props.handleEditSubject(sub);
                        }}
                      >
                        <Image
                          src="/img/edit.svg"
                          height="22"
                          width="22"
                          alt="edit"
                        />
                      </ButtonIcon>
                    </div>
                  </div>
                );
              })}
            {electives.length > 0 &&
              electives.map((elec) => {
                return (
                  <div key={elec.id}>
                    <div className={styl.subject} key={elec.id}>
                      <p className={styl.subjectName}>{elec.subjectCode}</p>
                      <p className={styl.subjectName}>{elec.subjectName}</p>
                      <div
                        className={`${styl.dateTime} ${
                          unsavedArray
                            .map((elec) => elec.id)
                            .includes(elec.id) && styl.unsaved
                        }`}
                      >
                        <FormControl margin="normal">
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DateTimePicker
                              label="Date Time"
                              value={
                                cleanTimestamp([elec], "datetime")[0].dateTime
                              }
                              onChange={(datetime) => {
                                handleElectiveDateTimeChange(elec, datetime);
                              }}
                              inputFormat="dd/MM/yyyy HH:mm"
                              mask="__/__/____ __:__"
                              renderInput={(params) => (
                                <TextField {...params} className="formInput" />
                              )}
                            />
                          </LocalizationProvider>
                        </FormControl>
                      </div>
                      <ButtonIcon
                        onClick={(e) => {
                          e.preventDefault();
                          props.handleEditSubject(elec);
                        }}
                      >
                        <Image
                          src="/img/edit.svg"
                          height="22"
                          width="22"
                          alt="edit"
                        />
                      </ButtonIcon>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Action buttons */}
          <div className={styl.actionContainer}>
            <div
              margin="normal"
              className={`${styl.actionBtnGrp} ${styl.reverseFlex}`}
            >
              <button
                className={styl.submit}
                onClick={() => props.handleAddSubject(semester.id)}
              >
                Add subject
              </button>
              <button
                type="submit"
                // disabled={!unsavedChanges}
                value="submit"
                className={styl.submit}
              >
                Submit
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  reset({
                    subjects: [],
                    electives: [],
                  });
                  setUnsavedArray([]);
                  setUnsavedChanges(false);
                  hide();
                  props.handleCancel(semester);
                }}
                value="cancel"
                className={styl.cancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      ) : (
        <></>
      )}
    </>
  );
};

export default forwardRef(SemesterForm);
