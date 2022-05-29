import styl from "styl/RatePackage.module.css";

export default function RatePackage({ data, ...props }) {
  return (
    <div key={data.id} className={styl.vehicle}>
      <div className={styl.textContainer}>
        <div className={styl.stats}>
          <p>{data.packageName} </p>
          <p>{data.tripType} </p>
          <p>{data.vehicleGroup} </p>
        </div>
        <hr />
        <button
          className={styl.edit}
          onClick={() => props.handleEditClick(data)}
        >
          Edit
        </button>
      </div>
    </div>
    //   </a>
    // </Link>
  );
}
