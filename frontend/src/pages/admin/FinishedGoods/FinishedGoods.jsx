import {
  Package,
  ChartNoAxesColumn,
  Recycle,
  Store,
  Truck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { useApp } from "../../../context/useApp";
import { formatDate } from "../../../utils/formatDate";
import "./finishedGoods.scss";

function AdminCard({ title, icon, gradient, children }) {
  return (
    <div className={`admin-card admin-card-gradient-${gradient}`}>
      <div className="admin-card-header">
        <span>{icon}</span>
        <h2>{title}</h2>
      </div>
      <div className="admin-card-body">{children}</div>
    </div>
  );
}

export default function FinishedGoods() {
  const { finishedGoods, productionReports, deliverToCustomer } = useApp();

  // A report marked as received is also an inventory lot. Keep it visible here
  // if the finished-goods API did not return its corresponding inventory row.
  const inventoryGoods = [...finishedGoods];
  productionReports
    .filter((report) =>
      ["in_warehouse", "delivered", "handed_over"].includes(report.status),
    )
    .forEach((report) => {
      const normalizedName = (report.productName || "").trim().toLowerCase();
      if (
        !normalizedName ||
        inventoryGoods.some(
          (good) => good.name?.trim().toLowerCase() === normalizedName,
        )
      ) {
        return;
      }

      inventoryGoods.push({
        id: `report-${report.id}`,
        name: report.productName,
        qty: Number(report.finishedQty || 0),
        unit: "cái",
        receivedAt: report.createdAt,
        status:
          report.status === "handed_over" ? "handed_over" : "in_warehouse",
        handedOver: report.status === "handed_over",
      });
    });

  const totalQty = inventoryGoods.reduce((s, g) => s + Number(g.qty || 0), 0);
  const totalTypes = inventoryGoods.length;
  const delivered = productionReports.filter((r) =>
    ["in_warehouse", "delivered", "handed_over"].includes(r.status),
  ).length;

  const [showAllInventory, setShowAllInventory] = useState(false);
  const [showAllReports, setShowAllReports] = useState(false);

  // Sort by newest first
  const sortedFinishedGoods = [...inventoryGoods].sort(
    (a, b) => new Date(b.receivedAt) - new Date(a.receivedAt),
  );
  const sortedProductionReports = [...productionReports].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  return (
    <div className="fg-page">
      <div className="page-header">
        <h1>
          <Package /> Kho Thành phẩm
        </h1>
        <p className="page-sub">
          Tổng hợp thành phẩm đã sản xuất và bàn giao từ Nhà máy
        </p>
      </div>

      {/* Stats */}
      <div className="fg-page-summary">
        <div className="fg-page-summary-card admin-card-surface admin-summary-card admin-card-color admin-card-color-pink">
          <strong>{totalQty}</strong>
          <span>Tổng sản phẩm</span>
        </div>
        <div className="fg-page-summary-card admin-card-surface admin-summary-card admin-card-color admin-card-color-purple">
          <strong>{totalTypes}</strong>
          <span>Loại sản phẩm</span>
        </div>
        <div className="fg-page-summary-card admin-card-surface admin-summary-card admin-card-color admin-card-color-blue">
          <strong>{delivered}</strong>
          <span>Lô đã nhận</span>
        </div>
        <div className="fg-page-summary-card admin-card-surface admin-summary-card admin-card-color admin-card-color-orange">
          <strong>
            {productionReports.reduce(
              (s, r) => s + (r.scrapItems?.length || 0),
              0,
            )}
          </strong>
          <span>Loại phế liệu ghi nhận</span>
        </div>
      </div>

      {/* ── Tồn kho thành phẩm ──────────────────────────────────────────────── */}
      <AdminCard
        gradient="green"
        title="Tồn kho thành phẩm"
        icon={<Store size={18} strokeWidth={2} />}
      >
        {inventoryGoods.length === 0 ? (
          <p className="empty-state">
            Chưa có thành phẩm nào trong kho.
            <br />
            <small>
              Thành phẩm sẽ xuất hiện khi Thủ kho xác nhận nhận hàng từ Nhà máy.
            </small>
          </p>
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Tên sản phẩm</th>
                    <th>Đơn vị</th>
                    <th>Số lượng</th>
                    <th>Ngày nhập kho</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedFinishedGoods
                    .slice(0, showAllInventory ? undefined : 5)
                    .map((g, i) => (
                      <tr key={g.id}>
                        <td>{i + 1}</td>
                        <td>
                          <strong>{g.name}</strong>
                        </td>
                        <td>{g.unit}</td>
                        <td>
                          <span className="fg-page-qty">{g.qty}</span>
                        </td>
                        <td>{formatDate(g.receivedAt)}</td>
                        <td>
                          <div className="fg-page-status-row">
                            {g.status === "handed_over" || g.handedOver ? (
                              <span className="admin-status admin-status-blue">
                                Đã bàn giao
                              </span>
                            ) : (
                              <>
                                <span className="admin-status admin-status-green">
                                  Trong kho
                                </span>
                                <button
                                  type="button"
                                  className="admin-button-action admin-button-action-purple"
                                  onClick={() => deliverToCustomer(g)}
                                >
                                  <Truck
                                    size={13}
                                    strokeWidth={2}
                                    style={{ marginRight: 4 }}
                                  />
                                  Bàn giao cho khách hàng
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            {inventoryGoods.length > 5 && (
              <button
                className="admin-view-more"
                onClick={() => setShowAllInventory(!showAllInventory)}
              >
                {showAllInventory ? (
                  <>
                    <ChevronUp
                      size={14}
                      strokeWidth={2}
                      style={{ marginRight: 4 }}
                    />
                    Thu gọn
                  </>
                ) : (
                  <>
                    <ChevronDown
                      size={14}
                      strokeWidth={2}
                      style={{ marginRight: 4 }}
                    />
                    Xem thêm ({inventoryGoods.length - 5} mục nữa)
                  </>
                )}
              </button>
            )}
          </>
        )}
      </AdminCard>

      {/* ── Lịch sử báo cáo SX ───────────────────────────────────────────────── */}
      <AdminCard
        gradient="blue"
        title="Lịch sử báo cáo sản xuất"
        icon={<ChartNoAxesColumn size={18} strokeWidth={2} />}
      >
        {productionReports.length === 0 ? (
          <p className="empty-state">Chưa có báo cáo nào.</p>
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Sản phẩm</th>
                    <th>SL hoàn thành</th>
                    <th>Phế liệu</th>
                    <th>Ghi chú</th>
                    <th>Ngày báo cáo</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedProductionReports
                    .slice(0, showAllReports ? undefined : 5)
                    .map((r, i) => (
                      <tr key={r.id}>
                        <td>{i + 1}</td>
                        <td>
                          <strong>{r.productName}</strong>
                        </td>
                        <td>
                          <span className="admin-status admin-status-green">
                            {r.finishedQty} cái
                          </span>
                        </td>
                        <td>
                          {r.scrapItems?.length > 0 ? (
                            <ul className="material-list-inline">
                              {r.scrapItems.map((s, si) => (
                                <li key={si}>
                                  {s.name}: {s.qty} {s.unit}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="admin-status admin-status-gray">Không có</span>
                          )}
                        </td>
                        <td>{r.note || "—"}</td>
                        <td>{formatDate(r.createdAt)}</td>
                        <td>
                          {r.status === "handed_over" ? (
                            <span className="admin-status admin-status-blue">
                              Đã bàn giao
                            </span>
                          ) : r.status === "delivered" ||
                            r.status === "in_warehouse" ? (
                            <span className="admin-status admin-status-green">
                              Đang trong kho
                            </span>
                          ) : (
                            <span className="admin-status admin-status-yellow">
                              Chờ thủ kho
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            {productionReports.length > 5 && (
              <button
                className="admin-view-more"
                onClick={() => setShowAllReports(!showAllReports)}
              >
                {showAllReports ? (
                  <>
                    <ChevronUp
                      size={14}
                      strokeWidth={2}
                      style={{ marginRight: 4 }}
                    />
                    Thu gọn
                  </>
                ) : (
                  <>
                    <ChevronDown
                      size={14}
                      strokeWidth={2}
                      style={{ marginRight: 4 }}
                    />
                    Xem thêm ({productionReports.length - 5} mục nữa)
                  </>
                )}
              </button>
            )}
          </>
        )}
      </AdminCard>

      {/* ── Phế liệu tổng hợp ───────────────────────────────────────────────── */}
      {productionReports.some((r) => r.scrapItems?.length > 0) && (
        <AdminCard
          title="Tổng hợp phế liệu"
          icon={<Recycle size={18} strokeWidth={2} />}
        >
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tên phế liệu</th>
                  <th>Tổng số lượng</th>
                  <th>Đơn vị</th>
                  <th>Từ sản phẩm</th>
                </tr>
              </thead>
              <tbody>
                {productionReports
                  .filter((r) => r.scrapItems?.length > 0)
                  .flatMap((r) =>
                    r.scrapItems.map((s, i) => ({
                      ...s,
                      product: r.productName,
                      reportId: r.id + "_" + i,
                    })),
                  )
                  .map((s) => (
                    <tr key={s.reportId}>
                      <td>
                        <strong>{s.name}</strong>
                      </td>
                      <td>{s.qty}</td>
                      <td>{s.unit}</td>
                      <td>{s.product}</td>
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
