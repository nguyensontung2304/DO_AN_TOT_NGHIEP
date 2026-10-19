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

// Nhãn và màu sắc của trạng thái đơn hàng
const STATUS_LABEL = {
  pending: { text: "Mới đặt hàng", cls: "order-status--pending" },
  confirmed: { text: "Đã xác nhận", cls: "order-status--confirmed" },
  processing: { text: "Đang sản xuất", cls: "order-status--processing" },
  shipping: { text: "Đang giao hàng", cls: "order-status--shipping" },
  done: { text: "Hoàn thành", cls: "order-status--done" },
  cancelled: { text: "Đã hủy", cls: "order-status--cancelled" },
};

function StatusBadge({ status = "pending" }) {
  const info = STATUS_LABEL[status] || STATUS_LABEL.pending;

  return <span className={`order-status ${info.cls}`}>{info.text}</span>;
}

// Lấy danh sách sản phẩm của đơn hàng
const getOrderItems = (order) => order.cart || [];

const getOrderTotal = (order, items) =>
  order.total ||
  items.reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0);

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
        <LockKeyhole className="cart-empty-icon" size={48} strokeWidth={1.8} />

        <h2>Chưa đăng nhập</h2>
        <p>Bạn cần đăng nhập để xem đơn hàng.</p>

        <Link to={ROUTES.USER.LOGIN} className="cart-btn cart-btn-primary">
          Đăng nhập
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="cart-empty">
        <LoaderCircle
          className="cart-empty-icon cart-empty-icon-loading"
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
        <Inbox className="cart-empty-icon" size={48} strokeWidth={1.8} />

        <h2>Chưa có đơn hàng nào</h2>
        <p>Hãy mua sắm và đặt hàng để xem lịch sử tại đây.</p>

        <Link
          to={ROUTES.USER.PRODUCT_LIST}
          className="cart-btn cart-btn-primary"
        >
          Khám phá sản phẩm
        </Link>
      </div>
    );
  }

  return (
    <section className="orders-list">
      <header className="orders-list-header">
        <h2 className="orders-list-title">
          <Package size={20} strokeWidth={1.8} />
          <span>Đơn hàng của tôi</span>
        </h2>

        <span className="orders-list-count">{orders.length} đơn</span>
      </header>

      <div className="orders-list-content">
        {orders.map((order, idx) => {
          const orderId = order.id || idx + 1;
          const isExpanded = expandedOrder === orderId;
          const items = getOrderItems(order);
          const total = getOrderTotal(order, items);

          return (
            <article key={orderId} className="order-card">
              <div
                className="order-card-head"
                onClick={() => onToggle(isExpanded ? null : orderId)}
                role="button"
                aria-expanded={isExpanded}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onToggle(isExpanded ? null : orderId);
                  }
                }}
              >
                <div className="order-card-head-meta">
                  <span className="order-card-head-meta-id">
                    Đơn #{String(orderId).slice(-6).toUpperCase()}
                  </span>

                  <span className="order-card-head-meta-date">
                    {formatDate(order.createdAt)}
                  </span>
                </div>

                <div className="order-card-head-summary">
                  <StatusBadge status={order.status} />

                  <strong className="order-card-head-summary-total">
                    {Number(total).toLocaleString("vi-VN")}₫
                  </strong>
                </div>

                <span className="order-card-head-toggle" aria-hidden="true">
                  {isExpanded ? (
                    <ChevronUp size={18} strokeWidth={2} />
                  ) : (
                    <ChevronDown size={18} strokeWidth={2} />
                  )}
                </span>
              </div>

              {isExpanded && (
                <div className="order-card-body">
                  <section className="order-card-info">
                    <div className="order-card-info-row">
                      <span className="order-card-info-label">
                        <UserRound size={17} strokeWidth={1.8} />
                        Người nhận
                      </span>

                      <strong>{order.name}</strong>
                    </div>

                    <div className="order-card-info-row">
                      <span className="order-card-info-label">
                        <Phone size={17} strokeWidth={1.8} />
                        Điện thoại
                      </span>

                      <strong>{order.phone}</strong>
                    </div>

                    <div className="order-card-info-row">
                      <span className="order-card-info-label">
                        <MapPin size={17} strokeWidth={1.8} />
                        Địa chỉ
                      </span>

                      <strong>{order.address}</strong>
                    </div>

                    {order.note && (
                      <div className="order-card-info-row">
                        <span className="order-card-info-label">
                          <FileText size={15} strokeWidth={1.8} />
                          Ghi chú
                        </span>

                        <strong>{order.note}</strong>
                      </div>
                    )}
                  </section>

                  <section className="order-card-items">
                    <h3 className="order-card-items-title">
                      Sản phẩm đã đặt ({items.length})
                    </h3>

                    <div className="order-card-items-list">
                      {items.map((item, i) => (
                        <div key={i} className="order-card-items-item">
                          <div className="order-card-items-item-image">
                            <img src={item.image} alt={item.name} />
                          </div>

                          <span className="order-card-items-item-name">
                            {item.name}
                          </span>

                          <span className="order-card-items-item-qty">
                            × {item.qty}
                          </span>

                          <span className="order-card-items-item-price">
                            {(
                              Number(item.price) * Number(item.qty)
                            ).toLocaleString("vi-VN")}
                            ₫
                          </span>
                        </div>
                      ))}
                    </div>

                    {order.status === "pending" && (
                      <button
                        type="button"
                        className="order-card-items-cancel"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCancelOrder(order.id);
                        }}
                      >
                        Hủy đơn hàng
                      </button>
                    )}
                  </section>

                  <footer className="order-card-footer">
                    <span>Tổng cộng</span>

                    <strong>{Number(total).toLocaleString("vi-VN")}₫</strong>
                  </footer>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
