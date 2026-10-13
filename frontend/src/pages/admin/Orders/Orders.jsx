import { useState } from "react";
import {
  Check,
  Ban,
  User,
  Phone,
  MapPin,
  Mail,
  FileText,
  ClipboardList,
  Loader2,
} from "lucide-react";
import { useApp } from "../../../context/useApp";
import { getProductById } from "../../../api";
import "../Technical/technical.scss";
import "./orders.scss";

function AdminCard({ title, icon, children, gradient }) {
  return (
    <div
      className={`admin-card${gradient ? ` admin-card--gradient-${gradient}` : ""}`}
    >
      <div className="admin-card__header">
        <span>{icon}</span>
        <h2>{title}</h2>
      </div>
      <div className="admin-card__body">{children}</div>
    </div>
  );
}

function OrderStatusBadge({ status }) {
  const map = {
    pending: { label: "Chờ xác nhận", cls: "badge--yellow" },
    confirmed: { label: "Đã xác nhận", cls: "badge--blue" },
    processing: { label: "Đang sản xuất", cls: "badge--purple" },
    done: { label: "Hoàn thành", cls: "badge--green" },
    shipping: { label: "Đang giao hàng", cls: "badge--blue" },
    cancelled: { label: "Đã hủy", cls: "badge--red" },
  };
  const s = map[status] || { label: status, cls: "badge--gray" };
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}

export default function Orders() {
  const { orders, updateOrderStatus, setConfirmedOrderDraft } = useApp();

  const pendingOrders = orders.filter((o) => o.status === "pending");
  const confirmedOrders = orders.filter((o) => o.status === "confirmed");
  const processingOrders = orders.filter((o) => o.status === "processing");
  const doneOrders = orders.filter((o) => o.status === "done");

  const [confirmingId, setConfirmingId] = useState(null);

  const handleConfirm = async (order) => {
    setConfirmingId(order.id);
    updateOrderStatus(order.id, "confirmed");
    try {
      const recipeResults = await Promise.all(
        (order.cart || []).map((item) =>
          getProductById(item.productId)
            .then((res) => ({ item, recipe: res.data?.recipe || [] }))
            .catch(() => ({ item, recipe: [] })),
        ),
      );
      const itemsWithRecipe = recipeResults.map(({ item, recipe }) => ({
        ...item,
        materials: recipe.map((r) => ({
          material_name: r.material_name,
          unit: r.unit,
          qty: Number(r.qty) * Number(item.qty),
        })),
      }));
      const materialMap = {};
      itemsWithRecipe.forEach((item) => {
        item.materials.forEach((r) => {
          const key = r.material_name.toLowerCase().trim();
          if (!materialMap[key])
            materialMap[key] = {
              material_name: r.material_name,
              unit: r.unit,
              qty: 0,
            };
          materialMap[key].qty += r.qty;
        });
      });
      setConfirmedOrderDraft?.({
        ...order,
        itemsWithRecipe,
        recipeRows: Object.values(materialMap),
      });
    } catch {
      /* keep draft from updateOrderStatus */
    } finally {
      setConfirmingId(null);
    }
  };

  const handleCancel = (order) => updateOrderStatus(order.id, "cancelled");

  const formatDate = (d) =>
    new Date(d).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  const formatCurrency = (a) => Number(a).toLocaleString("vi-VN") + "₫";

  return (
    <div className="orders-page">
      <div className="page-header">
        <h1>
          <ClipboardList
            size={24}
            strokeWidth={2}
            style={{ verticalAlign: "middle", marginRight: 8 }}
          />
          Quản lý đơn hàng
        </h1>
        <p className="page-sub">
          Danh sách đơn hàng từ khách hàng — xác nhận và tạo yêu cầu sản xuất
        </p>
      </div>

      <div className="orders-summary">
        <div className="orders-summary__card orders-summary__card--yellow">
          <strong>{pendingOrders.length}</strong>
          <span>Chờ xác nhận</span>
        </div>
        <div className="orders-summary__card orders-summary__card--blue">
          <strong>{confirmedOrders.length}</strong>
          <span>Đã xác nhận</span>
        </div>
        <div className="orders-summary__card orders-summary__card--purple">
          <strong>{processingOrders.length}</strong>
          <span>Đang sản xuất</span>
        </div>
        <div className="orders-summary__card orders-summary__card--green">
          <strong>{doneOrders.length}</strong>
          <span>Hoàn thành</span>
        </div>
      </div>

      <AdminCard
        title="Tất cả đơn hàng"
        icon={<ClipboardList size={18} strokeWidth={2} />}
        gradient="purple"
      >
        {orders.length === 0 ? (
          <p className="empty-state">Chưa có đơn hàng nào.</p>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <OrderItemCard
                key={order.id}
                order={order}
                onConfirm={
                  order.status === "pending" ? handleConfirm : undefined
                }
                onCancel={
                  ["pending", "processing"].includes(order.status)
                    ? handleCancel
                    : undefined
                }
                confirming={confirmingId === order.id}
                formatDate={formatDate}
                formatCurrency={formatCurrency}
              />
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  );
}

function OrderItemCard({
  order,
  onConfirm,
  onCancel,
  loading,
  confirming,
  actionMsg,
  formatDate,
  formatCurrency,
}) {
  const orderItems = order.cart || [];
  const orderTotal =
    order.total ||
    orderItems.reduce((s, i) => s + Number(i.price) * Number(i.qty), 0);

  return (
    <div className="order-card">
      <div className="order-card__head">
        <div className="order-card__meta">
          <span className="order-card__id">
            Đơn #{String(order.id).slice(-6).toUpperCase()}
          </span>
          <span className="order-card__date">
            {formatDate(order.createdAt)}
          </span>
        </div>
        <div className="order-card__right">
          <OrderStatusBadge status={order.status} />
          <span className="order-card__total">
            {formatCurrency(orderTotal)}
          </span>
        </div>
      </div>

      <div className="order-card__client">
        <div className="order-card__info-row">
          <span>
            <User size={13} strokeWidth={2} style={{ marginRight: 4 }} />
            Khách hàng
          </span>
          <strong>{order.name}</strong>
        </div>
        <div className="order-card__info-row">
          <span>
            <Phone size={13} strokeWidth={2} style={{ marginRight: 4 }} />
            Điện thoại
          </span>
          <strong>{order.phone}</strong>
        </div>
        <div className="order-card__info-row">
          <span>
            <MapPin size={13} strokeWidth={2} style={{ marginRight: 4 }} />
            Địa chỉ
          </span>
          <strong>{order.address}</strong>
        </div>
        {order.userEmail && (
          <div className="order-card__info-row">
            <span>
              <Mail size={13} strokeWidth={2} style={{ marginRight: 4 }} />
              Email
            </span>
            <strong>{order.userEmail}</strong>
          </div>
        )}
        {order.note && (
          <div className="order-card__info-row">
            <span>
              <FileText size={13} strokeWidth={2} style={{ marginRight: 4 }} />
              Ghi chú
            </span>
            <strong>{order.note}</strong>
          </div>
        )}
      </div>

      <div className="order-card__items">
        <p className="order-card__items-title">
          Sản phẩm ({orderItems.length})
        </p>
        {orderItems.map((item, i) => (
          <div key={i} className="order-card__item">
            <div className="order-card__item-image">
              <img src={item.image} alt={item.name} />
            </div>
            <span className="order-card__item-name">{item.name}</span>
            <span className="order-card__item-qty">× {item.qty}</span>
            <span className="order-card__item-price">
              {formatCurrency(Number(item.price) * Number(item.qty))}
            </span>
          </div>
        ))}
      </div>

      <div className="order-card__footer">
        <span>Tổng cộng</span>
        <strong>{formatCurrency(orderTotal)}</strong>
      </div>

      {actionMsg && <p className="form-success">{actionMsg}</p>}

      <div className="order-card__actions">
        {order.status === "pending" && onConfirm && (
          <button
            className="btn-action btn-action--blue"
            onClick={() => onConfirm(order)}
            disabled={confirming}
          >
            {confirming ? (
              <>
                <Loader2 size={14} strokeWidth={2} style={{ marginRight: 4 }} />
                Đang xử lý...
              </>
            ) : (
              <>
                <Check size={14} strokeWidth={2} style={{ marginRight: 4 }} />
                Xác nhận đơn
              </>
            )}
          </button>
        )}
        {["pending", "processing"].includes(order.status) && onCancel && (
          <button
            className="btn-action btn-action--danger"
            onClick={() => onCancel(order)}
          >
            <Ban size={14} strokeWidth={2} style={{ marginRight: 4 }} />
            Hủy đơn
          </button>
        )}
      </div>
    </div>
  );
}
