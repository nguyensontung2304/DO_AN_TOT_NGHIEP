import { useApp } from "../../../context/useApp";
import "../Technical/technical.scss";
import "./finishedGoods.scss";

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

export default function FinishedGoods() {
  const { finishedGoods, productionReports } = useApp();

  const totalQty   = finishedGoods.reduce((s, g) => s + g.qty, 0);
  const totalTypes = finishedGoods.length;
  const delivered  = productionReports.filter((r) => r.status === "delivered").length;

  return (
    <div className="fg-page">
      <div className="page-header">
        <h1>📦 Kho Thành phẩm</h1>
        <p className="page-sub">Tổng hợp thành phẩm đã sản xuất và bàn giao từ Nhà máy</p>
      </div>

      {/* Stats */}
      <div className="fg-summary">
        <div className="fg-summary__card fg-summary__card--green">
          <strong>{totalQty}</strong>
          <span>Tổng sản phẩm</span>
        </div>
        <div className="fg-summary__card fg-summary__card--blue">
          <strong>{totalTypes}</strong>
          <span>Loại sản phẩm</span>
        </div>
        <div className="fg-summary__card">
          <strong>{delivered}</strong>
          <span>Lô đã nhận</span>
        </div>
        <div className="fg-summary__card fg-summary__card--purple">
          <strong>{productionReports.reduce((s, r) => s + (r.scrapItems?.length || 0), 0)}</strong>
          <span>Loại phế liệu ghi nhận</span>
        </div>
      </div>

      {/* ── Tồn kho thành phẩm ──────────────────────────────────────────────── */}
      <AdminCard title="Tồn kho thành phẩm" icon="🏪">
        {finishedGoods.length === 0 ? (
          <p className="empty-state">
            Chưa có thành phẩm nào trong kho.<br />
            <small>Thành phẩm sẽ xuất hiện khi Thủ kho xác nhận nhận hàng từ Nhà máy.</small>
          </p>
        ) : (
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
                {finishedGoods.map((g, i) => (
                  <tr key={g.id}>
                    <td>{i + 1}</td>
                    <td><strong>{g.name}</strong></td>
                    <td>{g.unit}</td>
                    <td>
                      <span className="fg-qty">{g.qty}</span>
                    </td>
                    <td>{g.receivedAt}</td>
                    <td><span className="badge badge--green">Trong kho</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {/* ── Lịch sử báo cáo SX ───────────────────────────────────────────────── */}
      <AdminCard title="Lịch sử báo cáo sản xuất" icon="📊">
        {productionReports.length === 0 ? (
          <p className="empty-state">Chưa có báo cáo nào.</p>
        ) : (
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
                {productionReports.map((r, i) => (
                  <tr key={r.id}>
                    <td>{i + 1}</td>
                    <td><strong>{r.productName}</strong></td>
                    <td><span className="badge badge--green">{r.finishedQty} cái</span></td>
                    <td>
                      {r.scrapItems?.length > 0 ? (
                        <ul className="material-list-inline">
                          {r.scrapItems.map((s, si) => (
                            <li key={si}>{s.name}: {s.qty} {s.unit}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="badge badge--gray">Không có</span>
                      )}
                    </td>
                    <td>{r.note || "—"}</td>
                    <td>{r.createdAt}</td>
                    <td>
                      {r.status === "delivered"
                        ? <span className="badge badge--green">Đã bàn giao</span>
                        : <span className="badge badge--yellow">Chờ thủ kho</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {/* ── Phế liệu tổng hợp ───────────────────────────────────────────────── */}
      {productionReports.some((r) => r.scrapItems?.length > 0) && (
        <AdminCard title="Tổng hợp phế liệu" icon="♻️">
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
                    }))
                  )
                  .map((s) => (
                    <tr key={s.reportId}>
                      <td><strong>{s.name}</strong></td>
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
