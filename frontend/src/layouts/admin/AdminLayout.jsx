import { Outlet } from "react-router-dom";

import AdminHeader from "../../components/admin/AdminHeader/AdminHeader";
import "./adminLayout.scss";

// Layout route cho toàn bộ trang admin: chỉ render khung chung,
// trang con được render vào <Outlet />.
export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <AdminHeader />
      <main className="admin-layout__main">
        <div className="admin-layout__content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
