import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
// import { getStorage, ref, getDownloadURL } from "firebase/storage";
import cGetDoc from "crud-lite/cGetDoc";
// const storage = getStorage();

export default async function generateSubjectMarksheet({
  course,
  exam,
  subject,
  marksheets,
}) {
  const doc = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: "a4",
    putOnlyUsedFonts: true,
    compress: true,
  });
  doc.addImage("/img/logo.jpeg", "JPEG", 40, 15, 20, 20);
  doc.text("Savitribai Phule Pune University", 70, 20);
  doc.setFontSize(14);
  doc.text("(formerly University of Pune)", 79, 27);
  doc.text("Ganeshkhind, Pune - 411007", 78.35, 34);
  doc.setDrawColor(0, 0, 0);
  doc.line(10, 38, 200, 38);
  doc.setTextColor(168, 7, 7);
  doc.setFontSize(12);

  doc.setDrawColor(0, 0, 0);

  doc.line(15, 280, 60, 280);
  doc.text("CEO sign", 15, 287);

  doc.line(85, 280, 110, 280);
  doc.text("Coordinator sign", 85, 287);

  doc.line(155, 280, 180, 280);
  doc.text("Principal's sign", 155, 287);

  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  console.log("STU");

  const settings = await cGetDoc({
    collectionPath: ["settings"],
    docId: "mainSettings",
  });

  // const coordSign = await getDownloadURL(ref(storage, settings.coordSign));
  // const principalSign = await getDownloadURL(
  //   ref(storage),
  //   settings.principalSign
  // );
  // const ceoSign = await getDownloadURL(ref(storage, settings.ceoSign));

  autoTable(doc, {
    body: [
      [
        `Course: ${exam.courseName}`,
        `Subject: ${subject.subjectName}`,
        `Academic Year. ${exam?.centerNumber ? exam?.centerNumber : "---"}`,
      ],
      //   [
      //     {
      //       content: `Name: ${
      //         student?.displayName ? student?.displayName : "---"
      //       }`,
      //       colSpan: 2,
      //     },
      //     `Mother's name: ${student?.motherName ? student?.motherName : "---"}`,
      //   ],
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
  });

  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);

  const body = marksheets.map((mks) => {
    const sub = mks.exam[subject.isElective ? "electives" : "subjects"].filter(
      (s) => s.id === subject.id
    )[0];
    if (!sub) {
      console.error("Subject not found on marksheet.exam ");
    }
    return [
      mks.student.roll,
      mks.student.displayName,
      sub.marks ? sub.marks : "-----",
    ];
  });

  autoTable(doc, {
    head: [["Roll no.", "Name", "Marks"]],
    body,
    startY: 63,
    theme: "grid",
  });

  doc.output("save", {
    filename: `${exam.courseName}-${exam.examName}-${exam.academicYear}-${subject.subjectName}-marksheet.pdf`,
  });
}
