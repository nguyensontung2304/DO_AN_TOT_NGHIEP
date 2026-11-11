import "./loadingSpinner.scss";

export default function LoadingSpinner({ size = 20, className = "", style = {} }) {
  return (
    <span
      className={`loading-spinner ${className}`.trim()}
      style={{ width: size, height: size, ...style }}
      role="status"
      aria-label="Đang tải"
    />
  );
}
