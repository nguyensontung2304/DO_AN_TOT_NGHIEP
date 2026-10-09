import {
  LockKeyhole,
  LoaderCircle,
  Inbox,
  UserRound,
  Phone,
  MapPin,
  FileText,
  ChevronUp,
  ChevronDown,
  Package,
} from "lucide-react";

import { Link } from "react-router-dom";
import { ROUTES } from "../../../../../constants/router";

import "./ordersView.scss";

// Nhãn + màu của từng trạng thái đơn hàng
const STATUS_LABEL = {
  pending: { text: "Chờ xác nhận", cls: "order-status--pending" },
  confirmed: { text: "Đã xác nhận", cls: "order-status--confirmed" },
  processing: { text: "Đang sản xuất", cls: "order-status--confirmed" },
  shipping: { text: "Đang giao hàng", cls: "order-status--shipping" },
  done: { text: "Hoàn thành", cls: "order-status--done" },
  cancelled: { text: "Đã hủy", cls: "order-status--cancelled" },
};

function StatusBadge({ status = "pending" }) {
  const info = STATUS_LABEL[status] || STATUS_LABEL.pending;
  return <span className={`order-status ${info.cls}`}>{info.text}</span>;
}

// Lấy danh sách sản phẩm của đơn: API trả `cart`, localStorage cũ dùng `items`.
const getOrderItems = (order) => order.cart || [];

const getOrderTotal = (order, items) =>
  order.total ||
  items.reduce((sum, i) => sum + Number(i.price) * Number(i.qty), 0);

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

// TAB ĐƠN HÀNG: danh sách đơn, bấm vào để mở rộng chi tiết.
export default function OrdersView({
  isLoggedIn,
  loading,
  orders,
  expandedOrder,
  onToggle,
  onCancelOrder,
}) {
  if (!isLoggedIn) {
    return (
      <div className="cart-empty">
        <LockKeyhole className="cart-empty__icon" size={48} strokeWidth={1.8} />
        <h2>Chưa đăng nhập</h2>
        <p>Bạn cần đăng nhập để xem đơn hàng.</p>
        <Link to={ROUTES.USER.LOGIN} className="cart-btn cart-btn--primary">
          Đăng nhập
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="cart-empty">
        <LoaderCircle
          className="cart-empty__icon cart-empty__icon--loading"
          size={48}
          strokeWidth={1.8}
        />

        <h2>Đang tải đơn hàng...</h2>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="cart-empty">
        <Inbox className="cart-empty__icon" size={48} strokeWidth={1.8} />
        <h2>Chưa có đơn hàng nào</h2>
        <p>Hãy mua sắm và đặt hàng để xem lịch sử tại đây.</p>
        <Link
          to={ROUTES.USER.PRODUCT_LIST}
          className="cart-btn cart-btn--primary"
        >
          Khám phá sản phẩm
        </Link>
      </div>
    );
  }

  return (
    <div className="orders-list">
      <div className="orders-list__header">
        <div className="orders-list__header-title">
          <Package size={20} strokeWidth={1.8} />
          Đơn hàng của tôi
        </div>
        <span className="orders-list__count">{orders.length} đơn</span>
      </div>

      {orders.map((order, idx) => {
        const orderId = order.id || idx + 1;
        const isExpanded = expandedOrder === orderId;
        const items = getOrderItems(order);
        const total = getOrderTotal(order, items);
        console.log(items);

        return (
          <div key={orderId} className="order-card">
            <div
              className="order-card__head"
              onClick={() => onToggle(isExpanded ? null : orderId)}
              role="button"
              aria-expanded={isExpanded}
            >
              <div className="order-card__meta">
                <span className="order-card__id">
                  Đơn #{String(orderId).slice(-6).toUpperCase()}
                </span>
                <span className="order-card__date">
                  {formatDate(order.createdAt)}
                </span>
              </div>

              <div className="order-card__right">
                <StatusBadge status={order.status} />
                <span className="order-card__total">
                  {Number(total).toLocaleString("vi-VN")}₫
                </span>
                <span className="order-card__toggle">
                  {isExpanded ? (
                    <ChevronUp size={18} strokeWidth={2} />
                  ) : (
                    <ChevronDown size={18} strokeWidth={2} />
                  )}
                </span>
              </div>
            </div>

            {isExpanded && (
              <div className="order-card__body">
                <div className="order-card__info">
                  <div className="order-card__info-row">
                    <span>
                      <UserRound size={15} strokeWidth={1.8} /> Người nhận
                    </span>
                    <strong>{order.name}</strong>
                  </div>
                  <div className="order-card__info-row">
                    <span>
                      <Phone size={15} strokeWidth={1.8} /> Điện thoại
                    </span>
                    <strong>{order.phone}</strong>
                  </div>
                  <div className="order-card__info-row">
                    <span>
                      <MapPin size={15} strokeWidth={1.8} />
                      Địa chỉ
                    </span>
                    <strong>{order.address}</strong>
                  </div>
                  {order.note && (
                    <div className="order-card__info-row">
                      <span>
                        <FileText size={15} strokeWidth={1.8} /> Ghi chú
                      </span>
                      <strong>{order.note}</strong>
                    </div>
                  )}
                </div>

                <div className="order-card__items">
                  <p className="order-card__items-title">
                    Sản phẩm đã đặt ({items.length})
                  </p>

                  {items.map((item, i) => (
                    <div key={i} className="order-card__item">
                      <div className="order-card__item-image">
                        <img src={item.image} alt={item.name} />
                      </div>

                      <span className="order-card__item-name">{item.name}</span>

                      <span className="order-card__item-qty">× {item.qty}</span>

                      <span className="order-card__item-price">
                        {(Number(item.price) * Number(item.qty)).toLocaleString(
                          "vi-VN",
                        )}
                        ₫
                      </span>
                    </div>
                  ))}

                  {order.status === "pending" && (
                    <button
                      type="button"
                      className="order-card__cancel"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCancelOrder(order.id);
                      }}
                    >
                      Hủy đơn hàng
                    </button>
                  )}
                </div>

                <div className="order-card__footer">
                  <span>Tổng cộng</span>
                  <strong>{Number(total).toLocaleString("vi-VN")}₫</strong>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
