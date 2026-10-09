/**
 * Format ngày/giờ kiểu 16:16:57 5/10/2026
 */
export function formatDate(value) {
  if (!value) return "—";

  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return String(value);

  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const yyyy = d.getFullYear();

  return `${hh}:${mm}:${ss} ${day}/${month}/${yyyy}`;
}
