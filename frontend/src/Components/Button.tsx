interface Props {
  message: string;
  color?: "blue" | "grey" | "green" | "red" | "yellow" | "black";
  onClick: () => void;
}

const bootstrapColors = {
  blue: "primary",
  grey: "secondary",
  green: "success",
  red: "danger",
  yellow: "warning",
  black: "dark",
};

function Button({ message, color = "blue", onClick }: Props) {
  return (
    <button
      type="button"
      className={`btn btn-${bootstrapColors[color]}`}
      onClick={onClick}
    >
      {message}
    </button>
  );
}

export default Button;
