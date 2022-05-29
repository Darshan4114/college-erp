const courseUpdateWarning = (
  <div>
    <p>Updating this course will also update the exams of the course.</p>
    <p>You will be required to remake timetables for the updated exams.</p>
    <br />
    <ul>
      <li>
        If you have reduced the number of years of this course, the extra exams
        will be moved to the recycle bin.
      </li>
      <li>
        If you have increased the number of years, then new exams will be
        created for the increased years.
      </li>
    </ul>
    <p> Do you want to continue?</p>
  </div>
);
export default courseUpdateWarning;
