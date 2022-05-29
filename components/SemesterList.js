import styl from "styl/SemesterList.module.css";

export default function SemesterList(props) {
  return (
    <section className={styl.semesters}>
      <h3 className={styl.sectionHeader}>Semesters</h3>
      {/* <button className={styl.addBtn} onClick={props.handleSemesterAdd}>
        Add semester
      </button> */}
      {props.semesterList &&
        props.semesterList
          .sort((a, b) => (a.semNumber > b.semNumber ? 1 : -1), {})
          .map((semester, idx) => {
            return (
              <p
                key={semester.id}
                className={
                  props.selectedSemester?.id === semester.id && styl.selected
                }
                onClick={() => {
                  props.handleSemesterClick(semester);
                  props.setSelectedSemester(semester);
                }}
              >
                {/* <span>{idx + 1}. </span> */}
                Sem {semester.semNumber}
              </p>
            );
          })}
      <hr className={styl.hr} />
    </section>
  );
}
