import { useApp } from "../../../context/useApp";
import "../Technical/technical.scss";
import "./purchasing.scss";

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

export default function Purchasing() {
  const { purchaseRequests, updatePurchaseRequestStatus } = useApp();

  const pending  = purchaseRequests.filter((r) => r.status === "pending");
  const bought   = purchaseRequests.filter((r) => r.status === "purchased");
  const stocked  = purchaseRequests.filter((r) => r.status === "stocked");

  const totalItems = purchaseRequests.reduce((s, r) => s + r.items.length, 0);

  return (
    <div className="purchasing-page">
      <div className="page-header">
        <h1>🛒 Bộ phận Mua hàng</h1>
        <p className="page-sub">Nhận yêu cầu mua vật tư từ Thủ kho và xác nhận đã mua</p>
      </div>

      {/* Stats */}
      <div className="pur-summary">
        <div className="pur-summary__card pur-summary__card--yellow">
          <strong>{pending.length}</strong>
          <span>Đơn chờ mua</span>
        </div>
        <div className="pur-summary__card pur-summary__card--blue">
          <strong>{bought.length}</strong>
          <span>Đã mua — chờ nhập kho</span>
        </div>
        <div className="pur-summary__card pur-summary__card--green">
          <strong>{stocked.length}</strong>
          <span>Đã nhập kho</span>
        </div>
        <div className="pur-summary__card">
          <strong>{totalItems}</strong>
          <span>Tổng mặt hàng</span>
        </div>
      </div>

      {/* ── Đơn hàng chờ mua ──────────────────────────────────────────────── */}
      <AdminCard title="Đơn hàng chờ mua" icon="🟡">
        {pending.length === 0 ? (
          <p className="empty-state">Không có đơn hàng nào đang chờ.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Sản phẩm SX</th>
                  <th>Vật tư cần mua</th>
                  <th>Ngày yêu cầu</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((req, i) => (
                  <tr key={req.id}>
                    <td>{i + 1}</td>
                    <td><strong>{req.productName}</strong></td>
                    <td>
                      <ul className="material-list-inline">
                        {req.items.map((item, ii) => (
                          <li key={ii}>
                            <strong>{item.materialName}</strong>: {item.qtyToBuy} {item.unit}
                            <span className="pur-stock-hint">
                              {" "}(tồn: {item.qtyInStock}, cần: {item.qtyNeeded})
                            </span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td>{req.createdAt}</td>
                    <td>
                      <button
                        className="btn-action btn-action--green"
                        onClick={() => updatePurchaseRequestStatus(req.id, "purchased")}
                      >
                        ✅ Xác nhận đã mua
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {/* ── Đã mua — chờ Thủ kho nhập ─────────────────────────────────────── */}
      <AdminCard title="Đã mua — chờ Thủ kho nhập kho" icon="🔵">
        {bought.length === 0 ? (
          <p className="empty-state">Chưa có đơn nào đã mua.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Sản phẩm SX</th>
                  <th>Vật tư đã mua</th>
                  <th>Ngày mua</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {bought.map((req, i) => (
                  <tr key={req.id}>
                    <td>{i + 1}</td>
                    <td><strong>{req.productName}</strong></td>
                    <td>
                      <ul className="material-list-inline">
                        {req.items.map((item, ii) => (
                          <li key={ii}>{item.materialName}: <strong>{item.qtyToBuy} {item.unit}</strong></li>
                        ))}
                      </ul>
                    </td>
                    <td>{req.createdAt}</td>
                    <td><span className="badge badge--blue">Chờ thủ kho nhập</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {/* ── Lịch sử đã hoàn thành ─────────────────────────────────────────── */}
      {stocked.length > 0 && (
        <AdminCard title="Lịch sử đơn đã hoàn thành" icon="✅">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Sản phẩm SX</th>
                  <th>Vật tư</th>
                  <th>Ngày</th>
                </tr>
              </thead>
              <tbody>
                {stocked.map((req, i) => (
                  <tr key={req.id}>
                    <td>{i + 1}</td>
                    <td><strong>{req.productName}</strong></td>
                    <td>
                      <ul className="material-list-inline">
                        {req.items.map((item, ii) => (
                          <li key={ii}>{item.materialName}: {item.qtyToBuy} {item.unit}</li>
                        ))}
                      </ul>
                    </td>
                    <td>{req.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>
      )}
    </div>
  );
}
