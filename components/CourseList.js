import styl from "styl/CourseList.module.css";

export default function CourseList(props) {
  return (
    <section className={styl.courses}>
      <h3 className={styl.sectionHeader}>Courses</h3>
      {props.claims.includes("admin") && (
        <button className={styl.addBtn} onClick={props.handleAddCourse}>
          Add course
        </button>
      )}

      {props.courseList &&
        props.courseList.map((course, idx) => {
          return (
            <p
              key={course.id}
              className={
                props.selectedCourse?.id === course.id && styl.selected
              }
              onClick={(e) => {
                props.setSelectedCourse(course);

                if (e.target !== e.currentTarget) return;
                props.setSemesterList(
                  props.groupedSemesters[course.id]?.sort(
                    (a, b) => (a.semNumber > b.semNumber ? 1 : -1),
                    {}
                  )
                );
                props.handleSemesterClick(props.groupedSemesters[course.id][0]);
              }}
            >
              <span>{idx + 1}. </span>
              {course.courseName}
              <span
                className={styl.editBtn}
                onClick={() => props.handleEditCourse(course)}
              >
                Edit course
              </span>
            </p>
          );
        })}
    </section>
  );
}
