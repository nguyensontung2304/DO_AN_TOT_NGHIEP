import { useEffect, useState } from "react";
import { formatDate } from "../../../utils/formatDate";
import {
  Settings,
  Trash2,
  Send,
  FileText,
  Ruler,
  Bell,
  CheckCircle,
  ClipboardList,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useApp } from "../../../context/useApp";
import "./technical.scss";

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

function StatusBadge({ status }) {
  const map = {
    pending: { label: "Chờ thủ kho", cls: "badge--yellow" },
    checked: { label: "Đã kiểm kê", cls: "badge--blue" },
    purchasing: { label: "Đang mua hàng", cls: "badge--orange" },
    ready: { label: "Sẵn sàng SX", cls: "badge--teal" },
    in_production: { label: "Đang sản xuất", cls: "badge--purple" },
    done: { label: "Hoàn thành", cls: "badge--green" },
  };
  const s = map[status] || { label: status, cls: "badge--gray" };
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}

// ── Material row in the form ──────────────────────────────────────────────────
function MaterialRow({
  row,
  index,
  groupIndex = -1,
  materials,
  onChange,
  onRemove,
}) {
  return (
    <div className="tech-material-row">
      <select
        value={row.materialId}
        onChange={(e) => {
          const m = materials.find((m) => m.id === Number(e.target.value));
          onChange(groupIndex, index, {
            materialId: m ? m.id : "",
            materialName: m ? m.name : "",
            unit: m ? m.unit : "",
            requiredQty: row.requiredQty,
          });
        }}
      >
        <option value="">-- Chọn vật tư --</option>
        {materials.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name} ({m.unit})
          </option>
        ))}
      </select>

      <input
        type="number"
        min="0.01"
        step="0.01"
        placeholder="Số lượng cần"
        value={row.requiredQty}
        onChange={(e) =>
          onChange(groupIndex, index, { ...row, requiredQty: e.target.value })
        }
      />

      <span className="tech-material-unit">{row.unit || "—"}</span>

      <button
        className="btn-icon btn-icon--danger"
        onClick={() => onRemove(groupIndex, index)}
        title="Xoá dòng"
      >
        <Trash2 size={14} strokeWidth={2} />
      </button>
    </div>
  );
}

const emptyRow = {
  materialId: "",
  materialName: "",
  unit: "",
  requiredQty: "",
};
const emptyForm = {
  productName: "",
  productQty: "",
  note: "",
  rows: [{ ...emptyRow }],
};

// Dựng form từ đơn hàng vừa được admin xác nhận.
// Mỗi sản phẩm có danh sách vật tư riêng nên đơn nhiều sản phẩm sẽ thành nhiều nhóm.
function buildFormFromOrder(order, materials) {
  const cart = order.cart || [];
  if (cart.length === 0) return null;

  const toRow = (r) => {
    const mat = materials.find(
      (m) =>
        (m.name || "").toLowerCase().trim() ===
        (r.material_name || "").toLowerCase().trim(),
    );
    return {
      materialId: mat ? mat.id : "",
      materialName: r.material_name,
      unit: mat ? mat.unit : r.unit || "",
      requiredQty: String(r.qty),
    };
  };

  // Gom theo từng sản phẩm, bỏ sản phẩm không có vật tư nào khớp kho
  const groups = (order.itemsWithRecipe || [])
    .map((item) => ({
      name: item.name,
      qty: item.qty,
      rows: (item.materials || []).map(toRow),
    }))
    .filter((g) => g.rows.length > 0);

  const fallbackRows = (order.recipeRows || []).map(toRow);
  const orderCode = String(order.id).slice(-6).toUpperCase();
  const note = `Đơn hàng #${orderCode} — ${order.name || "Khách hàng"}`;

  if (groups.length === 1) {
    return {
      form: {
        productName: groups[0].name,
        productQty: String(groups[0].qty),
        note,
        rows: groups[0].rows,
      },
      banner: `🔔 Đơn hàng #${orderCode} vừa được xác nhận — đã điền sẵn, kiểm tra lại trước khi gửi.`,
    };
  }

  return {
    form: {
      productName: cart.map((i) => i.name).join(", "),
      productQty: String(cart.reduce((s, i) => s + Number(i.qty), 0)),
      note,
      rows: fallbackRows.length > 0 ? fallbackRows : [{ ...emptyRow }],
      groups,
    },
    banner:
      `🔔 Đơn hàng #${orderCode} vừa được xác nhận — gồm ` +
      `${groups.length || cart.length} sản phẩm, kiểm tra vật tư từng sản phẩm bên dưới.`,
  };
}

export default function Technical() {
  const {
    materials,
    productionRequests,
    addProductionRequest,
    designRequests,
    provideDesign,
    confirmedOrderDraft,
    setConfirmedOrderDraft,
    clearConfirmedOrderDraft,
    pendingNotifications,
    dismissNotification,
  } = useApp();

  // ── Form tạo yêu cầu SX ────────────────────────────────────────────────────
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [autoFillBanner, setAutoFillBanner] = useState("");

  // Đơn hàng đã nạp vào form lần nào (tránh nạp lại khi render lại)
  const [filledOrderId, setFilledOrderId] = useState(null);

  // View more state
  const [showAllTechnical, setShowAllTechnical] = useState(false);

  useEffect(() => {
    if (
      !confirmedOrderDraft ||
      confirmedOrderDraft.id === filledOrderId ||
      !(confirmedOrderDraft.cart || []).length
    ) {
      return;
    }
    const built = buildFormFromOrder(confirmedOrderDraft, materials);
    if (built) {
      setForm(built.form);
      setAutoFillBanner(built.banner);
      setFilledOrderId(confirmedOrderDraft.id);
    }
  }, [confirmedOrderDraft, filledOrderId, materials]);

  // Nạp lại 1 đơn từ bảng thông báo vào form
  const loadOrderIntoForm = (order) => {
    setFilledOrderId(null);
    setFormError("");
    setConfirmedOrderDraft(order);
  };

  const resetAfterSubmit = () => {
    setForm(emptyForm);
    setFilledOrderId(null);
    clearConfirmedOrderDraft?.();
    if (filledOrderId) dismissNotification(filledOrderId);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  // Gửi yêu cầu: nhiều sản phẩm → tạo 1 yêu cầu/sản phẩm, vật tư đi kèm riêng
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setAutoFillBanner("");

    const groups = form.groups || [];

    try {
      if (groups.length > 0) {
        const items = groups
          .map((g) => ({
            productName: g.name,
            productQty: Number(g.qty),
            materials: g.rows
              .filter((r) => r.materialId && Number(r.requiredQty) > 0)
              .map((r) => ({
                materialId: r.materialId,
                materialName: r.materialName,
                unit: r.unit,
                requiredQty: Number(r.requiredQty),
              })),
          }))
          .filter((it) => it.materials.length > 0);

        if (items.length === 0) {
          setFormError(
            "Cần chọn ít nhất 1 vật tư với số lượng hợp lệ cho mỗi sản phẩm.",
          );
          return;
        }

        await addProductionRequest({ note: form.note.trim(), items });
        resetAfterSubmit();
        return;
      }

      if (!form.productName.trim() || !form.productQty) {
        setFormError("Vui lòng nhập tên sản phẩm và số lượng.");
        return;
      }
      const validRows = (form.rows || []).filter(
        (r) => r.materialId && Number(r.requiredQty) > 0,
      );
      if (validRows.length === 0) {
        setFormError("Cần chọn ít nhất 1 vật tư với số lượng hợp lệ.");
        return;
      }
      await addProductionRequest({
        productName: form.productName.trim(),
        productQty: Number(form.productQty),
        note: form.note.trim(),
        materials: validRows.map((r) => ({
          materialId: r.materialId,
          materialName: r.materialName,
          unit: r.unit,
          requiredQty: Number(r.requiredQty),
        })),
      });
      resetAfterSubmit();
    } catch {
      setFormError("Không gửi được yêu cầu. Vui lòng thử lại.");
    }
  };

  // ── Cung cấp bản thiết kế cho nhà máy ────────────────────────────────────
  const [designNotes, setDesignNotes] = useState({});

  // Sửa dòng vật tư — groupIndex = -1 nghĩa là form 1 sản phẩm
  const updateRow = (groupIndex, i, val) =>
    setForm((f) => {
      if (groupIndex === -1) {
        return {
          ...f,
          rows: f.rows.map((r, idx) => (idx === i ? val : r)),
        };
      }
      return {
        ...f,
        groups: f.groups.map((g, gi) =>
          gi === groupIndex
            ? { ...g, rows: g.rows.map((r, idx) => (idx === i ? val : r)) }
            : g,
        ),
      };
    });

  const addRow = (groupIndex) =>
    setForm((f) => {
      if (groupIndex === -1) {
        return { ...f, rows: [...f.rows, { ...emptyRow }] };
      }
      return {
        ...f,
        groups: f.groups.map((g, gi) =>
          gi === groupIndex ? { ...g, rows: [...g.rows, { ...emptyRow }] } : g,
        ),
      };
    });

  const removeRow = (groupIndex, i) =>
    setForm((f) => {
      if (groupIndex === -1) {
        return { ...f, rows: f.rows.filter((_, idx) => idx !== i) };
      }
      return {
        ...f,
        groups: f.groups.map((g, gi) =>
          gi === groupIndex
            ? { ...g, rows: g.rows.filter((_, idx) => idx !== i) }
            : g,
        ),
      };
    });

  const pendingDesigns = designRequests.filter((r) => r.status === "pending");
  const doneDesigns = designRequests.filter((r) => r.status === "provided");

  return (
    <div className="technical-page">
      <div className="page-header">
        <h1>
          <Settings
            size={24}
            strokeWidth={2}
            style={{ verticalAlign: "middle", marginRight: 8 }}
          />
          Bộ phận Kỹ thuật
        </h1>
        <p className="page-sub">
          Tạo yêu cầu sản xuất và cung cấp bản thiết kế cho Nhà máy
        </p>
      </div>

      {/* ── 0. Thông báo đơn hàng mới được admin xác nhận ────��─────────────── */}
      <AdminCard
        title={`Thông báo đơn hàng mới (${pendingNotifications.length})`}
        icon={<Bell size={18} strokeWidth={2} />}
        gradient="orange"
      >
        {pendingNotifications.length === 0 ? (
          <p className="empty-state">Chưa có đơn hàng nào mới cần xử lý.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Đơn hàng</th>
                  <th>Tên khách hàng</th>
                  <th>Số điện thoại</th>
                  <th>Sản phẩm</th>
                  <th>Thời gian</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {pendingNotifications.map((o, ni) => (
                  <tr key={`${o.id}-${ni}`}>
                    <td>
                      <strong>#{String(o.id).slice(-6).toUpperCase()}</strong>
                    </td>

                    <td>{o.name}</td>

                    <td>{o.phone}</td>

                    <td>
                      <ul className="material-list-inline">
                        {(o.cart || []).map((c, ci) => (
                          <li key={ci}>
                            {c.name} <strong>× {c.qty}</strong>
                          </li>
                        ))}
                      </ul>
                    </td>

                    <td>{formatDate(o.createdAt)}</td>

                    <td>
                      <div className="tech-notify-actions">
                        <button
                          className="btn-action btn-action--gray"
                          onClick={() => dismissNotification(o.id)}
                        >
                          <CheckCircle
                            size={13}
                            strokeWidth={2}
                            style={{ marginRight: 4 }}
                          />
                          Đã xem
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {/* ── 1. Tạo yêu cầu SX ─────────────────────────────────────────────── */}
      <AdminCard
        title="Tạo yêu cầu sản xuất"
        icon={<ClipboardList size={18} strokeWidth={2} />}
        gradient="blue"
      >
        <form className="tech-form" onSubmit={handleSubmit}>
          {/* Banner auto-fill từ đơn hàng */}
          {autoFillBanner && (
            <div className="form-autofill-banner">
              {autoFillBanner} — Kiểm tra và chọn vật tư bên dưới trước khi gửi.
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>
                Tên sản phẩm đầu ra <span className="req">*</span>
              </label>
              <input
                value={form.productName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, productName: e.target.value }))
                }
                placeholder="VD: Bàn ăn gỗ sồi 6 chỗ"
              />
            </div>
            <div className="form-group">
              <label>
                Số lượng sản xuất <span className="req">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={form.productQty}
                onChange={(e) =>
                  setForm((f) => ({ ...f, productQty: e.target.value }))
                }
                placeholder="VD: 10"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Ghi chú</label>
            <textarea
              rows={2}
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              placeholder="Yêu cầu kỹ thuật đặc biệt, quy cách..."
            />
          </div>

          {/* Nhiều sản phẩm: mỗi sản phẩm 1 khối vật tư riêng */}
          {form.groups?.length > 0 ? (
            form.groups.map((g, gi) => (
              <div className="form-group" key={gi}>
                <h3 className="section-subtitle">
                  🪑 {g.name} <small>(SL: {g.qty})</small>
                </h3>
                <div className="tech-material-list">
                  <div className="tech-material-list__head">
                    <span>Vật tư</span>
                    <span>Số lượng cần</span>
                    <span>Đơn vị</span>
                    <span></span>
                  </div>
                  {g.rows.map((row, i) => (
                    <MaterialRow
                      key={i}
                      row={row}
                      index={i}
                      groupIndex={gi}
                      materials={materials}
                      onChange={updateRow}
                      onRemove={removeRow}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className="btn-add-row"
                  onClick={() => addRow(gi)}
                >
                  + Thêm vật tư cho {g.name}
                </button>
              </div>
            ))
          ) : (
            <div className="form-group">
              <label>
                Danh sách vật tư cần dùng <span className="req">*</span>
              </label>
              <div className="tech-material-list">
                <div className="tech-material-list__head">
                  <span>Vật tư</span>
                  <span>Số lượng cần</span>
                  <span>Đơn vị</span>
                  <span></span>
                </div>
                {(form.rows || []).map((row, i) => (
                  <MaterialRow
                    key={i}
                    row={row}
                    index={i}
                    groupIndex={-1}
                    materials={materials}
                    onChange={updateRow}
                    onRemove={removeRow}
                  />
                ))}
              </div>
              <button
                type="button"
                className="btn-add-row"
                onClick={() => addRow(-1)}
              >
                + Thêm vật tư
              </button>
            </div>
          )}

          {formError && (
            <p className="form-error">
              <AlertTriangle
                size={14}
                strokeWidth={2}
                style={{ marginRight: 4 }}
              />
              {formError}
            </p>
          )}
          {submitted && (
            <p className="form-success">
              <CheckCircle
                size={14}
                strokeWidth={2}
                style={{ marginRight: 4 }}
              />
              Đã gửi yêu cầu tới Thủ kho!
            </p>
          )}

          <button type="submit" className="btn-submit">
            <Send size={15} strokeWidth={2} style={{ marginRight: 6 }} />
            Gửi yêu cầu cho Thủ kho
          </button>
        </form>
      </AdminCard>

      {/* ── 2. Danh sách yêu cầu SX đã tạo ────────────────────────────────── */}
      <AdminCard
        title="Danh sách yêu cầu sản xuất đã tạo"
        icon={<FileText size={18} strokeWidth={2} />}
        gradient="teal"
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
                    <th>SL SX</th>
                    <th>Vật tư cần</th>
                    <th>Ghi chú</th>
                    <th>Ngày tạo</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {productionRequests.slice(0, showAllTechnical ? undefined : 5).map((req, i) => (
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
                      <td>{req.note || "—"}</td>
                      <td>{formatDate(req.createdAt)}</td>
                      <td>
                        <StatusBadge status={req.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {productionRequests.length > 5 && (
              <button
                className="dash-view-more"
                onClick={() => setShowAllTechnical(!showAllTechnical)}
              >
                {showAllTechnical ? (
                  <>
                    <ChevronUp size={14} strokeWidth={2} style={{ marginRight: 4 }} />
                    Thu gọn
                  </>
                ) : (
                  <>
                    <ChevronDown size={14} strokeWidth={2} style={{ marginRight: 4 }} />
                    Xem thêm ({productionRequests.length - 5} mục nữa)
                  </>
                )}
              </button>
            )}
          </>
        )}
      </AdminCard>

      {/* ── 3. Yêu cầu bản thiết kế từ Nhà máy ────────────────────────────── */}
      <AdminCard
        title="Yêu cầu bản thiết kế từ Nhà máy"
        icon={<Ruler size={18} strokeWidth={2} />}
        gradient="purple"
      >
        {pendingDesigns.length === 0 && doneDesigns.length === 0 ? (
          <p className="empty-state">Chưa có yêu cầu bản thiết kế nào.</p>
        ) : (
          <>
            {pendingDesigns.length > 0 && (
              <>
                <h3 className="section-subtitle">
                  <CheckCircle
                    size={14}
                    strokeWidth={2}
                    style={{ color: "#856404", marginRight: 4 }}
                  />
                  Chờ cung cấp ({pendingDesigns.length})
                </h3>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Sản phẩm</th>
                        <th>Ghi chú từ Nhà máy</th>
                        <th>Ngày yêu cầu</th>
                        <th>Phản hồi bản thiết kế</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingDesigns.map((req, i) => (
                        <tr key={req.id}>
                          <td>{i + 1}</td>
                          <td>
                            <strong>{req.productName}</strong>
                          </td>
                          <td>{req.note || "—"}</td>
                          <td>{formatDate(req.createdAt)}</td>
                          <td>
                            <textarea
                              rows={2}
                              placeholder="Mô tả bản thiết kế, thông số kỹ thuật..."
                              value={designNotes[req.id] || ""}
                              onChange={(e) =>
                                setDesignNotes((n) => ({
                                  ...n,
                                  [req.id]: e.target.value,
                                }))
                              }
                            />
                          </td>
                          <td>
                            <button
                              className="btn-action btn-action--green"
                              disabled={!designNotes[req.id]?.trim()}
                              onClick={() =>
                                provideDesign(req.id, designNotes[req.id])
                              }
                            >
                              <Send
                                size={13}
                                strokeWidth={2}
                                style={{ marginRight: 4 }}
                              />
                              Gửi thiết kế
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {doneDesigns.length > 0 && (
              <>
                <h3 className="section-subtitle" style={{ marginTop: "24px" }}>
                  <CheckCircle
                    size={14}
                    strokeWidth={2}
                    style={{ color: "#155724", marginRight: 4 }}
                  />
                  Đã cung cấp ({doneDesigns.length})
                </h3>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Sản phẩm</th>
                        <th>Nội dung thiết kế</th>
                        <th>Ngày yêu cầu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doneDesigns.map((req, i) => (
                        <tr key={req.id}>
                          <td>{i + 1}</td>
                          <td>
                            <strong>{req.productName}</strong>
                          </td>
                          <td>{req.designNote}</td>
                          <td>{formatDate(req.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
      </AdminCard>
    </div>
  );
}
