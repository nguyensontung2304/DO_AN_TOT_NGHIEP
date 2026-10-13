import { Package, ShoppingCart, LoaderCircle } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ROUTES } from "../../../constants/router";

import {
  getCartByUserId,
  getOrdersByUserId,
  updateCartQty,
  removeFromCart,
  createOrder,
  cancelOrder,
} from "../../../api";

import { useApp } from "../../../context/useApp";

import CartView from "./components/CartView/CartView";
import CartSteps from "./components/CartSteps/CartSteps";
import CheckoutForm from "./components/CheckoutForm/CheckoutForm";
import CartSummary from "./components/CartSummary/CartSummary";
import OrdersView from "./components/OrdersView/OrdersView";
import OrderSuccess from "./components/OrderSuccess/OrderSuccess";

import "./cart.scss";

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

// Chuẩn hóa địa chỉ từ database hoặc Redux.
function normalizeAddress(address = {}) {
  return {
    ...address,
    name: address.name ?? address.full_name ?? "",
    phone: address.phone ?? "",
    provinceCode: String(address.province_code ?? address.provinceCode ?? ""),
    provinceName: address.province_name ?? address.provinceName ?? "",
    wardCode: String(address.ward_code ?? address.wardCode ?? ""),
    wardName: address.ward_name ?? address.wardName ?? "",
    addressLine: address.address_line ?? address.addressLine ?? "",
    isDefault: address.is_default === true || address.isDefault === true,
  };
}

const EMPTY_ERRORS = {
  name: "",
  phone: "",
  provinceCode: "",
  wardCode: "",
  addressLine: "",
};

export default function Cart() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const currentUser = useSelector((state) => state.user.currentUser);

  const { addOrder, pushGlobalNotify } = useApp();

  const isOrdersTab = pathname === ROUTES.USER.CART_ORDERS;

  const step = pathname === ROUTES.USER.CART_CHECKOUT ? "checkout" : "cart";

  const [justOrdered, setJustOrdered] = useState(false);

  // GIỎ HÀNG
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // ĐƠN HÀNG
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);

  // ĐỊA CHỈ NGƯỜI DÙNG
  // currentUser.address là địa chỉ mặc định.
  const profileAddress = currentUser?.address
    ? normalizeAddress(currentUser.address)
    : null;

  // Danh sách địa chỉ đã lưu.
  const addresses = Array.isArray(currentUser?.addresses)
    ? currentUser.addresses.map(normalizeAddress)
    : [];

  const profileComplete = Boolean(
    profileAddress?.name?.trim() &&
    profileAddress?.phone?.trim() &&
    profileAddress?.provinceCode &&
    profileAddress?.wardCode &&
    profileAddress?.addressLine?.trim(),
  );
  // FORM THANH TOÁN
  const [form, setForm] = useState({
    name: "",
    phone: "",
    provinceCode: "",
    provinceName: "",
    wardCode: "",
    wardName: "",
    addressLine: "",
    note: "",
  });

  const [formErrors, setFormErrors] = useState(EMPTY_ERRORS);

  const [formInitialized, setFormInitialized] = useState(false);

  // Hỗ trợ cả hai cách gọi:
  // updateForm("name", "Nguyễn Văn A")
  // updateForm(event)
  const updateForm = useCallback((fieldOrEvent, value) => {
    let field;
    let nextValue;

    if (
      fieldOrEvent &&
      typeof fieldOrEvent === "object" &&
      fieldOrEvent.target
    ) {
      field = fieldOrEvent.target.name;
      nextValue = fieldOrEvent.target.value;
    } else {
      field = fieldOrEvent;
      nextValue = value;
    }

    if (!field) return;

    setForm((prev) => {
      const next = {
        ...prev,
        [field]: nextValue,
      };

      // Đổi tỉnh/thành thì xóa phường/xã cũ.
      if (field === "provinceCode") {
        next.wardCode = "";
        next.wardName = "";
        next.provinceName = "";
      }

      // Không giữ tên địa phương cũ khi đổi mã.
      if (field === "wardCode") {
        next.wardName = "";
      }

      return next;
    });

    setFormErrors((prev) => ({
      ...prev,
      [field]: "",
      ...(field === "provinceCode" ? { wardCode: "" } : {}),
    }));
  }, []);

  // Điền dữ liệu địa chỉ mặc định vào form.
  useEffect(() => {
    if (step !== "checkout" || formInitialized || !currentUser) {
      return;
    }

    const address = normalizeAddress(currentUser.address || {});

    setForm({
      name: address.name || currentUser.name || "",
      phone: address.phone || currentUser.phone || "",
      provinceCode: address.provinceCode,
      provinceName: address.provinceName,
      wardCode: address.wardCode,
      wardName: address.wardName,
      addressLine: address.addressLine,
      note: "",
    });

    setFormErrors({ ...EMPTY_ERRORS });
    setFormInitialized(true);
  }, [step, currentUser, formInitialized]);

  // Khi quay lại giỏ hàng, cho phép khởi tạo form ở lần checkout sau.
  useEffect(() => {
    if (step === "cart") {
      setFormInitialized(false);
    }
  }, [step]);

  // KIỂM TRA FORM
  const validateForm = useCallback(() => {
    const errors = { ...EMPTY_ERRORS };

    const name = String(form.name ?? "").trim();
    const phone = String(form.phone ?? "").trim();
    const provinceCode = String(form.provinceCode ?? "").trim();
    const wardCode = String(form.wardCode ?? "").trim();
    const addressLine = String(form.addressLine ?? "").trim();

    if (!name) {
      errors.name = "Vui lòng nhập họ và tên.";
    }

    if (!phone) {
      errors.phone = "Vui lòng nhập số điện thoại.";
    } else if (!/^0\d{9}$/.test(phone)) {
      errors.phone = "Số điện thoại phải gồm 10 số và bắt đầu bằng 0.";
    }

    if (!provinceCode) {
      errors.provinceCode = "Vui lòng chọn tỉnh/thành phố.";
    }

    if (!wardCode) {
      errors.wardCode = "Vui lòng chọn phường/xã.";
    }

    if (!addressLine) {
      errors.addressLine = "Vui lòng nhập địa chỉ chi tiết.";
    }

    setFormErrors(errors);

    return !Object.values(errors).some(Boolean);
  }, [form]);

  // TẢI GIỎ HÀNG
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
    } catch (error) {
      console.error("Lỗi lấy giỏ hàng:", error);
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

  // TẢI LỊCH SỬ ĐƠN HÀNG
  const loadOrders = useCallback(
    async (showLoading = true) => {
      if (!currentUser?.id) {
        setOrders([]);
        setOrdersLoading(false);
        return;
      }

      if (showLoading) setOrdersLoading(true);

      try {
        const res = await getOrdersByUserId(currentUser.id);

        if (Array.isArray(res.data)) {
          setOrders(res.data);
        } else {
          setOrders(getLocalOrders(currentUser.id));
        }
      } catch (error) {
        console.error("Lỗi lấy đơn hàng:", error);
        setOrders(getLocalOrders(currentUser.id));
      } finally {
        if (showLoading) setOrdersLoading(false);
      }
    },
    [currentUser],
  );

  useEffect(() => {
    if (!isOrdersTab) return;

    loadOrders();

    const refreshId = window.setInterval(() => loadOrders(false), 5000);

    return () => window.clearInterval(refreshId);
  }, [isOrdersTab, loadOrders]);

  // TỔNG TIỀN
  const cartTotal = cart.reduce(
    (total, item) => total + Number(item.price) * Number(item.qty),
    0,
  );

  // CẬP NHẬT GIỎ HÀNG
  const removeCartItem = async (productId) => {
    if (!currentUser?.id) return;

    try {
      await removeFromCart(currentUser.id, productId);

      setCart((prev) => prev.filter((item) => item.productId !== productId));

      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Lỗi xóa sản phẩm:", error);
      alert("Không thể xóa sản phẩm.");
    }
  };

  const updateCartQuantity = async (productId, newQty) => {
    if (newQty <= 0) {
      await removeCartItem(productId);
      return;
    }

    if (!currentUser?.id) return;

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

      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Lỗi cập nhật số lượng:", error);
      alert("Không thể cập nhật số lượng.");
    }
  };

  const clearCartOnServer = async () => {
    if (!currentUser?.id) return;

    try {
      await Promise.all(
        cart.map((item) => removeFromCart(currentUser.id, item.productId)),
      );

      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Lỗi xóa giỏ hàng sau đặt hàng:", error);
    }
  };
  // ĐẶT HÀNG
  const handleOrder = async () => {
    if (!currentUser) {
      navigate(ROUTES.USER.LOGIN, {
        state: { from: ROUTES.USER.CART },
      });
      return;
    }

    if (cart.length === 0) {
      alert("Giỏ hàng của bạn đang trống.");
      return;
    }

    // Không gọi API nếu form không hợp lệ.
    if (!validateForm()) {
      return;
    }

    const name = String(form.name).trim();
    const phone = String(form.phone).trim();
    const addressLine = String(form.addressLine).trim();

    // Lấy tên địa phương nếu mã được chọn trùng địa chỉ đã lưu.
    const matchingSavedAddress = addresses.find(
      (item) =>
        item.provinceCode === String(form.provinceCode) &&
        item.wardCode === String(form.wardCode),
    );

    const provinceName =
      form.provinceName ||
      matchingSavedAddress?.provinceName ||
      (profileAddress?.provinceCode === String(form.provinceCode)
        ? profileAddress.provinceName
        : "");

    const wardName =
      form.wardName ||
      matchingSavedAddress?.wardName ||
      (profileAddress?.wardCode === String(form.wardCode)
        ? profileAddress.wardName
        : "");

    const fullAddress = [addressLine, wardName, provinceName]
      .filter(Boolean)
      .join(", ");

    try {
      const res = await createOrder({
        userId: currentUser.id,
        name,
        phone,
        address: fullAddress,
        provinceCode: String(form.provinceCode),
        wardCode: String(form.wardCode),
        addressLine,
        note: form.note || "",
        cart,
        total: cartTotal,
      });

      const orderId =
        res.data?.order?.id ||
        res.data?.id ||
        res.data?.orderId ||
        generateOrderId();

      const newOrder = {
        id: orderId,
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        createdAt: res.data?.order?.created_at || new Date().toISOString(),
        name,
        phone,
        provinceCode: String(form.provinceCode),
        provinceName,
        wardCode: String(form.wardCode),
        wardName,
        addressLine,
        address: fullAddress,
        note: form.note || "",
        cart: cart.map((item) => ({ ...item })),
        total: cartTotal,
        status: "pending",
      };

      saveLocalOrder(currentUser.id, newOrder);
      addOrder(newOrder);

      pushGlobalNotify?.("order_created", {
        orderId,
        name,
      });

      await clearCartOnServer();

      setCart([]);
      setJustOrdered(true);
    } catch (error) {
      console.error("Lỗi đặt hàng:", error.response?.data || error);

      alert(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Đặt hàng thất bại.",
      );
    }
  };

  // HỦY ĐƠN HÀNG
  const handleCancelOrder = async (orderId) => {
    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn hủy đơn hàng này không?",
    );

    if (!confirmed) return;

    try {
      const res = await cancelOrder(orderId);
      const updatedOrder = res.data?.order;

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? updatedOrder || {
                ...order,
                status: "cancelled",
              }
            : order,
        ),
      );

      if (currentUser?.id) {
        const localOrders = getLocalOrders(currentUser.id);

        const updatedLocalOrders = localOrders.map((order) =>
          order.id === orderId
            ? updatedOrder || {
                ...order,
                status: "cancelled",
              }
            : order,
        );

        localStorage.setItem(
          ORDERS_KEY(currentUser.id),
          JSON.stringify(updatedLocalOrders),
        );
      }

      setExpandedOrder(null);
    } catch (error) {
      console.error("Lỗi hủy đơn hàng:", error);

      alert(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Không thể hủy đơn hàng.",
      );
    }
  };

  // ĐI ĐẾN CHECKOUT
  const goCheckout = () => {
    if (!currentUser) {
      navigate(ROUTES.USER.LOGIN, {
        state: { from: ROUTES.USER.CART_CHECKOUT },
      });
      return;
    }

    navigate(ROUTES.USER.CART_CHECKOUT);
  };

  // GIAO DIỆN
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

  return (
    <div className="cart-page">
      <div className="cart-inner">
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
            <Package size={20} strokeWidth={1.8} />
            Đơn hàng của tôi
          </NavLink>
        </div>

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

        {!isOrdersTab && (
          <>
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
                <CartSteps currentStep={step} />

                <div className="cart-layout">
                  <div className="cart-main">
                    {step === "checkout" ? (
                      !formInitialized ? (
                        <div className="cart-empty">
                          <LoaderCircle size={36} />
                          <p>Đang tải địa chỉ giao hàng...</p>
                        </div>
                      ) : (
                        <CheckoutForm
                          cart={cart}
                          form={form}
                          formErrors={formErrors}
                          address={addresses}
                          profileComplete={profileComplete}
                          onChangeField={updateForm}
                          onBack={() => navigate(ROUTES.USER.CART)}
                        />
                      )
                    ) : (
                      <CartView
                        cart={cart}
                        onUpdateQty={updateCartQuantity}
                        onRemoveItem={removeCartItem}
                      />
                    )}
                  </div>

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
