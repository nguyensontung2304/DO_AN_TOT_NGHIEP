import { Link } from "react-router-dom";
import { useApp } from "../../../context/useApp";
import { ROUTES } from "../../../constants/router";

import "../Technical/technical.scss";
import "./dashboard.scss";

function StatCard({ icon, value, label, color, to }) {
  const inner = (
    <div className={`dash-stat dash-stat--${color}`}>
      <span className="dash-stat__icon">{icon}</span>
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

function FlowStep({ num, icon, label, active, done }) {
  return (
    <div
      className={`flow-step ${active ? "flow-step--active" : ""} ${done ? "flow-step--done" : ""}`}
    >
      <div className="flow-step__circle">{done ? "✓" : num}</div>
      <span className="flow-step__icon">{icon}</span>
      <span className="flow-step__label">{label}</span>
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
  const designPending = designRequests.filter(
    (r) => r.status === "pending",
  ).length;
  const reportPending = productionReports.filter(
    (r) => r.status === "reported",
  ).length;
  const totalFinished = finishedGoods.reduce((s, g) => s + g.qty, 0);
  const lowStock = materials.filter((m) => m.stock <= 5).length;

  const recentRequests = [...productionRequests].reverse().slice(0, 5);

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

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>📊 Dashboard</h1>
        <p className="page-sub">Tổng quan hệ thống quản lý sản xuất</p>
      </div>

      {/* Alerts */}
      {(pending > 0 ||
        purPending > 0 ||
        designPending > 0 ||
        reportPending > 0 ||
        lowStock > 0) && (
        <div className="dash-alerts">
          {pending > 0 && (
            <Link
              to={ROUTES.ADMIN.WAREHOUSE}
              className="dash-alert dash-alert--yellow"
            >
              ⚠️ {pending} yêu cầu SX chờ Thủ kho kiểm kê
            </Link>
          )}
          {purPending > 0 && (
            <Link
              to={ROUTES.ADMIN.PURCHASING}
              className="dash-alert dash-alert--orange"
            >
              🛒 {purPending} đơn mua hàng chờ xử lý
            </Link>
          )}
          {designPending > 0 && (
            <Link
              to={ROUTES.ADMIN.TECHNICAL}
              className="dash-alert dash-alert--blue"
            >
              📐 {designPending} yêu cầu bản thiết kế chờ Kỹ thuật
            </Link>
          )}
          {reportPending > 0 && (
            <Link
              to={ROUTES.ADMIN.WAREHOUSE}
              className="dash-alert dash-alert--purple"
            >
              📦 {reportPending} lô thành phẩm chờ Thủ kho nhận
            </Link>
          )}
          {lowStock > 0 && (
            <Link
              to={ROUTES.ADMIN.WAREHOUSE}
              className="dash-alert dash-alert--red"
            >
              🔴 {lowStock} loại vật tư sắp hết tồn kho
            </Link>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="dash-stats">
        <StatCard
          icon="📦"
          value={materials.length}
          label="Loại vật tư"
          color="blue"
          to={ROUTES.ADMIN.WAREHOUSE}
        />
        <StatCard
          icon="📋"
          value={productionRequests.length}
          label="Tổng yêu cầu SX"
          color="purple"
          to={ROUTES.ADMIN.WAREHOUSE}
        />
        <StatCard
          icon="🛒"
          value={purchaseRequests.length}
          label="Đơn mua hàng"
          color="orange"
          to={ROUTES.ADMIN.PURCHASING}
        />
        <StatCard
          icon="🏭"
          value={handoverOrders.length}
          label="Phiếu bàn giao"
          color="teal"
          to={ROUTES.ADMIN.FACTORY}
        />
        <StatCard
          icon="🎁"
          value={totalFinished}
          label="Tổng thành phẩm"
          color="green"
          to={ROUTES.ADMIN.FINISHED_GOODS}
        />
        <StatCard
          icon="⚡"
          value={inProd}
          label="Đang sản xuất"
          color="yellow"
          to={ROUTES.ADMIN.FACTORY}
        />
      </div>

      {/* Flow diagram */}
      <div className="admin-card" style={{ marginBottom: "28px" }}>
        <div className="admin-card__header">
          <span>🔄</span>
          <h2>Quy trình sản xuất</h2>
        </div>
        <div className="admin-card__body">
          <div className="flow-diagram">
            <FlowStep
              num={1}
              icon="⚙️"
              label="Kỹ thuật tạo yêu cầu"
              done={productionRequests.length > 0}
              active={false}
            />
            <div className="flow-arrow">→</div>
            <FlowStep
              num={2}
              icon="🏭"
              label="Thủ kho kiểm kê"
              done={productionRequests.some((r) => r.status !== "pending")}
              active={pending > 0}
            />
            <div className="flow-arrow">→</div>
            <FlowStep
              num={3}
              icon="🛒"
              label="Mua hàng"
              done={purchaseRequests.some((r) => r.status !== "pending")}
              active={purPending > 0}
            />
            <div className="flow-arrow">→</div>
            <FlowStep
              num={4}
              icon="📥"
              label="Nhập kho"
              done={purchaseRequests.some((r) => r.status === "stocked")}
              active={false}
            />
            <div className="flow-arrow">→</div>
            <FlowStep
              num={5}
              icon="🚚"
              label="Bàn giao NM"
              done={handoverOrders.length > 0}
              active={false}
            />
            <div className="flow-arrow">→</div>
            <FlowStep
              num={6}
              icon="🔧"
              label="Sản xuất"
              done={productionReports.length > 0}
              active={inProd > 0}
            />
            <div className="flow-arrow">→</div>
            <FlowStep
              num={7}
              icon="📦"
              label="Nhận thành phẩm"
              done={totalFinished > 0}
              active={reportPending > 0}
            />
          </div>
        </div>
      </div>

      <div className="dash-bottom">
        {/* Yêu cầu SX gần nhất */}
        <div className="admin-card">
          <div className="admin-card__header">
            <span>🕐</span>
            <h2>Yêu cầu sản xuất gần nhất</h2>
          </div>
          <div className="admin-card__body">
            {recentRequests.length === 0 ? (
              <p className="empty-state">Chưa có yêu cầu nào.</p>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th>SL</th>
                      <th>Ngày tạo</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRequests.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <strong>{r.productName}</strong>
                        </td>
                        <td>{r.productQty}</td>
                        <td>{r.createdAt}</td>
                        <td>
                          <span
                            className={`badge ${statusCls[r.status] || "badge--gray"}`}
                          >
                            {statusLabel[r.status] || r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className="admin-card">
          <div className="admin-card__header">
            <span>⚡</span>
            <h2>Truy cập nhanh</h2>
          </div>
          <div className="admin-card__body">
            <div className="dash-quick-links">
              {[
                {
                  to: ROUTES.ADMIN.TECHNICAL,
                  icon: "⚙️",
                  label: "Kỹ thuật",
                  sub: "Tạo yêu cầu SX",
                },
                {
                  to: ROUTES.ADMIN.WAREHOUSE,
                  icon: "🏭",
                  label: "Thủ kho",
                  sub: "Kiểm kê & nhập kho",
                },
                {
                  to: ROUTES.ADMIN.PURCHASING,
                  icon: "🛒",
                  label: "Mua hàng",
                  sub: "Xử lý đơn mua",
                },
                {
                  to: ROUTES.ADMIN.FACTORY,
                  icon: "🔧",
                  label: "Nhà máy",
                  sub: "Quản lý sản xuất",
                },
                {
                  to: ROUTES.ADMIN.FINISHED_GOODS,
                  icon: "📦",
                  label: "Thành phẩm",
                  sub: "Kho thành phẩm",
                },
              ].map((lnk) => (
                <Link key={lnk.to} to={lnk.to} className="dash-quick-link">
                  <span className="dash-quick-link__icon">{lnk.icon}</span>
                  <div>
                    <strong>{lnk.label}</strong>
                    <small>{lnk.sub}</small>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
