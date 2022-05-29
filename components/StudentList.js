import { useState, useEffect, forwardRef, useImperativeHandle } from "react";

import Link from "next/link";
import Image from "next/image";

import cAddDoc from "crud-lite/cAddDoc";
import ProfilePic from "comp/ProfilePic";
import ButtonIcon from "comp/ButtonIcon";
import cGetDocs from "crud-lite/cGetDocs";
import styl from "styl/StudentList.module.css";
import TextField from "@mui/material/TextField";
import cleanTimestamp from "util/cleanTimestamp";

function StudentList(props, ref) {
  const [studentList, setStudentList] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState([]);

  useEffect(() => {
    reFetch();
  }, [props.semesterId]);

  useImperativeHandle(ref, () => ({
    reFetch,
  }));

  async function reFetch() {
    let conditions = [
      // { field: "status", operator: "==", value: "student" },
      { field: "isDeleted", operator: "!=", value: true },
    ];
    if (props.semesterId) {
      conditions.push({
        field: "semesterId",
        operator: "==",
        value: props.semesterId,
      });
    }
    let users = await cGetDocs({
      collectionPath: ["semstudents"],
      conditions,
      orderByFields: ["isDeleted", "seatNumber", "displayName"],
    });
    if (users.length) {
      // users = users.reduce((x, y) => (x.seatNumber > y.seatNumber ? x : y));
    }
    console.log("fetched users = ", users);
    setStudentList(cleanTimestamp(users, "date"));
  }

  async function handleNewEntryKeyPress(e) {
    if (e.key !== "Enter" || e.target.value === "" || e.target.value === null)
      return;

    let seatNumber;

    //Calculating seat number from number of students in current semester
    const currentStudents = await cGetDocs({
      collectionPath: ["semstudents"],
      conditions: [
        { field: "semesterId", operator: "==", value: props.semesterId },
      ],
    });
    console.log("calculating current seat no. ", currentStudents);

    if (currentStudents.length) {
      // const prefix = currentStudents[0].seatNumber.split("-")[0];
      const newSeatNumber = currentStudents[0].seatNumber + 1;
      seatNumber = newSeatNumber;
    }

    const s = await cAddDoc({
      collectionPath: ["semstudents"],
      docData: {
        displayName: e.target.value,
        isDeleted: false,
        semesterId: props.semesterId,
        seatNumber: currentStudents.length + 1000,
        courseId: props.courseId,
      },
    });

    //Get exams related to course and create marksheets with the corresponding subjects and electives.
    const examList = await cGetDocs({
      collectionPath: ["exams"],
      conditions: [
        { field: "courseId", operator: "==", value: props.courseId },
      ],
    });

    examList.forEach((exam) => {
      cAddDoc({
        collectionPath: ["marksheets"],
        docData: {
          exam,
          student: {
            id: s.id,
            displayName: e.target.value,
            semesterId: exam.semesterId,
            courseId: props.courseId,
          },
          isDeleted: false,
          examId: exam.id,
        },
      });
    });
    reFetch();
  }

  useEffect(() => {
    reFetch();
  }, [props?.semesterId]);
  return (
    <table className={styl.userTable}>
      {/* <tr>
        <th>&nbsp;</th>
        <th>&nbsp;</th>
        <th></th>
      
        <th>&nbsp;</th>
        <th>&nbsp;</th> 
        <th>&nbsp;</th> 
      </tr> */}
      <div className={styl.addBtn}>
        <ButtonIcon onClick={props.handleAddStudent}>
          <Image
            src="/img/plus_dark.svg"
            height="22"
            width="22"
            alt="add_user"
          />
        </ButtonIcon>
      </div>

      <tr>
        <td></td>
        <td></td>
        <td>
          <TextField
            label="Name"
            name="displayName"
            margin="normal"
            variant="outlined"
            helpText="Display Name is required"
            onKeyPress={handleNewEntryKeyPress}
          />
        </td>
        <td>
          <TextField
            label="Prefix"
            name="prefix"
            margin="normal"
            variant="outlined"
            helpText="Prefix is required"
            onKeyPress={handleNewEntryKeyPress}
          />
        </td>
      </tr>
      <tr>
        <td>Seat no.</td>
        <td></td>
        <td>Name</td>
      </tr>
      {studentList.length &&
        studentList.map((user) => {
          // console.log("USER + ", user);
          return (
            <tr
              key={user.id}
              className={`${selectedStudent === user.id && styl.selected} ${
                styl.datarow
              }`}
            >
              <td>{user?.seatNumber}</td>
              <td>
                <ProfilePic
                  imgSrc={user.profilePicURL}
                  showEditIcon={false}
                  defaultImg="empty.png"
                  size="36"
                  shape="circle"
                />
              </td>

              <td>{user.displayName}</td>
              {/* <td>{user.courseName}</td> 
              <td>{user.courseYear}</td> */}
              <td className={styl.actionBtn}>
                <ButtonIcon
                  onClick={() => {
                    setSelectedStudent(user.id);
                  }}
                  disabled={user.phone !== undefined && user.phone !== null}
                >
                  <Link href={`tel:${user.phone}`}>
                    <a>
                      <Image
                        src="/img/phone.svg"
                        height="22"
                        width="22"
                        alt="phone"
                      />
                    </a>
                  </Link>
                </ButtonIcon>
              </td>
              <td className={styl.actionBtn}>
                <ButtonIcon
                  onClick={() => {
                    setSelectedStudent(user.id);
                  }}
                  disabled={user.email !== undefined && user.email !== null}
                >
                  <Link href={`mailto:${user.email}`}>
                    <a>
                      <Image
                        src="/img/mail.svg"
                        height="22"
                        width="22"
                        alt="mail"
                      />
                    </a>
                  </Link>
                </ButtonIcon>
              </td>
              <td className={styl.actionBtn}>
                <ButtonIcon
                  onClick={() => {
                    setSelectedStudent(user.id);
                    props.handleInfoClick(user);
                  }}
                >
                  <Image
                    src="/img/info.svg"
                    height="22"
                    width="22"
                    alt="info"
                  />
                </ButtonIcon>
              </td>
            </tr>
          );
        })}
    </table>
  );
}
export default forwardRef(StudentList);
