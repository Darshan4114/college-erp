import {
  React,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import styled from "styled-components";
import FormControl from "@mui/material/FormControl";

import formStyl from "styles/css/Forms.module.css";
import cUpdateDoc from "crud-lite/cUpdateDoc";
import cDeleteDoc from "crud-lite/cDeleteDoc";
import { toastOptions } from "../constants";
import { toast } from "react-toastify";

const DeleteForm = (props, ref) => {
  const [mode, setMode] = useState("temporary");
  const [collectionPath, setCollectionPath] = useState([]);
  const [docId, setDocId] = useState(null);
  const [docData, setDocData] = useState(null);
  const [docTitle, setDocTitle] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleDelete = async () => {
    console.log(
      "handling delete",
      docId,
      docData,
      docTitle,
      mode,
      collectionPath
    );
    try {
      if (mode === "temporary") {
        await cUpdateDoc({
          collectionPath,
          docData: { id: docId, isDeleted: true },
        });
      } else if (mode === "permanent") {
        await cDeleteDoc({
          collectionPath,
          docId,
        });
      }
      props.handleConfirm({docId, docData});

      hide();
    } catch (err) {
      toast.error(err, toastOptions);
    }
  };

  const hide = () => setShowForm(false);
  const unhide = () => setShowForm(true);

  useImperativeHandle(ref, () => ({
    setMode,
    hide,
    unhide,
    setCollectionPath,
    setDocId,
    setDocData,
    setDocTitle,
  }));

  return (
    <>
      {showForm ? (
        <div className={formStyl.modalContainer}>
          <div className={formStyl.formClass}>
            <Form className={props.className}>
              {mode === "temporary" && (
                <p>Do you want to move {docTitle} to recycle bin?</p>
              )}
              {mode === "permanent" && (
                <p>Do you want to permanently delete {docTitle}?</p>
              )}
              <div margin="normal" className={formStyl.actionBtnGrp}>
                <button
                  onClick={hide}
                  value="cancel"
                  className={formStyl.cancel}
                >
                  Cancel
                </button>
                <button className={formStyl.submit} onClick={handleDelete}>
                  Delete
                </button>
              </div>
            </Form>
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default forwardRef(DeleteForm);

const Form = styled.div`
  max-height: calc(100vh - 210px);
  max-width: 20rem;
  overflow-y: auto;
  width: 25rem;
  position: relative;
  padding: 1em;

  @media screen and (min-width: 1200px) {
    width: 55rem;
  }
`;
