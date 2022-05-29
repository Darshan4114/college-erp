import {
  React,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import styled from "styled-components";
import styl from "styl/SubjectForm.module.css";
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
import ButtonIcon from "comp/ButtonIcon";
import Image from "next/image";

import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

import cAddDoc from "crud-lite/cAddDoc";
import cGetDoc from "crud-lite/cGetDoc";
import cGetDocs from "crud-lite/cGetDocs";
import cUpdateDoc from "crud-lite/cUpdateDoc";
import { toastOptions } from "comp/constants";
import { toast } from "react-toastify";

const SubjectForm = (props, ref) => {
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState(null);
  const [semesterId, setSemesterId] = useState(null);

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

  //   Reesetting state
  const resetState = () => {
    setSubject(null);
    setSemesterId(null);
    reset({
      subjectCode: null,
      subjectName: null,
      outOfExternal: null,
      outOfInternal: null,
      passingMarks: null,
      fullCredits: null,
      isElective: null,
    });
  };

  useImperativeHandle(ref, () => ({
    setSubject: (subject) => {
      if (subject === null) {
        resetState();
        return;
      }
      setSubject(subject);
      reset(subject);

      if (subject.subjects) {
        setValue("subjects", subject.subjects.join(","));
        console.log("setting subs = ", subject.subjects);
      }
    },
    hide,
    unhide,
    setSemesterId,
    handleSubjectDeleteConfirm,
  }));

  async function handleSubjectDeleteConfirm({ docData }) {
    const subject = docData;
    console.log("delete confirm data", subject);
    // update semester
    const sem = await cGetDoc({
      collectionPath: ["semesters"],
      docId: subject.semesterId,
    });

    const semUpdateData = {};
    if (subject.isElective)
      semUpdateData.electives = sem.electives.filter(
        (elec) => elec.id !== subject.id
      );
    else
      semUpdateData.subjects = sem.subjects.filter(
        (sub) => sub.id !== subject.id
      );

    cUpdateDoc({
      collectionPath: ["semesters"],
      docId: subject.semesterId,
      docData: semUpdateData,
    });

    // update exams
    const examList = await cGetDocs({
      collectionPath: ["exams"],
      conditions: [
        { field: "semesterId", operator: "==", value: subject.semesterId },
      ],
    });

    const examUpdateData = semUpdateData;

    for (const exam of examList) {
      cUpdateDoc({
        collectionPath: ["exams"],
        docData: { id: exam.id, ...examUpdateData },
      });
    }
  }

  const onSubmit = async (data) => {
    console.log("submitted subject = ", data, semesterId);
    let s;
    if (subject !== null) {
      s = await cUpdateDoc({
        collectionPath: ["subjects"],
        docId: subject.id,
        docData: data,
      });
      toast.success("Updated subject successfully!", toastOptions);
    } else {
      s = await cAddDoc({
        collectionPath: ["subjects"],
        docData: { ...data, semesterId, isDeleted: false },
      });
      data.id = s.id;
      data.semesterId = semesterId;
    }
    console.log("new sub = ", s);

    // update semester
    const sem = await cGetDoc({
      collectionPath: ["semesters"],
      docId: semesterId,
    });

    const semUpdateData = {};
    //updating subject list if updating
    if (subject !== null) {
      if (data.isElective)
        semUpdateData.electives = sem.electives.map((elec) =>
          elec.id === subject.id ? data : elec
        );
      else
        semUpdateData.subjects = sem.subjects.map((sub) =>
          sub.id === subject.id ? data : sub
        );
    } else {
      //Adding subject to list if new subject
      if (data.isElective) semUpdateData.electives = [...sem.electives, data];
      else semUpdateData.subjects = [...sem.subjects, data];
    }

    console.log("semupdatedata=", semesterId, semUpdateData);

    cUpdateDoc({
      collectionPath: ["semesters"],
      docId: semesterId,
      docData: semUpdateData,
    });

    // update exams
    const examList = await cGetDocs({
      collectionPath: ["exams"],
      conditions: [{ field: "semesterId", operator: "==", value: semesterId }],
    });

    const examUpdateData = semUpdateData;
    console.log("examupdatedata", examUpdateData);

    for (const exam of examList) {
      cUpdateDoc({
        collectionPath: ["exams"],
        docData: { id: exam.id, ...examUpdateData },
      });
    }

    resetState();
    props.handleSubmit(data);
    hide();
  };

  return (
    <>
      {showForm ? (
        <form className={styl.form} onSubmit={handleSubmit(onSubmit)}>
          <h1>{props.formTitle}</h1>

          <FormControl margin="normal">
            <TextField
              label="Subject Code"
              name="subjectCode"
              type="text"
              variant="outlined"
              error={errors && errors.subjectName}
              helpText={"Subject code is required"}
              {...register("subjectCode", { required: true })}
            />
          </FormControl>
          <FormControl margin="normal">
            <TextField
              label="Subject Name"
              name="subjectName"
              type="text"
              variant="outlined"
              error={errors && errors.subjectName}
              helpText={"First name is required"}
              {...register("subjectName", { required: true })}
            />
          </FormControl>
          <TextField
            label="Out of internal"
            name="outOfInternal"
            type="number"
            variant="outlined"
            margin="normal"
            error={errors && errors.outOfInternal}
            helpText={"Out of internal is required"}
            {...register("outOfInternal", { required: true })}
          />
          <TextField
            label="Out of external"
            name="outOfExternal"
            type="number"
            variant="outlined"
            margin="normal"
            error={errors && errors.outOfExternal}
            helpText={"Out of external is required"}
            {...register("outOfExternal", { required: true })}
          />
          <TextField
            label="Internal Passing marks"
            name="internalPassingMarks"
            type="number"
            variant="outlined"
            margin="normal"
            error={errors && errors.internalPassingMarks}
            helpText={"Internal Passing marks is required"}
            {...register("internalPassingMarks", { required: true })}
          />
          <TextField
            label="External Passing marks"
            name="externalPassingMarks"
            type="number"
            variant="outlined"
            margin="normal"
            error={errors && errors.externalPassingMarks}
            helpText={"External Passing marks is required"}
            {...register("externalPassingMarks", { required: true })}
          />
          <TextField
            label="Full credits"
            name="fullCredits"
            type="number"
            variant="outlined"
            margin="normal"
            error={errors && errors.fullCredits}
            helpText={"Full credits is required"}
            {...register("fullCredits", { required: true })}
          />
          <FormControl margin="normal">
            <FormControlLabel
              control={
                <Controller
                  name="isElective"
                  control={control}
                  defaultValue={false}
                  render={({ field: props }) => (
                    <Checkbox {...props} checked={!!props.value} />
                  )}
                />
              }
              label="Is elective"
            />
          </FormControl>
          {subject && (
            <div className={styl.deleteBtn}>
              <ButtonIcon
                onClick={() => {
                  hide();
                  props.handleDelete(subject);
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
          )}

          <div className={`${styl.actionBtnGrp} ${styl.reverseFlex}`}>
            <button type="submit" value="submit" className={styl.submit}>
              Submit
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                resetState();
                hide();
                props.handleCancel(subject);
              }}
              value="cancel"
              className={styl.cancel}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <></>
      )}
    </>
  );
};

export default forwardRef(SubjectForm);
