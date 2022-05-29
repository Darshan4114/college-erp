import styl from "styl/ExamList.module.css";

export default function ExamList(props) {
  return (
    <section className={styl.exams}>
      <h3 className={styl.sectionHeader}>Exams</h3>
      <button className={styl.addBtn} onClick={props.handleExamAdd}>
        Add exam
      </button>
      {props.examList &&
        props.examList
          .filter((ex) => ex.isExternal === false)
          .sort((a, b) => (a.semester > b.semester ? 1 : -1), {})
          .map((exam, idx) => {
            return (
              <p
                key={exam.id}
                className={props.selectedExam === exam.id && styl.selected}
                onClick={() => {
                  props.handleExamClick(exam);
                  props.setSelectedExam(exam.id);
                }}
              >
                <span>{idx + 1}. </span>
                {exam.examName}
              </p>
            );
          })}
      <hr className={styl.hr} />
    </section>
  );
}
