import Ripple from "comp/Ripple";
import styl from "styl/ActionList.module.css";

export default function ActionList(props) {
  return (
    <section className={styl.actions}>
      <h3 className={styl.sectionHeader}>Actions</h3>
      <div className={styl.actionBtnGrp}>
        <Ripple>
          <button
            className={styl.actionBtn}
            onClick={props.enterInternalMassMarks}
          >
            Enter Internal Marks
          </button>
        </Ripple>
        <Ripple>
          <button
            className={styl.actionBtn}
            onClick={props.enterExternalMassMarks}
          >
            Enter External Marks
          </button>
        </Ripple>
        <Ripple>
          <button
            className={styl.actionBtn}
            onClick={props.downloadSuperMarksheet}
          >
            Download Marksheet
          </button>
        </Ripple>
        <Ripple>
          <button className={styl.actionBtn} onClick={props.downloadSummary}>
            Download Summary
          </button>
        </Ripple>
        <Ripple>
          <button
            className={styl.actionBtn}
            onClick={props.downloadUniversityLedgers}
          >
            Download University Ledger
          </button>
        </Ripple>
      </div>

      <hr className={styl.hr} />
    </section>
  );
}
