import {
  React,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import styled from "styled-components";
import ButtonIcon from "comp/ButtonIcon";
import styl from "styl/StudentForm.module.css";
import { useForm, Controller } from "react-hook-form";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import DatePicker from "@mui/lab/DatePicker";
import TextField from "@mui/material/TextField";
import formStyl from "styles/css/Forms.module.css";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import ProfilePic from "comp/ProfilePic";
import CropperModal from "comp/CropperModal";
import useProfilePic from "hook/useProfilePic";

import Image from "next/image";
import { Timestamp } from "firebase/firestore/lite";
import { verifyFile } from "util/imageUtils";

import cGetDocs from "crud-lite/cGetDocs";
import cAddDoc from "crud-lite/cAddDoc";
import cUpdateDoc from "crud-lite/cUpdateDoc";
import { toastOptions } from "comp/constants";
import { toast } from "react-toastify";
import { debounce } from "debounce";
import Autocomplete from "@mui/material/Autocomplete";

const StudentForm = (props, ref) => {
  const [showForm, setShowForm] = useState(false);
  const [student, setStudent] = useState(null);
  const [courseId, setCourseId] = useState(null);
  const [electiveGroupId, setElectiveGroupId] = useState(null);
  const [courseList, setCourseList] = useState([]);
  const [electiveGroupList, setElectiveGroupList] = useState([]);
  const [dob, setDob] = useState(null);
  const [electivePredictions, setElectivePredictions] = useState([]);

  //Image cropper state
  const [showCropper, setShowCropper] = useState(false);
  const [croppedImage, setCroppedImage] = useState(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState(null);
  const [ogImage, setOgImage] = useState(null);
  const [imgSrc, setImgSrc] = useState("");
  const [imgName, setImgName] = useState("");
  const [imgExtension, setImgExtension] = useState("");
  const [profilePicUrls, setProfilePicUrls] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: props.formData,
  });

  useEffect(() => {
    (async () => {
      const courseList = await cGetDocs({
        collectionPath: ["courses"],
        conditions: [{ field: "isDeleted", operator: "!=", value: true }],
      });
      setCourseList(courseList);
    })();
    return resetForm;
  }, []);

  // useEffect(() => {
  //   (async () => {
  //     //Upload images if changed (user Id is known)
  //     const profilePicUrls = await useProfilePic({
  //       ogImage,
  //       croppedImage,
  //       folderPath: `users/${student?.id}`,
  //       imageName: student?.id,
  //       imageExtension: imgExtension,
  //     });
  //     setProfilePicUrls(profilePicUrls);
  //   })();
  // }, [ogImage, croppedImage, student, imgExtension]);

  const hide = () => setShowForm(false);
  const unhide = () => setShowForm(true);
  function resetForm() {
    reset({
      displayName: null,
      roll: null,
      prn: null,
      centerNumber: null,
      seatNumber: null,
      fatherName: null,
      motherName: null,
      address: null,
      permanentAddress: null,
      phone: null,
      phone2: null,
      parentPhone: null,
      gender: null,
      email: null,
      dob: null,
      nationality: null,
      state: null,
      district: null,
      pincode: null,
      course: null,
      electives: null,
      courseYear: null,
      religion: null,
      caste: null,
      category: null,
      subCaste: null,
    });
    setStudent(null);
  }

  useImperativeHandle(ref, () => ({
    setStudent: (s) => {
      console.log("setting student, ", s);
      setStudent(s);
      if (s?.dob) {
        setDob(new Date(s.dob));
      }
      if (s?.courseId) {
        setCourseId(s.courseId);
        const course = courseList.filter((c) => c.id === s.courseId)[0];
        setElectiveGroupList(course?.electiveGroups);
        setElectiveGroupId(s.electiveGroupId);
      }

      reset(s);
    },
    hide,
    unhide,
  }));
  function handleCourseChange(e) {
    const course = courseList.filter((c) => c.id === e.target.value)[0];
    setCourseId(e.target.value);
    setElectiveGroupList(course.electiveGroups);
    setValue("courseId", e.target.value);
    setValue("courseName", course.courseName);
  }

  //Handling change of photo during crop
  const handleChangePhoto = () => {
    const fileInput = document.querySelector("#fileInput");
    fileInput.click();
  };

  //Setting base64 image data in imgSrc
  const handleFileSelect = (event) => {
    setImgSrc(null);
    const files = event.target.files;
    if (files && files.length > 0) {
      if (verifyFile(files)) {
        // imageBase64Data
        const currentFile = files[0];
        console.log(files[0]);
        setOgImage(currentFile);
        setImgName(currentFile.name);
        setImgExtension(currentFile.name.split(".").pop());
        const myFileItemReader = new FileReader();
        myFileItemReader.addEventListener(
          "load",
          (c) => {
            console.log(myFileItemReader, c);
            const base64img = myFileItemReader.result;
            setImgSrc(base64img);
            setShowCropper(true);
          },
          false
        );
        myFileItemReader.readAsDataURL(currentFile);
      }
    }
  };

  // function handleElectiveGroupChange(e) {
  //   const electiveGroup = courseList
  //     .filter((c) => c.id === getValues("courseId"))[0]
  //     .electiveGroups.filter((eg) => eg.id === e.target.value)[0];
  //   console.log("selceted elective grp id", e.target.value);
  //   console.log("elective = ", electiveGroup);
  //   setElectiveGroupId(e.target.value);
  //   setValue("electiveGroupId", e.target.value);
  //   setValue("electives", electiveGroup.electives);
  // }

  async function handlePredictionInputChange(val) {
    const subjects = await cGetDocs({
      collectionPath: ["subjects"],
      conditions: [
        { field: "isDeleted", operator: "!=", value: true },
        { field: "isElective", operator: "==", value: true },
      ],
      orderByFields: ["isDeleted", "subjectName"],
    });
    setElectivePredictions(subjects);
  }
  async function handleSubjectChange(e, val) {
    setValue("electives", val);
  }

  const onSubmit = async (data) => {
    console.log("submitted data", data);
    let s = student; //student
    //NOTE:temporary fix
    if (!data.electives) data.electives = [];
    if (!s) {
      data.status = "student";

      //Calculating seat number from number of students in current semester
      const currentStudents = await cGetDocs({
        collectionPath: ["users"],
        conditions: [
          { field: "semesterId", operator: "==", value: props.semesterId },
        ],
      });

      s = await cAddDoc({
        collectionPath: ["users"],
        docData: {
          ...data,
          isDeleted: false,
          semesterId: props.semesterId,
          seatNumber: currentStudents.length + 1000,
        },
      });
      //Get exams related to course and create marksheets with the corresponding subjects and electives.
      const examList = await cGetDocs({
        collectionPath: ["exams"],
        conditions: [{ field: "courseId", operator: "==", value: courseId }],
      });
      examList.forEach((exam) => {
        cAddDoc({
          collectionPath: ["marksheets"],
          docData: {
            exam,
            student: {
              id: s.id,
              ...data,
              semesterId: exam.semesterId,
            },
            isDeleted: false,
            examId: exam.id,
          },
        });
      });
    }

    // Converting to ISOString
    data.dob = new Date(data.dob).toISOString();

    console.log("profilepicurls = ", profilePicUrls);

    s = await cUpdateDoc({
      collectionPath: ["users"],
      docId: s.id,
      docData: { ...data, semesterId: props.semesterId, ...profilePicUrls },
    });

    //Find existing marksheets and update electiveGroup
    // const marksheets = await cGetDocs({
    //   collectionPath: ["marksheets"],
    //   conditions: [
    //     { field: "student.id", operator: "==", value: student.id },
    //   ],
    // });
    // console.log("marksheets to update = ", marksheets);
    // marksheets.forEach((mks) => {
    //   cUpdateDoc({
    //     collectionPath: ["marksheets"],
    //     docData: {
    //       id: mks.id,
    //       student: { ...mks.student, electives: data.electives },
    //     },
    //   });
    // });

    if (props.handleSubmit) props.handleSubmit(data, "student");
    resetForm();
    hide();
  };

  return (
    <>
      {showForm ? (
        <div
          className={styl.modalContainer}
          data-name="modalContainer"
          onClick={(e) => {
            if (e.target?.dataset?.name === "modalContainer") hide();
          }}
        >
          <form
            className={styl.form}
            method="POST"
            onSubmit={handleSubmit(onSubmit)}
          >
            <h1>{props.formTitle}</h1>
            <CropperModal
              rawImg={imgSrc}
              imgName={imgName}
              show={showCropper}
              setShow={setShowCropper}
              setCroppedImage={setCroppedImage}
              setCroppedImageUrl={setCroppedImageUrl}
              handleChangePhoto={handleChangePhoto}
            />
            <div className="profilePicForm">
              <label htmlFor="fileInput" type="button" className={styl.pfp}>
                <div className={styl.profilePicContainer}>
                  {student?.profilePicURL ? (
                    <>
                      <ProfilePic
                        imgSrc={student?.profilePicURL}
                        layout="fill"
                        objectFit="cover"
                        alt="Profile Pic"
                      />
                    </>
                  ) : (
                    <div className={styl.defaultUser}>
                      <Image
                        src="/img/user.png"
                        layout="fill"
                        objectFit="contain"
                        alt="Profile Pic"
                      />
                    </div>
                  )}
                </div>
              </label>
              <input
                name="photo"
                id="fileInput"
                accept="image/*"
                type="file"
                value=""
                className="d-none"
                onChange={handleFileSelect}
                style={{ visibility: "hidden" }}
              />
            </div>
            <div className={styl.col2}>
              <TextField
                margin="normal"
                label="Full name"
                name="displayName"
                type="text"
                variant="outlined"
                error={errors && errors.displayName}
                helpText="First name is required"
                {...register("displayName", { required: true })}
              />
              <TextField
                margin="normal"
                label="Roll no."
                name="displayName"
                type="text"
                variant="outlined"
                error={errors && errors.roll}
                helpText="Roll number is required"
                {...register("roll")}
              />
              <TextField
                margin="normal"
                label="PRN"
                name="prn"
                type="text"
                variant="outlined"
                error={errors && errors.prn}
                helpText="PRN is required"
                {...register("prn")}
              />
              <TextField
                margin="normal"
                label="Center number"
                name="centerNumber"
                type="text"
                variant="outlined"
                error={errors && errors.centerNumber}
                helpText="Center number is required"
                {...register("centerNumber")}
              />
              <TextField
                margin="normal"
                label="Seat no."
                name="seatNumber"
                type="text"
                variant="outlined"
                error={errors && errors.seatNumber}
                helpText="Seat number is required"
                {...register("seatNumber")}
              />

              <FormControl margin="normal">
                <TextField
                  label="Father's Name"
                  name="fatherName"
                  type="text"
                  variant="outlined"
                  {...register("fatherName")}
                />
              </FormControl>
              <FormControl margin="normal">
                <TextField
                  label="Mother's Name"
                  name="motherName"
                  type="text"
                  variant="outlined"
                  error={errors && errors.motherName}
                  helpText="Mother's name is required"
                  {...register("motherName")}
                />
              </FormControl>

              <FormControl margin="normal">
                <TextField
                  label="Current Address"
                  variant="outlined"
                  name="address"
                  className="formInput"
                  error={errors && errors.address}
                  helpText="Address is required"
                  {...register("address")}
                />
              </FormControl>
              <FormControl margin="normal">
                <TextField
                  label="Permanent Address"
                  variant="outlined"
                  name="permanentAddress"
                  className="formInput"
                  error={errors && errors.permanentAddress}
                  helpText="Permanent address is required"
                  {...register("permanentAddress")}
                />
              </FormControl>

              <FormControl margin="normal">
                <TextField
                  label="Phone"
                  variant="outlined"
                  name="phone"
                  placeholder="Phone"
                  className="formInput"
                  error={errors && errors.phone}
                  helpText="Phone address is required"
                  // defaultValue={props.formData.phone}
                  {...register("phone")}
                />
              </FormControl>
              <FormControl margin="normal">
                <TextField
                  label="Alternate Phone"
                  variant="outlined"
                  name="phone2"
                  placeholder="Phone"
                  className="formInput"
                  {...register("phone2")}
                />
              </FormControl>
              <FormControl margin="normal">
                <TextField
                  label="Parent's Phone"
                  variant="outlined"
                  name="parentPhone"
                  placeholder="Phone"
                  className="formInput"
                  {...register("parentPhone")}
                />
              </FormControl>
              <FormControl>
                <InputLabel>Gender</InputLabel>
                <Select
                  onChange={(e) => setValue("gender", e.target.value)}
                  value={student?.gender}
                  error={errors && errors.gender}
                  helpText="Gender is required"
                  label="Gender"
                >
                  <MenuItem key="male" value="male">
                    Male
                  </MenuItem>
                  <MenuItem key="female" value="female">
                    Female
                  </MenuItem>
                  <MenuItem key="other" value="other">
                    Other
                  </MenuItem>
                </Select>
              </FormControl>
              <FormControl margin="normal">
                <TextField
                  label="Email"
                  variant="outlined"
                  name="email"
                  placeholder="Email ID"
                  className="formInput"
                  type="email"
                  // defaultValue={props.formData.email}
                  {...register("email")}
                />
                <p className="error">{errors.email && "Email is required"}</p>
              </FormControl>
              <FormControl margin="normal">
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Date of Birth"
                    value={dob}
                    inputFormat="dd/MM/yyyy"
                    mask="__/__/____"
                    onChange={(datetime) => {
                      console.log("setting datetime dob to=", datetime);
                      setDob(datetime);
                      setValue("dob", datetime);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={errors && errors.dob}
                        helpText="Date of birth is required"
                        className="formInput"
                      />
                    )}
                  />
                </LocalizationProvider>
              </FormControl>
              <FormControl margin="normal">
                <TextField
                  label="Nationality"
                  variant="outlined"
                  name="nationality"
                  placeholder="Nationality"
                  {...register("nationality")}
                />
              </FormControl>
              <FormControl margin="normal">
                <TextField
                  label="State"
                  variant="outlined"
                  name="state"
                  {...register("state")}
                />
              </FormControl>
              <FormControl margin="normal">
                <TextField
                  label="District"
                  variant="outlined"
                  name="district"
                  {...register("district")}
                />
              </FormControl>
              <FormControl margin="normal">
                <TextField
                  label="Pincode"
                  variant="outlined"
                  name="pincode"
                  {...register("pincode")}
                />
              </FormControl>
              <FormControl>
                <InputLabel>Course</InputLabel>
                <Select
                  onChange={handleCourseChange}
                  value={courseId}
                  label="Course"
                  error={errors && errors.course}
                  helpText="Course is required"
                >
                  {courseList.map((course) => (
                    <MenuItem key={course.id} value={course.id}>
                      {course.courseName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {/* <FormControl>
              <InputLabel>Elective group</InputLabel>
              <Select
                onChange={handleElectiveGroupChange}
                defaultValue={student?.electiveGroupId}
                value={electiveGroupId}
                label="Elective group"
                disabled={!getValues("courseId")}
              > 
                {electiveGroupList?.map((elecGrp) => (
                  <MenuItem key={elecGrp.id} value={elecGrp.id}>
                    {elecGrp.electives.map((e) => e.subjectName).join(", ")}
                  </MenuItem>
                ))}
              </Select>
            </FormControl> */}
              <Controller
                render={() => (
                  <Autocomplete
                    multiple
                    name="electives"
                    options={electivePredictions}
                    className={styl.subjectAutocomplete}
                    defaultValue={student?.electives ? student.electives : []}
                    onInputChange={debounce(
                      (e, val) => handlePredictionInputChange(val),
                      500
                    )}
                    // isOptionEqualToValue={(option, value) => option.id === value.id}
                    getOptionLabel={(option) => option.subjectName}
                    onChange={handleSubjectChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        multiline
                        rows={2}
                        label="Electives"
                      />
                    )}
                  />
                )}
                name={"electives"}
                control={control}
              />
              <FormControl margin="normal">
                <TextField
                  label="Course year"
                  variant="outlined"
                  name="courseYear"
                  type="number"
                  error={errors && errors.phocourseYearne}
                  helpText="Course year is required"
                  {...register("courseYear")}
                />
              </FormControl>
              {/* <FormControl margin="normal">
              <TextField
                label="Elective"
                variant="outlined"
                name="elective"
                {...register("elective")}
              />
            </FormControl> */}

              <FormControl margin="normal">
                <TextField
                  label="Religion"
                  variant="outlined"
                  name="religion"
                  {...register("religion")}
                />
              </FormControl>
              <FormControl margin="normal">
                <TextField
                  label="Caste"
                  variant="outlined"
                  name="caste"
                  {...register("caste")}
                />
              </FormControl>
              <FormControl margin="normal">
                <TextField
                  label="Category"
                  variant="outlined"
                  name="category"
                  placeholder="Category"
                  {...register("category")}
                />
              </FormControl>
              <FormControl margin="normal">
                <TextField
                  label="Sub caste"
                  variant="outlined"
                  name="subCaste"
                  {...register("subCaste")}
                />
              </FormControl>
              <div
                margin="normal"
                className={`${styl.actionBtnGrp} ${styl.reverseFlex}`}
              >
                <button type="submit" value="submit" className={styl.submit}>
                  Submit
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    props.handleCancel();
                    resetForm();
                    hide();
                  }}
                  value="cancel"
                  className={styl.cancel}
                >
                  Cancel
                </button>
              </div>
              {student && (
                <div className={styl.deleteBtn}>
                  <ButtonIcon
                    onClick={() => {
                      hide();
                      props.handleDelete(student);
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
              )}
            </div>
          </form>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default forwardRef(StudentForm);
