import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "./redux/userSlice";
import { getMyProfile } from "./api/authApi";

import { Routes, Route } from "react-router-dom";
import { ROUTES } from "./constants/router";
import RequireAdmin from "./components/RequireAdmin";

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

function App() {
  console.log("localStorage accessToken:", localStorage.getItem("accessToken"));
  console.log("localStorage:", localStorage);
  const dispatch = useDispatch();
  // authLoading: true cho đến khi biết user là ai → tránh render header sai trạng thái
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
      // Backend trả về object user thẳng (không bọc { user: ... })
      const user = response.data;
      dispatch(setUser(user));
    } catch (error) {
      console.error("Lỗi lấy thông tin user:", error);
      dispatch(clearUser());
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
    <Routes>
      {/* PUBLIC */}
      <Route
        path={ROUTES.USER.HOME}
        element={
          <PublicLayout>
            <Home />
          </PublicLayout>
        }
      />

      <Route
        path={ROUTES.USER.PRODUCT_LIST}
        element={
          <PublicLayout>
            <Products />
          </PublicLayout>
        }
      />

      <Route
        path={ROUTES.USER.ABOUT}
        element={
          <PublicLayout>
            <About />
          </PublicLayout>
        }
      />

      <Route
        path={ROUTES.USER.CONTACT}
        element={
          <PublicLayout>
            <Contact />
          </PublicLayout>
        }
      />

      <Route
        path={ROUTES.USER.CART}
        element={
          <PublicLayout>
            <Cart />
          </PublicLayout>
        }
      />

      <Route
        path={ROUTES.USER.LOGIN}
        element={
          <PublicLayout>
            <Login />
          </PublicLayout>
        }
      />

      <Route
        path={ROUTES.USER.REGISTER}
        element={
          <PublicLayout>
            <Register />
          </PublicLayout>
        }
      />

      <Route
        path={ROUTES.USER.PROFILE}
        element={
          <PublicLayout>
            <Profile />
          </PublicLayout>
        }
      />

      <Route
        path={ROUTES.USER.PRODUCT_DETAIL}
        element={
          <PublicLayout>
            <ProductDetail />
          </PublicLayout>
        }
      />

      {/* ADMIN - bảo vệ bởi RequireAdmin */}
      <Route
        path={ROUTES.ADMIN.DASHBOARD}
        element={
          <RequireAdmin>
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          </RequireAdmin>
        }
      />

      <Route
        path={ROUTES.ADMIN.ORDERS}
        element={
          <RequireAdmin>
            <AdminLayout>
              <Orders />
            </AdminLayout>
          </RequireAdmin>
        }
      />

      <Route
        path={ROUTES.ADMIN.TECHNICAL}
        element={
          <RequireAdmin>
            <AdminLayout>
              <Technical />
            </AdminLayout>
          </RequireAdmin>
        }
      />

      <Route
        path={ROUTES.ADMIN.WAREHOUSE}
        element={
          <RequireAdmin>
            <AdminLayout>
              <Warehouse />
            </AdminLayout>
          </RequireAdmin>
        }
      />

      <Route
        path={ROUTES.ADMIN.PURCHASING}
        element={
          <RequireAdmin>
            <AdminLayout>
              <Purchasing />
            </AdminLayout>
          </RequireAdmin>
        }
      />

      <Route
        path={ROUTES.ADMIN.FACTORY}
        element={
          <RequireAdmin>
            <AdminLayout>
              <Factory />
            </AdminLayout>
          </RequireAdmin>
        }
      />

      <Route
        path={ROUTES.ADMIN.FINISHED_GOODS}
        element={
          <RequireAdmin>
            <AdminLayout>
              <FinishedGoods />
            </AdminLayout>
          </RequireAdmin>
        }
      />

      <Route
        path={ROUTES.ADMIN.PRODUCTS}
        element={
          <RequireAdmin>
            <AdminLayout>
              <AdminProducts />
            </AdminLayout>
          </RequireAdmin>
        }
      />
    </Routes>
  );
}

export default App;
