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
      // Backend trả về object user thẳng (không bọc { user: ... })
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
        {/* ── Trang public: dùng chung PublicLayout ───────────────────────── */}
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

          {/* ── Trang cần đăng nhập: PrivateLayout chặn trước khi render ──── */}
          <Route element={<PrivateLayout />}>
            {/* Mỗi UI của giỏ hàng là 1 route riêng: /cart, /cart/checkout,
              /cart/orders — reload hoặc chia sẻ link đều giữ đúng phần đang xem */}
            <Route path={ROUTES.USER.CART} element={<Cart />} />
            <Route path={ROUTES.USER.CART_CHECKOUT} element={<Cart />} />
            <Route path={ROUTES.USER.CART_ORDERS} element={<Cart />} />

            {/* Tương tự: tab hồ sơ và tab đổi mật khẩu có 2 URL khác nhau */}
            <Route path={ROUTES.USER.PROFILE} element={<Profile />} />
            <Route path={ROUTES.USER.PROFILE_ADDRESS_BOOK} element={<Profile />} />
            <Route
              path={ROUTES.USER.PROFILE_CHANGE_PASSWORD}
              element={<Profile />}
            />
          </Route>
        </Route>

        {/* ── Trang admin: RequireAdmin kiểm tra trước, rồi mới vào AdminLayout ─ */}
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

// import { useEffect, useState, useCallback } from "react";
// import { ClipboardList, MapPin, Plus } from "lucide-react";
// import { Link } from "react-router-dom";
// import { ROUTES } from "../../../../../constants/router";
// import { getAddresses } from "../../../../../api/addressApi";
// import { getProvinces, getWards } from "../../../../../api/locationApi";
// import AddressFields from "../../../../../components/public/AddressFields/AddressFields";
// import "./checkoutForm.scss";

// // Form thông tin đặt hàng và tóm tắt đơn hàng.
// function CheckoutForm({
//   cart,
//   form,
//   formErrors,
//   profileComplete,
//   onChangeField,
//   onBack,
// }) {
//   const [addresses, setAddresses] = useState([]);
//   const [selectedAddressId, setSelectedAddressId] = useState("");
//   const [addressLoading, setAddressLoading] = useState(true);
//   const [addressError, setAddressError] = useState("");
//   const [addressFieldsKey, setAddressFieldsKey] = useState(0);

//   // Province/ward data for constructing full address string
//   const [provinceList, setProvinceList] = useState([]);
//   const [wardMap, setWardMap] = useState({});

//   // Load provinces for address construction
//   useEffect(() => {
//     let active = true;
//     getProvinces()
//       .then((data) => {
//         if (active) setProvinceList(data);
//       })
//       .catch(() => {});
//     return () => {
//       active = false;
//     };
//   }, []);

//   // Load wards for a province when needed
//   const loadWardsForProvince = async (provinceCode) => {
//     if (wardMap[provinceCode]) return;
//     try {
//       const data = await getWards(provinceCode);
//       setWardMap((prev) => ({ ...prev, [provinceCode]: data }));
//     } catch (error) {
//       console.error("Failed to load wards:", error);
//     }
//   };

//   // Construct full address string from components
//   const buildFullAddress = useCallback(
//     (provinceCode, wardCode, addressLine) => {
//       if (!provinceCode || !wardCode || !addressLine) return "";
//       const province = provinceList.find((p) => p.code === provinceCode);
//       const wards = wardMap[provinceCode] || [];
//       const ward = wards.find((w) => w.code === wardCode);
//       if (!province || !ward) return "";
//       return `${addressLine}, ${ward.name}, ${province.name}`;
//     },
//     [provinceList, wardMap],
//   );

//   // Sync AddressFields data to form.address for API compatibility
//   useEffect(() => {
//     const provinceCode = form.provinceCode;
//     const wardCode = form.wardCode;
//     const addressLine = form.addressLine;
//     if (provinceCode && wardCode && addressLine) {
//       const fullAddress = buildFullAddress(provinceCode, wardCode, addressLine);
//       if (fullAddress) {
//         onChangeField("address", fullAddress);
//       }
//     }
//   }, [
//     form.provinceCode,
//     form.wardCode,
//     form.addressLine,
//     onChangeField,
//     buildFullAddress,
//   ]);

//   // Lấy sổ địa chỉ của người dùng đang đăng nhập.
//   useEffect(() => {
//     let active = true;

//     const loadAddresses = async () => {
//       try {
//         setAddressLoading(true);
//         setAddressError("");

//         const data = await getAddresses();

//         if (!active) return;

//         setAddresses(Array.isArray(data) ? data : []);

//         // Không tự động điền địa chỉ mặc định, để người dùng tự chọn
//         const defaultAddress = data.find((address) => address.isDefault);

//         if (defaultAddress) {
//           setSelectedAddressId(String(defaultAddress.id));
//         }
//       } catch (error) {
//         if (active) {
//           setAddressError(
//             error.response?.data?.message ||
//               "Không tải được sổ địa chỉ. Vui lòng thử lại.",
//           );
//         }
//       } finally {
//         if (active) {
//           setAddressLoading(false);
//         }
//       }
//     };

//     loadAddresses();

//     return () => {
//       active = false;
//     };
//   }, []);

//   // Chọn địa chỉ đã lưu và điền thông tin vào form đặt hàng.
//   const handleSelectAddress = async (event) => {
//     const id = event.target.value;

//     setSelectedAddressId(id);

//     const address = addresses.find((item) => String(item.id) === id);

//     if (!address) return;

//     onChangeField("name", address.fullName);
//     onChangeField("phone", address.phone);
//     onChangeField("address", address.fullAddress);
//     onChangeField("provinceCode", address.provinceCode || "");
//     onChangeField("wardCode", address.wardCode || "");
//     onChangeField("addressLine", address.addressLine || "");

//     // Force AddressFields remount với giá trị mới
//     setAddressFieldsKey((prev) => prev + 1);

//     // Load wards for the selected province to enable address construction
//     if (address.provinceCode) {
//       await loadWardsForProvince(address.provinceCode);
//     }
//   };

//   // Cho phép nhập số điện thoại chỉ gồm chữ số.
//   const handlePhoneChange = (event) => {
//     const value = event.target.value;

//     if (!/^\d*$/.test(value)) return;

//     onChangeField("phone", value);
//   };

//   return (
//     <>
//       <h2 className="cart-section-title">
//         <ClipboardList size={20} />
//         Thông tin đặt hàng
//       </h2>

//       {profileComplete ? (
//         <div className="checkout-profile-banner checkout-profile-banner--filled">
//           <span>✅</span>
//           <span>
//             Thông tin từ hồ sơ của bạn đã được điền sẵn. Bạn có thể chỉnh sửa
//             nếu cần.
//           </span>
//         </div>
//       ) : (
//         <div className="checkout-profile-banner checkout-profile-banner--empty">
//           <span>⚠️</span>
//           <span>
//             Bạn chưa cập nhật hồ sơ. Vui lòng điền đầy đủ thông tin bên dưới để
//             đặt hàng.{" "}
//             <Link to={ROUTES.USER.PROFILE} className="checkout-profile-link">
//               Cập nhật hồ sơ ngay
//             </Link>
//           </span>
//         </div>
//       )}

//       <div className="checkout-form">
//         {/* Họ tên và số điện thoại */}
//         <div className="checkout-form__row">
//           <div className="checkout-form__group">
//             <label>
//               Họ và tên <span className="req">*</span>
//             </label>

//             <input
//               type="text"
//               value={form.name || ""}
//               onChange={(event) => onChangeField("name", event.target.value)}
//               placeholder="Nguyễn Văn A"
//               className={formErrors.name ? "input-error" : ""}
//             />

//             {formErrors.name && (
//               <p className="field-error">{formErrors.name}</p>
//             )}
//           </div>

//           <div className="checkout-form__group">
//             <label>
//               Số điện thoại <span className="req">*</span>
//             </label>

//             <input
//               type="tel"
//               value={form.phone || ""}
//               onChange={handlePhoneChange}
//               placeholder="Nhập số điện thoại"
//               maxLength={10}
//               className={formErrors.phone ? "input-error" : ""}
//             />

//             {formErrors.phone && (
//               <p className="field-error">{formErrors.phone}</p>
//             )}
//           </div>
//         </div>

//         {/* Địa chỉ nhận hàng */}
//         <div className="checkout-form__group">

//           <AddressFields
//             key={addressFieldsKey}
//             form={form}
//             onChange={(event) => {
//               const { name, value } = event.target;
//               // Map AddressFields field names to parent form field names
//               const fieldMap = {
//                 fullName: "name",
//                 phone: "phone",
//                 provinceCode: "provinceCode",
//                 wardCode: "wardCode",
//                 addressLine: "addressLine",
//               };
//               onChangeField(fieldMap[name] || name, value);
//             }}
//           />

//           {formErrors.address && (
//             <p className="field-error">{formErrors.address}</p>
//           )}
//         </div>

//         {/* Ghi chú đơn hàng */}
//         <div className="checkout-form__group">
//           <label>Ghi chú (không bắt buộc)</label>

//           <textarea
//             rows={3}
//             value={form.note || ""}
//             onChange={(event) => onChangeField("note", event.target.value)}
//             placeholder="Yêu cầu đặc biệt, thời gian giao hàng..."
//           />
//         </div>

//         {/* Tóm tắt đơn hàng */}
//         <div className="checkout-order-summary">
//           <h3>Tóm tắt đơn hàng</h3>

//           <div className="checkout-order-list">
//             {cart.map((item) => (
//               <div key={item.productId} className="checkout-order-row">
//                 <div className="checkout-order-product">
//                   <div className="checkout-order-img">
//                     <img src={item.image} alt={item.name} />

//                     <span className="checkout-order-qty">×{item.qty}</span>
//                   </div>

//                   <div className="checkout-order-info">
//                     <span className="checkout-order-name">{item.name}</span>

//                     <span className="checkout-order-price">
//                       {Number(item.price).toLocaleString("vi-VN")} ₫ / sản phẩm
//                     </span>
//                   </div>
//                 </div>

//                 <strong className="checkout-order-total">
//                   {(Number(item.price) * Number(item.qty)).toLocaleString(
//                     "vi-VN",
//                   )}{" "}
//                   ₫
//                 </strong>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       <button type="button" className="cart-btn-back" onClick={onBack}>
//         ← Quay lại giỏ hàng
//       </button>
//     </>
//   );
// }

// export default CheckoutForm;

// ==================================================
// CHECKOUT FORM
// .checkout-form {
//   display: flex;
//   flex-direction: column;
//   gap: 20px;

//   // FORM ROW
//   &__row {
//     display: grid;
//     grid-template-columns: 1fr 1fr;
//     gap: 20px;
//   }

//   // FORM GROUP
//   &__group {
//     display: flex;
//     flex-direction: column;
//     gap: 6px;

//     label {
//       font-size: 13px;
//       font-weight: 600;
//       color: #444;
//       letter-spacing: 0.2px;
//     }

//     input,
//     textarea {
//       width: 100%;
//       padding: 11px 14px;
//       border: 1.5px solid #ddd;
//       border-radius: 9px;
//       background: #fff;
//       color: #222;
//       font-size: 14px;
//       font-family: inherit;
//       outline: none;
//       transition:
//         border-color 0.2s ease,
//         box-shadow 0.2s ease,
//         background-color 0.2s ease;

//       &:focus {
//         border-color: #c0392b;
//         box-shadow: 0 0 0 3px rgba(192, 57, 43, 0.08);
//       }

//       &::placeholder {
//         color: #aaa;
//       }
//     }

//     textarea {
//       resize: vertical;
//       min-height: 80px;
//     }
//   }
// }

// // REQUIRED
// .req {
//   color: #e74c3c;
// }

// // FIELD ERROR
// .field-error {
//   margin: 0;
//   font-size: 12px;
//   line-height: 1.4;
//   color: #c0392b;
// }

// // INPUT ERROR
// .input-error {
//   border-color: #e74c3c !important;
//   background: #fff5f5 !important;

//   &:focus {
//     border-color: #e74c3c !important;
//     box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.08) !important;
//   }
// }

// // PROFILE BANNER
// .checkout-profile-banner {
//   display: flex;
//   align-items: flex-start;
//   gap: 10px;
//   margin-bottom: 20px;
//   padding: 12px 16px;
//   border-radius: 10px;
//   font-size: 13px;
//   line-height: 1.6;

//   // Icon
//   span:first-child {
//     flex-shrink: 0;
//     margin-top: 1px;
//     font-size: 16px;
//   }

//   // PROFILE ĐÃ ĐỦ THÔNG TIN
//   &--filled {
//     background: #eafaf1;
//     color: #1e8449;
//     border: 1px solid #a9dfbf;
//   }

//   // PROFILE CHƯA ĐỦ THÔNG TIN
//   &--empty {
//     background: #fff8e1;
//     color: #7d6608;
//     border: 1px solid #f9ca24;
//   }
// }

// // PROFILE LINK
// .checkout-profile-link {
//   color: #c0392b;
//   font-weight: 700;
//   text-decoration: underline;

//   &:hover {
//     color: #a93226;
//   }
// }

// // ORDER SUMMARY
// .checkout-order-summary {
//   width: 100%;
//   padding: 24px;
//   background: #fff;
//   border: 1px solid #eeeeee;
//   border-radius: 16px;
//   box-shadow: 0 4px 18px rgba(0, 0, 0, 0.05);

//   // TITLE
//   h3 {
//     display: flex;
//     align-items: center;
//     gap: 8px;
//     margin: 0 0 20px;
//     color: #1a1a2e;
//     font-size: 18px;
//     font-weight: 800;
//     line-height: 1.4;

//     &::before {
//       content: "";
//       width: 4px;
//       height: 20px;
//       flex-shrink: 0;
//       background: #c0392b;
//       border-radius: 4px;
//     }
//   }
// }

// // ORDER LIST
// .checkout-order-list {
//   display: flex;
//   flex-direction: column;
// }

// // ORDER ROW
// .checkout-order-row {
//   display: flex;
//   align-items: center;
//   justify-content: space-between;
//   gap: 16px;
//   padding: 14px 0;
//   border-bottom: 1px solid #f0f0f0;

//   &:first-child {
//     padding-top: 0;
//   }

//   &:last-child {
//     padding-bottom: 0;
//     border-bottom: none;
//   }
// }

// // ORDER PRODUCT
// .checkout-order-product {
//   display: flex;
//   align-items: center;
//   gap: 12px;
//   min-width: 0;
//   flex: 1;
// }

// // ORDER IMAGE
// .checkout-order-img {
//   position: relative;
//   width: 64px;
//   height: 64px;
//   flex: 0 0 64px;
//   background: #f7f7f7;
//   border: 1px solid #eeeeee;
//   border-radius: 10px;
//   overflow: visible;

//   img {
//     display: block;
//     width: 100%;
//     height: 100%;
//     object-fit: cover;
//     border-radius: 10px;
//   }
// }

// // ORDER QUANTITY
// .checkout-order-qty {
//   position: absolute;
//   top: -7px;
//   right: -7px;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   min-width: 23px;
//   height: 23px;
//   padding: 0 5px;
//   background: #1a1a2e;
//   color: #fff;
//   border: 2px solid #fff;
//   border-radius: 50px;
//   font-size: 11px;
//   font-weight: 700;
//   white-space: nowrap;
// }

// // ORDER INFO
// .checkout-order-info {
//   display: flex;
//   flex-direction: column;
//   gap: 5px;
//   min-width: 0;
// }

// // ORDER NAME
// .checkout-order-name {
//   display: -webkit-box;
//   overflow: hidden;
//   color: #222;
//   font-size: 14px;
//   font-weight: 700;
//   line-height: 1.4;
//   -webkit-line-clamp: 2;
//   -webkit-box-orient: vertical;
// }

// // ORDER UNIT PRICE
// .checkout-order-price {
//   color: #888;
//   font-size: 12px;
//   font-weight: 400;
//   line-height: 1.4;
// }
// // ORDER TOTAL
// .checkout-order-total {
//   flex-shrink: 0;
//   color: #c0392b;
//   font-size: 14px;
//   font-weight: 800;
//   line-height: 1.4;
//   text-align: right;
//   white-space: nowrap;
// }

// // BACK BUTTON
// .cart-btn-back {
//   display: inline-flex;
//   align-items: center;
//   gap: 4px;
//   margin-top: 20px;
//   padding: 0;
//   background: none;
//   border: none;
//   color: #6495ed;
//   font-size: 14px;
//   font-weight: 600;
//   cursor: pointer;
//   &:hover {
//     text-decoration: underline;
//   }
// }

// // ==================== RESPONSIVE ====================
// // ==================== 900px ====================
// @media (max-width: 900px) {
//   // FORM
//   .checkout-form {
//     gap: 18px;
//   }

//   .checkout-form__row {
//     gap: 16px;
//   }

//   // ORDER SUMMARY
//   .checkout-order-summary {
//     padding: 20px;
//     border-radius: 14px;

//     h3 {
//       margin-bottom: 16px;
//       font-size: 17px;
//     }
//   }

//   .checkout-order-row {
//     gap: 12px;
//     padding: 12px 0;
//   }

//   .checkout-order-img {
//     width: 58px;
//     height: 58px;
//     flex-basis: 58px;
//   }

//   .checkout-order-name {
//     font-size: 13px;
//   }

//   .checkout-order-total {
//     font-size: 13px;
//   }
// }
// // ==================== 600px ====================
// @media (max-width: 600px) {
//   // FORM
//   .checkout-form {
//     gap: 16px;
//   }

//   .checkout-form__row {
//     grid-template-columns: 1fr;
//     gap: 16px;
//   }

//   .checkout-form__group {
//     gap: 5px;

//     label {
//       font-size: 12px;
//     }

//     input,
//     textarea {
//       padding: 10px 12px;
//       font-size: 13px;
//     }
//   }

//   // PROFILE BANNER
//   .checkout-profile-banner {
//     margin-bottom: 16px;
//     padding: 11px 13px;

//     font-size: 12px;
//   }

//   // ORDER SUMMARY
//   .checkout-order-summary {
//     padding: 18px;

//     border-radius: 12px;

//     h3 {
//       margin-bottom: 14px;

//       font-size: 16px;

//       &::before {
//         width: 3px;
//         height: 18px;
//       }
//     }
//   }

//   .checkout-order-row {
//     align-items: center;

//     gap: 10px;
//   }

//   .checkout-order-product {
//     gap: 10px;
//   }

//   .checkout-order-img {
//     width: 54px;
//     height: 54px;

//     flex-basis: 54px;
//   }

//   .checkout-order-qty {
//     min-width: 21px;
//     height: 21px;

//     font-size: 10px;
//   }

//   .checkout-order-name {
//     font-size: 13px;
//   }

//   .checkout-order-price {
//     font-size: 11px;
//   }

//   .checkout-order-total {
//     font-size: 13px;
//   }
//   // BACK BUTTON
//   .cart-btn-back {
//     margin-top: 16px;

//     font-size: 13px;
//   }
// }

// // ==================== 480px ====================
// @media (max-width: 480px) {
//   // FORM
//   .checkout-form {
//     gap: 14px;
//   }

//   .checkout-form__group {
//     input,
//     textarea {
//       padding: 9px 11px;
//       font-size: 12px;
//     }
//   }

//   // PROFILE BANNER
//   .checkout-profile-banner {
//     gap: 8px;

//     padding: 10px 12px;

//     font-size: 11px;
//     line-height: 1.5;

//     span:first-child {
//       font-size: 14px;
//     }
//   }

//   // ORDER SUMMARY
//   .checkout-order-summary {
//     padding: 16px;
//   }

//   .checkout-order-row {
//     gap: 8px;
//   }

//   .checkout-order-product {
//     gap: 9px;
//   }

//   .checkout-order-img {
//     width: 48px;
//     height: 48px;

//     flex-basis: 48px;
//   }

//   .checkout-order-qty {
//     top: -6px;
//     right: -6px;

//     min-width: 19px;
//     height: 19px;

//     font-size: 9px;
//   }

//   .checkout-order-name {
//     font-size: 12px;
//   }

//   .checkout-order-price {
//     font-size: 10px;
//   }

//   .checkout-order-total {
//     font-size: 12px;
//   }
// }
