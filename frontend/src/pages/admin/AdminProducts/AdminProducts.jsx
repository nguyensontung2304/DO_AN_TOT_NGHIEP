import { useState, useEffect, useCallback } from "react";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../../api/productApi";
import "../Technical/technical.scss";
import "./adminProducts.scss";

// ─── Helpers ─────────────────────────────────────────────────────────────────
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

const formatCurrency = (v) => Number(v).toLocaleString("vi-VN") + "₫";

const emptySpec = { spec_name: "", spec_value: "" };
const emptyRecipe = { material_name: "", unit: "", qty: "" };

const emptyForm = {
  name: "",
  category: "",
  price: "",
  old_price: "",
  emoji: "",
  badge: "",
  description: "",
  long_description: "",
  specs: [{ ...emptySpec }],
  recipe: [{ ...emptyRecipe }],
};

// ─── Sub-form helpers ─────────────────────────────────────────────────────────
function SpecsEditor({ specs, onChange }) {
  const update = (i, field, val) =>
    onChange(specs.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)));
  const add = () => onChange([...specs, { ...emptySpec }]);
  const remove = (i) => onChange(specs.filter((_, idx) => idx !== i));

  return (
    <div className="sub-editor">
      <div className="sub-editor__head">
        <span>Tên thông số</span>
        <span>Giá trị</span>
        <span></span>
      </div>
      {specs.map((s, i) => (
        <div key={i} className="sub-editor__row">
          <input
            placeholder="VD: Kích thước"
            value={s.spec_name}
            onChange={(e) => update(i, "spec_name", e.target.value)}
          />
          <input
            placeholder="VD: 120×80×75 cm"
            value={s.spec_value}
            onChange={(e) => update(i, "spec_value", e.target.value)}
          />
          <button type="button" className="btn-icon btn-icon--danger" onClick={() => remove(i)}>
            🗑️
          </button>
        </div>
      ))}
      <button type="button" className="btn-add-row" onClick={add}>
        + Thêm thông số
      </button>
    </div>
  );
}

function RecipeEditor({ recipe, onChange }) {
  const update = (i, field, val) =>
    onChange(recipe.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)));
  const add = () => onChange([...recipe, { ...emptyRecipe }]);
  const remove = (i) => onChange(recipe.filter((_, idx) => idx !== i));

  return (
    <div className="sub-editor">
      <div className="sub-editor__head">
        <span>Nguyên vật liệu</span>
        <span>Đơn vị</span>
        <span>Số lượng</span>
        <span></span>
      </div>
      {recipe.map((r, i) => (
        <div key={i} className="sub-editor__row">
          <input
            placeholder="VD: Gỗ sồi"
            value={r.material_name}
            onChange={(e) => update(i, "material_name", e.target.value)}
          />
          <input
            placeholder="VD: tấm"
            value={r.unit}
            onChange={(e) => update(i, "unit", e.target.value)}
          />
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="VD: 2"
            value={r.qty}
            onChange={(e) => update(i, "qty", e.target.value)}
          />
          <button type="button" className="btn-icon btn-icon--danger" onClick={() => remove(i)}>
            🗑️
          </button>
        </div>
      ))}
      <button type="button" className="btn-add-row" onClick={add}>
        + Thêm nguyên liệu
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AdminProducts() {
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // modal state: null | "create" | "edit"
  const [modal, setModal] = useState(null);
  const [editTarget, setEditTarget] = useState(null); // product being edited
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // search / filter
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");

  // ── Load ──────────────────────────────────────────────────────────────────
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // limit=all để lấy hết sản phẩm trong DB (mặc định API chỉ trả 12)
      const res = await getProducts({ limit: "all" });
      // getProducts trả về { products: [...], categories: [...], total, ... }
      // hoặc mảng thẳng — xử lý cả 2 shape
      const raw = res.data;
      const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.products) ? raw.products : []);
      setProductList(list);
    } catch {
      setError("Không thể tải danh sách sản phẩm.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const openCreate = () => {
    setForm(emptyForm);
    setFormError("");
    setEditTarget(null);
    setModal("create");
  };

  const openEdit = async (product) => {
    // Fetch chi tiết để lấy specs + recipe đầy đủ
    setFormError("");
    setModal("edit");
    setEditTarget(product);
    setForm({
      name: product.name || "",
      category: product.category || "",
      price: String(product.price || ""),
      old_price: String(product.old_price || ""),
      emoji: product.emoji || "",
      badge: product.badge || "",
      description: product.description || "",
      long_description: product.long_description || "",
      specs: [{ ...emptySpec }],
      recipe: [{ ...emptyRecipe }],
    });

    try {
      const res = await getProductById(product.id);
      const detail = res.data;
      setForm({
        name: detail.name || "",
        category: detail.category || "",
        price: String(detail.price || ""),
        old_price: String(detail.old_price || ""),
        emoji: detail.emoji || "",
        badge: detail.badge || "",
        description: detail.description || "",
        long_description: detail.long_description || "",
        specs: detail.specs?.length > 0
          ? detail.specs.map((s) => ({ spec_name: s.spec_name, spec_value: s.spec_value }))
          : [{ ...emptySpec }],
        recipe: detail.recipe?.length > 0
          ? detail.recipe.map((r) => ({ material_name: r.material_name, unit: r.unit, qty: String(r.qty) }))
          : [{ ...emptyRecipe }],
      });
    } catch {
      // Giữ form cơ bản nếu fetch thất bại
    }
  };

  const closeModal = () => { setModal(null); setEditTarget(null); };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.name.trim() || !form.category.trim() || !form.price) {
      setFormError("Tên sản phẩm, danh mục và giá là bắt buộc.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      category: form.category.trim(),
      price: Number(form.price),
      old_price: form.old_price ? Number(form.old_price) : null,
      emoji: form.emoji.trim() || null,
      badge: form.badge.trim() || null,
      description: form.description.trim() || null,
      long_description: form.long_description.trim() || null,
      specs: form.specs.filter((s) => s.spec_name.trim() && s.spec_value.trim()),
      recipe: form.recipe.filter((r) => r.material_name.trim() && r.unit.trim() && r.qty),
    };

    setSaving(true);
    try {
      if (modal === "create") {
        await createProduct(payload);
        showSuccess("✅ Đã thêm sản phẩm mới!");
      } else {
        await updateProduct(editTarget.id, payload);
        showSuccess("✅ Đã cập nhật sản phẩm!");
      }
      closeModal();
      loadProducts();
    } catch (err) {
      setFormError(err.response?.data?.message || "Lỗi khi lưu sản phẩm.");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteTarget.id);
      setDeleteTarget(null);
      showSuccess("✅ Đã xóa sản phẩm!");
      loadProducts();
    } catch {
      setDeleteTarget(null);
      setError("Xóa sản phẩm thất bại.");
    } finally {
      setDeleting(false);
    }
  };

  // ── Filter ────────────────────────────────────────────────────────────────
  const categories = ["all", ...new Set(productList.map((p) => p.category))];

  const filtered = productList.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "all" || p.category === filterCat;
    return matchSearch && matchCat;
  });

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="admin-products-page">
      <div className="page-header">
        <div>
          <h1>🛋️ Quản lý sản phẩm</h1>
          <p className="page-sub">Thêm, sửa, xóa sản phẩm hiển thị trên cửa hàng</p>
        </div>
        <button className="btn-submit" onClick={openCreate}>
          + Thêm sản phẩm
        </button>
      </div>

      {successMsg && <div className="form-autofill-banner">{successMsg}</div>}
      {error && <p className="form-error">⚠️ {error}</p>}

      {/* Filters */}
      <div className="ap-filters">
        <input
          className="ap-search"
          placeholder="🔍 Tìm theo tên..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="ap-select"
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === "all" ? "Tất cả danh mục" : c}
            </option>
          ))}
        </select>
        <span className="ap-count">{filtered.length} sản phẩm</span>
      </div>

      {/* Table */}
      <AdminCard title="Danh sách sản phẩm" icon="📋">
        {loading ? (
          <p className="empty-state">Đang tải...</p>
        ) : filtered.length === 0 ? (
          <p className="empty-state">Không có sản phẩm nào.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Icon</th>
                  <th>Tên sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Giá</th>
                  <th>Giá cũ</th>
                  <th>Badge</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td className="ap-emoji">{p.emoji || "—"}</td>
                    <td><strong>{p.name}</strong></td>
                    <td><span className="badge badge--blue">{p.category}</span></td>
                    <td>{formatCurrency(p.price)}</td>
                    <td>{p.old_price ? formatCurrency(p.old_price) : "—"}</td>
                    <td>
                      {p.badge
                        ? <span className="badge badge--yellow">{p.badge}</span>
                        : "—"}
                    </td>
                    <td>
                      <div className="ap-actions">
                        <button
                          className="btn-action btn-action--blue"
                          onClick={() => openEdit(p)}
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          className="btn-action btn-action--danger"
                          onClick={() => setDeleteTarget(p)}
                        >
                          🗑️ Xóa
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

      {/* ── Modal Create / Edit ── */}
      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box modal-box--wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modal === "create" ? "➕ Thêm sản phẩm mới" : `✏️ Sửa: ${editTarget?.name}`}</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <form className="tech-form ap-form" onSubmit={handleSave}>
              {/* Row 1 */}
              <div className="form-row">
                <div className="form-group">
                  <label>Tên sản phẩm <span className="req">*</span></label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="VD: Bàn ăn gỗ sồi 6 chỗ"
                  />
                </div>
                <div className="form-group">
                  <label>Danh mục <span className="req">*</span></label>
                  <input
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    placeholder="VD: Bàn ăn"
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="form-row">
                <div className="form-group">
                  <label>Giá bán (₫) <span className="req">*</span></label>
                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    placeholder="VD: 8500000"
                  />
                </div>
                <div className="form-group">
                  <label>Giá cũ (₫)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.old_price}
                    onChange={(e) => setForm((f) => ({ ...f, old_price: e.target.value }))}
                    placeholder="VD: 10000000"
                  />
                </div>
                <div className="form-group">
                  <label>Emoji icon</label>
                  <input
                    value={form.emoji}
                    onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))}
                    placeholder="VD: 🪑"
                    maxLength={4}
                  />
                </div>
                <div className="form-group">
                  <label>Badge</label>
                  <input
                    value={form.badge}
                    onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
                    placeholder="VD: Bán chạy"
                  />
                </div>
              </div>

              {/* Row 3 */}
              <div className="form-group">
                <label>Mô tả ngắn</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Mô tả ngắn hiển thị trên thẻ sản phẩm..."
                />
              </div>

              <div className="form-group">
                <label>Mô tả chi tiết</label>
                <textarea
                  rows={4}
                  value={form.long_description}
                  onChange={(e) => setForm((f) => ({ ...f, long_description: e.target.value }))}
                  placeholder="Nội dung đầy đủ hiển thị trên trang chi tiết sản phẩm..."
                />
              </div>

              {/* Specs */}
              <div className="form-group">
                <label>Thông số kỹ thuật</label>
                <SpecsEditor
                  specs={form.specs}
                  onChange={(v) => setForm((f) => ({ ...f, specs: v }))}
                />
              </div>

              {/* Recipe */}
              <div className="form-group">
                <label>Nguyên vật liệu sản xuất</label>
                <RecipeEditor
                  recipe={form.recipe}
                  onChange={(v) => setForm((f) => ({ ...f, recipe: v }))}
                />
              </div>

              {formError && <p className="form-error">⚠️ {formError}</p>}

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={closeModal}>
                  Hủy
                </button>
                <button type="submit" className="btn-submit" disabled={saving}>
                  {saving ? "Đang lưu..." : modal === "create" ? "➕ Thêm sản phẩm" : "💾 Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete confirm dialog ── */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🗑️ Xác nhận xóa</h3>
              <button className="modal-close" onClick={() => setDeleteTarget(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p>
                Bạn có chắc muốn xóa sản phẩm{" "}
                <strong>"{deleteTarget.name}"</strong>?
                <br />
                <small>Thao tác này không thể hoàn tác. Specs và công thức sản xuất sẽ bị xóa theo.</small>
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setDeleteTarget(null)}>
                Hủy
              </button>
              <button
                className="btn-action btn-action--danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Đang xóa..." : "🗑️ Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
