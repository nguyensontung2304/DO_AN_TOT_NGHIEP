import { Package, ShoppingCart, LoaderCircle } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { ROUTES } from "../../../constants/router";

import {
  getCartByUserId,
  getOrdersByUserId,
  updateCartQty,
  removeFromCart,
  createOrder,
  cancelOrder,
} from "../../../api";
import { getAddress } from "../../../api/addressApi";
import { useApp } from "../../../context/useApp";

import CartView from "./components/CartView/CartView";
import CartSteps from "./components/CartSteps/CartSteps";
import CheckoutForm from "./components/CheckoutForm/CheckoutForm";
import CartSummary from "./components/CartSummary/CartSummary";
import OrdersView from "./components/OrdersView/OrdersView";
import OrderSuccess from "./components/OrderSuccess/OrderSuccess";

import "./cart.scss";

//  Helper: đọc/ghi lịch sử đơn hàng từ localStorage
const ORDERS_KEY = (userId) => `orders_${userId}`;

function getLocalOrders(userId) {
  try {
    const raw = localStorage.getItem(ORDERS_KEY(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalOrder(userId, order) {
  const prev = getLocalOrders(userId);
  localStorage.setItem(ORDERS_KEY(userId), JSON.stringify([order, ...prev]));
}

function generateOrderId() {
  return Date.now() + Math.random();
}

//
// Trang giỏ hàng.
// Giữ toàn bộ state và logic gọi API; giao diện chia cho các component con
// theo từng phần: giỏ hàng, checkout, tổng đơn và danh sách đơn đã đặt.
//
// Phần đang xem nằm trên URL chứ không trong state:
//   /cart             → giỏ hàng
//   /cart/checkout    → thông tin đặt hàng
//   /cart/orders      → đơn hàng của tôi
// Nhờ vậy F5 hay gửi link cho người khác vẫn mở đúng phần, và nút back
// của trình duyệt quay lại đúng bước trước đó.
export default function Cart() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const currentUser = useSelector((state) => state.user.currentUser);
  const { addOrder } = useApp();

  //  Phần đang xem, suy ra từ URL
  const isOrdersTab = pathname === ROUTES.USER.CART_ORDERS;
  const step = pathname === ROUTES.USER.CART_CHECKOUT ? "checkout" : "cart";

  // Màn hình xác nhận chỉ xuất hiện ngay sau khi đặt hàng,
  // nên vẫn giữ tạm trong state chứ không nhét vào URL.
  const [justOrdered, setJustOrdered] = useState(false);

  //  State giỏ hàng
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  console.log(cart);

  //  State đơn hàng
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  // id đơn đang mở rộng chi tiết
  const [expandedOrder, setExpandedOrder] = useState(null);

  //  State địa chỉ từ AddressBook
  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [defaultAddress, setDefaultAddress] = useState(null);

  const dispatch = useDispatch();

  // Kiểm tra profile đã đủ thông tin chưa
  const profileComplete =
    currentUser &&
    currentUser.name?.trim() &&
    currentUser.phone?.trim() &&
    currentUser.address?.trim();

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    provinceCode: "",
    wardCode: "",
    addressLine: "",
    note: "",
  });

  const [formErrors, setFormErrors] = useState({
    fullName: "",
    phone: "",
    provinceCode: "",
    wardCode: "",
    addressLine: "",
  });

  //  Helper cập nhật form
  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  //  Sync profile/AddressBook → form khi chuyển sang checkout
  const [formInitialized, setFormInitialized] = useState(false);

  // Load addresses from AddressBook when entering checkout
  useEffect(() => {
    if (step === "checkout" && currentUser?.id && addresses.length === 0) {
      setAddressLoading(true);
      getAddress()
        .then((data) => {
          const addrList = Array.isArray(data) ? data : [];
          setAddresses(addrList);
          const defaultAddr = addrList.find((a) => a.isDefault);
          if (defaultAddr) {
            setDefaultAddress(defaultAddr);
          }
        })
        .catch((err) => {
          console.error("Lỗi tải sổ địa chỉ:", err);
        })
        .finally(() => {
          setAddressLoading(false);
        });
    }
  }, [step, currentUser]);

  useEffect(() => {
    if (step === "checkout" && !formInitialized && currentUser) {
      // Ưu tiên địa chỉ mặc định từ AddressBook
      const addr = defaultAddress || {};
      setForm({
        fullName: addr.fullName || currentUser.name || "",
        phone: addr.phone || currentUser.phone || "",
        provinceCode: addr.provinceCode || currentUser.provinceCode || "",
        wardCode: addr.wardCode || currentUser.wardCode || "",
        addressLine: addr.addressLine || currentUser.addressLine || "",
        note: "",
      });
      setFormInitialized(true);
    }
  }, [step, currentUser, formInitialized, defaultAddress]);

  useEffect(() => {
    if (step === "cart") setFormInitialized(false);
  }, [step]);

  //  Validate form
  const validateForm = () => {
    const errors = {
      fullName: "",
      phone: "",
      provinceCode: "",
      wardCode: "",
      addressLine: "",
    };
    let valid = true;
    if (!form.fullName.trim()) {
      errors.fullName = "Vui lòng nhập họ và tên.";
      valid = false;
    }

    if (!form.phone.trim()) {
      errors.phone = "Vui lòng nhập số điện thoại.";
      valid = false;
    } else if (form.phone.length !== 10) {
      errors.phone = "Số điện thoại phải đúng 10 số.";
      valid = false;
    }

    if (!form.provinceCode) {
      errors.provinceCode = "Vui lòng chọn tỉnh/thành phố.";
      valid = false;
    }

    if (!form.wardCode) {
      errors.wardCode = "Vui lòng chọn phường/xã.";
      valid = false;
    }

    if (!form.addressLine.trim()) {
      errors.addressLine = "Vui lòng nhập địa chỉ chi tiết.";
      valid = false;
    }

    setFormErrors(errors);
    return valid;
  };

  //  Lấy giỏ hàng từ API
  const getCart = useCallback(async () => {
    if (!currentUser?.id) {
      setCart([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await getCartByUserId(currentUser.id);
      setCart(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Lỗi lấy giỏ hàng:", err);
      setCart([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    getCart();
  }, [getCart]);

  useEffect(() => {
    window.addEventListener("cartUpdated", getCart);
    window.addEventListener("userChanged", getCart);
    return () => {
      window.removeEventListener("cartUpdated", getCart);
      window.removeEventListener("userChanged", getCart);
    };
  }, [getCart]);

  //  Lấy danh sách đơn hàng
  const loadOrders = useCallback(async () => {
    if (!currentUser?.id) {
      setOrders([]);
      return;
    }
    setOrdersLoading(true);
    try {
      // API là nguồn chính (đã có đầy đủ cart, createdAt, status từ DB)
      const res = await getOrdersByUserId(currentUser.id);
      console.log(res);

      if (Array.isArray(res.data)) {
        setOrders(res.data);
        return;
      }
    } catch (err) {
      console.error("Lỗi lấy đơn hàng:", err);
    } finally {
      setOrdersLoading(false);
    }

    // Chỉ fallback sang localStorage khi API lỗi
    setOrders(getLocalOrders(currentUser.id));
  }, [currentUser]);

  // Tải đơn hàng khi mở tab /cart/orders
  useEffect(() => {
    if (isOrdersTab) loadOrders();
  }, [isOrdersTab, loadOrders]);

  //  Tính tổng tiền giỏ
  const cartTotal = cart.reduce(
    (total, item) => total + Number(item.price) * Number(item.qty),
    0,
  );

  //  Xóa sản phẩm khỏi giỏ
  const removeCartItem = async (productId) => {
    try {
      await removeFromCart(currentUser.id, productId);
      setCart((prev) => prev.filter((item) => item.productId !== productId));

      // Báo cho PublicHeader đổi lại số trên icon giỏ hàng
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Lỗi xóa sản phẩm:", err);
      alert("Không thể xóa sản phẩm");
    }
  };

  //  Cập nhật qty
  const updateCartQuantity = async (productId, newQty) => {
    if (newQty <= 0) {
      await removeCartItem(productId);
      return;
    }
    try {
      await updateCartQty({
        userId: currentUser.id,
        productId,
        qty: newQty,
      });
      setCart((prev) =>
        prev.map((item) =>
          item.productId === productId ? { ...item, qty: newQty } : item,
        ),
      );

      // Đổi số lượng cũng phải báo header để icon giỏ hàng chạy theo
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Lỗi cập nhật số lượng:", err);
      alert("Không thể cập nhật số lượng");
    }
  };

  //  Xóa toàn bộ giỏ trên server
  const clearCartOnServer = async () => {
    try {
      await Promise.all(
        cart.map((item) => removeFromCart(currentUser.id, item.productId)),
      );
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Lỗi xóa giỏ hàng sau đặt hàng:", err);
    }
  };

  //  Đặt hàng
  const handleOrder = async () => {
    if (!currentUser) {
      navigate(ROUTES.USER.LOGIN, { state: { from: ROUTES.USER.CART } });
      return;
    }
    if (!validateForm()) return;

    // Construct full address string for API
    const fullAddress = `${form.addressLine}, ${form.wardCode}, ${form.provinceCode}`;

    try {
      const res = await createOrder({
        userId: currentUser.id,
        name: form.fullName,
        phone: form.phone,
        address: fullAddress,
        provinceCode: form.provinceCode,
        wardCode: form.wardCode,
        addressLine: form.addressLine,
        note: form.note,
        cart,
        total: cartTotal,
      });

      // Dùng id từ API nếu có, không thì tạo id tạm
      const orderId =
        res.data?.order?.id ||
        res.data?.id ||
        res.data?.orderId ||
        generateOrderId();

      // Tạo object đơn hàng để lưu
      const newOrder = {
        id: orderId,
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        createdAt: res.data?.order?.created_at || new Date().toISOString(),
        name: form.fullName,
        phone: form.phone,
        provinceCode: form.provinceCode,
        wardCode: form.wardCode,
        addressLine: form.addressLine,
        address: `${form.addressLine}, ${form.wardCode}, ${form.provinceCode}`,
        note: form.note,
        cart: cart.map((item) => ({ ...item })),
        total: cartTotal,
        status: "pending",
      };

      // Lưu vào localStorage cá nhân (lịch sử đơn hàng người dùng)
      saveLocalOrder(currentUser.id, newOrder);

      // Đẩy đơn hàng sang admin qua AppContext (shared localStorage)
      addOrder(newOrder);

      // Xóa toàn bộ giỏ hàng sau khi đặt thành công
      await clearCartOnServer();

      setCart([]);
      setJustOrdered(true);
    } catch (err) {
      console.error("Lỗi đặt hàng:", err.response?.data || err);
      alert(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Đặt hàng thất bại",
      );
    }
  };

  //  Hủy đơn hàng
  const handleCancelOrder = async (orderId) => {
    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn hủy đơn hàng này không?",
    );

    if (!confirmed) return;

    try {
      const res = await cancelOrder(orderId);

      // Cập nhật lại state ngay để giao diện đổi trạng thái thành "Đã hủy"
      const updatedOrder = res.data?.order;

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? updatedOrder || { ...order, status: "cancelled" }
            : order,
        ),
      );

      // Cập nhật luôn localStorage để dữ liệu fallback không bị trạng thái cũ
      if (currentUser?.id) {
        const localOrders = getLocalOrders(currentUser.id);

        const updatedLocalOrders = localOrders.map((order) =>
          order.id === orderId
            ? updatedOrder || { ...order, status: "cancelled" }
            : order,
        );

        localStorage.setItem(
          ORDERS_KEY(currentUser.id),
          JSON.stringify(updatedLocalOrders),
        );
      }

      // Đóng chi tiết đơn sau khi hủy
      setExpandedOrder(null);
    } catch (err) {
      console.error("Lỗi hủy đơn hàng:", err);

      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Không thể hủy đơn hàng.",
      );
    }
  };

  // Sang bước thanh toán: cần đăng nhập trước
  const goCheckout = () => {
    if (!currentUser) {
      navigate(ROUTES.USER.LOGIN, {
        state: { from: ROUTES.USER.CART_CHECKOUT },
      });
      return;
    }
    navigate(ROUTES.USER.CART_CHECKOUT);
  };

  //  Loading
  if (loading) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <LoaderCircle size={48} strokeWidth={1.8} />
          <h2>Đang tải giỏ hàng...</h2>
        </div>
      </div>
    );
  }

  //  Đặt hàng thành công
  if (justOrdered) {
    return (
      <div className="cart-page">
        <OrderSuccess
          form={form}
          onViewOrders={() => {
            setJustOrdered(false);
            navigate(ROUTES.USER.CART_ORDERS);
          }}
        />
      </div>
    );
  }

  //  Giao diện chính
  return (
    <div className="cart-page">
      <div className="cart-inner">
        {/* Breadcrumb — phần cuối đổi theo URL đang mở */}
        <div className="cart-breadcrumb">
          <Link to={ROUTES.USER.HOME}>Trang chủ</Link>
          <span>›</span>
          <span>Giỏ hàng</span>
          {isOrdersTab && (
            <>
              <span>›</span>
              <span>Đơn hàng của tôi</span>
            </>
          )}
          {step === "checkout" && (
            <>
              <span>›</span>
              <span>Thanh toán</span>
            </>
          )}
        </div>

        {/*  TABS: mỗi tab là 1 URL riêng  */}
        <div className="cart-tabs">
          <NavLink
            to={ROUTES.USER.CART}
            end
            className={({ isActive }) =>
              `cart-tab ${isActive ? "cart-tab--active" : ""}`
            }
          >
            <ShoppingCart size={20} strokeWidth={1.8} />
            Giỏ hàng
            {cart.length > 0 && (
              <span className="cart-tab__badge">{cart.length}</span>
            )}
          </NavLink>
          <NavLink
            to={ROUTES.USER.CART_ORDERS}
            className={({ isActive }) =>
              `cart-tab ${isActive ? "cart-tab--active" : ""}`
            }
          >
            <Package size={20} strokeWidth={1.8} /> Đơn hàng của tôi
          </NavLink>
        </div>

        {/* TAB: ĐƠN HÀNG */}
        {isOrdersTab && (
          <div className="orders-panel">
            <OrdersView
              isLoggedIn={!!currentUser}
              loading={ordersLoading}
              orders={orders}
              expandedOrder={expandedOrder}
              onToggle={setExpandedOrder}
              onCancelOrder={handleCancelOrder}
            />
          </div>
        )}

        {/* TAB: GIỎ HÀNG */}
        {!isOrdersTab && (
          <>
            {/* Giỏ hàng trống */}
            {cart.length === 0 ? (
              <div className="cart-empty">
                <ShoppingCart size={48} strokeWidth={1.8} />
                <h2>Giỏ hàng trống</h2>
                <p>Bạn chưa thêm sản phẩm nào vào giỏ.</p>
                <Link
                  to={ROUTES.USER.PRODUCT_LIST}
                  className="cart-btn cart-btn--primary"
                >
                  Khám phá sản phẩm
                </Link>
              </div>
            ) : (
              <>
                {/* Thanh bước nằm ngoài .cart-layout để tràn hết chiều ngang */}
                <CartSteps currentStep={step} />

                <div className="cart-layout">
                  {/*  MAIN  */}
                  <div className="cart-main">
                    {step === "checkout" ? (
                      <CheckoutForm
                        cart={cart}
                        form={form}
                        formErrors={formErrors}
                        profileComplete={profileComplete}
                        onChangeField={updateForm}
                        onBack={() => navigate(ROUTES.USER.CART)}
                      />
                    ) : (
                      <CartView
                        cart={cart}
                        onUpdateQty={updateCartQuantity}
                        onRemoveItem={removeCartItem}
                      />
                    )}
                  </div>

                  {/*  SIDEBAR  */}
                  <CartSummary
                    cart={cart}
                    cartTotal={cartTotal}
                    step={step}
                    isLoggedIn={!!currentUser}
                    onProceedCheckout={goCheckout}
                    onConfirmOrder={handleOrder}
                  />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
