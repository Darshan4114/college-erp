import { getStorage, ref, getDownloadURL } from "firebase/storage";
import cleanTimestamp from "util/cleanTimestamp";
import groupBy from "util/groupBy";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const storage = getStorage();

export default async function generateSuperMarksheet({ students, marksheets }) {
  const doc = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: "a4",
    putOnlyUsedFonts: true,
    compress: true,
  });

  const newStudentsArr = await getPfpURLs(students);

  console.log("newStudentsArr,,", newStudentsArr);
  let groupedMarksheets = marksheets.reduce((acc, mks) => {
    if (!acc[mks.student.id]) {
      acc[mks.student.id] = [];
    }
    if (!acc[mks.student.id][mks.exam.semesterId]) {
      acc[mks.student.id][mks.exam.semesterId] = [];
    }

    acc[mks.student.id][mks.exam.semesterId].push(mks);
    return acc;
  }, {});

  Object.entries(groupedMarksheets).forEach(
    ([studentId, semesters], studentIdx) => {
      console.log("asd", studentId, semesters, studentIdx);
      doc.addImage("/img/logo.jpeg", "JPEG", 15, 15, 15, 15);
      const student = Object.entries(semesters)[0][1][0]?.student;
      console.log("newst", newStudentsArr);
      console.log("newasst", student);
      doc.addImage("/img/user.png", "JPEG", 160, 10, 37, 37);
      // doc.addImage(
      //   newStudentsArr.filter((s) => s.id === student.id)[0]?.profilePicURL,
      //   "JPEG",
      //   160,
      //   10,
      //   37,
      //   37
      // );

      doc.setLineWidth(12);
      doc.setDrawColor(255, 255, 255);
      doc.setFillColor(0, 0, 0, 0);
      doc.circle(178.5, 28.5, 25);
      doc.setLineWidth(0);

      // doc.text("SAVITRIBAI PHULE PUNE UNIVERSITY", 50, 20);
      doc.text("Savitribai Phule Pune University", 35, 20);
      doc.setFontSize(14);
      doc.text("(formerly University of Pune)", 44, 27);
      doc.text("Ganeshkhind, Pune - 411007", 43.35, 34);
      doc.setDrawColor(0, 0, 0);
      doc.line(10, 38, 139, 38);
      console.log("STU");

      autoTable(doc, {
        // head: [["Seat no.", "Center", "Perm Reg No(PRN) :"]],
        body: [
          [
            `Seat No. ${student?.seatNumber ? student?.seatNumber : "---"}`,
            `Center No. ${
              student?.centerNumber ? student?.centerNumber : "---"
            }`,
            `PRN.: ${student?.prn ? student?.prn : "---"}`,
          ],
          [
            {
              content: `Name: ${
                student?.displayName ? student?.displayName : "---"
              }`,
              colSpan: 2,
            },
            `Mother's name: ${
              student?.motherName ? student?.motherName : "---"
            }`,
          ],
          [
            {
              content:
                "Col/Inst Name:  0244  PAD. DR.D.Y.PATIL ARTS,COMMERCE & SCIENCE COLLEGE PIMPRI,PUNE",
              colSpan: 3,
            },
          ],
        ],
        startY: 42,
        theme: "plain",
        // tableWidth: "wrap",
        // styles: { cellPadding: 0.5, fontSize: 12 },
      });

      // doc.line(15, 100, 57, 100);

      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);

      addAllMarksheets(doc, studentId, semesters, 80.5, 55);
      if (studentIdx < Object.entries(groupedMarksheets).length - 1) {
        doc.addPage();
      }
    }
  );
  doc.output("save", { filename: "marksheet.pdf" });
}

async function getPfpURLs(students) {
  let studentsWithPfpAttached = [];
  for (const s of students) {
    let profilePicURL;
    if (s.profilePic) {
      profilePicURL = await getDownloadURL(ref(storage, s.profilePic));
    } else {
      profilePicURL = "/img/user.png";
    }
    const pfpUrl = await getDataUrl(profilePicURL);
    s.profilePicURL = pfpUrl;
    studentsWithPfpAttached.push(s);
  }
  return studentsWithPfpAttached;
}

async function getDataUrl(imgPath) {
  let blob = await fetch(imgPath).then((r) => r.blob());
  let dataUrl = await new Promise((resolve) => {
    let reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
  return dataUrl;
}
async function addAllMarksheets(doc, studentId, semesters, x, y) {
  const generateTableBodyData = () => {
    let body = [];

    let outOfIntTotal, outOfExtTotal, outOfFinalTotal;
    outOfIntTotal = outOfExtTotal = outOfFinalTotal = 0;

    let intTotal = 0;
    let extTotal = 0;
    let finalTotal = 0;

    for (const [semId, mksList] of Object.entries(semesters)) {
      const intExam = mksList.filter((mks) => !mks.exam.isExternal)[0].exam;
      const extExam = mksList.filter((mks) => mks.exam.isExternal)[0].exam;

      //NOTE: Assuming that intExam and extExam have the same subjects
      const allSubs = [...intExam.subjects, ...intExam.electives];

      const unselectedElectives = allSubs
        .filter((sub) => sub.isElective)
        .filter((sub) => {
          const selectedElectiveIds = mksList[0].student.electives.map(
            (s) => s.id
          );
          return !selectedElectiveIds.includes(sub.id);
        })
        .map((sub) => sub.id);

      //Subjects + Electives - unselected electives
      const selectedSubjects = allSubs.filter(
        (sub) => !unselectedElectives.includes(sub.id)
      );
      console.log("selectedSubjects elcs =", selectedSubjects);

      selectedSubjects.map((sub, idx) => {
        const intMarks = sub?.marks ? sub.marks : "-------";
        const extSubject = [...extExam.subjects, ...extExam.electives].filter(
          (s) => s.id === sub.id
        )[0];
        console.log("extExam extExam", extExam);
        console.log("external subject", extSubject);

        const extMarks = extSubject?.marks ? extSubject.marks : "-------";

        let totalMarks = parseInt(intMarks) + parseInt(extMarks);

        //Adding to totals
        if (parseInt(intMarks)) intTotal += parseInt(intMarks);
        if (parseInt(extMarks)) extTotal += parseInt(extMarks);
        if (parseInt(totalMarks)) finalTotal += parseInt(totalMarks);

        if (intMarks === "-------") totalMarks = "-------";
        let row = [
          sub.subjectCode,
          sub.subjectName,
          sub.outOfInternal,
          sub.outOfExternal,
          parseInt(sub.outOfInternal) + parseInt(sub.outOfExternal),
          intMarks,
          extMarks,
          totalMarks,
        ];
        console.log("row = ", row);
        //Aggregating out of totals
        outOfIntTotal += parseInt(sub.outOfInternal);
        outOfExtTotal += parseInt(sub.outOfExternal);
        outOfFinalTotal +=
          parseInt(sub.outOfInternal) + parseInt(sub.outOfExternal);

        if (idx === 0) {
          row.unshift({
            content: intExam.semNumber,
            rowSpan: selectedSubjects.length,
          });
        }

        body.push(row);
      });
    }
    body.push([
      {
        content: `SGPA:`,
        colSpan: 3,
        styles: { borderTop: "1px solid black" },
      },
      outOfIntTotal,
      outOfExtTotal,
      outOfFinalTotal,
      intTotal,
      extTotal,
      finalTotal,
    ]);
    return body;
  };

  // return new Promise((resolve) => {
  //   for (const [semId, mksList] of Object.entries(semesters)) {
  //     console.log("semId, mkslist = ", semId, mksList);

  //     const intExam = mksList.filter((mks) => mks.exam.isExternal)[0].exam;
  //     const extExam = mksList.filter((mks) => !mks.exam.isExternal)[0].exam;
  //     console.log("intExam, extExam = ", intExam, extExam);
  //     //NOTE: Assuming that intExam and extExam have the same subjects
  //     [...intExam.subjects, ...intExam.electives].map((sub) => {
  //       const intMarks = sub?.marks ? sub.marks : null;
  //       const extSubject = [...extExam.subjects, ...extExam.electives].filter(
  //         (s) => s.id === sub.id
  //       )[0];
  //       console.log("extExam extExam", extExam);
  //       console.log("external subject", extSubject);
  //       const extMarks = extSubject?.marks ? extSubject.marks : null;
  //       const totalMarks = intMarks + extMarks;
  //       body.push[[intMarks, extMarks, totalMarks]];
  //       console.log("pushing to body - ", [intMarks, extMarks, totalMarks]);
  //     });
  //   }
  //   resolve(body);
  // });

  const body = generateTableBodyData();
  // let table = (
  //   <table id="markTable">
  //     <thead>
  //       {/* <th>SEM</th> */}
  //       <th>SUBCODE</th>
  //       <th>SUBJECT NAME</th>
  //       <th>INT</th>
  //       <th>UEX</th>
  //       <th>TOT</th>
  //     </thead>
  //     <tbody>
  //       {body.entries().map((idx, sub) => {
  //         <tr>
  //           <td>sub[0]</td>
  //           <td>sub[1]</td>
  //           <td>sub[2]</td>
  //           <td>sub[3]</td>
  //           <td>sub[4]</td>
  //         </tr>;
  //       })}
  //     </tbody>
  //   </table>
  // );

  autoTable(doc, {
    head: [
      [
        { content: "SEM", rowSpan: 2, styles: { valign: "middle" } },
        { content: "SUBCODE", rowSpan: 2, styles: { valign: "middle" } },
        { content: "SUBJECT NAME", rowSpan: 2, styles: { valign: "middle" } },
        { content: "OUT OF", colSpan: 3, styles: { halign: "center" } },
        { content: "OBTAINED", colSpan: 3, styles: { halign: "center" } },
        { content: "CREDITS", rowSpan: 2, styles: { valign: "middle" } },
        { content: "GRADE", rowSpan: 2, styles: { valign: "middle" } },
      ],
      ["INT", "UEX", "TOT", "INT", "UEX", "TOT"],
    ],
    body,
    startY: 68,
    theme: "grid",
    didParseCell: function (data) {
      var s = data.cell.styles;
      if (data.row.index == data.table.body.length - 1) {
        s.fillColor = [240, 240, 240];
      }
    },
  });
}

function addMarks(doc, label, x, y) {
  doc.text(label, x, y);
}
