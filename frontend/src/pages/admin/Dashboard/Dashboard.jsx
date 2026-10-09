import { Link } from "react-router-dom";
import { useState } from "react";
import {
  Package,
  ClipboardList,
  ShoppingCart,
  Warehouse,
  Gift,
  Zap,
  Banknote,
  AlertTriangle,
  BarChart2,
  Clock,
  Ruler,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useApp } from "../../../context/useApp";
import { formatDate } from "../../../utils/formatDate";
import { ROUTES } from "../../../constants/router";
import "../Technical/technical.scss";
import "./dashboard.scss";

function StatCard({ icon: Icon, value, label, color, to }) {
  const inner = (
    <div className={`dash-stat dash-stat--${color}`}>
      <span className="dash-stat__icon">
        <Icon size={30} strokeWidth={1.6} />
      </span>
      <div>
        <strong>{value}</strong>
        <p>{label}</p>
      </div>
    </div>
  );
  return to ? (
    <Link to={to} className="dash-stat-link">
      {inner}
    </Link>
  ) : (
    inner
  );
}

function RecentTable({
  title,
  icon: Icon,
  gradient,
  data,
  columns,
  renderRow,
  route,
  limit = 5,
}) {
  const [showAll, setShowAll] = useState(false);
  const displayData = showAll ? data : data.slice(0, limit);
  const hasMore = data.length > limit;

  return (
    <div className={`admin-card admin-card--gradient-${gradient}`}>
      <div className="admin-card__header">
        <Icon size={18} strokeWidth={2} />
        <h2>{title}</h2>
      </div>
      <div className="admin-card__body">
        {data.length === 0 ? (
          <p className="empty-state">Chưa có dữ liệu nào.</p>
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    {columns.map((col, i) => (
                      <th key={i}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayData.map((item, i) => (
                    <tr key={item.id || i}>
                      {renderRow(item, i)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {hasMore && (
              <button
                className="dash-view-more"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? (
                  <>
                    <ChevronUp size={14} strokeWidth={2} style={{ marginRight: 4 }} />
                    Thu gọn
                  </>
                ) : (
                  <>
                    <ChevronDown size={14} strokeWidth={2} style={{ marginRight: 4 }} />
                    Xem thêm ({data.length - limit} mục nữa)
                  </>
                )}
              </button>
            )}
            {route && !showAll && (
              <Link to={route} className="dash-view-all-link">
                Xem tất cả →
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const {
    materials,
    productionRequests,
    purchaseRequests,
    handoverOrders,
    designRequests,
    productionReports,
    finishedGoods,
    orders,
  } = useApp();

  const pending = productionRequests.filter(
    (r) => r.status === "pending",
  ).length;
  const inProd = productionRequests.filter(
    (r) => r.status === "in_production",
  ).length;
  const purPending = purchaseRequests.filter(
    (r) => r.status === "pending",
  ).length;
  const designPend = designRequests.filter(
    (r) => r.status === "pending",
  ).length;
  const reportPend = productionReports.filter(
    (r) => r.status === "reported",
  ).length;
  const totalFin = finishedGoods.reduce((s, g) => s + g.qty, 0);
  const lowStock = materials.filter((m) => m.stock <= 5).length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const totalOrderValue = orders.reduce((s, o) => s + Number(o.total || 0), 0);

  const recentRequests = [...productionRequests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const statusLabel = {
    pending: "Chờ thủ kho",
    checked: "Đã kiểm kê",
    purchasing: "Đang mua hàng",
    ready: "Sẵn sàng SX",
    in_production: "Đang sản xuất",
    done: "Hoàn thành",
  };
  const statusCls = {
    pending: "badge--yellow",
    checked: "badge--blue",
    purchasing: "badge--orange",
    ready: "badge--teal",
    in_production: "badge--purple",
    done: "badge--green",
  };
  const orderStatusLabel = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    processing: "Đang sản xuất",
    shipping: "Đã giao hàng",
    done: "Hoàn thành",
    cancelled: "Đã hủy",
  };
  const orderStatusCls = {
    pending: "badge--yellow",
    confirmed: "badge--blue",
    processing: "badge--purple",
    shipping: "badge--blue",
    done: "badge--green",
    cancelled: "badge--red",
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>
          <BarChart2
            size={26}
            strokeWidth={2}
            style={{ verticalAlign: "middle", marginRight: 8 }}
          />
          Dashboard
        </h1>
        <p className="page-sub">Tổng quan hệ thống quản lý sản xuất</p>
      </div>

      {/* Alerts */}
      {(pending > 0 ||
        purPending > 0 ||
        designPend > 0 ||
        reportPend > 0 ||
        lowStock > 0 ||
        pendingOrders > 0) && (
        <div className="dash-alerts">
          {pending > 0 && (
            <Link
              to={ROUTES.ADMIN.WAREHOUSE}
              className="dash-alert dash-alert--yellow"
            >
              <AlertTriangle
                size={14}
                strokeWidth={2}
                style={{ marginRight: 6 }}
              />
              {pending} yêu cầu SX chờ Thủ kho kiểm kê
            </Link>
          )}
          {purPending > 0 && (
            <Link
              to={ROUTES.ADMIN.PURCHASING}
              className="dash-alert dash-alert--orange"
            >
              <ShoppingCart
                size={14}
                strokeWidth={2}
                style={{ marginRight: 6 }}
              />
              {purPending} đơn mua hàng chờ xử lý
            </Link>
          )}
          {designPend > 0 && (
            <Link
              to={ROUTES.ADMIN.TECHNICAL}
              className="dash-alert dash-alert--blue"
            >
              <Ruler size={14} strokeWidth={2} style={{ marginRight: 6 }} />
              {designPend} yêu cầu bản thiết kế chờ Kỹ thuật
            </Link>
          )}
          {reportPend > 0 && (
            <Link
              to={ROUTES.ADMIN.WAREHOUSE}
              className="dash-alert dash-alert--purple"
            >
              <Package size={14} strokeWidth={2} style={{ marginRight: 6 }} />
              {reportPend} lô thành phẩm chờ Thủ kho nhận
            </Link>
          )}
          {lowStock > 0 && (
            <Link
              to={ROUTES.ADMIN.WAREHOUSE}
              className="dash-alert dash-alert--red"
            >
              <AlertTriangle
                size={14}
                strokeWidth={2}
                style={{ marginRight: 6 }}
              />
              {lowStock} loại vật tư sắp hết tồn kho
            </Link>
          )}
          {pendingOrders > 0 && (
            <Link
              to={ROUTES.ADMIN.ORDERS}
              className="dash-alert dash-alert--yellow"
            >
              <ClipboardList
                size={14}
                strokeWidth={2}
                style={{ marginRight: 6 }}
              />
              {pendingOrders} đơn hàng chờ xác nhận
            </Link>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="dash-stats">
        <StatCard
          icon={Package}
          value={materials.length}
          label="Loại vật tư"
          color="blue"
          to={ROUTES.ADMIN.WAREHOUSE}
        />
        <StatCard
          icon={ClipboardList}
          value={productionRequests.length}
          label="Tổng yêu cầu SX"
          color="purple"
          to={ROUTES.ADMIN.WAREHOUSE}
        />
        <StatCard
          icon={ShoppingCart}
          value={purchaseRequests.length}
          label="Đơn mua hàng"
          color="orange"
          to={ROUTES.ADMIN.PURCHASING}
        />
        <StatCard
          icon={Warehouse}
          value={handoverOrders.length}
          label="Phiếu bàn giao"
          color="magenta"
          to={ROUTES.ADMIN.FACTORY}
        />
        <StatCard
          icon={Gift}
          value={totalFin}
          label="Tổng thành phẩm"
          color="green"
          to={ROUTES.ADMIN.FINISHED_GOODS}
        />
        <StatCard
          icon={Zap}
          value={inProd}
          label="Đang sản xuất"
          color="yellow"
          to={ROUTES.ADMIN.FACTORY}
        />
        <StatCard
          icon={ClipboardList}
          value={orders.length}
          label="Tổng đơn hàng"
          color="cyan"
          to={ROUTES.ADMIN.ORDERS}
        />
        <StatCard
          icon={Banknote}
          value={totalOrderValue.toLocaleString("vi-VN") + "₫"}
          label="Doanh thu"
          color="pink"
          to={ROUTES.ADMIN.ORDERS}
        />
      </div>

      <div className="dash-bottom">
        {/* Yêu cầu SX gần nhất */}
        <RecentTable
          title="Yêu cầu sản xuất gần nhất"
          icon={Clock}
          gradient="blue"
          data={recentRequests}
          columns={["Sản phẩm", "SL", "Ngày tạo", "Trạng thái"]}
          renderRow={(r) => (
            <>
              <td><strong>{r.productName}</strong></td>
              <td>{r.productQty}</td>
              <td>{formatDate(r.createdAt)}</td>
              <td>
                <span className={`badge ${statusCls[r.status] || "badge--gray"}`}>
                  {statusLabel[r.status] || r.status}
                </span>
              </td>
            </>
          )}
          route={ROUTES.ADMIN.WAREHOUSE}
        />

        {/* Đơn hàng gần nhất */}
        <RecentTable
          title="Đơn hàng gần nhất"
          icon={ClipboardList}
          gradient="green"
          data={recentOrders}
          columns={["Khách hàng", "Sản phẩm", "Tổng tiền", "Ngày đặt", "Trạng thái"]}
          renderRow={(o) => (
            <>
              <td><strong>{o.name}</strong></td>
              <td>
                <small>
                  {(o.cart || []).length} SP:{" "}
                  {(o.cart || []).map((i) => i.name).join(", ")}
                </small>
              </td>
              <td>{Number(o.total).toLocaleString("vi-VN")}₫</td>
              <td>{formatDate(o.createdAt)}</td>
              <td>
                <span className={`badge ${orderStatusCls[o.status] || "badge--gray"}`}>
                  {orderStatusLabel[o.status] || o.status}
                </span>
              </td>
            </>
          )}
          route={ROUTES.ADMIN.ORDERS}
        />
      </div>
    </div>
  );
}