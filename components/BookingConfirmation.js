import React, { useState, useEffect } from "react";
import styled from "styled-components";

export default function BookingConfirmation({
  bookingDetails,
  showConfirmation,
  handleConfirmation,
}) {
  const [confirmationClass, setConfirmationClass] = useState("confirmation");
  useEffect(() => {
    if (showConfirmation) {
      setConfirmationClass("confirmation");
    } else {
      setConfirmationClass("confirmation confirmation-hide");
    }
  }, [showConfirmation]);

  return (
    <Container className={confirmationClass}>
      {bookingDetails && (
        <>
          <p>You are booking a {bookingDetails.car}</p>
          <p>The kabbie will reach you in {bookingDetails.reachingIn}</p>
          <div className="info">
            <div className="fare">
              <h2>Fare</h2>
              <p>{bookingDetails.fare}</p>
            </div>
            <div className="eta">
              <h2>ETA</h2>
              <p>{bookingDetails.eta}</p>
            </div>
          </div>
          <button className="confirm" onClick={handleConfirmation}>
            Confirm
          </button>
        </>
      )}
    </Container>
  );
}

const Container = styled.div`
  padding: 1em;
  background: var(--theme-white);
  color: var(--text-primary);
  width: 100%;
  position: absolute;
  bottom: 0em;
  left: 0em;
  z-index: 10;

  .info {
    display: flex;
    width: 17rem;
    margin: 0 auto;
    justify-content: space-evenly;
    margin-top: 1em;
    .fare,
    .eta {
      flex-direction: column;
    }
  }
  &.confirmation-hide {
    display: none;
  }
  .confirm {
    color: var(--theme-white);
    background: var(--theme-primary);
    border: none;
    margin-top: 1em;
    padding: 0.25em;
    font-size: 1.25rem;
    width: 100%;
    cursor: pointer;
  }
  @media screen and (min-width: 520px) {
    width: 20rem;
    bottom: 2em;
    left: 2em;
  }
  @media screen and (min-width: 1100px) {
    top: 4em;
    left: 1em;
    bottom: unset;
  }
`;
