import { useState } from "react";
import { useApp } from "../../../context/useApp";
import "./technical.scss";

// ── Shared admin card shell ───────────────────────────────────────────────────
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

function StatusBadge({ status }) {
  const map = {
    pending:       { label: "Chờ thủ kho",      cls: "badge--yellow"  },
    checked:       { label: "Đã kiểm kê",        cls: "badge--blue"    },
    purchasing:    { label: "Đang mua hàng",      cls: "badge--orange"  },
    ready:         { label: "Sẵn sàng SX",        cls: "badge--teal"    },
    in_production: { label: "Đang sản xuất",      cls: "badge--purple"  },
    done:          { label: "Hoàn thành",         cls: "badge--green"   },
  };
  const s = map[status] || { label: status, cls: "badge--gray" };
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}

// ── Material row in the form ──────────────────────────────────────────────────
function MaterialRow({ row, index, materials, onChange, onRemove }) {
  return (
    <div className="tech-material-row">
      <select
        value={row.materialId}
        onChange={(e) => {
          const m = materials.find((m) => m.id === Number(e.target.value));
          onChange(index, {
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
        min="1"
        placeholder="Số lượng cần"
        value={row.requiredQty}
        onChange={(e) => onChange(index, { ...row, requiredQty: e.target.value })}
      />

      <span className="tech-material-unit">{row.unit || "—"}</span>

      <button className="btn-icon btn-icon--danger" onClick={() => onRemove(index)} title="Xoá dòng">
        🗑️
      </button>
    </div>
  );
}

export default function Technical() {
  const {
    materials,
    productionRequests,
    addProductionRequest,
    designRequests,
    provideDesign,
  } = useApp();

  // ── Form tạo yêu cầu SX ────────────────────────────────────────────────────
  const emptyRow = { materialId: "", materialName: "", unit: "", requiredQty: "" };
  const [form, setForm] = useState({
    productName: "",
    productQty: "",
    note: "",
    rows: [{ ...emptyRow }],
  });
  const [formError, setFormError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const updateRow = (i, val) =>
    setForm((f) => ({ ...f, rows: f.rows.map((r, idx) => (idx === i ? val : r)) }));

  const addRow = () =>
    setForm((f) => ({ ...f, rows: [...f.rows, { ...emptyRow }] }));

  const removeRow = (i) =>
    setForm((f) => ({ ...f, rows: f.rows.filter((_, idx) => idx !== i) }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");
    if (!form.productName.trim() || !form.productQty) {
      setFormError("Vui lòng nhập tên sản phẩm và số lượng.");
      return;
    }
    const validRows = form.rows.filter((r) => r.materialId && r.requiredQty > 0);
    if (validRows.length === 0) {
      setFormError("Cần chọn ít nhất 1 vật tư với số lượng hợp lệ.");
      return;
    }
    addProductionRequest({
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
    setForm({ productName: "", productQty: "", note: "", rows: [{ ...emptyRow }] });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  // ── Cung cấp bản thiết kế cho nhà máy ────────────────────────────────────
  const [designNotes, setDesignNotes] = useState({});
  const pendingDesigns = designRequests.filter((r) => r.status === "pending");
  const doneDesigns    = designRequests.filter((r) => r.status === "provided");

  return (
    <div className="technical-page">
      <div className="page-header">
        <h1>⚙️ Bộ phận Kỹ thuật</h1>
        <p className="page-sub">Tạo yêu cầu sản xuất và cung cấp bản thiết kế cho Nhà máy</p>
      </div>

      {/* ── 1. Tạo yêu cầu SX ─────────────────────────────────────────────── */}
      <AdminCard title="Tạo yêu cầu sản xuất" icon="📋">
        <form className="tech-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Tên sản phẩm đầu ra <span className="req">*</span></label>
              <input
                value={form.productName}
                onChange={(e) => setForm((f) => ({ ...f, productName: e.target.value }))}
                placeholder="VD: Bàn ăn gỗ sồi 6 chỗ"
              />
            </div>
            <div className="form-group">
              <label>Số lượng sản xuất <span className="req">*</span></label>
              <input
                type="number"
                min="1"
                value={form.productQty}
                onChange={(e) => setForm((f) => ({ ...f, productQty: e.target.value }))}
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

          <div className="form-group">
            <label>Danh sách vật tư cần dùng <span className="req">*</span></label>
            <div className="tech-material-list">
              <div className="tech-material-list__head">
                <span>Vật tư</span>
                <span>Số lượng cần</span>
                <span>Đơn vị</span>
                <span></span>
              </div>
              {form.rows.map((row, i) => (
                <MaterialRow
                  key={i}
                  row={row}
                  index={i}
                  materials={materials}
                  onChange={updateRow}
                  onRemove={removeRow}
                />
              ))}
            </div>
            <button type="button" className="btn-add-row" onClick={addRow}>
              + Thêm vật tư
            </button>
          </div>

          {formError && <p className="form-error">⚠️ {formError}</p>}
          {submitted && <p className="form-success">✅ Đã gửi yêu cầu tới Thủ kho!</p>}

          <button type="submit" className="btn-submit">
            📤 Gửi yêu cầu cho Thủ kho
          </button>
        </form>
      </AdminCard>

      {/* ── 2. Danh sách yêu cầu SX đã tạo ────────────────────────────────── */}
      <AdminCard title="Danh sách yêu cầu sản xuất đã tạo" icon="📑">
        {productionRequests.length === 0 ? (
          <p className="empty-state">Chưa có yêu cầu nào.</p>
        ) : (
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
                {productionRequests.map((req, i) => (
                  <tr key={req.id}>
                    <td>{i + 1}</td>
                    <td><strong>{req.productName}</strong></td>
                    <td>{req.productQty}</td>
                    <td>
                      <ul className="material-list-inline">
                        {req.materials.map((m, mi) => (
                          <li key={mi}>
                            {m.materialName}: <strong>{m.requiredQty} {m.unit}</strong>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td>{req.note || "—"}</td>
                    <td>{req.createdAt}</td>
                    <td><StatusBadge status={req.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {/* ── 3. Yêu cầu bản thiết kế từ Nhà máy ────────────────────────────── */}
      <AdminCard title="Yêu cầu bản thiết kế từ Nhà máy" icon="📐">
        {pendingDesigns.length === 0 && doneDesigns.length === 0 ? (
          <p className="empty-state">Chưa có yêu cầu bản thiết kế nào.</p>
        ) : (
          <>
            {pendingDesigns.length > 0 && (
              <>
                <h3 className="section-subtitle">🟡 Chờ cung cấp ({pendingDesigns.length})</h3>
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
                          <td><strong>{req.productName}</strong></td>
                          <td>{req.note || "—"}</td>
                          <td>{req.createdAt}</td>
                          <td>
                            <textarea
                              rows={2}
                              placeholder="Mô tả bản thiết kế, thông số kỹ thuật..."
                              value={designNotes[req.id] || ""}
                              onChange={(e) =>
                                setDesignNotes((n) => ({ ...n, [req.id]: e.target.value }))
                              }
                            />
                          </td>
                          <td>
                            <button
                              className="btn-action btn-action--green"
                              disabled={!designNotes[req.id]?.trim()}
                              onClick={() => provideDesign(req.id, designNotes[req.id])}
                            >
                              ✅ Gửi thiết kế
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
                  ✅ Đã cung cấp ({doneDesigns.length})
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
                          <td><strong>{req.productName}</strong></td>
                          <td>{req.designNote}</td>
                          <td>{req.createdAt}</td>
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
