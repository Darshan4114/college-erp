import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

import styl from "styl/index.module.css";

import groupBy from "util/groupBy";
import checkAuth from "util/checkAuth";
import cleanTimestamp from "util/cleanTimestamp";
import generateSummaries from "util/generateSummaries";
import generateSuperMarksheet from "util/generateSuperMarksheet";
import generateSubjectMarksheet from "util/generateSubjectMarksheet";
import generateUniversityLedgers from "util/generateUniversityLedgers";
import secondsToFirebaseTimestamp from "util/secondsToFirebaseTimestamp";
import generateEmptySubjectMarksheet from "util/generateEmptySubjectMarksheet";

import cAddDoc from "crud-lite/cAddDoc";
import cGetDoc from "crud-lite/cGetDoc";
import cGetDocs from "crud-lite/cGetDocs";
import cUpdateDoc from "crud-lite/cUpdateDoc";

import ExamList from "comp/ExamList";
import SearchBar from "comp/SearchBar";
import ButtonIcon from "comp/ButtonIcon";
import ExamDetail from "comp/ExamDetail";
import CourseList from "comp/CourseList";
import ActionList from "comp/ActionList";
import SemesterList from "comp/SemesterList";
import CourseDetail from "comp/CourseDetail";
import SemesterDetail from "comp/SemesterDetail";

import markLockWarning from "comp/messages/markLockWarning";
import markUpdateWarning from "comp/messages/markUpdateWarning";
import courseUpdateWarning from "comp/messages/courseUpdateWarning";
import semesterUpdateWarning from "comp/messages/semesterUpdateWarning";
import markUpdateCancelWarning from "comp/messages/markUpdateCancelWarning";

import Checkbox from "@mui/material/Checkbox";

import ExamForm from "form/ExamForm";
import MarkForm from "form/MarkForm";
import DeleteForm from "form/DeleteForm";
import CourseForm from "form/CourseForm";
import StudentForm from "form/StudentForm";
import SubjectForm from "form/SubjectForm";
import MassMarkForm from "form/MassMarkForm";
import SemesterForm from "form/SemesterForm";
import SemStudentForm from "form/SemStudentForm";
import UpdateConfirmationForm from "form/UpdateConfirmationForm";

import { Timestamp } from "firebase/firestore/lite";

import { toast } from "react-toastify";
import { toastOptions } from "comp/constants";

export const getServerSideProps = async (ctx) => {
  let res = await checkAuth({
    ctx,
    requireLogin: true,
    minimumOneClaim: ["coordinator", "caap", "admin"],
  });
  return res;
};

export default function Index({ userId, userName, claims, tabValue }) {
  console.log("index rerender");
  const [examList, setExamList] = useState([]);
  const [semesterList, setSemesterList] = useState([]);
  const [groupedSemesters, setGroupedSemesters] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);

  const markForm = useRef(null);
  const examForm = useRef(null);
  const deleteForm = useRef(null);
  const courseForm = useRef(null);
  const subjectForm = useRef(null);
  const studentForm = useRef(null);
  const massMarkForm = useRef(null);
  const semesterForm = useRef(null);
  const semStudentForm = useRef(null);
  const studentDeleteForm = useRef(null);
  const subjectDeleteForm = useRef(null);
  const markUpdateCancelForm = useRef(null);
  const markLockConfirmationForm = useRef(null);
  const markUpdateConfirmationForm = useRef(null);
  const courseUpdateConfirmationForm = useRef(null);
  const semesterUpdateConfirmationForm = useRef(null);
  const massMarkUpdateConfirmationForm = useRef(null);

  const examDetail = useRef(null);
  const courseDetail = useRef(null);
  const semesterDetail = useRef(null);

  useEffect(() => {
    reFetch();
  }, []);

  //Utils
  function hideAllExcept(unhideForm) {
    if (unhideForm !== markForm.current) markForm.current.hide();
    // if (unhideForm !== examForm.current) examForm.current.hide();
    if (unhideForm !== deleteForm.current) deleteForm.current.hide();
    if (unhideForm !== courseForm.current) courseForm.current.hide();
    if (unhideForm !== semesterForm.current) semesterForm.current.hide();
    if (unhideForm !== courseUpdateConfirmationForm.current)
      courseUpdateConfirmationForm.current.hide();
    if (unhideForm !== semesterUpdateConfirmationForm.current)
      semesterUpdateConfirmationForm.current.hide();
    if (unhideForm !== examDetail.current) examDetail.current.hide();
    if (unhideForm !== courseDetail.current) courseDetail.current.hide();
    if (unhideForm !== semesterDetail.current) semesterDetail.current.hide();
  }

  async function reFetch(course) {
    //course
    let c;
    let conditions = [{ field: "isDeleted", operator: "!=", value: true }];
    let orderByFields = [];
    let semesters = await reFetchSemesters();

    const groupedSemesters = groupBy(semesters, "courseId");
    setGroupedSemesters(groupedSemesters);

    if (claims.includes("coordinator")) {
      const coordinator = await cGetDoc({
        collectionPath: ["users"],
        docId: userId,
      });

      conditions.push({
        field: "id",
        operator: "in",
        value: coordinator?.courses.map((c) => c.id),
      });
      orderByFields = ["isDeleted", "displayName"];
    }

    const courses = await cGetDocs({
      collectionPath: ["courses"],
      conditions,
      orderByFields,
    });
    if (!courses) return;
    if (course) c = course;
    else c = courses[0];
    //CHECK: setting the first index, you might wanna set the previously selected one by storing it in local
    if (!courses.length) return;
    setCourseList(courses);
    setSelectedCourse(c);

    setSemesterList(groupedSemesters[c.id]);
    const sem = groupedSemesters[c.id] ? groupedSemesters[c.id][0] : null;
    if (!sem) return;

    setSelectedSemester(sem);
    handleSemesterClick(sem);
    const exams = await reFetchExams(sem.id);
    semesterDetail.current.setExam(
      exams.filter((ex) => ex.isExternal === false)[0]
    );

    return true;
  }

  async function reFetchExams(semId) {
    let conditions = [{ field: "isDeleted", operator: "!=", value: true }];
    if (semId) {
      conditions.push({ field: "semesterId", operator: "==", value: semId });
    }
    let exams = await cGetDocs({
      collectionPath: ["exams"],
      conditions,
      orderByFields: ["isDeleted"],
    });
    if (exams) {
      return cleanTimestamp(exams, "date");
    } else {
      return [];
    }
  }
  async function reFetchSemesters(courseId) {
    let conditions = [{ field: "isDeleted", operator: "!=", value: true }];
    if (courseId) {
      conditions.push({ field: "courseId", operator: "==", value: courseId });
    }
    let semesters = await cGetDocs({
      collectionPath: ["semesters"],
      conditions,
      orderByFields: ["isDeleted", "semNumber"],
    });
    if (semesters) {
      return cleanTimestamp(semesters, "date");
    } else {
      return [];
    }
  }

  //CourseList EH
  function handleAddCourse() {
    hideAllExcept(courseForm.current);
    courseForm.current.clearForm();
    courseForm.current.unhide();
  }
  function handleEditCourse(course) {
    hideAllExcept(courseForm.current);
    courseForm.current.setCourse(course);
    courseForm.current.unhide();
  }
  function checkCourseUpdateConfirmation(data) {
    courseUpdateConfirmationForm.current.setUpdateData(data);
    courseUpdateConfirmationForm.current.setConfirmationMessage(
      courseUpdateWarning
    );
    courseUpdateConfirmationForm.current.unhide();
  }
  function checkSemesterUpdateConfirmation(data) {
    semesterUpdateConfirmationForm.current.setUpdateData(data);
    semesterUpdateConfirmationForm.current.setConfirmationMessage(
      semesterUpdateWarning
    );
    semesterUpdateConfirmationForm.current.unhide();
  }
  function checkMarkUpdateConfirmation(data) {
    markUpdateConfirmationForm.current.setUpdateData(data);
    markUpdateConfirmationForm.current.setConfirmationMessage(
      markUpdateWarning
    );
    markUpdateConfirmationForm.current.setPrimaryBtnLabel("Confirm Update");
    markUpdateConfirmationForm.current.setSecondaryBtnLabel("Edit marks");
    markUpdateConfirmationForm.current.unhide();
  }
  function checkMarkUpdateCancel() {
    markUpdateCancelForm.current.setUpdateData();
    markUpdateCancelForm.current.setConfirmationMessage(
      markUpdateCancelWarning
    );
    markUpdateCancelForm.current.setPrimaryBtnLabel("Cancel update");
    markUpdateCancelForm.current.setSecondaryBtnLabel("Edit marks");
    markUpdateCancelForm.current.unhide();
  }
  function checkMassMarkUpdateConfirmation(data) {
    massMarkUpdateConfirmationForm.current.setUpdateData(data);
    massMarkUpdateConfirmationForm.current.setConfirmationMessage(
      markUpdateWarning
    );
    massMarkUpdateConfirmationForm.current.setPrimaryBtnLabel("Confirm Update");
    massMarkUpdateConfirmationForm.current.setSecondaryBtnLabel("Edit marks");
    massMarkUpdateConfirmationForm.current.unhide();
  }

  function checkMarkLockConfirmation(updateData) {
    markLockConfirmationForm.current.setUpdateData(updateData);
    markLockConfirmationForm.current.setConfirmationMessage(markLockWarning);
    markLockConfirmationForm.current.setPrimaryBtnLabel("Lock marks");
    markLockConfirmationForm.current.unhide();
  }

  async function handleCourseUpdateConfirm(course) {
    const semesters = await reFetchSemesters(course.id);
    const newCourseList = courseList.map((c) =>
      c.id === course.id ? course : c
    );
    setCourseList(newCourseList);
    setSemesterList(semesters);
  }

  async function handleSemesterUpdateConfirm({ semester }) {
    //Resetting semesterlist with new semester
    const newSemesterList = semesterList.map((s) =>
      s.id === semester.id ? semester : s
    );
    setSemesterList(newSemesterList);
    //Gets exams for the sem and sets them
    handleSemesterClick(semester);
  }

  async function handleMarkLockConfirm({ exam, subject, subjectType }) {
    const newSubjectArr = exam[subjectType].map((s) =>
      s.id === subject.id ? { ...subject, marksLocked: true } : s
    );
    let docData;
    if (subjectType === "subjects") {
      docData = { id: exam.id, subjects: newSubjectArr };
    } else if (subjectType === "electives") {
      docData = { id: exam.id, electives: newSubjectArr };
    }

    await cUpdateDoc({
      collectionPath: ["exams"],
      docData,
    });
    toast.success("Marks successfully locked!", toastOptions);
  }

  function getDateTime(subject, exam, subjectType) {
    let sub = exam[subjectType].filter((s) => s.id === subject.id);
    sub = sub[0];

    if (sub) return sub.dateTime;
    else return null;
  }

  function handleStudentInfoClick(student) {
    semStudentForm.current.setStudent(student);
    semStudentForm.current.unhide();
  }

  //Examlist EH
  // function handleExamAdd() {
  //   hideAllExcept(examForm.current);
  //   examForm.current.unhide();
  // }
  /**
   *
   * @param {*} sem - semester to get exams for
   */
  async function handleSemesterClick(sem) {
    const exams = await reFetchExams(sem.id);
    hideAllExcept(semesterDetail.current);
    setSelectedSemester(sem);
    semesterDetail.current.unhide();
    semesterDetail.current.setSemester(sem);
    semesterDetail.current.setExams(exams);
  }

  async function enterMarks(exam, subject) {
    //Existing marksheets
    const mksList = await cGetDocs({
      collectionPath: ["marksheets"],
      conditions: [
        { field: "isDeleted", operator: "!=", value: true },
        { field: "examId", operator: "==", value: exam.id },
      ],
      orderByFields: ["isDeleted", "student.roll"],
    });

    //Students
    let studentList = await cGetDocs({
      collectionPath: ["users"],
      conditions: [
        { field: "isDeleted", operator: "!=", value: true },
        { field: "status", operator: "==", value: "student" },
        { field: "courseId", operator: "==", value: exam.courseId },
      ],
      orderByFields: ["isDeleted", "roll"],
    });

    //Students without marksheets
    const studentsWithoutMarksheet = studentList.filter(
      (s) => !mksList.map((mks) => mks.student.id).includes(s.id)
    );

    let marksheetList = [];

    //Creating required marksheets
    for (const s of studentsWithoutMarksheet) {
      const mks = await cAddDoc({
        collectionPath: ["marksheets"],
        docData: {
          student: secondsToFirebaseTimestamp([s])[0],
          exam: {
            ...exam,
            subjects: secondsToFirebaseTimestamp(exam.subjects),
            electives: exam.electives
              ? secondsToFirebaseTimestamp(exam.electives)
              : [],
          },
          isDeleted: false,
          examId: exam.id,
        },
      });
      marksheetList.push(mks);
    }

    markForm.current.setMarksheetList([...mksList, ...marksheetList]);
    markForm.current.setExam(exam);
    markForm.current.setSelectedSubject(subject);
    markForm.current.unhide();

    studentList = cleanTimestamp(studentList, "datetimeDmt12h");
    exam.subjects = cleanTimestamp(exam.subjects, "datetimeDmt12h");

    await cUpdateDoc({
      collectionPath: ["exams"],
      docData: { id: exam.id, marksEntered: true },
    });

    markForm.current.setNumberOfSubjects(exam.subjects.length);
  }

  function lockMarks(updateData) {
    checkMarkLockConfirmation(updateData);
  }
  async function handleGenerateSubjectMarksheet({ exam, subject }) {
    const marksheets = await cGetDocs({
      collectionPath: ["marksheets"],
      conditions: [{ field: "examId", operator: "==", value: exam.id }],
    });
    generateSubjectMarksheet({ exam, subject, marksheets });
  }
  async function handleGenerateEmptySubjectMarksheet({ exam, subject }) {
    const marksheets = await cGetDocs({
      collectionPath: ["marksheets"],
      conditions: [{ field: "examId", operator: "==", value: exam.id }],
    });
    generateEmptySubjectMarksheet({ exam, subject, marksheets });
  }
  async function downloadSuperMarksheet() {
    //Students
    let students = await cGetDocs({
      collectionPath: ["users"],
      conditions: [
        { field: "isDeleted", operator: "!=", value: true },
        { field: "status", operator: "==", value: "student" },
        { field: "courseId", operator: "==", value: selectedCourse.id },
      ],
      orderByFields: ["isDeleted", "roll"],
    });
    //Marksheets
    const marksheets = await cGetDocs({
      collectionPath: ["marksheets"],
      conditions: [
        { field: "exam.courseId", operator: "==", value: selectedCourse.id },
      ],
    });
    const superMks = await generateSuperMarksheet({ students, marksheets });
  }
  async function downloadSummary() {
    if (!selectedCourse) return;
    //Students
    let students = await cGetDocs({
      collectionPath: ["users"],
      conditions: [
        { field: "isDeleted", operator: "!=", value: true },
        { field: "status", operator: "==", value: "student" },
        { field: "courseId", operator: "==", value: selectedCourse.id },
      ],
      orderByFields: ["isDeleted", "roll"],
    });
    //Marksheets
    const marksheets = await cGetDocs({
      collectionPath: ["marksheets"],
      conditions: [
        { field: "exam.courseId", operator: "==", value: selectedCourse.id },
      ],
    });
    const summaries = await generateSummaries({
      students,
      marksheets,
      course: selectedCourse,
    });
  }
  async function downloadUniversityLedgers() {
    if (!selectedCourse) return;
    //Students
    let students = await cGetDocs({
      collectionPath: ["users"],
      conditions: [
        { field: "isDeleted", operator: "!=", value: true },
        { field: "status", operator: "==", value: "student" },
        { field: "courseId", operator: "==", value: selectedCourse.id },
      ],
      orderByFields: ["isDeleted", "roll"],
    });
    //Marksheets
    const marksheets = await cGetDocs({
      collectionPath: ["marksheets"],
      conditions: [
        { field: "exam.courseId", operator: "==", value: selectedCourse.id },
      ],
    });
    const ledgers = await generateUniversityLedgers({
      students,
      marksheets,
      course: selectedCourse,
    });
  }

  async function enterInternalMassMarks() {
    massMarkForm.current.setMode("internal");
    massMarkForm.current.setCourse(selectedCourse);
    massMarkForm.current.unhide();
  }

  async function enterExternalMassMarks() {
    massMarkForm.current.setMode("external");
    massMarkForm.current.setCourse(selectedCourse);
    massMarkForm.current.unhide();
  }

  function handleAddStudent() {
    semStudentForm.current.unhide();
  }

  const onCourseSubmitOrCancel = (course) => {
    // if (course) {
    //   courseDetail.current.setCourse(course);
    //   reFetch();
    //   courseDetail.current.unhide();
    // }
  };

  // function handleTimetableEdit(exam) {
  //   examForm.current.setExam(exam);
  //   hideAllExcept(examForm.current);
  //   examForm.current.unhide();
  // }

  // const onSemesterSubmitOrCancel = (sem) => {

  // };
  const courseFormProps = {
    handleSubmit: (course) => {
      reFetch(course);
    },
    handleCancel: () => handleSemesterClick(semesterList[0]),
    checkUpdateConfirmation: checkCourseUpdateConfirmation,
    handleCourseUpdateConfirm,
    handleDelete: async (course) => {
      deleteForm.current.setMode("temporary");
      deleteForm.current.setCollectionPath(["courses"]);
      deleteForm.current.setDocId(course.id);
      deleteForm.current.setDocTitle(course.courseName);
      deleteForm.current.unhide();
    },
  };

  const courseDetailProps = {
    handleDelete: async (course) => {
      deleteForm.current.setMode("temporary");
      deleteForm.current.setCollectionPath(["courses"]);
      deleteForm.current.setDocId(course.id);
      deleteForm.current.setDocTitle(course.courseName);
      deleteForm.current.unhide();
    },
  };
  // const examFormProps = {
  //   handleSubmit: async (exam) => {
  //     const sem = semesterList.filter((s) => s.id === exam.semesterId)[0];
  //     await handleSemesterClick(sem);
  //     semesterDetail.current.setExam(exam);
  //   },
  //   handleCancel: async (exam) => {
  //     const sem = semesterList.filter((s) => s.id === exam.semesterId)[0];
  //     await handleSemesterClick(sem);
  //     semesterDetail.current.setExam(exam);
  //   },
  // };
  const examDetailProps = {
    handleDelete: async (exam) => {
      deleteForm.current.setMode("temporary");
      deleteForm.current.setCollectionPath(["exams"]);
      deleteForm.current.setDocId(exam.id);
      deleteForm.current.setDocTitle(exam.examName);
      deleteForm.current.unhide();
    },
    handleEdit: (exam) => {
      examForm.current.setExam(exam);
      examForm.current.unhide();
    },
    enterMarks,
  };
  const semesterDetailProps = {
    handleDelete: async (exam) => {
      deleteForm.current.setMode("temporary");
      deleteForm.current.setCollectionPath(["exams"]);
      deleteForm.current.setDocId(exam.id);
      deleteForm.current.setDocTitle(exam.examName);
      deleteForm.current.unhide();
    },
    handleEdit: async (sem) => {
      semesterForm.current.setSemester(sem);
      const exams = await reFetchExams(sem.id);
      semesterForm.current.setExams(exams);
      semesterForm.current.unhide();
    },
    enterMarks,
    lockMarks,
    handleGenerateSubjectMarksheet,
    handleGenerateEmptySubjectMarksheet,
    handleStudentInfoClick,
    handleAddStudent,
    // handleTimetableEdit,
  };
  const semesterFormProps = {
    checkUpdateConfirmation: checkSemesterUpdateConfirmation,
    handleSubmit: () => {},
    handleCancel: (sem) => {
      if (sem) {
        semesterDetail.current.setSemester(sem);
        hideAllExcept(semesterDetail.current);
        semesterDetail.current.unhide();
      }
    },
    handleAddSubject: (semesterId) => {
      hideAllExcept(subjectForm.current);
      subjectForm.current.setSemesterId(semesterId);
      subjectForm.current.unhide();
    },
    handleEditSubject: (subject) => {
      hideAllExcept(subjectForm.current);
      subjectForm.current.setSubject(subject);
      subjectForm.current.setSemesterId(subject.semesterId);
      subjectForm.current.unhide();
    },
  };
  const markFormProps = {
    checkMarkUpdateConfirmation,
    checkMarkUpdateCancel,
  };
  const massMarkFormProps = {
    checkMassMarkUpdateConfirmation,
    checkMarkUpdateCancel,
  };
  const studentFormProps = {
    handleCancel: () => {},
    handleSubmit: () => {},
    handleDelete: async (student) => {
      studentDeleteForm.current.setCollectionPath(["users"]);
      studentDeleteForm.current.setDocId(student.id);
      studentDeleteForm.current.setDocData(student);
      studentDeleteForm.current.setDocTitle(student.displayName);
      studentDeleteForm.current.unhide();
    },
  };
  const semStudentFormProps = {
    handleCancel: () => {},
    handleSubmit: () => {},
    handleDelete: async (student) => {
      studentDeleteForm.current.setCollectionPath(["semstudents"]);
      studentDeleteForm.current.setDocId(student.id);
      studentDeleteForm.current.setDocData(student);
      studentDeleteForm.current.setDocTitle(student.displayName);
      studentDeleteForm.current.unhide();
    },
    courseId: selectedSemester?.courseId,
  };
  const subjectFormProps = {
    reFetch: semesterForm.current?.reFetchSubjects,
    handleCancel: async () => {
      semesterForm.current.setSemester(selectedSemester);
      const exams = await reFetchExams(selectedSemester.id);
      semesterForm.current.setExams(exams);
      semesterForm.current.unhide();
    },
    handleDelete: async (subject) => {
      subjectDeleteForm.current.setCollectionPath(["subjects"]);
      subjectDeleteForm.current.setDocId(subject.id);
      subjectDeleteForm.current.setDocData(subject);
      subjectDeleteForm.current.setDocTitle(subject.subjectName);
      subjectDeleteForm.current.unhide();
    },
    handleSubmit: async (subject) => {
      const sem = await cGetDoc({
        collectionPath: ["semesters"],
        docId: subject.semesterId,
      });
      semesterForm.current.setSemester(sem);
      const exams = await reFetchExams(subject.semesterId);
      semesterForm.current.setExams(exams);
      semesterForm.current.unhide();
    },
  };

  return (
    <div className={styl.container}>
      <section className={styl.courseList}>
        <div className={styl.toolbar}>
          <SearchBar />
        </div>
        <CourseList
          courseList={courseList}
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
          setSemesterList={setSemesterList}
          groupedSemesters={groupedSemesters}
          handleAddCourse={handleAddCourse}
          handleEditCourse={handleEditCourse}
          handleSemesterClick={handleSemesterClick}
          claims={claims}
        />
      </section>

      <section className={styl.examList}>
        <ActionList
          downloadSuperMarksheet={downloadSuperMarksheet}
          downloadSummary={downloadSummary}
          enterInternalMassMarks={enterInternalMassMarks}
          enterExternalMassMarks={enterExternalMassMarks}
          downloadUniversityLedgers={downloadUniversityLedgers}
        />
        <SemesterList
          semesterList={semesterList}
          selectedSemester={selectedSemester}
          setSelectedSemester={setSelectedSemester}
          handleSemesterClick={handleSemesterClick}
        />
        {/* <ExamList
          examList={examList}
          selectedExam={selectedExam}
          handleExamAdd={handleExamAdd}
          setSelectedExam={setSelectedExam}
          handleExamClick={handleExamClick}
        /> */}
      </section>

      <section className={styl.examDetail}>
        <ExamDetail ref={examDetail} {...examDetailProps} />
        <SemesterDetail ref={semesterDetail} {...semesterDetailProps} />

        {/* Forms */}
        {/* <ExamForm ref={examForm} {...examFormProps} /> */}
        <MarkForm ref={markForm} {...markFormProps} />
        <MassMarkForm ref={massMarkForm} {...massMarkFormProps} />
        <CourseForm ref={courseForm} {...courseFormProps} />
        <SemesterForm ref={semesterForm} {...semesterFormProps} />
        <StudentForm
          ref={studentForm}
          semesterId={selectedSemester?.id}
          {...studentFormProps}
        />
        <SemStudentForm
          ref={semStudentForm}
          semesterId={selectedSemester?.id}
          {...semStudentFormProps}
        />
        <CourseDetail ref={courseDetail} {...courseDetailProps} />
        <SubjectForm ref={subjectForm} {...subjectFormProps} />
        <DeleteForm ref={deleteForm} handleConfirm={() => reFetch()} />
        <DeleteForm
          ref={subjectDeleteForm}
          handleConfirm={subjectForm.current?.handleSubjectDeleteConfirm}
        />
        <DeleteForm
          ref={studentDeleteForm}
          handleConfirm={semesterDetail.current?.reFetchStudents}
        />
        <UpdateConfirmationForm
          ref={courseUpdateConfirmationForm}
          handleConfirm={(updateData) => {
            courseForm.current.confirmUpdate(updateData);
            handleCourseUpdateConfirm(updateData);
          }}
        />
        <UpdateConfirmationForm
          ref={semesterUpdateConfirmationForm}
          handleConfirm={async (updateData) => {
            semesterForm.current.confirmUpdate(updateData);
            handleSemesterUpdateConfirm(updateData);
          }}
        />
        <UpdateConfirmationForm
          ref={markUpdateConfirmationForm}
          handleConfirm={async (updateData) => {
            markForm.current.confirmUpdate(updateData);
          }}
        />
        <UpdateConfirmationForm
          ref={massMarkUpdateConfirmationForm}
          handleConfirm={async (updateData) => {
            massMarkForm.current.confirmUpdate(updateData);
          }}
        />
        <UpdateConfirmationForm
          ref={markUpdateCancelForm}
          handleConfirm={async (updateData) => {
            markForm.current.resetState();
            markForm.current.hide();
            massMarkForm.current.resetState();
            massMarkForm.current.hide();
          }}
        />
        <UpdateConfirmationForm
          ref={markLockConfirmationForm}
          handleConfirm={async (updateData) => {
            handleMarkLockConfirm(updateData);
          }}
        />
      </section>
    </div>
  );
}
