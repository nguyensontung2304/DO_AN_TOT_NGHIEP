import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ROUTES } from "../../../constants/router";

import {
  getCartByUserId,
  getOrdersByUserId,
  updateCartQty,
  removeFromCart,
  createOrder,
} from "../../../api";
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

//  Badge trạng thái đơn hàng
const STATUS_LABEL = {
  pending: { text: "Chờ xác nhận", cls: "order-status--pending" },
  confirmed: { text: "Đã xác nhận", cls: "order-status--confirmed" },
  shipping: { text: "Đang giao hàng", cls: "order-status--shipping" },
  done: { text: "Hoàn thành", cls: "order-status--done" },
  cancelled: { text: "Đã hủy", cls: "order-status--cancelled" },
};

function OrderStatusBadge({ status = "pending" }) {
  const info = STATUS_LABEL[status] || STATUS_LABEL.pending;
  return <span className={`order-status ${info.cls}`}>{info.text}</span>;
}

//
export default function Cart() {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.currentUser);

  //  Tab hiện tại: "cart" | "orders"
  const [activeTab, setActiveTab] = useState("cart");

  //  State giỏ hàng
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState("cart"); // "cart" | "checkout" | "success"

  //  State đơn hàng
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  // id đơn đang mở rộng chi tiết
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Kiểm tra profile đã đủ thông tin chưa
  const profileComplete =
    currentUser &&
    currentUser.name?.trim() &&
    currentUser.phone?.trim() &&
    currentUser.address?.trim();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
  });

  const [formErrors, setFormErrors] = useState({
    name: "",
    phone: "",
    address: "",
  });

  //  Helper cập nhật form
  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  //  Sync profile → form khi chuyển sang checkout
  const [formInitialized, setFormInitialized] = useState(false);

  useEffect(() => {
    if (step === "checkout" && !formInitialized && currentUser) {
      setForm({
        name: currentUser.name || "",
        phone: currentUser.phone || "",
        address: currentUser.address || "",
        note: "",
      });
      setFormInitialized(true);
    }
  }, [step, currentUser, formInitialized]);

  useEffect(() => {
    if (step === "cart") setFormInitialized(false);
  }, [step]);

  //  Validate form
  const validateForm = () => {
    const errors = { name: "", phone: "", address: "" };
    let valid = true;
    if (!form.name.trim()) {
      errors.name = "Vui lòng nhập họ và tên.";
      valid = false;
    }
    if (!form.phone.trim()) {
      errors.phone = "Vui lòng nhập số điện thoại.";
      valid = false;
    }
    if (!form.address.trim()) {
      errors.address = "Vui lòng nhập địa chỉ nhận hàng.";
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
      // Thử lấy từ API trước
      const res = await getOrdersByUserId(currentUser.id);
      const apiOrders = Array.isArray(res.data) ? res.data : [];
      if (apiOrders.length > 0) {
        setOrders(apiOrders);
      } else {
        // Fallback: lấy từ localStorage
        setOrders(getLocalOrders(currentUser.id));
      }
    } catch {
      // API không hỗ trợ GET orders → dùng localStorage
      setOrders(getLocalOrders(currentUser.id));
    } finally {
      setOrdersLoading(false);
    }
  }, [currentUser]);

  // Tải đơn hàng khi chuyển sang tab đơn hàng
  useEffect(() => {
    if (activeTab === "orders") loadOrders();
  }, [activeTab, loadOrders]);

  //  Tính tổng tiền giỏ
  const cartTotal = cart.reduce(
    (total, item) => total + Number(item.price) * Number(item.qty),
    0,
  );

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
    } catch (err) {
      console.error("Lỗi cập nhật số lượng:", err);
      alert("Không thể cập nhật số lượng");
    }
  };

  //  Xóa sản phẩm khỏi giỏ
  const removeCartItem = async (productId) => {
    try {
      await removeFromCart(currentUser.id, productId);
      setCart((prev) => prev.filter((item) => item.productId !== productId));
    } catch (err) {
      console.error("Lỗi xóa sản phẩm:", err);
      alert("Không thể xóa sản phẩm");
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
      navigate(ROUTES.USER.LOGIN_USER, { state: { from: ROUTES.USER.CART } });
      return;
    }
    if (!validateForm()) return;

    try {
      const res = await createOrder({
        userId: currentUser.id,
        name: form.name,
        phone: form.phone,
        address: form.address,
        note: form.note,
        cart,
        total: cartTotal,
      });

      // Tạo object đơn hàng để lưu localStorage
      const newOrder = {
        // Dùng id từ API nếu có, không thì tạo id tạm
        id: res.data?.id || res.data?.orderId || Date.now(),
        createdAt: new Date().toISOString(),
        name: form.name,
        phone: form.phone,
        address: form.address,
        note: form.note,
        cart: cart.map((item) => ({ ...item })),
        total: cartTotal,
        status: "pending",
      };

      // Lưu vào localStorage
      saveLocalOrder(currentUser.id, newOrder);

      // Xóa toàn bộ giỏ hàng sau khi đặt thành công
      await clearCartOnServer();

      setCart([]);
      setStep("success");
    } catch (err) {
      console.error("Lỗi đặt hàng:", err.response?.data || err);
      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Đặt hàng thất bại",
      );
    }
  };

  //  Loading
  if (loading) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <span>⏳</span>
          <h2>Đang tải giỏ hàng...</h2>
        </div>
      </div>
    );
  }

  //  Đặt hàng thành công
  if (step === "success") {
    return (
      <div className="cart-page">
        <div className="cart-success">
          <div className="cart-success__icon">🎉</div>
          <h2>Đặt hàng thành công!</h2>
          <p>
            Cảm ơn <strong>{form.name}</strong>! Đơn hàng đã được ghi nhận.
          </p>
          <p className="cart-success__sub">
            Chúng tôi sẽ liên hệ qua <strong>{form.phone}</strong> để xác nhận.
          </p>
          <div className="cart-success__btns">
            <button
              className="cart-btn cart-btn--primary"
              onClick={() => {
                setStep("cart");
                setActiveTab("orders");
              }}
            >
              📦 Xem đơn hàng của tôi
            </button>
            <Link
              to={ROUTES.USER.PRODUCT_LIST}
              className="cart-btn cart-btn--outline"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  //  Giao diện chính
  return (
    <div className="cart-page">
      <div className="cart-inner">
        {/* Breadcrumb */}
        <div className="cart-breadcrumb">
          <Link to={ROUTES.USER.HOME}>Trang chủ</Link>
          <span>›</span>
          <span>Giỏ hàng</span>
          {activeTab === "orders" && (
            <>
              <span>›</span>
              <span>Đơn hàng của tôi</span>
            </>
          )}
          {activeTab === "cart" && step === "checkout" && (
            <>
              <span>›</span>
              <span>Thanh toán</span>
            </>
          )}
        </div>

        {/*  TABS: Giỏ hàng / Đơn hàng  */}
        <div className="cart-tabs">
          <button
            className={`cart-tab ${activeTab === "cart" ? "cart-tab--active" : ""}`}
            onClick={() => {
              setActiveTab("cart");
              setStep("cart");
            }}
          >
            🛒 Giỏ hàng
            {cart.length > 0 && (
              <span className="cart-tab__badge">{cart.length}</span>
            )}
          </button>
          <button
            className={`cart-tab ${activeTab === "orders" ? "cart-tab--active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            📦 Đơn hàng của tôi
          </button>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            TAB: ĐƠN HÀNG
        ════════════════════════════════════════════════════════════════ */}
        {activeTab === "orders" && (
          <div className="orders-panel">
            {!currentUser ? (
              <div className="cart-empty">
                <span>🔒</span>
                <h2>Chưa đăng nhập</h2>
                <p>Bạn cần đăng nhập để xem đơn hàng.</p>
                <Link
                  to={ROUTES.USER.LOGIN_USER}
                  className="cart-btn cart-btn--primary"
                >
                  Đăng nhập
                </Link>
              </div>
            ) : ordersLoading ? (
              <div className="cart-empty">
                <span>⏳</span>
                <h2>Đang tải đơn hàng...</h2>
              </div>
            ) : orders.length === 0 ? (
              <div className="cart-empty">
                <span>📭</span>
                <h2>Chưa có đơn hàng nào</h2>
                <p>Hãy mua sắm và đặt hàng để xem lịch sử tại đây.</p>
                <Link
                  to={ROUTES.USER.PRODUCT_LIST}
                  className="cart-btn cart-btn--primary"
                >
                  Khám phá sản phẩm
                </Link>
              </div>
            ) : (
              <div className="orders-list">
                <div className="orders-list__header">
                  <h2>Đơn hàng của tôi</h2>
                  <span className="orders-list__count">
                    {orders.length} đơn
                  </span>
                </div>

                {orders.map((order, idx) => {
                  const orderId = order.id || idx + 1;
                  const isExpanded = expandedOrder === orderId;
                  const orderItems = order.cart || order.items || [];
                  const orderTotal =
                    order.total ||
                    orderItems.reduce(
                      (s, i) => s + Number(i.price) * Number(i.qty),
                      0,
                    );
                  const createdDate = order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—";

                  return (
                    <div key={orderId} className="order-card">
                      {/* Header đơn hàng */}
                      <div
                        className="order-card__head"
                        onClick={() =>
                          setExpandedOrder(isExpanded ? null : orderId)
                        }
                        role="button"
                        aria-expanded={isExpanded}
                      >
                        <div className="order-card__meta">
                          <span className="order-card__id">
                            Đơn #{String(orderId).slice(-6).toUpperCase()}
                          </span>
                          <span className="order-card__date">
                            {createdDate}
                          </span>
                        </div>

                        <div className="order-card__right">
                          <OrderStatusBadge status={order.status} />
                          <span className="order-card__total">
                            {Number(orderTotal).toLocaleString("vi-VN")}₫
                          </span>
                          <span className="order-card__toggle">
                            {isExpanded ? "▲" : "▼"}
                          </span>
                        </div>
                      </div>

                      {/* Chi tiết đơn hàng (collapsible) */}
                      {isExpanded && (
                        <div className="order-card__body">
                          {/* Thông tin giao hàng */}
                          <div className="order-card__info">
                            <div className="order-card__info-row">
                              <span>👤 Người nhận</span>
                              <strong>{order.name}</strong>
                            </div>
                            <div className="order-card__info-row">
                              <span>📞 Điện thoại</span>
                              <strong>{order.phone}</strong>
                            </div>
                            <div className="order-card__info-row">
                              <span>📍 Địa chỉ</span>
                              <strong>{order.address}</strong>
                            </div>
                            {order.note && (
                              <div className="order-card__info-row">
                                <span>📝 Ghi chú</span>
                                <strong>{order.note}</strong>
                              </div>
                            )}
                          </div>

                          {/* Danh sách sản phẩm */}
                          <div className="order-card__items">
                            <p className="order-card__items-title">
                              Sản phẩm đã đặt ({orderItems.length})
                            </p>
                            {orderItems.map((item, i) => (
                              <div key={i} className="order-card__item">
                                <span className="order-card__item-emoji">
                                  {item.emoji}
                                </span>
                                <span className="order-card__item-name">
                                  {item.name}
                                </span>
                                <span className="order-card__item-qty">
                                  × {item.qty}
                                </span>
                                <span className="order-card__item-price">
                                  {(
                                    Number(item.price) * Number(item.qty)
                                  ).toLocaleString("vi-VN")}
                                  ₫
                                </span>
                                <button>Hủy đơn hàng</button>
                              </div>
                            ))}
                          </div>

                          {/* Tổng đơn */}
                          <div className="order-card__footer">
                            <span>Tổng cộng</span>
                            <strong>
                              {Number(orderTotal).toLocaleString("vi-VN")}₫
                            </strong>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB: GIỎ HÀNG
        ════════════════════════════════════════════════════════════════ */}
        {activeTab === "cart" && (
          <>
            {/* Giỏ hàng trống */}
            {cart.length === 0 ? (
              <div className="cart-empty">
                <span>🛒</span>
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
                {/* Thanh tiến trình 3 bước */}
                <div className="cart-steps">
                  <div
                    className={`cart-steps__item ${step === "cart" ? "active" : "done"}`}
                  >
                    <span>1</span>
                    Giỏ hàng
                  </div>
                  <div className="cart-steps__line" />
                  <div
                    className={`cart-steps__item ${step === "checkout" ? "active" : ""}`}
                  >
                    <span>2</span>
                    Thông tin đặt hàng
                  </div>
                  <div className="cart-steps__line" />
                  <div
                    className={`cart-steps__item ${step === "success" ? "active" : ""}`}
                  >
                    <span>3</span>
                    Xác nhận
                  </div>
                </div>

                <div className="cart-layout">
                  {/*  MAIN  */}
                  <div className="cart-main">
                    {/* BƯỚC 1: Xem giỏ hàng */}
                    {step === "cart" && (
                      <>
                        <h2 className="cart-section-title">
                          🛒 Giỏ hàng của bạn
                          <span className="cart-count">
                            ({cart.length} sản phẩm)
                          </span>
                        </h2>

                        <div className="cart-items">
                          {cart.map((item) => (
                            <div key={item.productId} className="cart-item">
                              <div className="cart-item__img">{item.emoji}</div>

                              <div className="cart-item__info">
                                <h3>{item.name}</h3>
                                <p className="cart-item__price">
                                  {Number(item.price).toLocaleString("vi-VN")}₫
                                </p>
                                {item.recipe && item.recipe.length > 0 && (
                                  <details className="cart-item__recipe">
                                    <summary>
                                      Nguyên vật liệu cần ({item.recipe.length}{" "}
                                      loại)
                                    </summary>
                                    <ul>
                                      {item.recipe.map((r, i) => (
                                        <li key={i}>
                                          {r.materialName}:{" "}
                                          <strong>
                                            {r.qty * item.qty} {r.unit}
                                          </strong>
                                        </li>
                                      ))}
                                    </ul>
                                  </details>
                                )}
                              </div>

                              <div className="cart-item__actions">
                                <div className="cart-qty">
                                  <button
                                    onClick={() =>
                                      updateCartQuantity(
                                        item.productId,
                                        item.qty - 1,
                                      )
                                    }
                                  >
                                    −
                                  </button>
                                  <span>{item.qty}</span>
                                  <button
                                    onClick={() =>
                                      updateCartQuantity(
                                        item.productId,
                                        item.qty + 1,
                                      )
                                    }
                                  >
                                    +
                                  </button>
                                </div>
                                <p className="cart-item__subtotal">
                                  {(
                                    Number(item.price) * Number(item.qty)
                                  ).toLocaleString("vi-VN")}
                                  ₫
                                </p>
                                <button
                                  className="cart-item__remove"
                                  onClick={() => removeCartItem(item.productId)}
                                  aria-label="Xóa sản phẩm"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <Link
                          to={ROUTES.USER.PRODUCT_LIST}
                          className="cart-continue"
                        >
                          ← Tiếp tục mua sắm
                        </Link>
                      </>
                    )}

                    {/* BƯỚC 2: Thông tin đặt hàng */}
                    {step === "checkout" && (
                      <>
                        <h2 className="cart-section-title">
                          📋 Thông tin đặt hàng
                        </h2>

                        {profileComplete ? (
                          <div className="checkout-profile-banner checkout-profile-banner--filled">
                            <span>✅</span>
                            <span>
                              Thông tin từ hồ sơ của bạn đã được điền sẵn. Bạn
                              có thể chỉnh sửa nếu cần.
                            </span>
                          </div>
                        ) : (
                          <div className="checkout-profile-banner checkout-profile-banner--empty">
                            <span>⚠️</span>
                            <span>
                              Bạn chưa cập nhật hồ sơ. Vui lòng điền đầy đủ
                              thông tin bên dưới để đặt hàng.{" "}
                              <Link
                                to={ROUTES.USER.PROFILE}
                                className="checkout-profile-link"
                              >
                                Cập nhật hồ sơ ngay
                              </Link>
                            </span>
                          </div>
                        )}

                        <div className="checkout-form">
                          <div className="checkout-form__row">
                            <div className="checkout-form__group">
                              <label>
                                Họ và tên <span className="req">*</span>
                              </label>
                              <input
                                type="text"
                                value={form.name}
                                onChange={(e) =>
                                  updateForm("name", e.target.value)
                                }
                                placeholder="Nguyễn Văn A"
                                className={formErrors.name ? "input-error" : ""}
                              />
                              {formErrors.name && (
                                <p className="field-error">{formErrors.name}</p>
                              )}
                            </div>
                            <div className="checkout-form__group">
                              <label>
                                Số điện thoại <span className="req">*</span>
                              </label>
                              <input
                                type="tel"
                                value={form.phone}
                                onChange={(e) =>
                                  updateForm("phone", e.target.value)
                                }
                                placeholder="Nhập số điện thoại"
                                className={
                                  formErrors.phone ? "input-error" : ""
                                }
                              />
                              {formErrors.phone && (
                                <p className="field-error">
                                  {formErrors.phone}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="checkout-form__group">
                            <label>
                              Địa chỉ nhận hàng <span className="req">*</span>
                            </label>
                            <textarea
                              rows={3}
                              value={form.address}
                              onChange={(e) =>
                                updateForm("address", e.target.value)
                              }
                              placeholder="Nhập địa chỉ nhận hàng"
                              className={
                                formErrors.address ? "input-error" : ""
                              }
                            />
                            {formErrors.address && (
                              <p className="field-error">
                                {formErrors.address}
                              </p>
                            )}
                          </div>

                          <div className="checkout-form__group">
                            <label>Ghi chú (không bắt buộc)</label>
                            <textarea
                              rows={3}
                              value={form.note}
                              onChange={(e) =>
                                updateForm("note", e.target.value)
                              }
                              placeholder="Yêu cầu đặc biệt, thời gian giao hàng..."
                            />
                          </div>

                          <div className="checkout-order-summary">
                            <h3>Tóm tắt đơn hàng</h3>
                            {cart.map((item) => (
                              <div
                                key={item.productId}
                                className="checkout-order-row"
                              >
                                <span>
                                  {item.emoji} {item.name} × {item.qty}
                                </span>
                                <span>
                                  {(
                                    Number(item.price) * Number(item.qty)
                                  ).toLocaleString("vi-VN")}
                                  ₫
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <button
                          className="cart-btn-back"
                          onClick={() => setStep("cart")}
                        >
                          ← Quay lại giỏ hàng
                        </button>
                      </>
                    )}
                  </div>

                  {/*  SIDEBAR  */}
                  <aside className="cart-sidebar">
                    <div className="cart-summary">
                      <h3>Tổng đơn hàng</h3>

                      <div className="cart-summary__rows">
                        {cart.map((item) => (
                          <div
                            key={item.productId}
                            className="cart-summary__row"
                          >
                            <span>
                              {item.emoji} {item.name} × {item.qty}
                            </span>
                            <span>
                              {(
                                Number(item.price) * Number(item.qty)
                              ).toLocaleString("vi-VN")}
                              ₫
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="cart-summary__divider" />

                      <div className="cart-summary__total">
                        <span>Tổng cộng</span>
                        <strong>{cartTotal.toLocaleString("vi-VN")}₫</strong>
                      </div>

                      <div className="cart-summary__note">
                        🚚 Miễn phí giao hàng &amp; lắp đặt trong 50km
                        <br />
                        🛡️ Bảo hành 5 năm chính hãng
                      </div>

                      {step === "cart" && (
                        <button
                          className="cart-btn cart-btn--primary cart-btn--full"
                          onClick={() => {
                            if (!currentUser) {
                              navigate(ROUTES.USER.LOGIN_USER, {
                                state: { from: ROUTES.USER.CART },
                              });
                              return;
                            }
                            setStep("checkout");
                          }}
                        >
                          {currentUser
                            ? "Tiến hành đặt hàng →"
                            : "🔒 Đăng nhập để đặt hàng"}
                        </button>
                      )}

                      {step === "checkout" && (
                        <button
                          className="cart-btn cart-btn--primary cart-btn--full"
                          onClick={handleOrder}
                        >
                          ✅ Xác nhận đặt hàng
                        </button>
                      )}
                    </div>
                  </aside>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
