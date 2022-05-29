import { React, useState, forwardRef, useImperativeHandle } from "react";
import styled from "styled-components";

import formStyl from "styles/css/Forms.module.css";
import styl from "styles/css/UpdateConfirmationForm.module.css";

const UpdateConfirmationForm = (props, ref) => {
  const [showForm, setShowForm] = useState(false);
  const [updateData, setUpdateData] = useState(null);
  const [confirmationMessage, setConfirmationMessage] = useState(null);
  const [primaryBtnLabel, setPrimaryBtnLabel] = useState(null);
  const [secondaryBtnLabel, setSecondaryBtnLabel] = useState(null);

  const hide = () => setShowForm(false);
  const unhide = () => setShowForm(true);

  useImperativeHandle(ref, () => ({
    hide,
    unhide,
    setUpdateData,
    setPrimaryBtnLabel,
    setSecondaryBtnLabel,
    setConfirmationMessage,
  }));

  return (
    <>
      {showForm ? (
        <div className={formStyl.modalContainer}>
          <Form className={formStyl.formClass}>
            <p className={styl.message}>{confirmationMessage}</p>

            <div margin="normal" className={formStyl.actionBtnGrp}>
              <button onClick={hide} value="cancel" className={formStyl.cancel}>
                {secondaryBtnLabel ? secondaryBtnLabel : "Cancel"}
              </button>
              <button
                className={formStyl.submit}
                onClick={() => {
                  props.handleConfirm(updateData);
                  hide();
                }}
              >
                {primaryBtnLabel ? primaryBtnLabel : "Confirm"}
              </button>
            </div>
          </Form>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default forwardRef(UpdateConfirmationForm);

const Form = styled.div`
  max-height: calc(100vh - 210px);
  max-width: 20rem;
  margin: 0 auto;
  overflow-y: auto;
  /* width: 25rem; */
  position: relative;
  padding: 1em;

  @media screen and (min-width: 1200px) {
    width: 55rem;
  }
`;
