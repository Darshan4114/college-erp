import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

import Header from "comp/Header";
import styl from "styl/users.module.css";
import checkAuth from "util/checkAuth";
import cGetDocs from "fire/crud-lite/cGetDocs";
import cGetDoc from "fire/crud-lite/cGetDoc";
import cUpdateDoc from "fire/crud-lite/cUpdateDoc";
import SearchBar from "comp/SearchBar";
import ButtonIcon from "comp/ButtonIcon";
import UserDetail from "comp/UserDetail";
import StudentList from "comp/StudentList";
import AdminList from "comp/AdminList";
import CoordinatorList from "comp/CoordinatorList";
import CaapList from "comp/CaapList";

import UserForm from "form/UserForm";
import StudentForm from "form/StudentForm";
import PromoteForm from "form/PromoteForm";
import DeleteForm from "form/DeleteForm";
import getListFromSnapshot from "util/getListFromSnapshot";

export const getServerSideProps = async (ctx) => {
  let res = await checkAuth({
    ctx,
    requireLogin: true,
    requireClaims: ["admin"],
  });
  return res;
};

export default function Home({ userId, userName, claims, tabValue }) {
  const [userList, setUserList] = useState([]);
  const [docId, setDocId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(null);
  const [formMode, setFormMode] = useState(null);
  const [userType, setUserType] = useState("admin");
  const userForm = useRef(null);
  const studentForm = useRef(null);
  const studentList = useRef(null);
  const adminList = useRef(null);
  const coordinatorList = useRef(null);
  const caapList = useRef(null);
  const userDetail = useRef(null);
  const deleteForm = useRef(null);
  const promoteForm = useRef(null);

  function handleAdd() {
    setFormData(null);
    setDocId(null);
    setFormMode("add");
    setFormTitle("Add User");
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
  function handleMenuItemClick(val) {
    userDetail.current.hide();
    userDetail.current.setUser(null);
    setUserType(val);
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
  function submitClick() {
    setShowForm(false);
  }

  function handleInfoClick(user) {
    userDetail.current.setUser(user);
    userForm.current.setStatus(user.status);
    userDetail.current.unhide();
  }
  useEffect(() => {
    console.log("userType chanegd, ", userType);
  }, [userType]);

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
    handleCancel: (user) => {
      if (user) {
        userDetail.current.setUser(user);
        userDetail.current.unhide();
      }
    },
    handleSubmit: (user, userType) => {
      if (user) {
        userDetail.current.setUser(user);
        userDetail.current.unhide();
      }
      if (userType === "student") {
        studentList.current.reFetch();
      }
      if (userType === "coordinator") {
        coordinatorList.current.reFetch();
      }
      if (userType === "caap") {
        caapList.current.reFetch();
      }
      if (userType === "admin") {
        adminList.current.reFetch();
      }
    },
  };
  const userDetailProps = {
    handleDelete: async (user) => {
      deleteForm.current.setMode("temporary");
      deleteForm.current.setCollectionPath(["users"]);
      deleteForm.current.setDocData(user);
      deleteForm.current.unhide();
    },
    handleEdit: (user) => {
      if (user.status === "student") {
        studentForm.current.setStudent(user);
        studentForm.current.unhide();
      } else {
        userForm.current.setUser(user);
        userForm.current.setUserType(user.status);
        userForm.current.unhide();
      }
    },
    handlePromote: ({ status, userId, userName }) => {
      promoteForm.current.setStatus(status);
      promoteForm.current.setUserId(userId);
      promoteForm.current.setUserName(userName);
      promoteForm.current.unhide();
    },
  };

  return (
    <div className={styl.container}>
      <div className={styl.userList}>
        <div className={styl.toolbar}>
          <SearchBar />

          <div className={styl.userTypeGroupWrapper}>
            <input
              type="radio"
              className={styl.userType}
              name="userTypeCheckbox"
              id="button1"
              checked={userType === "student"}
            />
            <label
              htmlFor="button1"
              onClick={() => handleMenuItemClick("student")}
            >
              Students
            </label>
            <input
              type="radio"
              className={styl.userType}
              name="userTypeCheckbox"
              id="button2"
              checked={userType === "coordinator"}
            />
            <label
              htmlFor="button2"
              onClick={() => handleMenuItemClick("coordinator")}
            >
              Coordinator
            </label>
            <input
              type="radio"
              className={styl.userType}
              name="userTypeCheckbox"
              id="button2"
              checked={userType === "caap"}
            />
            <label
              htmlFor="button2"
              onClick={() => handleMenuItemClick("caap")}
            >
              CAAP
            </label>
            <input
              type="radio"
              className={styl.userType}
              name="userTypeCheckbox"
              id="button3"
              checked={userType === "admin"}
            />
            <label
              htmlFor="button3"
              onClick={() => handleMenuItemClick("admin")}
            >
              Admins
            </label>
          </div>

          <ButtonIcon
            className={styl.addBtn}
            onClick={() => {
              if (userType === "student") {
                userDetail.current.hide();
                studentForm.current.unhide();
                studentForm.current.setStudent(null);
              } else {
                userDetail.current.hide();
                userForm.current.setStatus(userType);
                userForm.current.setUser(null);
                userForm.current.unhide();
              }
            }}
          >
            <Image
              src="/img/plus_dark.svg"
              height="22"
              width="22"
              alt="add_user"
            />
          </ButtonIcon>
        </div>
        {userType === "student" && (
          <StudentList ref={studentList} handleInfoClick={handleInfoClick} />
        )}
        {userType === "coordinator" && (
          <CoordinatorList
            ref={coordinatorList}
            handleInfoClick={handleInfoClick}
          />
        )}
        {userType === "caap" && (
          <CaapList ref={caapList} handleInfoClick={handleInfoClick} />
        )}
        {userType === "admin" && (
          <AdminList ref={adminList} handleInfoClick={handleInfoClick} />
        )}
      </div>
      <div className={styl.userDetail}>
        <UserForm ref={userForm} {...formProps} />
        <StudentForm ref={studentForm} {...formProps} />
        <UserDetail ref={userDetail} {...userDetailProps} />
        <PromoteForm ref={promoteForm} />
        <DeleteForm
          ref={deleteForm}
          handleConfirm={(listName) => {
            // if(listName==="student")
            // reFetch();
          }}
        />
      </div>

      {/* <button className="addBtn" onClick={handleAdd}>
        <Image src="/img/add_blue.svg" width="50" height="50" />
      </button> */}
    </div>
  );
}
