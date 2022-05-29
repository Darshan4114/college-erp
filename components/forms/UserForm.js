import {
  React,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import styled from "styled-components";
import styl from "styl/Forms.module.css";
import { useForm, Controller } from "react-hook-form";
import { FormControl } from "@material-ui/core";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import DatePicker from "@mui/lab/DatePicker";
import TextField from "@mui/material/TextField";
import formStyl from "styles/css/Forms.module.css";
import InputLabel from "@mui/material/InputLabel";
import { Timestamp } from "firebase/firestore/lite";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

import cAddDoc from "crud-lite/cAddDoc";
import cGetDocs from "crud-lite/cGetDocs";
import cUpdateDoc from "crud-lite/cUpdateDoc";
import { toastOptions } from "comp/constants";
import { toast } from "react-toastify";

const UserForm = (props, ref) => {
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(null);
  const [userType, setUserType] = useState(null);
  const [courseList, setCourseList] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    (async () => {
      const courseList = await cGetDocs({
        collectionPath: ["courses"],
        conditions: [{ field: "isDeleted", operator: "!=", value: true }],
      });
      setCourseList(courseList);
    })();
    return () => {
      reset({
        displayName: null,
        address: null,
        phone: null,
        email: null,
        course: null,
      });
    };
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    control,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: props.formData,
  });

  const hide = () => setShowForm(false);
  const unhide = () => setShowForm(true);

  useImperativeHandle(ref, () => ({
    setUser: (user) => {
      if (user === null || !user) {
        reset({
          displayName: null,
          address: null,
          phone: null,
          email: null,
          course: null,
        });
        return;
      }
      setUser(user);
      if (user.courses) setCourses(user.courses);
      reset(user);
    },
    setStatus,
    setUserType,
    hide,
    unhide,
  }));

  const onSubmit = async (data) => {
    try {
      console.log("submit user", data, props.formMode, props.docId);

      if (!user) {
        data.status = status;
        user = await cAddDoc({
          collectionPath: ["users"],
          docData: { ...data, isDeleted: false },
        });
      } else {
        user = await cUpdateDoc({
          collectionPath: ["users"],
          docId: props.docId,
          docData: data,
        });
      }
      if (props.handleSubmit) props.handleSubmit(data, userType);
      reset({
        displayName: null,
        address: null,
        phone: null,
        email: null,
        course: null,
      });
      hide();
    } catch (err) {
      reset();
      toast.error(err, toastOptions);
    }
  };

  return (
    <>
      {showForm ? (
        <div className={formStyl.modalContainer}>
          <Form
            onSubmit={handleSubmit(onSubmit)}
            className={formStyl.formClass}
          >
            <h1>{props.formTitle}</h1>
            <FormControl margin="normal">
              <TextField
                label="Full Name"
                name="displayName"
                type="text"
                variant="outlined"
                error={errors && errors.displayName}
                helpText={"Full name is required"}
                {...register("displayName", { required: true })}
              />
            </FormControl>

            <FormControl margin="normal">
              <TextField
                label="Address"
                variant="outlined"
                name="address"
                // defaultValue={props.formData.address}
                className="formInput"
                {...register("address", { required: true })}
              />
              <p className="error">{errors.address && "Address is required"}</p>
            </FormControl>

            <FormControl margin="normal">
              <TextField
                label="Phone"
                variant="outlined"
                name="phone"
                placeholder="Phone"
                className="formInput"
                // defaultValue={props.formData.phone}
                {...register("phone", { required: true })}
              />
              <p className="error">{errors.phone && "Phone is required"}</p>
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

            {/* Coordinator field */}
            {status === "coordinator" && (
              <FormControl>
                <InputLabel id="test-select-label">Course</InputLabel>
                <Controller
                  render={() => (
                    <Select
                      onChange={(e) => {
                        const courses = e.target.value.map(
                          (courseId) =>
                            courseList.filter((c) => c.id === courseId)[0]
                        );
                        console.log("setting courses to ", courses);
                        setValue("courses", courses);
                        setCourses(courses);
                      }}
                      value={courses ? courses?.map((c) => c.id) : []}
                      label="Courses"
                      labelId="test-select-label"
                      multiple
                    >
                      {courseList &&
                        courseList.map((course) => (
                          <MenuItem key={course.id} value={course.id}>
                            {course.courseName}
                          </MenuItem>
                        ))}
                    </Select>
                  )}
                  name={"courses"}
                  control={control}
                  // label="Course"
                  label="Courses"
                  labelId="test-select-label"
                />{" "}
              </FormControl>
            )}

            <FormControl
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
                  reset({
                    displayName: null,
                    address: null,
                    phone: null,
                    email: null,
                    course: null,
                  });
                  hide();
                }}
                value="cancel"
                className={styl.cancel}
              >
                Cancel
              </button>
            </FormControl>
          </Form>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default forwardRef(UserForm);
const Form = styled.form`
  max-height: calc(100vh - 210px);
  max-width: calc(100vw - 2rem);
  overflow-y: auto;
  width: 25rem;
  position: relative;
  background: white;
  display: flex;
  flex-direction: column;
  border-radius: 0.5em;

  padding: 1em;
  text-align: center;
  margin: 3em 0;
  @media screen and (min-width: 1200px) {
    width: 55rem;
  }
`;
