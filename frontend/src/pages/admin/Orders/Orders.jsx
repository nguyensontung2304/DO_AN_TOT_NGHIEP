import { useState, useCallback } from "react";
import { useApp } from "../../../context/useApp";
import { getProductById } from "../../../api";
import "../Technical/technical.scss";
import "./orders.scss";
function AdminCard({ title, icon, children }) {
  return (
    <div className="admin-card">
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
    pending: { label: "Chờ xác nhận", cls: "badge--yellow", icon: "🟡" },
    confirmed: { label: "Đã xác nhận", cls: "badge--blue", icon: "🔵" },
    processing: { label: "Đang sản xuất", cls: "badge--purple", icon: "🟣" },
    done: { label: "Hoàn thành", cls: "badge--green", icon: "✅" },
    cancelled: { label: "Đã hủy", cls: "badge--red", icon: "🔴" },
  };
  const s = map[status] || { label: status, cls: "badge--gray", icon: "⚪" };
  return (
    <span className={`badge ${s.cls}`}>
      {s.icon} {s.label}
    </span>
  );
}

export default function Orders() {
  const {
    orders,
    updateOrderStatus,
    addProductionRequest,
    materials,
    setConfirmedOrderDraft,
  } = useApp();

  const pendingOrders = orders.filter((o) => o.status === "pending");
  const confirmedOrders = orders.filter((o) => o.status === "confirmed");
  const processingOrders = orders.filter((o) => o.status === "processing");
  const doneOrders = orders.filter((o) => o.status === "done");
  const [loadingProduct, setLoadingProduct] = useState(null);
  const [actionMsg, setActionMsg] = useState({});
  const [confirmingId, setConfirmingId] = useState(null);

  // Xác nhận đơn hàng + fetch recipe của TỪNG sản phẩm để auto-fill Technical form
  const handleConfirm = useCallback(
    async (order) => {
      setConfirmingId(order.id);
      updateOrderStatus(order.id, "confirmed");

      // Lấy công thức riêng cho từng sản phẩm trong đơn
      try {
        const recipeResults = await Promise.all(
          (order.cart || []).map((item) =>
            getProductById(item.productId)
              .then((res) => ({ item, recipe: res.data?.recipe || [] }))
              .catch(() => ({ item, recipe: [] })),
          ),
        );

        // Mỗi sản phẩm giữ vật tư riêng, nhân số lượng với qty của sản phẩm đó
        const itemsWithRecipe = recipeResults.map(({ item, recipe }) => ({
          ...item,
          materials: recipe.map((r) => ({
            material_name: r.material_name,
            unit: r.unit,
            qty: Number(r.qty) * Number(item.qty),
          })),
        }));

        // Tổng hợp vật tư để hiển thị tổng quan trên banner
        const materialMap = {};
        itemsWithRecipe.forEach((item) => {
          item.materials.forEach((r) => {
            const key = r.material_name.toLowerCase().trim();
            if (!materialMap[key]) {
              materialMap[key] = {
                material_name: r.material_name,
                unit: r.unit,
                qty: 0,
              };
            }
            materialMap[key].qty += r.qty;
          });
        });

        setConfirmedOrderDraft?.({
          ...order,
          itemsWithRecipe,
          recipeRows: Object.values(materialMap),
        });
      } catch {
        // Fetch recipe thất bại → vẫn giữ draft do updateOrderStatus đã set
      } finally {
        setConfirmingId(null);
      }
    },
    [updateOrderStatus, setConfirmedOrderDraft],
  );

  const handleCreateProduction = useCallback(
    async (order) => {
      const items = order.cart || [];
      if (items.length === 0) return;

      setLoadingProduct(order.id);

      try {
        // Lấy recipe RIÊNG cho từng sản phẩm (không dùng chung cho cả đơn)
        const recipeResults = await Promise.all(
          items.map((item) =>
            getProductById(item.productId)
              .then((res) => ({ item, recipe: res.data?.recipe || [] }))
              .catch(() => ({ item, recipe: [] })),
          ),
        );

        // Gom vật tư trùng tên trong cùng 1 sản phẩm
        const requestItems = recipeResults
          .map(({ item, recipe }) => {
            const agg = {};
            recipe.forEach((r) => {
              const key = r.material_name.toLowerCase().trim();
              if (!agg[key]) {
                agg[key] = {
                  materialId: null,
                  materialName: r.material_name,
                  unit: r.unit,
                  requiredQty: 0,
                };
              }
              const mat = materials.find(
                (m) => m.name.toLowerCase().trim() === key,
              );
              if (agg[key].materialId === null && mat) {
                agg[key].materialId = mat.id;
              }
              // Số lượng tính theo qty của sản phẩm này
              agg[key].requiredQty += Number(r.qty) * Number(item.qty);
            });

            return {
              productName: item.name,
              productQty: item.qty,
              // Chỉ giữ vật tư đã tìm thấy trong kho
              materials: Object.values(agg).filter((m) => m.materialId !== null),
            };
          })
          // Bỏ qua sản phẩm không có công thức nào khớp với kho
          .filter((it) => it.materials.length > 0);

        if (requestItems.length === 0) {
          setActionMsg((prev) => ({
            ...prev,
            [order.id]: "❌ Không tìm thấy vật tư nào trong kho cho đơn này",
          }));
          setTimeout(
            () => setActionMsg((prev) => ({ ...prev, [order.id]: "" })),
            4000,
          );
          return;
        }

        // Tạo 1 yêu cầu sản xuất cho mỗi sản phẩm, mỗi yêu cầu có vật tư riêng
        await addProductionRequest({
          orderId: order.id,
          note: order.note || `Đơn hàng #${order.id}`,
          items: requestItems,
        });

        updateOrderStatus(order.id, "processing");

        setActionMsg((prev) => ({
          ...prev,
          [order.id]: `✅ Đã tạo ${requestItems.length} yêu cầu sản xuất!`,
        }));
        setTimeout(
          () => setActionMsg((prev) => ({ ...prev, [order.id]: "" })),
          3000,
        );
      } catch (err) {
        console.error("Lỗi tạo yêu cầu sản xuất:", err);
        setActionMsg((prev) => ({
          ...prev,
          [order.id]: "❌ Có lỗi khi tạo yêu cầu sản xuất",
        }));
        setTimeout(
          () => setActionMsg((prev) => ({ ...prev, [order.id]: "" })),
          3000,
        );
      } finally {
        setLoadingProduct(null);
      }
    },
    [materials, addProductionRequest, updateOrderStatus],
  );

  const handleComplete = (order) => {
    updateOrderStatus(order.id, "done");
  };

  const handleCancel = (order) => {
    updateOrderStatus(order.id, "cancelled");
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatCurrency = (amount) =>
    Number(amount).toLocaleString("vi-VN") + "₫";

  return (
    <div className="orders-page">
      <div className="page-header">
        <h1>📋 Quản lý đơn hàng</h1>
        <p className="page-sub">
          Danh sách đơn hàng từ khách hàng — xác nhận và tạo yêu cầu sản xuất
        </p>
      </div>

      {/* Stats */}
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

      {/* ── Đơn hàng chờ xác nhận ── */}
      <AdminCard title="Đơn hàng mới" icon="📬">
        {pendingOrders.length === 0 ? (
          <p className="empty-state">Chưa có đơn hàng nào.</p>
        ) : (
          <div className="orders-list">
            {pendingOrders.map((order) => (
              <OrderItemCard
                key={order.id}
                order={order}
                onConfirm={handleConfirm}
                onProduce={handleCreateProduction}
                onCancel={handleCancel}
                loading={loadingProduct === order.id}
                confirming={confirmingId === order.id}
                actionMsg={actionMsg[order.id]}
                formatDate={formatDate}
                formatCurrency={formatCurrency}
              />
            ))}
          </div>
        )}
      </AdminCard>

      {/* ── Đơn hàng đã xác nhận, chờ tạo yêu cầu SX ── */}
      {confirmedOrders.length > 0 && (
        <AdminCard title="Đã xác nhận — chờ tạo yêu cầu sản xuất" icon="🔵">
          <div className="orders-list">
            {confirmedOrders.map((order) => (
              <OrderItemCard
                key={order.id}
                order={order}
                onProduce={handleCreateProduction}
                onCancel={handleCancel}
                loading={loadingProduct === order.id}
                actionMsg={actionMsg[order.id]}
                formatDate={formatDate}
                formatCurrency={formatCurrency}
              />
            ))}
          </div>
        </AdminCard>
      )}

      {/* ── Đơn hàng đang xử lý ── */}
      {processingOrders.length > 0 && (
        <AdminCard title="Đang sản xuất" icon="🔧">
          <div className="orders-list">
            {processingOrders.map((order) => (
              <OrderItemCard
                key={order.id}
                order={order}
                onComplete={handleComplete}
                onCancel={handleCancel}
                formatDate={formatDate}
                formatCurrency={formatCurrency}
              />
            ))}
          </div>
        </AdminCard>
      )}

      {/* ── Đơn hàng hoàn thành ── */}
      {doneOrders.length > 0 && (
        <AdminCard title="Đơn hàng hoàn thành" icon="✅">
          <div className="orders-list">
            {doneOrders.map((order) => (
              <OrderItemCard
                key={order.id}
                order={order}
                formatDate={formatDate}
                formatCurrency={formatCurrency}
              />
            ))}
          </div>
        </AdminCard>
      )}
    </div>
  );
}

function OrderItemCard({
  order,
  onConfirm,
  onComplete,
  onCancel,
  onProduce,
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

      {/* Thông tin người dùng */}
      <div className="order-card__client">
        <div className="order-card__info-row">
          <span>👤 Khách hàng</span>
          <strong>
            {order.name}
            {order.userName && order.name !== order.userName && (
              <small>({order.userName})</small>
            )}
          </strong>
        </div>
        <div className="order-card__info-row">
          <span>📞 Điện thoại</span>
          <strong>{order.phone}</strong>
        </div>
        <div className="order-card__info-row">
          <span>📍 Địa chỉ</span>
          <strong>{order.address}</strong>
        </div>
        {order.userEmail && (
          <div className="order-card__info-row">
            <span>📧 Email</span>
            <strong>{order.userEmail}</strong>
          </div>
        )}
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
          Sản phẩm ({orderItems.length})
        </p>
        {orderItems.map((item, i) => (
          <div key={i} className="order-card__item">
            <span className="order-card__item-emoji">{item.emoji || "📦"}</span>
            <span className="order-card__item-name">{item.name}</span>
            <span className="order-card__item-qty">× {item.qty}</span>
            <span className="order-card__item-price">
              {formatCurrency(Number(item.price) * Number(item.qty))}
            </span>
          </div>
        ))}
      </div>

      {/* Tổng cộng */}
      <div className="order-card__footer">
        <span>Tổng cộng</span>
        <strong>{formatCurrency(orderTotal)}</strong>
      </div>

      {/* Hành động */}
      {actionMsg && <p className="form-success">{actionMsg}</p>}

      <div className="order-card__actions">
        {order.status === "pending" && onConfirm && (
          <button
            className="btn-action btn-action--blue"
            onClick={() => onConfirm(order)}
            disabled={confirming}
          >
            {confirming ? "⏳ Đang xử lý..." : "✅ Xác nhận đơn"}
          </button>
        )}

        {order.status === "confirmed" && onProduce && (
          <button
            className="btn-action btn-action--purple"
            onClick={() => onProduce(order)}
            disabled={loading}
          >
            {loading ? "⏳ Đang tạo..." : "🏭 Tạo yêu cầu sản xuất"}
          </button>
        )}

        {order.status === "processing" && onComplete && (
          <button
            className="btn-action btn-action--green"
            onClick={() => onComplete(order)}
          >
            ✅ Đánh dấu hoàn thành
          </button>
        )}

        {["pending", "processing"].includes(order.status) && onCancel && (
          <button
            className="btn-action btn-action--danger"
            onClick={() => onCancel(order)}
          >
            🚫 Hủy đơn
          </button>
        )}
      </div>
    </div>
  );
}
