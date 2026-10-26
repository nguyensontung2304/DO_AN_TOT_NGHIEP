/* eslint-disable react-hooks/set-state-in-effect */
import {
  ClipboardList,
  Sofa,
  Trash2,
  Pencil,
  CircleCheck,
  CirclePlus,
  Save,
  LoaderCircle,
  TriangleAlert,
  Search,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../../api/productApi";
import { getCategories } from "../../../api/categoryApi";
import { getMaterials } from "../../../api/materialApi";
import "../Technical/technical.scss";
import "./adminProducts.scss";

//  Helpers
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

const emptySpec = {
  spec_name: "",
  spec_value: "",
};

const emptyRecipe = {
  material_name: "",
  unit: "",
  qty: "",
};

const emptyForm = {
  name: "",
  category_id: "",
  price: "",
  old_price: "",
  image: null,
  badge: "",
  description: "",
  long_description: "",
  specs: [{ ...emptySpec }],
  recipe: [{ ...emptyRecipe }],
};

//  Specs Editor
function SpecsEditor({ specs, onChange }) {
  const update = (i, field, val) => {
    onChange(
      specs.map((s, idx) =>
        idx === i
          ? {
              ...s,
              [field]: val,
            }
          : s,
      ),
    );
  };

  const add = () => {
    onChange([
      ...specs,
      {
        ...emptySpec,
      },
    ]);
  };

  const remove = (i) => {
    onChange(specs.filter((_, idx) => idx !== i));
  };

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

          <button
            type="button"
            className="btn-icon btn-icon--danger"
            onClick={() => remove(i)}
          >
            <Trash2 size={23} />
          </button>
        </div>
      ))}

      <button type="button" className="btn-add-row" onClick={add}>
        + Thêm thông số
      </button>
    </div>
  );
}

//  Recipe Editor
function RecipeEditor({ recipe, onChange, materials, materialsLoading }) {
  const update = (i, field, val) => {
    onChange(
      recipe.map((r, idx) =>
        idx === i
          ? {
              ...r,
              [field]: val,
            }
          : r,
      ),
    );
  };

  // Khi chọn vật liệu
  const handleMaterialChange = (i, materialName) => {
    const material = (materials || []).find(
      (m) => String(m.name) === String(materialName),
    );

    onChange(
      recipe.map((r, idx) =>
        idx === i
          ? {
              ...r,
              material_name: material?.name || "",
              unit: material?.unit || "",
            }
          : r,
      ),
    );
  };

  const add = () => {
    onChange([
      ...recipe,
      {
        ...emptyRecipe,
      },
    ]);
  };

  const remove = (i) => {
    onChange(recipe.filter((_, idx) => idx !== i));
  };

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
          {/* CHỌN VẬT LIỆU */}
          <select
            value={r.material_name}
            onChange={(e) => handleMaterialChange(i, e.target.value)}
            disabled={materialsLoading}
          >
            <option value="">
              {materialsLoading
                ? "Đang tải vật liệu..."
                : "-- Chọn vật liệu --"}
            </option>

            {(materials || []).map((material) => (
              <option key={material.id} value={material.name}>
                {material.name}
              </option>
            ))}
          </select>

          {/* ĐƠN VỊ - TỰ ĐỘNG */}
          <input value={r.unit} readOnly placeholder="Tự động" />

          {/* SỐ LƯỢNG */}
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="VD: 2"
            value={r.qty}
            onChange={(e) => update(i, "qty", e.target.value)}
          />

          {/* XÓA */}
          <button
            type="button"
            className="btn-icon btn-icon--danger"
            onClick={() => remove(i)}
          >
            <Trash2 size={23} />
          </button>
        </div>
      ))}

      <button type="button" className="btn-add-row" onClick={add}>
        + Thêm nguyên liệu
      </button>
    </div>
  );
}

//  Main Component
export default function AdminProducts() {
  // Products
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Categories
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Materials
  const [materials, setMaterials] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(true);

  // Modal
  const [modal, setModal] = useState(null);
  const [editTarget, setEditTarget] = useState(null);

  const [form, setForm] = useState({
    ...emptyForm,
  });

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Delete
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Search / Filter
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  // LOAD PRODUCTS
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await getProducts({
        limit: "all",
      });
      console.log(res);

      setProductList(res.data.products);
    } catch (err) {
      console.error("Lỗi lấy sản phẩm:", err);

      setError(
        err.response?.data?.message || "Không thể tải danh sách sản phẩm.",
      );

      setProductList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // LOAD CATEGORIES
  const loadCategories = useCallback(async () => {
    setCategoriesLoading(true);

    try {
      const res = await getCategories();
      console.log(res);

      setCategories(res.data);

      if (res.data.length === 0) {
        console.warn("API categories trả về danh sách rỗng:", res.data);
      }
    } catch (err) {
      console.error("Lỗi lấy danh mục:", err);

      setCategories([]);

      setError(
        err.response?.data?.message || "Không thể tải danh sách danh mục.",
      );
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  // LOAD MATERIALSs
  const loadMaterials = useCallback(async () => {
    setMaterialsLoading(true);

    try {
      const res = await getMaterials();
      console.log("Materials:", res);

      setMaterials(res.data);

      if (res.data.length === 0) {
        console.warn("API materials trả về danh sách rỗng:", res.data);
      }
    } catch (err) {
      console.error("Lỗi lấy vật liệu:", err);

      setMaterials([]);

      setError(
        err.response?.data?.message || "Không thể tải danh sách vật liệu.",
      );
    } finally {
      setMaterialsLoading(false);
    }
  }, []);

  // LOAD DATA
  useEffect(() => {
    loadProducts();
    loadCategories();
    loadMaterials();
  }, [loadProducts, loadCategories, loadMaterials]);

  // SUCCESS MESSAGE
  const showSuccess = (msg) => {
    setSuccessMsg(msg);

    setTimeout(() => {
      setSuccessMsg("");
    }, 5000);
  };

  // OPEN CREATE
  const openCreate = () => {
    setForm({
      ...emptyForm,
      specs: [{ ...emptySpec }],
      recipe: [{ ...emptyRecipe }],
    });

    setFormError("");
    setEditTarget(null);
    setModal("create");
  };

  // OPEN EDIT
  const openEdit = async (product) => {
    setFormError("");
    setModal("edit");
    setEditTarget(product);

    // Đổ dữ liệu cơ bản trước
    setForm({
      name: product.name || "",
      category_id: String(product.categoryId ?? product.category_id ?? ""),
      price: String(product.price ?? ""),
      old_price: String(product.old_price ?? ""),
      image: null,
      badge: product.badge || "",
      description: product.description || "",
      long_description: product.long_description || "",
      specs: [
        {
          ...emptySpec,
        },
      ],
      recipe: [
        {
          ...emptyRecipe,
        },
      ],
    });

    try {
      const res = await getProductById(product.id);
      const detail = res.data;

      setForm({
        name: detail.name || "",
        category_id: String(detail.categoryId ?? detail.category_id ?? ""),
        price: String(detail.price ?? ""),
        old_price: String(detail.old_price ?? ""),

        // Giữ URL ảnh hiện tại khi edit nếu người dùng chọn File mới thì nó sẽ được thay thế ở input file.
        image: detail.image || null,
        badge: detail.badge || "",
        description: detail.description || "",
        long_description: detail.long_description || "",
        specs:
          Array.isArray(detail.specs) && detail.specs.length > 0
            ? detail.specs.map((s) => ({
                spec_name: s.spec_name || "",
                spec_value: s.spec_value || "",
              }))
            : [
                {
                  ...emptySpec,
                },
              ],
        recipe:
          Array.isArray(detail.recipe) && detail.recipe.length > 0
            ? detail.recipe.map((r) => ({
                material_name: r.material_name || "",

                unit: r.unit || "",

                qty: String(r.qty ?? ""),
              }))
            : [
                {
                  ...emptyRecipe,
                },
              ],
      });
    } catch (err) {
      console.error("Lỗi lấy chi tiết sản phẩm:", err);
    }
  };

  // CLOSE MODAL
  const closeModal = () => {
    setModal(null);
    setEditTarget(null);
    setFormError("");
  };

  // SAVE PRODUCT
  const handleSave = async (e) => {
    e.preventDefault();

    setFormError("");

    // Validate
    if (!form.name.trim() || !form.category_id || !form.price) {
      setFormError("Tên sản phẩm, danh mục và giá là bắt buộc.");

      return;
    }

    if (categories.length === 0) {
      setFormError(
        "Chưa có danh mục. Hãy tạo danh mục trước khi thêm sản phẩm.",
      );

      return;
    }

    // FormData
    const formData = new FormData();

    // Tên
    formData.append("name", form.name.trim());

    // Danh mục
    // QUAN TRỌNG:
    // gửi category_id thay vì category
    formData.append("category_id", String(form.category_id));

    // Giá
    formData.append("price", String(Number(form.price)));

    // Giá cũ
    if (form.old_price) {
      formData.append("old_price", String(Number(form.old_price)));
    }

    // Ảnh
    if (form.image instanceof File) {
      formData.append("image", form.image);
    }

    // Badge
    if (form.badge.trim()) {
      formData.append("badge", form.badge.trim());
    }

    // Mô tả ngắn
    if (form.description.trim()) {
      formData.append("description", form.description.trim());
    }

    // Mô tả chi tiết
    if (form.long_description.trim()) {
      formData.append("long_description", form.long_description.trim());
    }

    // Specs
    const validSpecs = form.specs.filter(
      (s) => s.spec_name.trim() && s.spec_value.trim(),
    );

    formData.append("specs", JSON.stringify(validSpecs));

    // Recipe
    const validRecipe = form.recipe.filter(
      (r) => r.material_name.trim() && r.unit.trim() && r.qty,
    );

    formData.append("recipe", JSON.stringify(validRecipe));

    // Save
    setSaving(true);

    try {
      if (modal === "create") {
        await createProduct(formData);

        showSuccess(
          <div className="notification">
            <CircleCheck size={18} />
            Đã thêm sản phẩm mới!
          </div>,
        );
      } else {
        await updateProduct(editTarget.id, formData);

        showSuccess(
          <div className="notification">
            <CircleCheck size={18} />
            Đã cập nhật sản phẩm!
          </div>,
        );
      }

      closeModal();

      await loadProducts();
    } catch (err) {
      console.error("Lỗi lưu sản phẩm:", err);

      setFormError(err.response?.data?.message || "Lỗi khi lưu sản phẩm.");
    } finally {
      setSaving(false);
    }
  };

  // DELETE
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      await deleteProduct(deleteTarget.id);
      setDeleteTarget(null);
      showSuccess(
        <div className="notification">
          <CircleCheck size={18} />
          Đã xóa sản phẩm!
        </div>,
      );

      await loadProducts();
    } catch (err) {
      console.error("Lỗi xóa sản phẩm:", err);
      setDeleteTarget(null);

      setError(err.response?.data?.message || "Xóa sản phẩm thất bại.");
    } finally {
      setDeleting(false);
    }
  };

  // FILTER
  const filtered = productList.filter((p) => {
    const matchSearch = String(p.name || "")
      .toLowerCase()
      .includes(search.toLowerCase());

    const productCategoryId = p.categoryId ?? p.category_id ?? "";

    const matchCat =
      filterCat === "all" || String(productCategoryId) === String(filterCat);

    return matchSearch && matchCat;
  });

  // RENDER
  return (
    <div className="admin-products-page">
      {/* PAGE HEADER */}
      <div className="page-header">
        <div>
          <h1>
            <Sofa size={26} strokeWidth={2} /> Quản lý sản phẩm
          </h1>

          <p className="page-sub">
            Thêm, sửa, xóa sản phẩm hiển thị trên cửa hàng
          </p>
        </div>

        <button className="btn-submit" onClick={openCreate}>
          <CirclePlus size={18} />
          Thêm sản phẩm
        </button>
      </div>

      {/* SUCCESS */}
      {successMsg && <div className="form-autofill-banner">{successMsg}</div>}

      {/* ERROR */}
      {error && (
        <p className="form-error">
          <TriangleAlert size={20} /> {error}
        </p>
      )}

      {/* FILTERS */}
      <div className="ap-filters">
        {/* SEARCH */}
        <div className="ap-search-box">
          <Search size={18} />
          <input
            className="ap-search"
            placeholder="Tìm theo tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* CATEGORY FILTER */}
        <select
          className="ap-select"
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          disabled={categoriesLoading}
        >
          <option value="all">
            {categoriesLoading ? "Đang tải danh mục..." : "Tất cả danh mục"}
          </option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <span className="ap-count">{filtered.length} sản phẩm</span>
      </div>

      {/* TABLE */}
      <AdminCard
        title="Danh sách sản phẩm"
        icon={<ClipboardList size={18} strokeWidth={2} />}
      >
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
                  <th>Ảnh sản phẩm</th>
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

                    <td className="ap-image">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="ap-product-image"
                        />
                      ) : (
                        "—"
                      )}
                    </td>

                    <td>
                      <strong>{p.name}</strong>
                    </td>

                    <td>
                      <span className="badge badge--blue">
                        {p.categoryName || p.category_name || "—"}
                      </span>
                    </td>

                    <td>{formatCurrency(p.price)}</td>

                    <td>{p.old_price ? formatCurrency(p.old_price) : "—"}</td>

                    <td>
                      {p.badge ? (
                        <span className="badge badge--yellow">{p.badge}</span>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td>
                      <div className="ap-actions">
                        <button
                          className="btn-action btn-action--blue"
                          onClick={() => openEdit(p)}
                        >
                          <Pencil size={15} strokeWidth={2} /> Sửa
                        </button>

                        <button
                          className="btn-action btn-action--danger"
                          onClick={() => setDeleteTarget(p)}
                        >
                          <Trash2 size={15} strokeWidth={2} /> Xóa
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

      {/* CREATE / EDIT MODAL */}
      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-box modal-box--wide"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="modal-header">
              <h3>
                {modal === "create" ? (
                  <div className="modal-header-title">
                    <CirclePlus size={25} />
                    Thêm sản phẩm mới
                  </div>
                ) : (
                  <div className="modal-header-title">
                    <Pencil size={25} />
                    Sửa: {editTarget?.name}
                  </div>
                )}
              </h3>

              <button className="modal-close" onClick={closeModal}>
                ✕
              </button>
            </div>

            {/* FORM */}
            <form className="tech-form ap-form" onSubmit={handleSave}>
              {/* ROW 1 */}
              <div className="form-row">
                {/* NAME */}
                <div className="form-group">
                  <label>
                    Tên sản phẩm <span className="req">*</span>
                  </label>

                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        name: e.target.value,
                      }))
                    }
                    placeholder="VD: Bàn ăn gỗ sồi 6 chỗ"
                  />
                </div>

                {/* CATEGORY */}
                <div className="form-group">
                  <label>
                    Danh mục <span className="req">*</span>
                  </label>

                  <select
                    value={form.category_id}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        category_id: e.target.value,
                      }))
                    }
                    required
                    disabled={categoriesLoading}
                  >
                    <option value="">
                      {categoriesLoading
                        ? "Đang tải danh mục..."
                        : "-- Chọn danh mục --"}
                    </option>

                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>

                  {form.category_id === "custom" && (
                    <input
                      type="text"
                      placeholder="Nhập tên danh mục mới..."
                      value={form.newCategory || ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          newCategory: e.target.value,
                        }))
                      }
                      required
                    />
                  )}

                  {!categoriesLoading && categories.length === 0 && (
                    <small className="form-error">
                      <TriangleAlert size={20} /> Chưa có danh mục. Hãy tạo danh
                      mục trước.
                    </small>
                  )}
                </div>
              </div>

              {/* ROW 2 */}
              <div className="form-row">
                {/* PRICE */}
                <div className="form-group">
                  <label>
                    Giá bán (₫) <span className="req">*</span>
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        price: e.target.value,
                      }))
                    }
                    placeholder="VD: 8500000"
                  />
                </div>

                {/* OLD PRICE */}
                <div className="form-group">
                  <label>Giá cũ (₫)</label>

                  <input
                    type="number"
                    min="0"
                    value={form.old_price}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        old_price: e.target.value,
                      }))
                    }
                    placeholder="VD: 10000000"
                  />
                </div>

                {/* IMAGE */}
                <div className="form-group">
                  <label>Ảnh sản phẩm</label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        image: e.target.files?.[0] || null,
                      }))
                    }
                  />

                  {form.image instanceof File && (
                    <small className="file-name">
                      Đã chọn: {form.image.name}
                    </small>
                  )}

                  {typeof form.image === "string" && form.image && (
                    <small className="file-name">Ảnh hiện tại</small>
                  )}
                </div>

                {/* BADGE */}
                <div className="form-group">
                  <label>Badge</label>

                  <input
                    value={form.badge}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        badge: e.target.value,
                      }))
                    }
                    placeholder="VD: Bán chạy"
                  />
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="form-group">
                <label>Mô tả ngắn</label>

                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Mô tả ngắn hiển thị trên thẻ sản phẩm..."
                />
              </div>

              {/* LONG DESCRIPTION */}
              <div className="form-group">
                <label>Mô tả chi tiết</label>

                <textarea
                  rows={4}
                  value={form.long_description}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      long_description: e.target.value,
                    }))
                  }
                  placeholder="Nội dung đầy đủ hiển thị trên trang chi tiết sản phẩm..."
                />
              </div>

              {/* SPECS */}
              <div className="form-group">
                <label>Thông số kỹ thuật</label>

                <SpecsEditor
                  specs={form.specs}
                  onChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      specs: v,
                    }))
                  }
                />
              </div>

              {/* RECIPE */}
              <div className="form-group">
                <label>Nguyên vật liệu sản xuất</label>

                <RecipeEditor
                  recipe={form.recipe}
                  materials={materials}
                  materialsLoading={materialsLoading}
                  onChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      recipe: v,
                    }))
                  }
                />
              </div>

              {/* FORM ERROR */}
              {formError && (
                <p className="form-error">
                  <TriangleAlert size={20} /> {formError}
                </p>
              )}

              {/* FOOTER */}
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={closeModal}
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="btn-submit"
                  disabled={
                    saving || categoriesLoading || categories.length === 0
                  }
                >
                  {saving ? (
                    <>
                      <LoaderCircle size={18} className="spinning" />
                      Đang lưu...
                    </>
                  ) : modal === "create" ? (
                    <>
                      <CirclePlus size={18} />
                      Thêm sản phẩm
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Lưu thay đổi
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            {/* HEADER */}

            <div className="modal-header">
              <h3>
                <Trash2 /> Xác nhận xóa
              </h3>

              <button
                className="modal-close"
                onClick={() => setDeleteTarget(null)}
              >
                ✕
              </button>
            </div>

            {/* BODY */}

            <div className="modal-body">
              <p>
                Bạn có chắc muốn xóa sản phẩm{" "}
                <strong>"{deleteTarget.name}"</strong>
                ?
                <br />
                <small>
                  Thao tác này không thể hoàn tác. Specs và công thức sản xuất
                  sẽ bị xóa theo.
                </small>
              </p>
            </div>

            {/* FOOTER */}

            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setDeleteTarget(null)}
              >
                Hủy
              </button>

              <button
                className="btn-action btn-action--danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  "Đang xóa..."
                ) : (
                  <div className="delete">
                    <Trash2 size={18} />
                    Xóa
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
