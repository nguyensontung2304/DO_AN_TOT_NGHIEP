import AdminHeader from "../../components/admin/AdminHeader/AdminHeader";
import "./adminLayout.scss";

export default function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      <AdminHeader />
      <main className="admin-layout__main">
        <div className="admin-layout__content">{children}</div>
      </main>
    </div>
  );
}
