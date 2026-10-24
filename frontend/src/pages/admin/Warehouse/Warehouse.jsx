import { useState } from "react";
import {
  Warehouse as WarehouseIcon,
  Package,
  Search,
  Download,
  Truck,
  Gift,
  ClipboardList,
  ShoppingCart,
  Pencil,
  Trash2,
  Save,
  X,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { formatDate } from "../../../utils/formatDate";
import { useApp } from "../../../context/useApp";
import "../Technical/technical.scss";
import "./warehouse.scss";

function StatusBadge({ status }) {
  const map = {
    pending: { label: "Chờ thủ kho", cls: "badge--yellow" },
    checked: { label: "Đã kiểm kê", cls: "badge--blue" },
    purchasing: { label: "Đang mua hàng", cls: "badge--orange" },
    ready: { label: "Sẵn sàng sản xuất", cls: "badge--teal" },
    in_production: { label: "Đang sản xuất", cls: "badge--purple" },
    done: { label: "Hoàn thành", cls: "badge--green" },
  };
  const s = map[status] || { label: status, cls: "badge--gray" };
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}

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

export default function Warehouse() {
  const {
    materials,
    addMaterial,
    updateMaterialStock,
    updateMaterial,
    removeMaterial,
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

  // 1. Thêm vật tư vào kho─
  const [matForm, setMatForm] = useState({ name: "", unit: "", stock: "" });
  const [matMsg, setMatMsg] = useState("");

  // Sửa / xoá từng vật tư
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", unit: "", stock: "" });
  const [rowMsg, setRowMsg] = useState("");

  // View more state
  const [showAllAll, setShowAllAll] = useState(false);

  const flash = (msg) => {
    setRowMsg(msg);
    setTimeout(() => setRowMsg(""), 2500);
  };

  const startEdit = (m) => {
    setEditId(m.id);
    setEditForm({ name: m.name, unit: m.unit, stock: String(m.stock) });
  };

  const saveEdit = async (id) => {
    if (!editForm.name.trim() || !editForm.unit.trim()) {
      flash("⚠️ Tên và đơn vị không được để trống");
      return;
    }
    try {
      await updateMaterial(id, {
        name: editForm.name.trim(),
        unit: editForm.unit.trim(),
        stock: Number(editForm.stock) || 0,
      });
      setEditId(null);
      flash("✅ Đã cập nhật vật tư");
    } catch {
      flash("❌ Không cập nhật được vật tư");
    }
  };

  const handleDeleteMaterial = async (m) => {
    if (!window.confirm(`Xoá vật tư "${m.name}" khỏi kho?`)) return;
    try {
      await removeMaterial(m.id);
      flash("✅ Đã xoá vật tư");
    } catch {
      flash("❌ Không xoá được vật tư");
    }
  };

  // Mua thẳng 1 vật tư đang thiếu (click vào dòng vật tư)
  const handleBuyMaterial = (m) => {
    const target = Number(
      window.prompt(`Cần mua bao nhiêu ${m.unit} ${m.name}?`, "10"),
    );
    if (!target || target <= 0) return;

    addPurchaseRequest({
      productName: `Nhập kho: ${m.name}`,
      items: [
        {
          materialId: m.id,
          materialName: m.name,
          unit: m.unit,
          qtyNeeded: target,
          qtyInStock: m.stock,
          qtyToBuy: target,
        },
      ],
    });
    flash(
      `🛒 Đã tạo đơn mua ${target} ${m.unit} ${m.name} — chuyển sang bộ phận Mua hàng`,
    );
  };

  const handleAddMaterial = (e) => {
    e.preventDefault();
    if (!matForm.name.trim() || !matForm.unit.trim() || !matForm.stock) return;
    addMaterial({
      name: matForm.name.trim(),
      unit: matForm.unit.trim(),
      stock: Number(matForm.stock),
    });
    setMatForm({ name: "", unit: "", stock: "" });
    setMatMsg("✅ Đã thêm vật tư!");
    setTimeout(() => setMatMsg(""), 2500);
  };

  // 2. Kiểm kê yêu cầu SX từ Kỹ thuật
  const pendingRequests = productionRequests.filter(
    (r) => r.status === "pending",
  );

  // Tính thiếu/đủ cho từng yêu cầu
  const checkStock = (req) =>
    (req.materials || []).map((m) => {
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

  // 3. Nhập kho sau khi mua về
  const purchasedOrders = purchaseRequests.filter(
    (r) => r.status === "purchased",
  );

  const handleStockIn = (pr) => {
    // Cộng số lượng đã mua vào tồn kho
    pr.items.forEach((item) =>
      updateMaterialStock(item.materialId, item.qtyToBuy),
    );
    updatePurchaseRequestStatus(pr.id, "stocked");
    if (pr.productionRequestId != null) {
      updateProductionRequestStatus(pr.productionRequestId, "pending");
    }
    flash("📥 Đã nhập kho và cộng vào tồn");
  };

  // 4. Tạo phiếu bàn giao cho Nhà máy
  const readyRequests = productionRequests.filter((r) => r.status === "ready");

  const handleHandover = (req) => {
    addHandoverOrder({
      productionRequestId: req.id,
      productName: req.productName,
      productQty: req.productQty,
      materials: (req.materials || []).map((m) => ({
        materialId: m.materialId,
        materialName: m.materialName,
        unit: m.unit,
        qty: m.requiredQty,
      })),
    });
    // trừ kho
    (req.materials || []).forEach((m) =>
      updateMaterialStock(m.materialId, -m.requiredQty),
    );
    updateProductionRequestStatus(req.id, "in_production");
  };

  // 5. Nhận thành phẩm từ Nhà máy
  const reportedReports = productionReports.filter(
    (r) => r.status === "reported",
  );

  const handleReceive = (report) => {
    receiveFinishedGoods(
      [{ name: report.productName, qty: report.finishedQty, unit: "cái" }],
      report.handoverOrderId,
    );
    updateProductionReportStatus(report.id, "in_warehouse");
    const ho = handoverOrders.find((o) => o.id === report.handoverOrderId);
    if (ho) updateHandoverOrderStatus(ho.id, "done");
  };

  return (
    <div className="warehouse-page">
      <div className="page-header">
        <h1>
          <WarehouseIcon
            size={24}
            strokeWidth={2}
            style={{ verticalAlign: "middle", marginRight: 8 }}
          />
          Thủ kho
        </h1>
        <p className="page-sub">
          Kiểm kê, nhập kho, bàn giao và nhận thành phẩm
        </p>
      </div>

      {/* Tổng quan tồn kho */}
      <div className="wh-summary">
        <div className="wh-summary__card wh-summary__card--purple">
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

      {/* 1. Kho vật tư  */}
      <AdminCard
        title="Kho vật tư"
        icon={<Package size={18} strokeWidth={2} />}
        gradient="pink"
      >
        <form className="wh-mat-form" onSubmit={handleAddMaterial}>
          <input
            placeholder="Tên vật tư"
            value={matForm.name}
            onChange={(e) =>
              setMatForm((f) => ({ ...f, name: e.target.value }))
            }
            required
          />
          <input
            placeholder="Đơn vị (tấm, kg, hộp...)"
            value={matForm.unit}
            onChange={(e) =>
              setMatForm((f) => ({ ...f, unit: e.target.value }))
            }
            required
          />
          <input
            type="number"
            min="0"
            placeholder="Tồn kho ban đầu"
            value={matForm.stock}
            onChange={(e) =>
              setMatForm((f) => ({ ...f, stock: e.target.value }))
            }
            required
          />
          <button type="submit" className="btn-submit">
            + Thêm
          </button>
        </form>
        {matMsg && (
          <p className="form-success" style={{ marginTop: "10px" }}>
            {matMsg}
          </p>
        )}
        {rowMsg && (
          <p className="form-success" style={{ marginTop: "10px" }}>
            {rowMsg}
          </p>
        )}

        <div className="table-wrap" style={{ marginTop: "16px" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tên vật tư</th>
                <th>Đơn vị</th>
                <th>Tồn kho</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((m, i) => (
                <tr key={m.id}>
                  <td>{i + 1}</td>
                  {editId === m.id ? (
                    <>
                      <td>
                        <input
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, name: e.target.value }))
                          }
                        />
                      </td>
                      <td>
                        <input
                          value={editForm.unit}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, unit: e.target.value }))
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={editForm.stock}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              stock: e.target.value,
                            }))
                          }
                        />
                      </td>
                      <td>—</td>
                      <td>
                        <div className="tech-notify-actions">
                          <button
                            className="btn-action btn-action--green"
                            onClick={() => saveEdit(m.id)}
                          >
                            <Save
                              size={13}
                              strokeWidth={2}
                              style={{ marginRight: 4 }}
                            />
                            Lưu
                          </button>
                          <button
                            className="btn-action btn-action--gray"
                            onClick={() => setEditId(null)}
                          >
                            <X
                              size={13}
                              strokeWidth={2}
                              style={{ marginRight: 4 }}
                            />
                            Huỷ
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>
                        <strong>{m.name}</strong>
                      </td>
                      <td>{m.unit}</td>
                      <td>
                        <span
                          className={`wh-stock ${m.stock <= 5 ? "wh-stock--low" : ""}`}
                        >
                          {m.stock}
                        </span>
                      </td>
                      <td>
                        {m.stock <= 5 ? (
                          <span className="badge badge--red">Sắp hết</span>
                        ) : (
                          <span className="badge badge--green">Còn hàng</span>
                        )}
                      </td>
                      <td>
                        <div className="tech-notify-actions">
                          <button
                            className="btn-action btn-action--orange"
                            onClick={() => handleBuyMaterial(m)}
                            title="Tạo đơn mua cho vật tư này"
                          >
                            <ShoppingCart
                              size={13}
                              strokeWidth={2}
                              style={{ marginRight: 4 }}
                            />
                            Mua
                          </button>
                          <button
                            className="btn-action btn-action--blue"
                            onClick={() => startEdit(m)}
                          >
                            <Pencil
                              size={13}
                              strokeWidth={2}
                              style={{ marginRight: 4 }}
                            />
                            Sửa
                          </button>
                          <button
                            className="btn-action btn-action--danger"
                            onClick={() => handleDeleteMaterial(m)}
                          >
                            <Trash2
                              size={13}
                              strokeWidth={2}
                              style={{ marginRight: 4 }}
                            />
                            Xoá
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {materials.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-state">
                    Chưa có vật tư nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>

      {/* 2. Kiểm kê yêu cầu SX─ */}
      <AdminCard
        title="Kiểm kê yêu cầu sản xuất từ Kỹ thuật"
        icon={<Search size={18} strokeWidth={2} />}
        gradient="teal"
      >
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
                      <td>
                        <strong>{req.productName}</strong>
                      </td>
                      <td>{req.productQty}</td>
                      <td>
                        <ul className="material-list-inline">
                          {checked.map((m, mi) => (
                            <li
                              key={mi}
                              className={m.lacking > 0 ? "wh-lack" : "wh-ok"}
                            >
                              {m.materialName}: cần{" "}
                              <strong>{m.requiredQty}</strong> {m.unit}
                              {" · "}tồn <strong>{m.inStock}</strong>
                              {m.lacking > 0 && (
                                <span className="wh-lack-tag">
                                  {" "}
                                  ⚠️ thiếu {m.lacking}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td>
                        {hasLack ? (
                          <span className="badge badge--red">Thiếu vật tư</span>
                        ) : (
                          <span className="badge badge--green">Đủ hàng</span>
                        )}
                      </td>
                      <td>
                        {hasLack ? (
                          <button
                            className="btn-action btn-action--orange"
                            onClick={() => handleSendToPurchasing(req)}
                          >
                            <ShoppingCart
                              size={13}
                              strokeWidth={2}
                              style={{ marginRight: 4 }}
                            />
                            Gửi mua hàng
                          </button>
                        ) : (
                          <button
                            className="btn-action btn-action--green"
                            onClick={() => handleSendToPurchasing(req)}
                          >
                            <CheckCircle
                              size={13}
                              strokeWidth={2}
                              style={{ marginRight: 4 }}
                            />
                            Đủ — Sẵn sàng SX
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

      {/* 3. Nhập kho hàng đã mua─ */}
      <AdminCard
        title="Nhập kho hàng vừa mua về"
        icon={<Download size={18} strokeWidth={2} />}
        gradient="orange"
      >
        {purchasedOrders.length === 0 ? (
          <p className="empty-state">
            Chưa có lô hàng nào chờ nhập. Hàng mua xong sẽ tự động vào kho.
          </p>
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
                    <td>
                      <strong>{pr.productName}</strong>
                    </td>
                    <td>
                      <ul className="material-list-inline">
                        {pr.items.map((item, ii) => (
                          <li key={ii}>
                            {item.materialName}:{" "}
                            <strong>
                              +{item.qtyToBuy} {item.unit}
                            </strong>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td>{formatDate(pr.createdAt)}</td>
                    <td>
                      <button
                        className="btn-action btn-action--blue"
                        onClick={() => handleStockIn(pr)}
                      >
                        <Download
                          size={13}
                          strokeWidth={2}
                          style={{ marginRight: 4 }}
                        />
                        Nhập kho ngay
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {/* 4. Tạo phiếu bàn giao cho Nhà máy */}
      <AdminCard
        title="Bàn giao vật tư cho Nhà máy"
        icon={<Truck size={18} strokeWidth={2} />}
        gradient="purple"
      >
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
                    <td>
                      <strong>{req.productName}</strong>
                    </td>
                    <td>{req.productQty}</td>
                    <td>
                      <ul className="material-list-inline">
                        {(req.materials || []).map((m, mi) => (
                          <li key={mi}>
                            {m.materialName}:{" "}
                            <strong>
                              {m.requiredQty} {m.unit}
                            </strong>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td>
                      <button
                        className="btn-action btn-action--purple"
                        onClick={() => handleHandover(req)}
                      >
                        <Truck
                          size={13}
                          strokeWidth={2}
                          style={{ marginRight: 4 }}
                        />
                        Bàn giao NM
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {/* 5. Nhận thành phẩm từ Nhà máy */}
      <AdminCard
        title="Nhận thành phẩm từ Nhà máy"
        icon={<Gift size={18} strokeWidth={2} />}
        gradient="green"
      >
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
                    <td>
                      <strong>{r.productName}</strong>
                    </td>
                    <td>
                      <span className="badge badge--green">
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
                        "Không có"
                      )}
                    </td>
                    <td>{r.note || "—"}</td>
                    <td>
                      <button
                        className="btn-action btn-action--green"
                        onClick={() => handleReceive(r)}
                      >
                        <CheckCircle
                          size={13}
                          strokeWidth={2}
                          style={{ marginRight: 4 }}
                        />
                        Nhận vào kho
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {/* Tất cả yêu cầu SX─ */}
      <AdminCard
        title="Toàn bộ yêu cầu sản xuất"
        icon={<ClipboardList size={18} strokeWidth={2} />}
        gradient="blue"
      >
        {productionRequests.length === 0 ? (
          <p className="empty-state">Chưa có yêu cầu nào.</p>
        ) : (
          <>
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
                  {productionRequests
                    .slice(0, showAllAll ? undefined : 5)
                    .map((r, i) => (
                      <tr key={r.id}>
                        <td>{i + 1}</td>
                        <td>
                          <strong>{r.productName}</strong>
                        </td>
                        <td>{r.productQty}</td>
                        <td>{formatDate(r.createdAt)}</td>
                        <td>
                          <StatusBadge status={r.status} />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            {productionRequests.length > 5 && (
              <button
                className="dash-view-more"
                onClick={() => setShowAllAll(!showAllAll)}
              >
                {showAllAll ? (
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
                    Xem thêm ({productionRequests.length - 5} mục nữa)
                  </>
                )}
              </button>
            )}
          </>
        )}
      </AdminCard>
    </div>
  );
}
