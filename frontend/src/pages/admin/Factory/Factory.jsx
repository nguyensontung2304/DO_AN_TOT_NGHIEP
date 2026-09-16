import { useState } from "react";
import { useApp } from "../../../context/useApp";
import "../Technical/technical.scss";
import "./factory.scss";

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

function HandoverStatusBadge({ status }) {
  const map = {
    pending:       { label: "Chờ nhận",    cls: "badge--yellow" },
    accepted:      { label: "Đã nhận",     cls: "badge--blue"   },
    in_production: { label: "Đang SX",     cls: "badge--purple" },
    done:          { label: "Hoàn thành",  cls: "badge--green"  },
  };
  const s = map[status] || { label: status, cls: "badge--gray" };
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}

// Scrap row trong form báo cáo
function ScrapRow({ row, index, onChange, onRemove }) {
  return (
    <div className="factory-scrap-row">
      <input
        placeholder="Tên phế liệu"
        value={row.name}
        onChange={(e) => onChange(index, { ...row, name: e.target.value })}
      />
      <input
        type="number"
        min="0"
        placeholder="Số lượng"
        value={row.qty}
        onChange={(e) => onChange(index, { ...row, qty: e.target.value })}
      />
      <input
        placeholder="Đơn vị"
        value={row.unit}
        onChange={(e) => onChange(index, { ...row, unit: e.target.value })}
      />
      <button className="btn-icon btn-icon--danger" onClick={() => onRemove(index)}>🗑️</button>
    </div>
  );
}

export default function Factory() {
  const {
    handoverOrders,
    updateHandoverOrderStatus,
    designRequests,
    addDesignRequest,
    addProductionReport,
    productionReports,
  } = useApp();

  // Nhận phiếu bàn giao
  const pendingHandovers  = handoverOrders.filter((o) => o.status === "pending");
  const acceptedHandovers = handoverOrders.filter((o) => o.status === "accepted" || o.status === "in_production");
  const doneHandovers     = handoverOrders.filter((o) => o.status === "done");

  const handleAccept = (order) => updateHandoverOrderStatus(order.id, "accepted");

  // Yêu cầu bản thiết kế
  const [designForm, setDesignForm] = useState({});
  const handleRequestDesign = (order) => {
    const note = designForm[order.id] || "";
    addDesignRequest({ handoverOrderId: order.id, productName: order.productName, note });
    updateHandoverOrderStatus(order.id, "in_production");
    setDesignForm((f) => ({ ...f, [order.id]: "" }));
  };

  // Báo cáo sản xuất
  const [reportForms, setReportForms] = useState({});
  const [reportMsgs, setReportMsgs] = useState({});

  const getReportForm = (orderId) =>
    reportForms[orderId] || { finishedQty: "", note: "", scraps: [] };

  const updateReportForm = (orderId, val) =>
    setReportForms((f) => ({ ...f, [orderId]: val }));

  const addScrap = (orderId) => {
    const form = getReportForm(orderId);
    updateReportForm(orderId, {
      ...form,
      scraps: [...form.scraps, { name: "", qty: "", unit: "" }],
    });
  };

  const updateScrap = (orderId, i, val) => {
    const form = getReportForm(orderId);
    updateReportForm(orderId, {
      ...form,
      scraps: form.scraps.map((s, idx) => (idx === i ? val : s)),
    });
  };

  const removeScrap = (orderId, i) => {
    const form = getReportForm(orderId);
    updateReportForm(orderId, {
      ...form,
      scraps: form.scraps.filter((_, idx) => idx !== i),
    });
  };

  const handleSubmitReport = (order) => {
    const form = getReportForm(order.id);
    if (!form.finishedQty || Number(form.finishedQty) <= 0) return;
    const validScraps = form.scraps.filter((s) => s.name.trim() && s.qty > 0);
    addProductionReport({
      handoverOrderId: order.id,
      productName: order.productName,
      finishedQty: Number(form.finishedQty),
      scrapItems: validScraps.map((s) => ({
        name: s.name.trim(),
        qty: Number(s.qty),
        unit: s.unit.trim() || "cái",
      })),
      note: form.note.trim(),
    });
    setReportMsgs((m) => ({ ...m, [order.id]: "✅ Đã gửi báo cáo cho Thủ kho!" }));
    setTimeout(
      () => setReportMsgs((m) => ({ ...m, [order.id]: "" })),
      3000
    );
    updateReportForm(order.id, { finishedQty: "", note: "", scraps: [] });
  };

  // Kiểm tra đã có báo cáo cho order chưa
  const hasReport = (orderId) =>
    productionReports.some((r) => r.handoverOrderId === orderId);

  // Design requests map
  const designByHandover = {};
  designRequests.forEach((r) => {
    designByHandover[r.handoverOrderId] = r;
  });

  return (
    <div className="factory-page">
      <div className="page-header">
        <h1>🔧 Nhà máy Sản xuất</h1>
        <p className="page-sub">Nhận bàn giao, yêu cầu bản thiết kế, báo cáo sản xuất và bàn giao thành phẩm</p>
      </div>

      {/* Stats */}
      <div className="factory-summary">
        <div className="factory-summary__card factory-summary__card--yellow">
          <strong>{pendingHandovers.length}</strong>
          <span>Phiếu bàn giao mới</span>
        </div>
        <div className="factory-summary__card factory-summary__card--purple">
          <strong>{acceptedHandovers.length}</strong>
          <span>Đang sản xuất</span>
        </div>
        <div className="factory-summary__card factory-summary__card--green">
          <strong>{doneHandovers.length}</strong>
          <span>Đã hoàn thành</span>
        </div>
        <div className="factory-summary__card">
          <strong>{productionReports.length}</strong>
          <span>Báo cáo đã gửi</span>
        </div>
      </div>

      {/* ── 1. Phiếu bàn giao chờ nhận ─────────────────────────────────────── */}
      <AdminCard title="Phiếu bàn giao từ Thủ kho" icon="📬">
        {pendingHandovers.length === 0 ? (
          <p className="empty-state">Không có phiếu bàn giao mới.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Sản phẩm</th>
                  <th>SL SX</th>
                  <th>Vật tư nhận</th>
                  <th>Ngày bàn giao</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {pendingHandovers.map((order, i) => (
                  <tr key={order.id}>
                    <td>{i + 1}</td>
                    <td><strong>{order.productName}</strong></td>
                    <td>{order.productQty}</td>
                    <td>
                      <ul className="material-list-inline">
                        {order.materials.map((m, mi) => (
                          <li key={mi}>{m.materialName}: <strong>{m.qty} {m.unit}</strong></li>
                        ))}
                      </ul>
                    </td>
                    <td>{order.createdAt}</td>
                    <td>
                      <button className="btn-action btn-action--blue" onClick={() => handleAccept(order)}>
                        📬 Xác nhận nhận
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {/* ── 2. Đang sản xuất ────────────────────────────────────────────────── */}
      <AdminCard title="Đang sản xuất" icon="⚡">
        {acceptedHandovers.length === 0 ? (
          <p className="empty-state">Không có đơn hàng đang sản xuất.</p>
        ) : (
          acceptedHandovers.map((order) => {
            const design = designByHandover[order.id];
            const form   = getReportForm(order.id);
            const reported = hasReport(order.id);

            return (
              <div key={order.id} className="factory-order-panel">
                <div className="factory-order-panel__title">
                  <strong>{order.productName}</strong>
                  <span>— {order.productQty} sản phẩm</span>
                  <HandoverStatusBadge status={order.status} />
                </div>

                {/* Yêu cầu bản thiết kế */}
                {!design && (
                  <div className="factory-design-request">
                    <p className="factory-section-label">📐 Yêu cầu bản thiết kế từ Kỹ thuật</p>
                    <div className="factory-design-row">
                      <textarea
                        rows={2}
                        placeholder="Ghi chú yêu cầu (thông số kỹ thuật, kích thước...)"
                        value={designForm[order.id] || ""}
                        onChange={(e) =>
                          setDesignForm((f) => ({ ...f, [order.id]: e.target.value }))
                        }
                      />
                      <button
                        className="btn-action btn-action--orange"
                        onClick={() => handleRequestDesign(order)}
                      >
                        📤 Gửi yêu cầu bản vẽ
                      </button>
                    </div>
                  </div>
                )}

                {design && (
                  <div className={`factory-design-info ${design.status === "provided" ? "factory-design-info--done" : ""}`}>
                    <p className="factory-section-label">
                      📐 Bản thiết kế:{" "}
                      {design.status === "provided"
                        ? <span className="badge badge--green">Đã nhận</span>
                        : <span className="badge badge--yellow">Chờ Kỹ thuật cung cấp</span>}
                    </p>
                    {design.status === "provided" && (
                      <p className="factory-design-note">📄 {design.designNote}</p>
                    )}
                  </div>
                )}

                {/* Báo cáo sản xuất */}
                {!reported ? (
                  <div className="factory-report-form">
                    <p className="factory-section-label">📊 Báo cáo kết quả sản xuất</p>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Số lượng hoàn thành <span className="req">*</span></label>
                        <input
                          type="number"
                          min="1"
                          placeholder="VD: 9"
                          value={form.finishedQty}
                          onChange={(e) =>
                            updateReportForm(order.id, { ...form, finishedQty: e.target.value })
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>Ghi chú</label>
                        <input
                          placeholder="Ghi chú quá trình SX..."
                          value={form.note}
                          onChange={(e) =>
                            updateReportForm(order.id, { ...form, note: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Phế liệu phát sinh</label>
                      <div className="factory-scrap-list">
                        {form.scraps.length > 0 && (
                          <div className="factory-scrap-list__head">
                            <span>Tên phế liệu</span>
                            <span>Số lượng</span>
                            <span>Đơn vị</span>
                            <span></span>
                          </div>
                        )}
                        {form.scraps.map((s, i) => (
                          <ScrapRow
                            key={i}
                            row={s}
                            index={i}
                            onChange={(idx, val) => updateScrap(order.id, idx, val)}
                            onRemove={(idx) => removeScrap(order.id, idx)}
                          />
                        ))}
                        <button
                          type="button"
                          className="btn-add-row"
                          onClick={() => addScrap(order.id)}
                        >
                          + Thêm phế liệu
                        </button>
                      </div>
                    </div>

                    {reportMsgs[order.id] && (
                      <p className="form-success">{reportMsgs[order.id]}</p>
                    )}

                    <button
                      className="btn-submit"
                      disabled={!form.finishedQty || Number(form.finishedQty) <= 0}
                      onClick={() => handleSubmitReport(order)}
                    >
                      📤 Gửi báo cáo cho Thủ kho
                    </button>
                  </div>
                ) : (
                  <p className="form-success" style={{ marginTop: "16px" }}>
                    ✅ Đã gửi báo cáo sản xuất — chờ Thủ kho nhận thành phẩm.
                  </p>
                )}
              </div>
            );
          })
        )}
      </AdminCard>

      {/* ── 3. Lịch sử đã hoàn thành ────────────────────────────────────────── */}
      {doneHandovers.length > 0 && (
        <AdminCard title="Lịch sử sản xuất hoàn thành" icon="✅">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Sản phẩm</th>
                  <th>SL</th>
                  <th>Ngày bàn giao</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {doneHandovers.map((o, i) => (
                  <tr key={o.id}>
                    <td>{i + 1}</td>
                    <td><strong>{o.productName}</strong></td>
                    <td>{o.productQty}</td>
                    <td>{o.createdAt}</td>
                    <td><HandoverStatusBadge status={o.status} /></td>
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
