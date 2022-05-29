import { getStorage, ref, getDownloadURL } from "firebase/storage";
import cleanTimestamp from "./cleanTimestamp";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const storage = getStorage();

export default async function generateHallTickets({ students, exam }) {
  const doc = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: "a4",
    putOnlyUsedFonts: true,
    compress: true,
  });

  const logoUrl = await getDataUrl("/img/logo.jpeg");

  const newStudentsArr = await getPfpURLs(students);

  newStudentsArr.forEach((student, studentIdx) => {
    doc.addImage(logoUrl, "JPEG", 92.5, 15, 25, 10);
    doc.addImage(student.profilePicURL, "JPEG", 15, 45, 37, 45);

    doc.setLineWidth(12);
    doc.setDrawColor(255, 255, 255);
    doc.setFillColor(0, 0, 0, 0);
    doc.circle(33.5, 67.5, 25);
    doc.setLineWidth(0);

    doc.setTextColor(168, 7, 7);
    doc.setFontSize(12);

    doc.setDrawColor(0, 0, 0);

    doc.line(15, 100, 57, 100);
    doc.text("sign", 15, 95);

    doc.line(150, 250, 190, 250);
    doc.text("Principal's sign", 150, 228);

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);

    doc.text(
      `${exam.courseName} Sem-${exam.semNumber} ${
        exam.isExternal ? "External" : "Internal"
      } Exam Hall ticket`,
      45.5,
      35
    );

    addAllStudentData(doc, student, 80.5, 55);

    doc.setDrawColor(140, 140, 140);

    let body = [];
    for (const [idx, subject] of [
      ...exam.subjects,
      ...exam.electives,
    ].entries()) {
      console.log("hall ticket gen = ", idx, subject);
      const dateTime = cleanTimestamp([subject], "datetimeDmt12h")[0].dateTime;
      body.push([subject.subjectCode, subject.subjectName, dateTime]);
    }

    autoTable(doc, {
      head: [["SUBCODE", "SUBJECT", "DATETIME"]],
      body,
      startY: 125,
      theme: "grid",
    });
    // doc.roundedRect(
    //   22.5,
    //   110,
    //   160,
    //   (exam.subjects.length + exam.electives.length) * 13.5,
    //   5,
    //   5,
    //   "S"
    // );
    // doc.line(25, 120, 180, 120);

    // //Building table
    // doc.setTextColor(168, 7, 7);
    // doc.text("Date-time", 28, 118);
    // doc.setTextColor(168, 7, 7);
    // doc.text("Subject code - Subject name", 105, 118);
    // // doc.text("Student", 105, 118);
    // console.log("exam = ", exam);

    // doc.setTextColor(0, 0, 0);

    if (studentIdx < students.length - 1) doc.addPage();
  });
  doc.output("save", { filename: "hall_ticket.pdf" });
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
function addAllStudentData(doc, student, x, y) {
  addStudentData(doc, "Name", student.displayName, x, y);
  addStudentData(doc, "Roll. No.", student.roll, x + 60, y);

  addStudentData(doc, "DOB", new Date(student.dob).toDateString(), x, y + 15);
  addStudentData(doc, "Phone", student.phone, x + 60, y + 15);

  addStudentData(doc, "Address", student.address, x, y + 30);
  if (student.phone2)
    addStudentData(doc, "Alt phone", student.phone2, x + 60, y + 30);
}
function addStudentData(doc, label, value, x, y) {
  doc.setFontSize(14);
  doc.setTextColor(168, 7, 7);
  doc.text(label, x, y);
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(value, x, y + 7, { maxWidth: 55 });
}
