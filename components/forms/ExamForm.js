import {
  React,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import styled from "styled-components";
import styl from "styl/ExamForm.module.css";
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
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import cAddDoc from "crud-lite/cAddDoc";
import cGetDocs from "crud-lite/cGetDocs";
import cUpdateDoc from "crud-lite/cUpdateDoc";
import { toastOptions } from "comp/constants";
import { toast } from "react-toastify";
import Autocomplete from "@mui/material/Autocomplete";

const ExamForm = (props, ref) => {
  console.log("rendering exam form, ");

  const [showForm, setShowForm] = useState(false);
  const [exam, setExam] = useState(null);
  const [courseList, setCourseList] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [electives, setElectives] = useState([]);
  const [subjectPredictions, setSubjectPredictions] = useState([]);

  useEffect(() => {
    (async () => {
      const courseList = await cGetDocs({
        collectionPath: ["courses"],
        conditions: [{ field: "isDeleted", operator: "!=", value: true }],
      });
      setCourseList(courseList);
    })();
  }, []);

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
    setExam: (exam) => {
      if (exam === null) {
        reset();
        setExam(null);
        setSubjects([]);
        return;
      }
      setExam(exam);
      reset(exam);

      if (exam.subjects) {
        let e = exam;
        const subjects = e.subjects.map((sub) => ({
          ...sub,
          dateTime: sub.dateTime
            ? new Date(sub?.dateTime.seconds * 1000)
            : null,
        }));
        setSubjects(subjects);
        setValue("subjects", subjects);

        console.log("setting subs = ", exam.subjects);
      }
      if (exam.electives) {
        let e = exam;
        const electives = e.electives.map((elec) => ({
          ...elec,
          dateTime: elec.dateTime
            ? new Date(elec?.dateTime.seconds * 1000)
            : null,
        }));
        setElectives(electives);
        setValue("electives", electives);

        console.log("setting electives = ", exam.electives);
      }
    },
    hide,
    unhide,
  }));
  function handleExamSwitch(examType) {
    if (examType === "internal") {
      setExam(internalExam);
    } else if (examType === "external") {
      setExam(externalExam);
    }
  }

  function handleDateTimeChange(sub, datetime) {
    console.log("handling datetime change", sub, datetime);
    const subjectList = getValues("subjects");
    const subject = subjectList.filter((s) => s.id === sub.id)[0];
    subject.dateTime = datetime;
    subjectList = subjectList.map((s) => (s.id !== subject.id ? s : subject));
    setSubjects(subjectList);
    setValue("subjects", subjectList);
  }
  function handleElectiveDateTimeChange(elec, datetime) {
    console.log("handling datetime change", elec, datetime);
    const electiveList = getValues("electives");
    const elective = electiveList.filter((el) => el.id === elec.id)[0];
    elective.dateTime = datetime;
    electiveList = electiveList.map((elec) =>
      elec.id !== elective.id ? elec : elective
    );
    setElectives(electiveList);
    console.log("setting electivelist = ", electiveList);
    setValue("electives", electiveList);
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
    setValue(
      "electives",
      val.filter((sub) => sub.isElective === true)
    );
    setValue(
      "subjects",
      val.filter((sub) => sub.isElective === false)
    );
  }

  const onSubmit = async (data) => {
    console.log("submitted exam form", data);
    const completeSubjectList = [...data.subjects, ...data.electives];
    const firstPaper = completeSubjectList.reduce((prevSub, currentSub) =>
      prevSub.dateTime > currentSub.dateTime ? currentSub : prevSub
    );
    const lastPaper = completeSubjectList.reduce((prevSub, currentSub) =>
      prevSub.dateTime < currentSub.dateTime ? currentSub : prevSub
    );

    console.log("firstPaper", firstPaper);
    console.log("lastPaper", lastPaper);

    //Setting exam status
    if (firstPaper.dateTime > new Date()) {
      data.status = "Not started";
    } else if (
      firstPaper.dateTime < new Date() &&
      lastPaper.dateTime > new Date()
    ) {
      data.status = "Ongoing";
    } else {
      data.status = "Finished";
    }

    // Converting to Firebase timestamps
    data.subjects = data.subjects.map((s) => ({
      ...s,
      dateTime: Timestamp.fromDate(s.dateTime),
    }));
    data.electives = data?.electives?.map((elec) => ({
      ...elec,
      dateTime: Timestamp.fromDate(elec.dateTime),
    }));

    if (exam !== null) {
      await cUpdateDoc({
        collectionPath: ["exams"],
        docId: exam.id,
        docData: data,
      });
      toast.success("Updated exam successfully!", toastOptions);
    } else {
      await cAddDoc({
        collectionPath: ["exams"],
        docData: { ...data, isDeleted: false },
      });
    }
    reset({});
    props.handleSubmit(data);
    hide();
  };

  return (
    <>
      {showForm ? (
        <form className={styl.form} onSubmit={handleSubmit(onSubmit)}>
          <h1>{props.formTitle}</h1>
          <div className={styl.group}>
            <p className={styl.label}>Exam</p>
            <p>{exam?.examName}</p>
          </div>
          <p>{exam?.isExternal}</p>
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
                      <FormControl margin="normal">
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DateTimePicker
                            label="Date Time"
                            value={sub.dateTime}
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
                      <div className={styl.dateTime}>
                        <FormControl margin="normal">
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DateTimePicker
                              label="Date Time"
                              value={elec.dateTime}
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
                    </div>
                  </div>
                );
              })}
          </div>
          <Controller
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
                  <TextField {...params} multiline rows={3} label="Subjects" />
                )}
              />
            )}
            name={"subjects"}
            // label="Subjects"
            control={control}
          />

          <FormControl
            margin="normal"
            className={`${formStyl.actionBtnGrp} ${formStyl.reverseFlex}`}
          >
            <button type="submit" value="submit" className={formStyl.submit}>
              Submit
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                reset({});
                setExam(null);
                setSubjects([]);
                hide();
                props.handleCancel(exam);
              }}
              value="cancel"
              className={formStyl.cancel}
            >
              Cancel
            </button>
          </FormControl>
        </form>
      ) : (
        <></>
      )}
    </>
  );
};

export default forwardRef(ExamForm);
