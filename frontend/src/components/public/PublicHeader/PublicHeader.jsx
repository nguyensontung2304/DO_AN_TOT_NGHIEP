import { useRef, useState, useEffect, useCallback } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "../../../redux/userSlice";
import { getCartByUserId } from "../../../api/cartApi";
import { logout } from "../../../api/authApi";
import { ROUTES } from "../../../constants/router.js";

import "./publicHeader.scss";

export default function PublicHeader() {
  const currentUser = useSelector((state) => state.user.currentUser);
  console.log("currentUser in PublicHeader:", currentUser);
  const dispatch = useDispatch();

  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const getCartCount = useCallback(async () => {
    if (!currentUser?.id) {
      setCartCount(0);
      return;
    }

    try {
      const response = await getCartByUserId(currentUser.id);

      const cartData = Array.isArray(response.data) ? response.data : [];

      // Badge trên icon giỏ hàng đếm SỐ MỤC (số dòng sản phẩm khác nhau),
      // không cộng dồn qty. Mua 3 chiếc cùng loại thì vẫn hiện 1.
      setCartCount(cartData.length);
    } catch (error) {
      console.error("Lỗi lấy số lượng giỏ hàng:", error);
      setCartCount(0);
    }
  }, [currentUser]);

  // KHI USER THAY ĐỔI → CẬP NHẬT CART
  useEffect(() => {
    getCartCount();
  }, [getCartCount]);

  // CART THAY ĐỔI
  useEffect(() => {
    const handleCartUpdated = () => {
      getCartCount();
    };

    window.addEventListener("cartUpdated", handleCartUpdated);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdated);
    };
  }, [getCartCount]);

  // ĐÓNG DROPDOWN KHI CLICK RA NGOÀI
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdown(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  // ĐĂNG XUẤT
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
    }

    localStorage.removeItem("userId");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userRole");

    dispatch(clearUser());

    setCartCount(0);

    setUserDropdown(false);

    navigate(ROUTES.USER.HOME);
  };

  return (
    <header className="pub-header">
      <div className="pub-header__inner">
        <Link to={ROUTES.USER.HOME} className="pub-header__logo">
          <span>
            <img
              src="/images/logo.jpeg"
              alt="Nguyễn Sơn Tùng"
              className="pub-header__logo-image"
            />
          </span>

          <span>
            <strong>Nội Thất</strong>
            <em> Việt</em>
          </span>
        </Link>
        <nav className={`pub-header__nav ${menuOpen ? "open" : ""}`}>
          <NavLink to={ROUTES.USER.HOME} end onClick={() => setMenuOpen(false)}>
            Trang chủ
          </NavLink>

          <NavLink
            to={ROUTES.USER.PRODUCT_LIST}
            onClick={() => setMenuOpen(false)}
          >
            Sản phẩm
          </NavLink>

          <NavLink to={ROUTES.USER.ABOUT} onClick={() => setMenuOpen(false)}>
            Giới thiệu
          </NavLink>

          <NavLink to={ROUTES.USER.CONTACT} onClick={() => setMenuOpen(false)}>
            Liên hệ
          </NavLink>
        </nav>

        <div className="pub-header__actions">
          <button
            className="pub-header__cart"
            aria-label={`Giỏ hàng (${cartCount})`}
            onClick={() => navigate(ROUTES.USER.CART)}
          >
            🛒
            {cartCount > 0 && (
              <span className="pub-header__cart-badge">{cartCount}</span>
            )}
          </button>

          {!currentUser && (
            <Link to={ROUTES.USER.LOGIN} className="pub-header__login-btn">
              Đăng nhập
            </Link>
          )}

          {currentUser && (
            <div className="pub-header__user" ref={dropdownRef}>
              <button
                className="pub-header__user-btn"
                onClick={() => setUserDropdown((value) => !value)}
                aria-expanded={userDropdown}
              >
                <span className="pub-header__user-avatar">
                  {currentUser?.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt="Ảnh đại diện"
                      className="header-avatar"
                    />
                  ) : (
                    <div className="pub-header__user-avatar-none">
                      <span>{currentUser?.name?.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                </span>

                <span className="pub-header__user-name">
                  {currentUser.name}
                </span>

                <span className="pub-header__user-caret">▾</span>
              </button>

              {userDropdown && (
                <div className="pub-header__dropdown">
                  <div className="pub-header__dropdown-info">
                    <strong>{currentUser.name}</strong>
                    <small>{currentUser.email}</small>
                  </div>

                  <div className="pub-header__dropdown-divider" />

                  <Link
                    to={ROUTES.USER.PROFILE}
                    className="pub-header__dropdown-item"
                    onClick={() => setUserDropdown(false)}
                  >
                    👤 Hồ sơ
                  </Link>

                  <button
                    className="pub-header__dropdown-item pub-header__dropdown-item--danger"
                    onClick={handleLogout}
                  >
                    🚪 Đăng xuất
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            className="pub-header__burger"
            aria-label="Menu"
            onClick={() => setMenuOpen((value) => !value)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
