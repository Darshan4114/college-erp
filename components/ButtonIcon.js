import Ripple from "./Ripple";
import styl from "styl/ButtonIcon.module.css";

export default function ButtonIcon(props) {
  return (
    <Ripple
      shape="circle"
      button={true}
      handleRippleOnClick={(e) => {
        if (props.disabled) return;
        props?.onClick(e);
      }}
      bgfff={props.bgfff}
    >
      <p>{props.disabled}</p>
      <button
        disabled={props.disabled}
        className={`${styl.iconBtn} ${props.bgfff && styl.bgfff}`}
      >
        {props.children}
      </button>
    </Ripple>
  );
}
