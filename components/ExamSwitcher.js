import styl from "styl/ExamSwitcher.module.css";

export default function ExamSwitcher(props) {
  return (
    <div className={styl.wrapper}>
      <input
        type="radio"
        className={styl.radio}
        name="radioButtonTest"
        id="button1"
        checked={props.isExternal === false}
      />
      <label
        htmlFor="button1"
        onClick={() => {
          if (props.isExternal === true) {
            props.handleExamSwitch("internal");
          }
        }}
      >
        Internal
      </label>
      <input
        type="radio"
        className={styl.radio}
        name="radioButtonTest"
        id="button2"
        checked={props.isExternal === true}
      />
      <label
        htmlFor="button2"
        onClick={() => {
          if (props.isExternal === false) {
            props.handleExamSwitch("external");
          }
        }}
      >
        External
      </label>
    </div>
  );
}
