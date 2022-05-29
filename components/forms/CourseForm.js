import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import styled from "styled-components";
import styl from "styl/CourseForm.module.css";
import formStyl from "styl/Forms.module.css";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import DateTimePicker from "@mui/lab/DateTimePicker";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import { Timestamp } from "firebase/firestore/lite";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import ButtonIcon from "comp/ButtonIcon";
import Image from "next/image";

import cAddDoc from "crud-lite/cAddDoc";
import cGetDocs from "crud-lite/cGetDocs";
import cUpdateDoc from "crud-lite/cUpdateDoc";
import range from "util/range";
import { toastOptions } from "comp/constants";
import { toast } from "react-toastify";

const CourseForm = (props, ref) => {
  console.log("rendering course form, ");

  const [showForm, setShowForm] = useState(false);
  const [course, setCourse] = useState(null);
  const [subjectList, setSubjectList] = useState([]);
  const [electiveList, setElectiveList] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    (async () => {
      const subjectList = await cGetDocs({
        collectionPath: ["subjects"],
        conditions: [{ field: "isDeleted", operator: "!=", value: true }],
      });
      setSubjectList(subjectList);
      const electiveList = await cGetDocs({
        collectionPath: ["subjects"],
        conditions: [
          { field: "isDeleted", operator: "!=", value: true },
          { field: "isElective", operator: "==", value: true },
        ],
        orderByFields: ["isDeleted", "subjectName"],
      });
      setElectiveList(electiveList);
    })();
    return () => {
      reset({
        courseName: null,
        years: null,
      });
    };
  }, []);

  useEffect(() => {
    console.log("subject change, ", subjects);
  }, [subjects]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm();

  // const { fields, append, remove, update } = useFieldArray({
  //   control,
  //   name: "electiveGroups",
  // });

  const hide = () => setShowForm(false);
  const unhide = () => setShowForm(true);

  useImperativeHandle(ref, () => ({
    setCourse: (course) => {
      reset({
        courseName: null,
        years: null,
      });

      setCourse(course);
      reset(course);
      console.log("setting course = ", course);

      if (course.subjects) {
        setSubjects(course.subjects);
        course.subjects.map((s) => s.id);
        console.log("setting subs = ", course.subjects);
        console.log(
          "course.subjects.map((s) => s.id); = ",
          course.subjects.map((s) => s.id)
        );

        setValue("subjects", course.subjects);
      }
    },
    hide,
    unhide,
    confirmUpdate,
    clearForm: () =>
      reset({
        courseName: null,
        years: null,
        // subjects: [],
        // electiveGroups: [],
      }),
  }));

  async function confirmUpdate(data) {
    //Updating course
    await cUpdateDoc({
      collectionPath: ["courses"],
      docId: data.id,
      docData: data,
    });

    //Checking if exams exist, if not then creating them
    // await checkDefaultExams(data, data.years);

    await updateMarksheets(data);
    await updateExams(data);
    await updateStudents(data);

    //Updating exams
    // const exams = await cGetDocs({
    //   collectionPath: ["exams"],
    //   conditions: [
    //     {
    //       field: "status",
    //       operator: "in",
    //       value: ["Not scheduled", "Not started"],
    //     },
    //     { field: "courseId", operator: "==", value: data.id },
    //   ],
    //   orderByFields: ["courseName"],
    // });

    // if (exams.length) {
    //   exams.forEach((exam) =>
    //     cUpdateDoc({
    //       collectionPath: ["exams"],
    //       docData: {
    //         ...exam,
    //         subjects: data.subjects,
    //         electives: computeElectiveList(data),
    //         subjectsChanged: true,
    //       },
    //     })
    //   );
    // }
    props.handleSubmit(data);
    reset({
      courseName: null,
      years: null,
      subjects: [],
      electiveGroups: [],
    });
    hide();
    toast.success("Updated course successfully!", toastOptions);
  }

  function computeElectiveList(data) {
    //Computing set of electives
    let electiveSet = new Set();
    let electiveList = [];
    data.electiveGroups.forEach((eg) => {
      eg.electives.forEach((elec) => {
        electiveSet.add(elec.id);
        electiveList.push(elec);
      });
    });
    const computedElectiveList = Array.from(electiveSet).map((elecId) => {
      const subjectName = electiveList.filter(
        (elective) => elective.id === elecId
      )[0].subjectName;
      return { id: elecId, subjectName };
    });
    return computedElectiveList;
  }

  async function checkDefaultExams(course, totalYears) {
    let defaultExams = await cGetDocs({
      collectionPath: ["exams"],
      conditions: [
        //CHECK: Do you want to update old exams? Old exams of the current academic year? Old exams of previous years?
        {
          field: "status",
          operator: "in",
          value: ["Not scheduled", "Not started"],
        },
        { field: "courseId", operator: "==", value: course.id },
        { field: "isDefault", operator: "==", value: true },
        { field: "isDeleted", operator: "!=", value: true },
      ],
      orderByFields: ["isDeleted", "courseName"],
    });
    if (!defaultExams || defaultExams.length === 0) defaultExams = [];

    console.log("def exams = ", defaultExams);

    const computedElectiveList = computeElectiveList(course);

    const commonExamData = {
      courseId: course.id,
      courseName: course.courseName,
      subjects: course.subjects,
      electives: computedElectiveList,
      status: "Not scheduled",
      isDefault: true,
      isDeleted: false,
    };
    console.log("commonExamData = ", commonExamData);

    //After reducing number of years, in a course update
    const extraExams = defaultExams.filter((exam) => exam.year > totalYears);
    console.log("extraExams = ", extraExams);
    if (extraExams.length) {
      extraExams.forEach((exam) =>
        cUpdateDoc({
          collectionPath: ["exams"],
          docData: {
            id: exam.id,
            isDeleted: true,
          },
        })
      );
    }

    for (const y = 1; y <= totalYears; y++) {
      const currentYearExams = defaultExams.filter((exam) => exam.year === y);
      //Checking if the required 4 default exams per semester exist, if not, then creating them
      const currentYearFirstSemInt = currentYearExams.filter(
        (exam) => exam.semester === 2 * (y - 1) + 1 && exam.isExternal === false
      ).length;
      const currentYearSecondSemInt = defaultExams.filter(
        (exam) => exam.semester === 2 * (y - 1) + 2 && exam.isExternal === false
      ).length;
      const currentYearFirstSemExt = defaultExams.filter(
        (exam) => exam.semester === 2 * (y - 1) + 1 && exam.isExternal === true
      ).length;
      const currentYearSecondSemExt = defaultExams.filter(
        (exam) => exam.semester === 2 * (y - 1) + 2 && exam.isExternal === true
      ).length;
      console.log(
        "currentYearFirstSemInt",
        currentYearFirstSemInt,
        currentYearSecondSemInt,
        currentYearFirstSemExt,
        currentYearSecondSemExt
      );

      if (!currentYearFirstSemInt) {
        await cAddDoc({
          collectionPath: ["exams"],
          docData: {
            ...commonExamData,
            examName: `Sem - ${2 * (y - 1) + 1}`,
            isExternal: false,
            semester: 2 * (y - 1) + 1,
            year: y,
          },
        });
      }
      if (!currentYearSecondSemInt) {
        await cAddDoc({
          collectionPath: ["exams"],
          docData: {
            ...commonExamData,
            examName: `Sem - ${2 * (y - 1) + 2}`,
            isExternal: false,
            semester: 2 * (y - 1) + 2,
            year: y,
          },
        });
      }
      if (!currentYearFirstSemExt) {
        await cAddDoc({
          collectionPath: ["exams"],
          docData: {
            ...commonExamData,
            examName: `Sem - ${2 * (y - 1) + 1}`,
            isExternal: true,
            semester: 2 * (y - 1) + 1,
            year: y,
          },
        });
      }
      if (!currentYearSecondSemExt) {
        await cAddDoc({
          collectionPath: ["exams"],
          docData: {
            ...commonExamData,
            examName: `Sem - ${2 * (y - 1) + 2}`,
            isExternal: true,
            semester: 2 * (y - 1) + 2,
            year: y,
          },
        });
      }
    }
  }
  async function updateMarksheets(course) {
    const marksheetList = await cGetDocs({
      collectionPath: ["marksheets"],
      conditions: [
        { field: "exam.courseId", operator: "==", value: course.id },
      ],
    });
    marksheetList?.forEach((mks) => {
      cUpdateDoc({
        collectionPath: ["marksheets"],
        docData: {
          id: mks.id,
          courseName: course.courseName,
        },
      });
    });
  }
  async function updateExams(course) {
    const examList = await cGetDocs({
      collectionPath: ["exams"],
      conditions: [{ field: "courseId", operator: "==", value: course.id }],
    });
    examList?.forEach((exam) => {
      cUpdateDoc({
        collectionPath: ["exams"],
        docData: {
          id: exam.id,
          courseName: course.courseName,
        },
      });
    });
  }
  async function updateStudents(course) {
    const studentList = await cGetDocs({
      collectionPath: ["user"],
      conditions: [{ field: "courseId", operator: "==", value: course.id }],
    });
    studentList?.forEach((student) => {
      cUpdateDoc({
        collectionPath: ["user"],
        docData: {
          id: student.id,
          courseName: course.courseName,
        },
      });
    });
  }

  function getMarks(subject, marksheet, subjectType) {
    const sub = marksheet.exam[subjectType].filter(
      (s) => s.id === subject.id
    )[0];
    if (sub) return sub.marks;
    else return null;
  }

  async function createSemester({
    courseId,
    courseName,
    currentYearSemNumber,
    semNumber,
    year,
  }) {
    return await cAddDoc({
      collectionPath: ["semesters"],
      docData: {
        courseId,
        courseName,
        subjects: [],
        electives: [],
        isDeleted: false,
        currentYearSemNumber,
        semNumber,
        year,
      },
    });
  }

  const onSubmit = async (data) => {
    // if (!getValues("subjects").length) {
    //   toast.error("Subjects are required", toastOptions);
    //   return;
    // }
    console.log("submitted course = ", data);

    if (course !== null) {
      //Update confirmation
      //Check if default exams exist, if not, create them
      console.log("passing data to check update confirm", data);
      props.checkUpdateConfirmation(data);
    } else {
      const course = await cAddDoc({
        collectionPath: ["courses"],
        docData: { ...data, isDeleted: false },
      });
      // const computedElectiveList = computeElectiveList(data);

      const commonExamData = {
        courseId: course.id,
        courseName: data.courseName,
        // subjects: data.subjects,
        // electives: computedElectiveList,
        status: "Not scheduled",
        isDefault: true,
        isDeleted: false,
        subjects: [],
        electives: [],
      };
      console.log("common exam data = ", commonExamData);
      for (const n = 1; n <= data.years; n++) {
        const sem1 = 2 * (n - 1) + 1;
        const sem2 = 2 * (n - 1) + 2;

        const semester1 = await createSemester({
          courseId: course.id,
          courseName: data.courseName,
          currentYearSemNumber: 1,
          semNumber: sem1,
          year: n,
        });
        const semester2 = await createSemester({
          courseId: course.id,
          courseName: data.courseName,
          currentYearSemNumber: 2,
          semNumber: sem2,
          year: n,
        });

        //SEM1 (current year)
        const exam1 = {
          ...commonExamData,
          examName: `Sem - ${sem1} - Int`,
          isExternal: false,
          semNumber: sem1,
          semesterId: semester1.id,
          year: n,
        };
        const exam2 = {
          ...commonExamData,
          examName: `Sem - ${sem2} - Int`,
          isExternal: false,
          semNumber: sem2,
          semesterId: semester2.id,
          year: n,
        };

        //SEM2 (current year)
        const exam3 = {
          ...commonExamData,
          examName: `Sem - ${sem1} - Ext`,
          isExternal: true,
          semNumber: sem1,
          semesterId: semester1.id,
          year: n,
        };
        const exam4 = {
          ...commonExamData,
          examName: `Sem - ${sem2} - Ext`,
          isExternal: true,
          semNumber: sem2,
          semesterId: semester2.id,
          year: n,
        };
        console.log("examArr", [exam1, exam2, exam3, exam4]);

        [exam1, exam2, exam3, exam4].forEach(async (exam) => {
          await cAddDoc({
            collectionPath: ["exams"],
            docData: exam,
          });
        });
      }
    }
    props.handleSubmit();
    hide();
    reset({
      courseName: null,
      years: null,
    });
  };

  return (
    <>
      {showForm ? (
        <form className={styl.form} onSubmit={handleSubmit(onSubmit)}>
          <h1>{props.formTitle}</h1>
          <TextField
            label="Course Name"
            name="courseName"
            margin="normal"
            variant="outlined"
            error={errors && errors.courseName}
            helpText="Course Name is required"
            {...register("courseName", { required: true })}
          />

          {!course && (
            <Controller
              render={() => (
                <FormControl margin="normal">
                  <InputLabel>Total years</InputLabel>
                  <Select
                    label="Total years"
                    onChange={(e) => setValue("years", e.target.value)}
                    value={getValues("years")}
                  >
                    <MenuItem key="1" value={1}>
                      1
                    </MenuItem>
                    <MenuItem key="2" value={2}>
                      2
                    </MenuItem>
                    <MenuItem key="3" value={3}>
                      3
                    </MenuItem>
                    <MenuItem key="4" value={4}>
                      4
                    </MenuItem>
                    <MenuItem key="5" value={5}>
                      5
                    </MenuItem>
                  </Select>
                </FormControl>
              )}
              name="years"
              label="Total years"
              control={control}
            />
          )}
          <Controller
            render={() => (
              <FormControl margin="normal">
                <InputLabel>Full credits</InputLabel>
                <Select
                  label="Full credits"
                  onChange={(e) => setValue("fullCredits", e.target.value)}
                  value={getValues("fullCredits")}
                >
                  <MenuItem key="1" value={1}>
                    1
                  </MenuItem>
                  <MenuItem key="2" value={2}>
                    2
                  </MenuItem>
                  <MenuItem key="3" value={3}>
                    3
                  </MenuItem>
                  <MenuItem key="4" value={4}>
                    4
                  </MenuItem>
                  <MenuItem key="5" value={5}>
                    5
                  </MenuItem>
                </Select>
              </FormControl>
            )}
            name="fullCredits"
            label="Full credits"
            control={control}
          />

          {/* <Controller
            render={() => (
              <FormControl>
                <InputLabel>Subjects</InputLabel>
                <Select
                  onChange={handleSubjectChange}
                  value={
                    getValues("subjects")
                      ? getValues("subjects").map((s) => s.id)
                      : []
                  }
                  label="Subjects"
                  multiple
                >
                  {subjectList.map((subject) => (
                    <MenuItem key={subject.id} value={subject.id}>
                      {subject.subjectName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            name={"subjects"}
            // label="Subjects"
            control={control}
          />
          <section className={styl.electiveGroupSection}>
            <h3>Elective groups</h3>
            <div className={styl.addElectiveGroupBtn}>
              <ButtonIcon
                onClick={(e) => {
                  e.preventDefault();
                  append({ groupIdx: fields.length, electives: [] });
                  console.log("onadd", getValues("electiveGroup"));
                }}
              >
                <Image
                  src="/img/plus_dark.svg"
                  height="22"
                  width="22"
                  alt="add_elective_group"
                />
              </ButtonIcon>
            </div>

            {fields.map((electiveGroup, index) => (
              <div className={styl.electiveGroup} key={electiveGroup.id}>
                <p>{index + 1}</p>
                <Controller
                  render={() => (
                    <FormControl>
                      <InputLabel>Elective group</InputLabel>
                      <Select
                        onChange={(e) =>
                          handleElectiveGroupChange(
                            index,
                            electiveGroup,
                            e.target.value
                          )
                        }
                        defaultValue={electiveGroup.electives.map((s) => s.id)}
                        label="Elective group"
                        multiple
                      >
                        {electiveList &&
                          electiveList.map((elective) => (
                            <MenuItem key={elective.id} value={elective.id}>
                              {elective.subjectName}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  )}
                  name={`electiveGroups.${index}.electives`}
                  label="Elective group"
                  control={control}
                />
                <div className={styl.deleteElectiveGroupBtn}>
                  <ButtonIcon
                    onClick={() => {
                      remove(index);
                    }}
                  >
                    <Image
                      src="/img/delete.svg"
                      height="22"
                      width="22"
                      alt="add_elective_group"
                    />
                  </ButtonIcon>
                </div>
              </div>
            ))}
          </section> */}
          <div className={styl.deleteBtn}>
            <ButtonIcon
              onClick={() => {
                hide();
                props.handleDelete(course);
              }}
            >
              <Image
                src="/img/delete.svg"
                height="22"
                width="22"
                alt="delete"
              />
            </ButtonIcon>
          </div>
          <div
            margin="normal"
            className={`${formStyl.actionBtnGrp} ${formStyl.reverseFlex}`}
          >
            <button type="submit" value="submit" className={formStyl.submit}>
              Submit
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                reset({
                  courseName: null,
                  years: null,
                  subjects: [],
                  electiveGroups: [],
                });
                hide();
                props.handleCancel(course);
              }}
              value="cancel"
              className={formStyl.cancel}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <></>
      )}
    </>
  );
};

export default forwardRef(CourseForm);
