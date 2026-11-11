import "./loadingSpinner.scss";

export default function LoadingSpinner({ size = 20, className = "" }) {
  return (
    <span
      className={`loading-spinner ${className}`.trim()}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Đang tải"
    />
  );
}
