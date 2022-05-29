import { getStorage, ref, getDownloadURL } from "firebase/storage";
import cleanTimestamp from "util/cleanTimestamp";
import groupBy from "util/groupBy";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const storage = getStorage();

export default async function generateUniversityLedgers({
  students,
  marksheets,
  course,
}) {
  const doc = new jsPDF({
    orientation: "l",
    unit: "mm",
    format: "a4",
    putOnlyUsedFonts: true,
    compress: true,
  });

  const newStudentsArr = await getPfpURLs(students);

  //console.log("newStudentsArr,,", newStudentsArr);

  //Grouping marksheets
  /**
   * Grouping structure - Student -> Semester -> [internalMarksheet, externalMarksheet]
   */
  let groupedMarksheets = marksheets.reduce((acc, mks) => {
    if (!acc[mks.student.id]) {
      acc[mks.student.id] = [];
    }
    if (
      !acc[mks.student.id].filter(
        (sem) => sem.semesterId === mks.exam.semesterId
      ).length
    ) {
      const sem = { semesterId: mks.exam.semesterId };
      sem.mksList = [];
      sem.semNumber = mks.exam.semNumber;
      acc[mks.student.id].push(sem);
    }

    acc[mks.student.id]
      .filter((sem) => sem.semesterId === mks.exam.semesterId)[0]
      .mksList.push(mks);
    acc[mks.student.id] = acc[mks.student.id].sort(
      (a, b) => (a.semNumber > b.semNumber ? 1 : -1),
      {}
    );
    //console.log("sorted list", acc[mks.student.id]);

    return acc;
  }, {});

  Object.entries(groupedMarksheets).forEach(
    ([studentId, semesters], studentIdx) => {}
  );

  Object.entries(groupedMarksheets).forEach(
    ([studentId, semesters], studentIdx) => {
      console.log("sem,", semesters);
      // doc.addImage("/img/logo.jpeg", "JPEG", 15, 15, 15, 15);
      const student = semesters[0].mksList[0]?.student;
      //console.log("newst", newStudentsArr);
      //console.log("newasst", student);
      // doc.addImage(
      //   newStudentsArr.filter((s) => s.id === student.id)[0].profilePicURL,
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

      // doc.text("(formerly University of Pune)", 44, 27);
      // doc.text("Ganeshkhind, Pune - 411007", 43.35, 34);

      //console.log("STU");
      if (studentIdx === 0) {
        doc.text("Savitribai Phule Pune University", 110, 12);
        doc.setFontSize(10);
        doc.text(
          "RESULT OF THE M.Com(E-Commerce) (REV.2013) EXAMINATION – APRIL 2015 [COURSE GRADE POINTS : 100-75 ‘O’ 06 / 74-65 ‘A’ 05 / 64-55 ‘B’ 04 / 54-50 ‘C’ 03 / 49-45 D 02 / 44-40 ‘E’ 01 / 39-0 ‘F’ 0][FINAL GRADE POINTS : 4.991-6.00 ‘O’ / 4.491-4.990 A / 3.491-4.490 B / 2.491-3.490 C /1.491-2.490 D / 0.491-1.490 E / 0.0-0.490 F] P – Previous * - Appearing $ - Ordinance Passing : 30% Int/Uex 40% Total",
          10,
          22,
          { maxWidth: 277 }
        );
        doc.setDrawColor(0, 0, 0);
        doc.line(10, 38, 200, 38);
      }

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
        startY: studentIdx === 0 ? 42 : 5,
        theme: "plain",
        // tableWidth: "wrap",
        // styles: { cellPadding: 0.5, fontSize: 12 },
      });

      // doc.line(15, 100, 57, 100);

      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);

      addAllMarksheets(doc, studentId, semesters, course, studentIdx, 80.5, 55);
      if (studentIdx < Object.entries(groupedMarksheets).length - 1) {
        doc.addPage();
      }
    }
  );
  doc.output("save", { filename: "ledger.pdf" });
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
async function addAllMarksheets(
  doc,
  studentId,
  semesters,
  course,
  studentIdx,
  x,
  y
) {
  const generateTableBodyData = () => {
    let body = [];

    let outOfIntTotal, outOfExtTotal, outOfFinalTotal, outOfCreditTotal;
    outOfIntTotal = outOfExtTotal = outOfFinalTotal = outOfCreditTotal = 0;

    let intTotal = 0;
    let extTotal = 0;
    let finalTotal = 0;
    let gpTotal = 0;
    let gpaTotal = 0;
    let creditTotal = 0;

    let sgpaList = [];

    for (const sem of semesters) {
      let sgpTotal, sgpaTotal;
      sgpTotal = sgpaTotal = 0;
      //console.log("xyz= ", sem);
      const intMks = sem.mksList.filter((mks) => mks.exam.isExternal);
      const extMks = sem.mksList.filter((mks) => !mks.exam.isExternal);
      const intExam = intMks.length ? intMks[0]?.exam : null;
      const extExam = extMks.length ? extMks[0]?.exam : null;

      //NOTE: Assuming that intExam and extExam have the same subjects
      const allSubs = [];
      if (intExam) {
        allSubs.push(...intExam.subjects);
        allSubs.push(...intExam.electives);
      }

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
      //console.log("selectedSubjects elcs =", selectedSubjects);

      //Iterating over subjects
      for (const idx = 0; idx < selectedSubjects.length; idx++) {
        const sub = selectedSubjects[idx];
        const intMarks = sub?.marks ? sub.marks : "-------";
        const extSubject = [...extExam.subjects, ...extExam.electives].filter(
          (s) => s.id === sub.id
        )[0];
        //console.log("extExam extExam", extExam);
        //console.log("external subject", extSubject);

        const extMarks = extSubject?.marks ? extSubject.marks : "-------";

        let totalMarks = parseInt(intMarks) + parseInt(extMarks);

        //Adding to totals
        if (parseInt(intMarks)) intTotal += parseInt(intMarks);
        if (parseInt(extMarks)) extTotal += parseInt(extMarks);
        if (parseInt(totalMarks)) finalTotal += parseInt(totalMarks);

        if (intMarks === "-------") totalMarks = "-------";

        let grade, gp, gpa, credits;
        grade = gp = gpa = "----";
        if (totalMarks) {
          grade = getGrade(totalMarks);
          gp = getGradePoints(totalMarks);
          gpa = course.fullCredits * gp;
          sgpTotal += gp;
          sgpaTotal += course.fullCredits * gp;
          gpTotal += gp;
          gpaTotal += course.fullCredits * gp;
          if (
            intMarks >= sub.internalPassingMarks &&
            extMarks >= sub.externalPassingMarks
          )
            credits = sub.fullCredits;
          else credits = 0;
          creditTotal += parseInt(credits);
          //console.log("gp data", totalMarks, grade, gp, gpa);
        }

        let subjectData = [
          `${sub.subjectCode} : `,
          intMarks,
          extMarks,
          totalMarks,
          grade,
          gp,
          " ",
        ];

        //Aggregating out of totals
        outOfIntTotal += parseInt(sub.outOfInternal);
        outOfExtTotal += parseInt(sub.outOfExternal);
        outOfCreditTotal += parseInt(sub.fullCredits);
        outOfFinalTotal +=
          parseInt(sub.outOfInternal) + parseInt(sub.outOfExternal);

        // if (idx === 0) {
        //   //console.log("semnumber = ", intExam);
        //   row.unshift({
        //     content: intExam.semNumber,
        //     rowSpan: selectedSubjects.length,
        //   });
        // }
        //console.log("idx = ", idx);

        if (body.length > 0 && body[body.length - 1].length < 28) {
          body[body.length - 1].push(...subjectData);
        } else {
          body.push([...subjectData]);
        }
        console.log("BODY - ", body);
      }
      //console.log(
      "sgpaTotal / (selectedSubjects.length * course.fullCredits",
        sgpaTotal,
        selectedSubjects.length,
        course.fullCredits;
      // );
      sgpaList.push(
        (sgpaTotal / (selectedSubjects.length * course.fullCredits)).toFixed(2)
      );
    }
    const sgpaString = "";
    sgpaList.forEach((sgpa, idx) => {
      sgpaString += `${idx + 1}) ${sgpa}, `;
    });

    body.push([
      {
        content: `SGPA: ${sgpaString}`,
        colSpan: 8,
        styles: { borderTop: "1px solid black" },
      },
      "",
      "",
      "",
      "",
      "",
      "",
    ]);
    body.push([
      {
        content: `Total marks: ${finalTotal}/${outOfFinalTotal} = ${(
          (finalTotal / outOfFinalTotal) *
          100
        ).toFixed(2)}% | CGPA: ${(gpaTotal / outOfCreditTotal).toFixed(
          2
        )} | Final grade: ${getGrade((finalTotal / outOfFinalTotal) * 100)}`,
        colSpan: 13,
        styles: { borderTop: "1px solid black" },
      },
    ]);
    return body;
  };

  // return new Promise((resolve) => {
  //   for (const [semId, mksList] of Object.entries(semesters)) {
  //     //console.log("semId, mkslist = ", semId, mksList);

  //     const intExam = mksList.filter((mks) => mks.exam.isExternal)[0].exam;
  //     const extExam = mksList.filter((mks) => !mks.exam.isExternal)[0].exam;
  //     //console.log("intExam, extExam = ", intExam, extExam);
  //     //NOTE: Assuming that intExam and extExam have the same subjects
  //     [...intExam.subjects, ...intExam.electives].map((sub) => {
  //       const intMarks = sub?.marks ? sub.marks : null;
  //       const extSubject = [...extExam.subjects, ...extExam.electives].filter(
  //         (s) => s.id === sub.id
  //       )[0];
  //       //console.log("extExam extExam", extExam);
  //       //console.log("external subject", extSubject);
  //       const extMarks = extSubject?.marks ? extSubject.marks : null;
  //       const totalMarks = intMarks + extMarks;
  //       body.push[[intMarks, extMarks, totalMarks]];
  //       //console.log("pushing to body - ", [intMarks, extMarks, totalMarks]);
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
    // head: [
    //   [
    //     { content: "SEM", rowSpan: 2, styles: { valign: "middle" } },
    //     { content: "SUBCODE", rowSpan: 2, styles: { valign: "middle" } },
    //     { content: "SUBJECT NAME", rowSpan: 2, styles: { valign: "middle" } },
    //     { content: "OUT OF", colSpan: 4, styles: { halign: "center" } },
    //     { content: "OBTAINED", colSpan: 4, styles: { halign: "center" } },
    //     { content: "GRADE", rowSpan: 2, styles: { valign: "middle" } },
    //     { content: "GP SUB", rowSpan: 2, styles: { valign: "middle" } },
    //     { content: "FOR GPA", rowSpan: 2, styles: { valign: "middle" } },
    //   ],
    //   ["INT", "UEX", "TOT", "CRS", "INT", "UEX", "TOT", "CRS"],
    // ],
    body,
    startY: studentIdx === 0 ? 68 : 35,
    theme: "plain",
    // didParseCell: function (data) {
    //   var s = data.cell.styles;
    //   if (
    //     data.row.index == data.table.body.length - 1 ||
    //     data.row.index == data.table.body.length - 2
    //   ) {
    //     s.fillColor = [240, 240, 240];
    //   }
    // },
  });
}

function addMarks(doc, label, x, y) {
  doc.text(label, x, y);
}

function getGrade(totalMarks) {
  //console.log("calc grade", totalMarks);
  switch (true) {
    case totalMarks >= 0 && totalMarks < 39.5:
      return "F";
    case totalMarks >= 39.5 && totalMarks < 44.5:
      return "E";
    case totalMarks >= 44.5 && totalMarks < 49.5:
      return "D";
    case totalMarks >= 49.5 && totalMarks < 54.5:
      return "C";
    case totalMarks >= 54.5 && totalMarks < 64.5:
      return "B";
    case totalMarks >= 64.5 && totalMarks < 74.5:
      return "A";
    case totalMarks >= 74.5 && totalMarks <= 100:
      return "O";
    default:
      return "Out of range";
  }
}

function getGradePoints(totalMarks) {
  switch (true) {
    case totalMarks >= 0 && totalMarks < 39.5:
      return 0;
    case totalMarks >= 39.5 && totalMarks < 44.5:
      return 1;
    case totalMarks >= 44.5 && totalMarks < 49.5:
      return 2;
    case totalMarks >= 49.5 && totalMarks < 54.5:
      return 3;
    case totalMarks >= 54.5 && totalMarks < 64.5:
      return 4;
    case totalMarks >= 64.5 && totalMarks < 74.5:
      return 5;
    case totalMarks >= 74.5 && totalMarks <= 100:
      return 6;
    default:
      return "Out of range";
  }
}
function getCpga() {
  return "1";
}
function getFinalGrade() {
  return "O";
}
