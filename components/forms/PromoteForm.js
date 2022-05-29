import { useState, forwardRef, useImperativeHandle } from "react";
import styled from "styled-components";

import cUpdateDoc from "crud-lite/cUpdateDoc";
import { toastOptions } from "comp/constants";
import formStyl from "styl/Forms.module.css";
import { toast } from "react-toastify";

const PromoteForm = (props, ref) => {
  const [status, setStatus] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState(null);
  const [showForm, setShowForm] = useState(false);
  // console.log("promote form props ", props);
  const handlePromote = () => {
    try {
      if (props.handleConfirm) props.handleConfirm();
      console.log("STS", status);
      promote(userId, userName, status)
        .then(async () => {
          let statusList = ["isAdmin", "isStudent", "isCoordinator", "isCaap"];
          console.log("stlist = ", statusList);
          let statusBooleans;
          if (status === "admin") {
            statusBooleans = allFalseExcept("isAdmin", statusList);
            statusBooleans["status"] = "admin";
          } else if (status === "coordinator") {
            statusBooleans = allFalseExcept("isCoordinator", statusList);
            statusBooleans["status"] = "coordinator";
          } else if (status === "caap") {
            statusBooleans = allFalseExcept("isCaap", statusList);
            statusBooleans["status"] = "caap";
          } else if (status === "student") {
            statusBooleans = allFalseExcept("isStudent", statusList);
            statusBooleans["status"] = "student";
          }
          console.log("status bools = ", statusBooleans);
          await cUpdateDoc({
            collectionPath: ["users"],
            docId: userId,
            docData: statusBooleans,
          });
          hide();
        })
        .catch((err) => {
          toast.error(err, toastOptions);
          hide();
        });
    } catch (err) {
      toast.error(err, toastOptions);
    }
  };

  const hide = () => setShowForm(false);
  const unhide = () => setShowForm(true);

  useImperativeHandle(ref, () => ({
    setStatus,
    setUserId,
    setUserName,
    hide,
    unhide,
  }));

  return (
    <>
      {showForm ? (
        <div className={formStyl.modalContainer}>
          <div className={formStyl.formClass}>
            <Form>
              <p>
                Do you want to promote {userName} to &quot;{status}
                &quot;?
              </p>
              <div margin="normal" className={formStyl.actionBtnGrp}>
                <button
                  onClick={hide}
                  value="cancel"
                  className={formStyl.cancel}
                >
                  Cancel
                </button>
                <button className={formStyl.submit} onClick={handlePromote}>
                  Promote
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
function promote(uid, userName, desg) {
  console.log("promotion in", uid, userName, desg);
  return new Promise((resolve, reject) => {
    fetch("/api/promote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: uid,
        desg: desg,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        // console.log("response = ", res);
        toast.success(
          `${userName} has been promoted to ${res.desg}`,
          toastOptions
        );
        resolve(res);
      })
      .catch((err) => {
        // console.log("err = ", err);
        toast.error(`User couldn't be promoted, - ${err}`, toastOptions);
        reject(err);
      });
  });
}
export default forwardRef(PromoteForm);

function allFalseExcept(status, statusList) {
  let statusBooleans = {};

  console.log("false start", status, statusList, statusBooleans);

  const falseList = statusList.filter((s) => s !== status);
  console.log("false list", status, statusList, statusBooleans);

  falseList.forEach((s) => (statusBooleans[s] = false));
  statusBooleans[status] = true;
  console.log("return from all false", statusBooleans);
  return statusBooleans;
}

const Form = styled.div`
  max-height: calc(100vh - 210px);
  overflow-y: auto;
  padding: 1em;
  /* width: 25rem; */
  position: relative;
`;
