import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import ChatBox from "../../components/public/ChatBox/ChatBox";

import PublicHeader from "../../components/public/PublicHeader/PublicHeader";
import PublicFooter from "../../components/public/PublicFooter/PublicFooter";

// Layout route cho toàn bộ trang public: chỉ render khung chung,
// trang con được render vào <Outlet />.
export default function PublicLayout() {
  const currentUser = useSelector((state) => state.user.currentUser);

  return (
    <div className="public-layout">
      <PublicHeader />
      <main>
        <Outlet />
        {currentUser && <ChatBox />}
      </main>
      <PublicFooter />
    </div>
  );
}
