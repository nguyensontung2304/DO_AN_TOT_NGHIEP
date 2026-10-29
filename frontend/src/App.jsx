/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "./redux/userSlice";
import { getMyProfile } from "./api/authApi";

import { Routes, Route } from "react-router-dom";
import { ROUTES } from "./constants/router";
import RequireAdmin from "./components/RequireAdmin";
import PrivateLayout from "./components/PrivateLayout";
import ScrollToTop from "./components/ScrollToTop";

// PUBLIC LAYOUT
import PublicLayout from "./layouts/public/PublicLayout";

// Public pages
import Home from "./pages/public/Home/Home";
import Products from "./pages/public/Products/Products";
import About from "./pages/public/About/About";
import Contact from "./pages/public/Contact/Contact";
import Cart from "./pages/public/Cart/Cart";
import Login from "./pages/public/Login/Login";
import Register from "./pages/public/Register/Register";
import ProductDetail from "./pages/public/ProductDetail/ProductDetail";
import Profile from "./pages/public/Profile/Profile";
import ForgotPassword from "./pages/public/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/public/ResetPassword/ResetPassword";

// ADMIN LAYOUT
import AdminLayout from "./layouts/admin/AdminLayout";

// Admin pages
import Dashboard from "./pages/admin/Dashboard/Dashboard";
import Orders from "./pages/admin/Orders/Orders";
import Technical from "./pages/admin/Technical/Technical";
import Warehouse from "./pages/admin/Warehouse/Warehouse";
import Purchasing from "./pages/admin/Purchasing/Purchasing";
import Factory from "./pages/admin/Factory/Factory";
import FinishedGoods from "./pages/admin/FinishedGoods/FinishedGoods";
import AdminProducts from "./pages/admin/AdminProducts/AdminProducts";
import Chat from "./pages/admin/Chat/Chat";

function App() {
  const dispatch = useDispatch();
  // authLoading: true cho đến khi biết user là ai → tránh render sai trạng thái
  const [authLoading, setAuthLoading] = useState(true);

  const getUser = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      dispatch(clearUser());
      setAuthLoading(false);
      return;
    }

    try {
      const response = await getMyProfile();
      console.log("=======> USER", response);
      dispatch(setUser(response.data));
    } catch (error) {
      // Chỉ xoá phiên khi server thực sự từ chối token (401).
      // Lỗi mạng tạm thời (server đang restart, rớt mạng) không phải lý do
      // để đăng xuất người dùng — trước đây mỗi lỗi đều clearUser() nên
      // ngồi im cũng bị logout.
      if (error.response?.status === 401) {
        dispatch(clearUser());
      } else {
        console.warn(
          "Không lấy được thông tin user, giữ nguyên phiên đăng nhập:",
          error?.message,
        );
      }
    } finally {
      setAuthLoading(false);
    }
  }, [dispatch]);

  // Chỉ chạy 1 lần khi app mount để xác định trạng thái đăng nhập
  useEffect(() => {
    getUser();
  }, [getUser]);

  // Chờ xác thực xong mới render để tránh header nháy giữa "Đăng nhập" và user dropdown
  if (authLoading) return null;

  return (
    <>
      <ScrollToTop />

      <Routes>
        {/* Trang public: dùng chung PublicLayout */}
        <Route element={<PublicLayout />}>
          <Route path={ROUTES.USER.HOME} element={<Home />} />
          <Route path={ROUTES.USER.PRODUCT_LIST} element={<Products />} />
          <Route
            path={ROUTES.USER.PRODUCT_DETAIL}
            element={<ProductDetail />}
          />
          <Route path={ROUTES.USER.ABOUT} element={<About />} />
          <Route path={ROUTES.USER.CONTACT} element={<Contact />} />
          <Route path={ROUTES.USER.LOGIN} element={<Login />} />
          <Route path={ROUTES.USER.REGISTER} element={<Register />} />
          <Route
            path={ROUTES.USER.FORGOT_PASSWORD}
            element={<ForgotPassword />}
          />
          <Route
            path={ROUTES.USER.RESET_PASSWORD}
            element={<ResetPassword />}
          />

          {/* Trang cần đăng nhập: PrivateLayout chặn trước khi render */}
          <Route element={<PrivateLayout />}>
            {/* Mỗi UI của giỏ hàng là 1 route riêng: /cart, /cart/checkout,
              /cart/orders — reload hoặc chia sẻ link đều giữ đúng phần đang xem */}
            <Route path={ROUTES.USER.CART} element={<Cart />} />
            <Route path={ROUTES.USER.CART_CHECKOUT} element={<Cart />} />
            <Route path={ROUTES.USER.CART_ORDERS} element={<Cart />} />

            {/* Tương tự: tab hồ sơ và tab đổi mật khẩu có 2 URL khác nhau */}
            <Route path={ROUTES.USER.PROFILE} element={<Profile />} />
            <Route
              path={ROUTES.USER.PROFILE_ADDRESS_BOOK}
              element={<Profile />}
            />
            <Route
              path={ROUTES.USER.PROFILE_CHANGE_PASSWORD}
              element={<Profile />}
            />
          </Route>
        </Route>

        {/* Trang admin: RequireAdmin kiểm tra trước, rồi mới vào AdminLayout */}
        <Route element={<RequireAdmin />}>
          <Route element={<AdminLayout />}>
            <Route path={ROUTES.ADMIN.DASHBOARD} element={<Dashboard />} />
            <Route path={ROUTES.ADMIN.ORDERS} element={<Orders />} />
            <Route path={ROUTES.ADMIN.TECHNICAL} element={<Technical />} />
            <Route path={ROUTES.ADMIN.WAREHOUSE} element={<Warehouse />} />
            <Route path={ROUTES.ADMIN.PURCHASING} element={<Purchasing />} />
            <Route path={ROUTES.ADMIN.FACTORY} element={<Factory />} />
            <Route
              path={ROUTES.ADMIN.FINISHED_GOODS}
              element={<FinishedGoods />}
            />
            <Route path={ROUTES.ADMIN.PRODUCTS} element={<AdminProducts />} />
            <Route path={ROUTES.ADMIN.CHAT} element={<Chat />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
