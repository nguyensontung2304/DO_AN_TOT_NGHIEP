import { useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "./redux/userSlice";
import { getUserById } from "./api/authApi";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ROUTES } from "./constants/router";

// PUBLIC LAYOUT
import PublicLayout from "./layouts/public/PublicLayout";

// Public pages
import Home from "./pages/public/Home/Home";
import Products from "./pages/public/Products/Products";
import About from "./pages/public/About/About";
import Contact from "./pages/public/Contact/Contact";
import Cart from "./pages/public/Cart/Cart";
import LoginAdmin from "./pages/public/LoginAdmin/LoginAdmin";
import LoginUser from "./pages/public/LoginUser/LoginUser";
import Register from "./pages/public/Register/Register";
import ProductDetail from "./pages/public/ProductDetail/ProductDetail";
import Profile from "./pages/public/Profile/Profile";

// ADMIN LAYOUT
import AdminLayout from "./layouts/admin/AdminLayout";

// Admin pages
import Dashboard from "./pages/admin/Dashboard/Dashboard";
import Technical from "./pages/admin/Technical/Technical";
import Warehouse from "./pages/admin/Warehouse/Warehouse";
import Purchasing from "./pages/admin/Purchasing/Purchasing";
import Factory from "./pages/admin/Factory/Factory";
import FinishedGoods from "./pages/admin/FinishedGoods/FinishedGoods";

function App() {
  const dispatch = useDispatch();

  const getUser = useCallback(async () => {
    try {
      const userId = JSON.parse(localStorage.getItem("userId"));

      if (!userId) {
        dispatch(clearUser());
        return;
      }

      const response = await getUserById(userId);

      const user = response.data.user;

      dispatch(setUser(user));
    } catch (error) {
      console.log("Lỗi lấy thông tin user:", error);
      dispatch(clearUser());
    }
  }, [dispatch]);

  useEffect(() => {
    getUser();
  }, [getUser]);

  useEffect(() => {
    const handleUserChanged = () => {
      getUser();
    };

    window.addEventListener("userChanged", handleUserChanged);

    return () => {
      window.removeEventListener("userChanged", handleUserChanged);
    };
  }, [getUser]);

  return (
    <BrowserRouter>
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
          path={ROUTES.USER.LOGIN_ADMIN}
          element={
            <PublicLayout>
              <LoginAdmin />
            </PublicLayout>
          }
        />

        <Route
          path={ROUTES.USER.LOGIN_USER}
          element={
            <PublicLayout>
              <LoginUser />
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

        {/* ADMIN */}
        <Route
          path={ROUTES.ADMIN.DASHBOARD}
          element={
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          }
        />

        <Route
          path={ROUTES.ADMIN.TECHNICAL}
          element={
            <AdminLayout>
              <Technical />
            </AdminLayout>
          }
        />

        <Route
          path={ROUTES.ADMIN.WAREHOUSE}
          element={
            <AdminLayout>
              <Warehouse />
            </AdminLayout>
          }
        />

        <Route
          path={ROUTES.ADMIN.PURCHASING}
          element={
            <AdminLayout>
              <Purchasing />
            </AdminLayout>
          }
        />

        <Route
          path={ROUTES.ADMIN.FACTORY}
          element={
            <AdminLayout>
              <Factory />
            </AdminLayout>
          }
        />

        <Route
          path={ROUTES.ADMIN.FINISHED_GOODS}
          element={
            <AdminLayout>
              <FinishedGoods />
            </AdminLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
