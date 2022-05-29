export default function Button({
  className,
  children,
  bg,
  border,
  padding,
  cursor,
  onClick,
}) {
  return (
    <button
      className={className}
      onClick={onClick}
      style={{
        border: border ? border : "none",
        background: bg ? bg : "none",
        padding: padding ? padding : "0.5em",
        cursor: cursor ? cursor : "pointer",
      }}
    >
      {children}
    </button>
  );
}
