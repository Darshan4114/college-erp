import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

import Header from "comp/Header";
import styl from "styl/exams.module.css";
import checkAuth from "util/checkAuth";
import cleanTimestamp from "util/cleanTimestamp";
import cGetDocs from "fire/crud-lite/cGetDocs";
import cGetDoc from "fire/crud-lite/cGetDoc";
import cUpdateDoc from "fire/crud-lite/cUpdateDoc";
import SearchBar from "comp/SearchBar";
import ButtonIcon from "comp/ButtonIcon";
import ExamDetail from "comp/ExamDetail";

import ExamForm from "form/ExamForm";
import PromoteForm from "form/PromoteForm";
import DeleteForm from "form/DeleteForm";
import getListFromSnapshot from "util/getListFromSnapshot";

export const getServerSideProps = async (ctx) => {
  let res = await checkAuth({ ctx });
  return res;
};

export default function Home({ examId, examName, claims, tabValue }) {
  const [examList, setExamList] = useState([]);
  const [docId, setDocId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(null);
  const [formMode, setFormMode] = useState(null);
  const examForm = useRef(null);
  const examDetail = useRef(null);
  const deleteForm = useRef(null);

  useEffect(() => {
    reFetch();
  }, []);

  async function reFetch() {
    const exams = await cGetDocs({
      collectionPath: ["exams"],
      conditions: [{ field: "isDeleted", operator: "!=", value: true }],
    });
    setExamList(cleanTimestamp(exams, "date"));
  }

  function handleAdd() {
    setFormData(null);
    setDocId(null);
    setFormMode("add");
    setFormTitle("Add Exam");
    setShowForm(!showForm);
  }
  function handleCancel() {
    setFormData(null);
    setDocId(null);
    setShowForm(false);
  }

  function handleEdit(data) {
    setFormData(data);
    setDocId(data.id);
    setFormMode("edit");
    setShowForm(!showForm);
    console.log("data", data);
  }

  async function handleDelete({ collectionPath, docTitle, docId }) {
    console.log("handing del, ", docTitle, docId);
    setDeleteFormProps({
      showForm: true,
      collectionPath: collectionPath,
      docId: docId,
      docTitle: docTitle,
      handleCancel: () => setDeleteFormProps({ showForm: false }),
      handleConfirm: () => setDeleteFormProps({ showForm: false }),
    });
  }
  function handlePromote({ examId, examName, status }) {}
  function submitClick() {
    setShowForm(false);
  }
  const listProps = {
    claims: claims,
    handleEdit: handleEdit,
    handleDelete: handleDelete,
  };
  const formProps = {
    submitClick,
    formData,
    formMode,
    docId,
    reFetch,
    handleCancel: (exam) => {
      if (exam) {
        examDetail.current.setExam(exam);
        examDetail.current.unhide();
      }
    },
    handleSubmit: (exam) => {
      if (exam) {
        examDetail.current.setExam(exam);
        examDetail.current.unhide();
      }
    },
  };
  const examDetailProps = {
    handleDelete: async (exam) => {
      deleteForm.current.setMode("temporary");
      deleteForm.current.setCollectionPath(["exams"]);
      deleteForm.current.setDocData(exam);
      deleteForm.current.unhide();
    },
    handleEdit: (exam) => {
      examForm.current.setExam(exam);
      examForm.current.unhide();
    },
  };
  return (
    <div className={styl.container}>
      <div className={styl.examList}>
        <div className={styl.toolbar}>
          <SearchBar />
          <ButtonIcon
            className={styl.addBtn}
            onClick={() => {
              examDetail.current.hide();
              examForm.current.unhide();
              examForm.current.setExam(null);
            }}
          >
            <Image
              src="/img/plus_dark.svg"
              height="22"
              width="22"
              alt="add_student"
            />
          </ButtonIcon>
        </div>
        <table className={styl.examTable}>
          <th>&nbsp;</th>
          <th>Exam name</th>
          <th>Course name</th>
          <th>Status</th>
          <th>Timetable</th>
          {examList &&
            examList.map((exam) => {
              console.log("EXAM + ", exam);
              return (
                <>
                  <td>{examList.indexOf(exam) + 1}</td>
                  <td>{exam.examName}</td>
                  <td>{exam.courseName}</td>
                  <td>{exam.status}</td>
                  <td className={styl.timetableIcon}>
                    {" "}
                    <ButtonIcon
                      onClick={() => {
                        examDetail.current.unhide();
                        examDetail.current.setExam(exam);
                      }}
                    >
                      <Image
                        src="/img/calendar.svg"
                        height="22"
                        width="22"
                        alt="calendar"
                      />
                    </ButtonIcon>
                  </td>
                </>
              );
            })}
        </table>
      </div>
      <div className={styl.examDetail}>
        <ExamForm ref={examForm} {...formProps} />
        <ExamDetail ref={examDetail} {...examDetailProps} />
        <DeleteForm
          ref={deleteForm}
          handleConfirm={() => {
            reFetch();
          }}
        />
      </div>

      {/* <button className="addBtn" onClick={handleAdd}>
        <Image src="/img/add_blue.svg" width="50" height="50" />
      </button> */}
    </div>
  );
}
