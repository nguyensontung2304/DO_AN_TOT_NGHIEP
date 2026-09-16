import { useState } from "react";
import { useApp } from "../../../context/useApp";
import "../Technical/technical.scss";
import "./warehouse.scss";

function StatusBadge({ status }) {
  const map = {
    pending:       { label: "Chờ thủ kho",   cls: "badge--yellow"  },
    checked:       { label: "Đã kiểm kê",     cls: "badge--blue"    },
    purchasing:    { label: "Đang mua hàng",  cls: "badge--orange"  },
    ready:         { label: "Sẵn sàng SX",    cls: "badge--teal"    },
    in_production: { label: "Đang SX",        cls: "badge--purple"  },
    done:          { label: "Hoàn thành",     cls: "badge--green"   },
  };
  const s = map[status] || { label: status, cls: "badge--gray" };
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}

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

export default function Warehouse() {
  const {
    materials,
    addMaterial,
    updateMaterialStock,
    productionRequests,
    updateProductionRequestStatus,
    purchaseRequests,
    updatePurchaseRequestStatus,
    addPurchaseRequest,
    handoverOrders,
    addHandoverOrder,
    updateHandoverOrderStatus,
    productionReports,
    updateProductionReportStatus,
    receiveFinishedGoods,
    finishedGoods,
  } = useApp();

  // ── 1. Thêm vật tư vào kho ─────────────────────────────────────────────────
  const [matForm, setMatForm] = useState({ name: "", unit: "", stock: "" });
  const [matMsg, setMatMsg] = useState("");

  const handleAddMaterial = (e) => {
    e.preventDefault();
    if (!matForm.name.trim() || !matForm.unit.trim() || !matForm.stock) return;
    addMaterial({ name: matForm.name.trim(), unit: matForm.unit.trim(), stock: Number(matForm.stock) });
    setMatForm({ name: "", unit: "", stock: "" });
    setMatMsg("✅ Đã thêm vật tư!");
    setTimeout(() => setMatMsg(""), 2500);
  };

  // ── 2. Kiểm kê yêu cầu SX từ Kỹ thuật ────────────────────────────────────
  const pendingRequests = productionRequests.filter((r) => r.status === "pending");

  // Tính thiếu/đủ cho từng yêu cầu
  const checkStock = (req) =>
    req.materials.map((m) => {
      const mat = materials.find((x) => x.id === m.materialId);
      const inStock = mat ? mat.stock : 0;
      const lacking = Math.max(0, m.requiredQty - inStock);
      return { ...m, inStock, lacking };
    });

  const handleSendToPurchasing = (req) => {
    const checked = checkStock(req);
    const lacking = checked.filter((m) => m.lacking > 0);
    if (lacking.length === 0) {
      // đủ hàng, chuyển thẳng sang sẵn sàng SX
      updateProductionRequestStatus(req.id, "ready");
      return;
    }
    addPurchaseRequest({
      productionRequestId: req.id,
      productName: req.productName,
      items: lacking.map((m) => ({
        materialId: m.materialId,
        materialName: m.materialName,
        unit: m.unit,
        qtyNeeded: m.requiredQty,
        qtyInStock: m.inStock,
        qtyToBuy: m.lacking,
      })),
    });
    updateProductionRequestStatus(req.id, "purchasing");
  };

  // ── 3. Nhập kho sau khi mua về ────────────────────────────────────────────
  const purchasedOrders = purchaseRequests.filter((r) => r.status === "purchased");

  const handleStockIn = (pr) => {
    // cộng số lượng đã mua vào tồn kho
    pr.items.forEach((item) => updateMaterialStock(item.materialId, item.qtyToBuy));
    updatePurchaseRequestStatus(pr.id, "stocked");
    // kiểm tra lại xem yêu cầu SX đã đủ chưa
    const req = productionRequests.find((r) => r.id === pr.productionRequestId);
    if (req) updateProductionRequestStatus(req.id, "ready");
  };

  // ── 4. Tạo phiếu bàn giao cho Nhà máy ────────────────────────────────────
  const readyRequests = productionRequests.filter((r) => r.status === "ready");

  const handleHandover = (req) => {
    addHandoverOrder({
      productionRequestId: req.id,
      productName: req.productName,
      productQty: req.productQty,
      materials: req.materials.map((m) => ({
        materialId: m.materialId,
        materialName: m.materialName,
        unit: m.unit,
        qty: m.requiredQty,
      })),
    });
    // trừ kho
    req.materials.forEach((m) => updateMaterialStock(m.materialId, -m.requiredQty));
    updateProductionRequestStatus(req.id, "in_production");
  };

  // ── 5. Nhận thành phẩm từ Nhà máy ────────────────────────────────────────
  const reportedReports = productionReports.filter((r) => r.status === "reported");

  const handleReceive = (report) => {
    receiveFinishedGoods([{ name: report.productName, qty: report.finishedQty, unit: "cái" }]);
    updateProductionReportStatus(report.id, "delivered");
    const ho = handoverOrders.find((o) => o.id === report.handoverOrderId);
    if (ho) updateHandoverOrderStatus(ho.id, "done");
  };

  return (
    <div className="warehouse-page">
      <div className="page-header">
        <h1>🏭 Thủ kho</h1>
        <p className="page-sub">Kiểm kê, nhập kho, bàn giao và nhận thành phẩm</p>
      </div>

      {/* ── Tổng quan tồn kho ──────────────────────────────────────────────── */}
      <div className="wh-summary">
        <div className="wh-summary__card">
          <strong>{materials.length}</strong>
          <span>Loại vật tư</span>
        </div>
        <div className="wh-summary__card wh-summary__card--yellow">
          <strong>{pendingRequests.length}</strong>
          <span>Yêu cầu chờ kiểm kê</span>
        </div>
        <div className="wh-summary__card wh-summary__card--blue">
          <strong>{purchasedOrders.length}</strong>
          <span>Hàng đã mua - chờ nhập</span>
        </div>
        <div className="wh-summary__card wh-summary__card--green">
          <strong>{finishedGoods.reduce((s, g) => s + g.qty, 0)}</strong>
          <span>Thành phẩm tổng</span>
        </div>
      </div>

      {/* ── 1. Kho vật tư ──────────────────────────────────────────────────── */}
      <AdminCard title="Kho vật tư" icon="📦">
        <form className="wh-mat-form" onSubmit={handleAddMaterial}>
          <input
            placeholder="Tên vật tư"
            value={matForm.name}
            onChange={(e) => setMatForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <input
            placeholder="Đơn vị (tấm, kg, hộp...)"
            value={matForm.unit}
            onChange={(e) => setMatForm((f) => ({ ...f, unit: e.target.value }))}
            required
          />
          <input
            type="number"
            min="0"
            placeholder="Tồn kho ban đầu"
            value={matForm.stock}
            onChange={(e) => setMatForm((f) => ({ ...f, stock: e.target.value }))}
            required
          />
          <button type="submit" className="btn-submit">+ Thêm</button>
        </form>
        {matMsg && <p className="form-success" style={{ marginTop: "10px" }}>{matMsg}</p>}

        <div className="table-wrap" style={{ marginTop: "16px" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tên vật tư</th>
                <th>Đơn vị</th>
                <th>Tồn kho</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((m, i) => (
                <tr key={m.id}>
                  <td>{i + 1}</td>
                  <td><strong>{m.name}</strong></td>
                  <td>{m.unit}</td>
                  <td>
                    <span className={`wh-stock ${m.stock <= 5 ? "wh-stock--low" : ""}`}>
                      {m.stock}
                    </span>
                  </td>
                  <td>
                    {m.stock <= 5
                      ? <span className="badge badge--red">Sắp hết</span>
                      : <span className="badge badge--green">Còn hàng</span>}
                  </td>
                </tr>
              ))}
              {materials.length === 0 && (
                <tr><td colSpan={5} className="empty-state">Chưa có vật tư nào.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>

      {/* ── 2. Kiểm kê yêu cầu SX ─────────────────────────────────────────── */}
      <AdminCard title="Kiểm kê yêu cầu sản xuất từ Kỹ thuật" icon="🔍">
        {pendingRequests.length === 0 ? (
          <p className="empty-state">Không có yêu cầu mới từ Kỹ thuật.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Sản phẩm</th>
                  <th>SL SX</th>
                  <th>Kiểm kê vật tư</th>
                  <th>Kết quả</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map((req, i) => {
                  const checked = checkStock(req);
                  const hasLack = checked.some((m) => m.lacking > 0);
                  return (
                    <tr key={req.id}>
                      <td>{i + 1}</td>
                      <td><strong>{req.productName}</strong></td>
                      <td>{req.productQty}</td>
                      <td>
                        <ul className="material-list-inline">
                          {checked.map((m, mi) => (
                            <li key={mi} className={m.lacking > 0 ? "wh-lack" : "wh-ok"}>
                              {m.materialName}: cần <strong>{m.requiredQty}</strong> {m.unit}
                              {" · "}tồn <strong>{m.inStock}</strong>
                              {m.lacking > 0 && (
                                <span className="wh-lack-tag"> ⚠️ thiếu {m.lacking}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td>
                        {hasLack
                          ? <span className="badge badge--red">Thiếu vật tư</span>
                          : <span className="badge badge--green">Đủ hàng</span>}
                      </td>
                      <td>
                        {hasLack ? (
                          <button
                            className="btn-action btn-action--orange"
                            onClick={() => handleSendToPurchasing(req)}
                          >
                            🛒 Gửi mua hàng
                          </button>
                        ) : (
                          <button
                            className="btn-action btn-action--green"
                            onClick={() => handleSendToPurchasing(req)}
                          >
                            ✅ Đủ — Sẵn sàng SX
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {/* ── 3. Nhập kho hàng đã mua ─────────────────────────────────────────── */}
      <AdminCard title="Nhập kho hàng vừa mua về" icon="📥">
        {purchasedOrders.length === 0 ? (
          <p className="empty-state">Chưa có lô hàng nào được xác nhận mua.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Sản phẩm SX</th>
                  <th>Vật tư nhập kho</th>
                  <th>Ngày mua</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {purchasedOrders.map((pr, i) => (
                  <tr key={pr.id}>
                    <td>{i + 1}</td>
                    <td><strong>{pr.productName}</strong></td>
                    <td>
                      <ul className="material-list-inline">
                        {pr.items.map((item, ii) => (
                          <li key={ii}>
                            {item.materialName}: <strong>+{item.qtyToBuy} {item.unit}</strong>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td>{pr.createdAt}</td>
                    <td>
                      <button className="btn-action btn-action--blue" onClick={() => handleStockIn(pr)}>
                        📥 Nhập kho
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {/* ── 4. Tạo phiếu bàn giao cho Nhà máy ──────────────────────────────── */}
      <AdminCard title="Bàn giao vật tư cho Nhà máy" icon="🚚">
        {readyRequests.length === 0 ? (
          <p className="empty-state">Chưa có yêu cầu nào sẵn sàng sản xuất.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Sản phẩm</th>
                  <th>SL SX</th>
                  <th>Vật tư bàn giao</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {readyRequests.map((req, i) => (
                  <tr key={req.id}>
                    <td>{i + 1}</td>
                    <td><strong>{req.productName}</strong></td>
                    <td>{req.productQty}</td>
                    <td>
                      <ul className="material-list-inline">
                        {req.materials.map((m, mi) => (
                          <li key={mi}>{m.materialName}: <strong>{m.requiredQty} {m.unit}</strong></li>
                        ))}
                      </ul>
                    </td>
                    <td>
                      <button className="btn-action btn-action--purple" onClick={() => handleHandover(req)}>
                        🏭 Bàn giao NM
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {/* ── 5. Nhận thành phẩm từ Nhà máy ──────────────────────────────────── */}
      <AdminCard title="Nhận thành phẩm từ Nhà máy" icon="🎁">
        {reportedReports.length === 0 ? (
          <p className="empty-state">Chưa có thành phẩm nào chờ nhận.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Sản phẩm</th>
                  <th>SL hoàn thành</th>
                  <th>Phế liệu</th>
                  <th>Ghi chú NM</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {reportedReports.map((r, i) => (
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
                      ) : "Không có"}
                    </td>
                    <td>{r.note || "—"}</td>
                    <td>
                      <button className="btn-action btn-action--green" onClick={() => handleReceive(r)}>
                        ✅ Nhận vào kho
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {/* ── Tất cả yêu cầu SX ─────────────────────────────────────────────── */}
      <AdminCard title="Toàn bộ yêu cầu sản xuất" icon="📋">
        {productionRequests.length === 0 ? (
          <p className="empty-state">Chưa có yêu cầu nào.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Sản phẩm</th>
                  <th>SL</th>
                  <th>Ngày tạo</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {productionRequests.map((r, i) => (
                  <tr key={r.id}>
                    <td>{i + 1}</td>
                    <td><strong>{r.productName}</strong></td>
                    <td>{r.productQty}</td>
                    <td>{r.createdAt}</td>
                    <td><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  );
}
