import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

import Header from "comp/Header";
import styl from "styl/subjects.module.css";
import checkAuth from "util/checkAuth";
import cleanTimestamp from "util/cleanTimestamp";
import cGetDocs from "fire/crud-lite/cGetDocs";
import cGetDoc from "fire/crud-lite/cGetDoc";
import cUpdateDoc from "fire/crud-lite/cUpdateDoc";
import SearchBar from "comp/SearchBar";
import ButtonIcon from "comp/ButtonIcon";
import Checkbox from "@mui/material/Checkbox";

// import SubjectDetail from "comp/SubjectDetail";

import SubjectForm from "form/SubjectForm";
import PromoteForm from "form/PromoteForm";
import DeleteForm from "form/DeleteForm";
import getListFromSnapshot from "util/getListFromSnapshot";

export const getServerSideProps = async (ctx) => {
  let res = await checkAuth({ ctx });
  return res;
};

export default function Home({ subjectId, subjectName, claims, tabValue }) {
  const [subjectList, setSubjectList] = useState([]);
  const [docId, setDocId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(null);
  const [formMode, setFormMode] = useState(null);
  const subjectForm = useRef(null);
  const subjectDetail = useRef(null);
  const deleteForm = useRef(null);

  useEffect(() => {
    reFetch();
  }, []);

  async function reFetch() {
    console.log("refetching");
    const subjects = await cGetDocs({
      collectionPath: ["subjects"],
      conditions: [{ field: "isDeleted", operator: "!=", value: true }],
    });
    console.log("new subs refetching", subjects);

    setSubjectList(cleanTimestamp(subjects, "date"));
  }

  function handleAdd() {
    setFormData(null);
    setDocId(null);
    setFormMode("add");
    setFormTitle("Add Subject");
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
  function handlePromote({ subjectId, subjectName, status }) {}

  const listProps = {
    claims: claims,
    handleEdit: handleEdit,
    handleDelete: handleDelete,
  };
  const formProps = {
    reFetch,
    handleCancel: (subject) => {
      // if (subject) {
      //   subjectDetail.current.setSubject(subject);
      //   subjectDetail.current.unhide();
      // }
    },
    handleSubmit: (subject) => {
      reFetch();
      // if (subject) {
      //   subjectDetail.current.setSubject(subject);
      //   subjectDetail.current.unhide();
      // }
    },
  };
  const subjectDetailProps = {
    handleDelete: async (subject) => {
      deleteForm.current.setMode("temporary");
      deleteForm.current.setCollectionPath(["subjects"]);
      deleteForm.current.setDocData(subject);
      deleteForm.current.unhide();
    },
    handleEdit: (subject) => {
      subjectForm.current.setSubject(subject);
      subjectForm.current.unhide();
    },
  };
  return (
    <div className={styl.container}>
      <div className={styl.subjectList}>
        <div className={styl.toolbar}>
          <SearchBar />
          <ButtonIcon
            className={styl.addBtn}
            onClick={() => {
              // subjectDetail.current.hide();
              subjectForm.current.unhide();
              subjectForm.current.setSubject(null);
            }}
          >
            <Image
              src="/img/plus_dark.svg"
              height="22"
              width="22"
              alt="add_subject"
            />
          </ButtonIcon>
        </div>
        <table className={styl.subjectTable}>
          <tr>
            <th>&nbsp;</th>
            <th>Subject name</th>
            <th>Subject code</th>
            <th>O internal</th>
            <th>O external</th>
            <th>Is elective</th>
            <th>&nbsp;</th>
          </tr> 

          {subjectList &&
            subjectList.map((subject) => {
              console.log("SUBJECT + ", subject);
              return (
                <tr className={styl.tr} key={subject.id}>
                  <td key={subject.id}>{subjectList.indexOf(subject) + 1}</td>
                  <td key={subject.id}>{subject.subjectName}</td>
                  <td key={subject.id}>{subject.subjectCode}</td>
                  <td key={subject.id}>{subject.outOfInternal}</td>
                  <td key={subject.id}>{subject.outOfExternal}</td>
                  <td key={subject.id}>
                    {" "}
                    <Checkbox disabled checked={subject.isElective} />
                  </td>
                  <td key={subject.id} className={styl.timetableIcon}>
                    <ButtonIcon
                      onClick={() => {
                        subjectForm.current.setSubject(subject);
                        subjectForm.current.unhide();
                      }}
                    >
                      <Image
                        src="/img/edit.svg"
                        height="22"
                        width="22"
                        alt="edit"
                      />
                    </ButtonIcon>
                  </td>
                </tr>
              );
            })}
        </table>
      </div>
      <div className={styl.subjectDetail}>
        <SubjectForm ref={subjectForm} {...formProps} />
        {/* <SubjectDetail ref={subjectDetail} {...subjectDetailProps} /> */}
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
