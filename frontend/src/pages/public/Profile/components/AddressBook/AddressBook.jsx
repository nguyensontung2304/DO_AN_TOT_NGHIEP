import { useEffect, useState } from "react";
import {
  MapPin,
  Plus,
  RotateCw,
  Pencil,
  Star,
  Trash2,
  X,
  Check,
} from "lucide-react";
import AddressFields from "../../../../../components/public/AddressFields/AddressFields";
import {
  getAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../../../../../api/addressApi";
import "./addressBook.scss";

const initialForm = {
  label: "",
  name: "",
  phone: "",
  provinceCode: "",
  wardCode: "",
  addressLine: "",
  isDefault: false,
};

function AddressBook({ currentUser }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [editor, setEditor] = useState(null);
  const [form, setForm] = useState(initialForm);

  // Chuyển lỗi API thành thông báo dễ đọc
  const showError = (err) => {
    if (typeof err === "string") return err;

    return (
      err?.response?.data?.message ||
      err?.message ||
      "Đã xảy ra lỗi. Vui lòng thử lại."
    );
  };

  // Lấy danh sách địa chỉ
  const fetchAddress = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getAddress();
      const result = response?.data ?? response;

      const list = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
          ? result.data
          : null;

      if (!list) {
        throw new Error("Dữ liệu danh sách địa chỉ không hợp lệ.");
      }

      setAddresses(list);
      return true;
    } catch (err) {
      setError(showError(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddress();
  }, []);

  // Mở form thêm hoặc sửa địa chỉ
  const openEditor = (address = null) => {
    setActionError("");
    setEditor(address || {});

    setForm({
      ...initialForm,
      ...(address || {}),
      name: address?.name ?? currentUser?.name ?? "",
      phone: address?.phone ?? currentUser?.phone ?? "",
      provinceCode: address?.provinceCode ?? "",
      wardCode: address?.wardCode ?? "",
      addressLine: address?.addressLine ?? "",
      isDefault: address ? Boolean(address.isDefault) : addresses.length === 0,
    });
  };

  // Cập nhật dữ liệu form
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => {
      const next = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      // Khi đổi tỉnh/thành, chọn lại phường/xã
      if (name === "provinceCode") {
        next.wardCode = "";
      }

      return next;
    });
  };

  // Thêm hoặc cập nhật địa chỉ
  const handleSave = async (event) => {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setActionError("");

    try {
      const values = { ...form };

      if (editor?.id) {
        await updateAddress({
          ...values,
          id: editor.id,
        });
      } else {
        await createAddress(values);
      }

      const refreshed = await fetchAddress();

      if (!refreshed) {
        setActionError(
          "Đã lưu địa chỉ nhưng không thể tải lại danh sách. Vui lòng thử lại.",
        );
        return;
      }

      setEditor(null);
      setForm(initialForm);
    } catch (err) {
      setActionError(showError(err));
    } finally {
      setSaving(false);
    }
  };

  // Xóa địa chỉ hoặc đặt địa chỉ mặc định
  const handleAction = async (apiRequest, successMessage) => {
    if (saving) return;

    setSaving(true);
    setActionError("");

    try {
      await apiRequest();

      const refreshed = await fetchAddress();

      if (!refreshed) {
        setActionError(
          "Thao tác đã hoàn tất nhưng không thể tải lại danh sách. Vui lòng thử lại.",
        );
        return;
      }

      window.alert(successMessage);
    } catch (err) {
      setActionError(showError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="address-book">
      {/* Tiêu đề */}
      <div className="address-book-header">
        <h2>Sổ địa chỉ</h2>

        <button
          type="button"
          className="address-book-add"
          onClick={() => openEditor()}
          disabled={saving || loading}
        >
          <Plus size={18} aria-hidden="true" />
          Thêm địa chỉ
        </button>
      </div>

      {/* Lỗi tải danh sách */}
      {error && (
        <div className="address-book-alert address-book-alert-error">
          <span>{error}</span>

          <button
            type="button"
            onClick={fetchAddress}
            disabled={loading || saving}
          >
            <RotateCw size={16} aria-hidden="true" />
            Thử lại
          </button>
        </div>
      )}

      {/* Lỗi thao tác */}
      {actionError && (
        <div className="address-book-alert address-book-alert-error">
          {actionError}
        </div>
      )}

      {/* Trạng thái tải dữ liệu */}
      {loading ? (
        <div className="address-book-loading">
          <span className="address-book-spinner" />
          <p>Đang tải danh sách địa chỉ...</p>
        </div>
      ) : !error && addresses.length === 0 ? (
        /* Chưa có địa chỉ */
        <div className="address-book-empty">
          <div className="address-book-empty-icon">
            <MapPin size={34} aria-hidden="true" />
          </div>

          <h3>Chưa có địa chỉ</h3>

          <p>
            Bạn chưa có địa chỉ giao hàng. Địa chỉ đầu tiên sẽ được đặt làm mặc
            định.
          </p>

          <button
            type="button"
            className="address-book-add"
            onClick={() => openEditor()}
            disabled={saving}
          >
            <Plus size={18} aria-hidden="true" />
            Thêm địa chỉ ngay
          </button>
        </div>
      ) : (
        /* Danh sách địa chỉ */
        !error && (
          <div className="address-book-list">
            {addresses.map((address) => (
              <article className="address-book-card" key={address.id}>
                <div className="address-book-card-header">
                  <div className="address-book-recipient">
                    <strong>{address.name}</strong>
                    <span>{address.phone}</span>
                  </div>

                  <div className="address-book-badges">
                    {address.label && (
                      <span className="address-book-badge">
                        {address.label}
                      </span>
                    )}

                    {address.isDefault && (
                      <span className="address-book-badge address-book-badge-default">
                        Mặc định
                      </span>
                    )}
                  </div>
                </div>

                <p className="address-book-full-address">
                  {address.fullAddress ||
                    [
                      address.addressLine,
                      address.wardName,
                      address.provinceName,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                </p>

                <div className="address-book-actions">
                  {/* Sửa địa chỉ */}
                  <button
                    type="button"
                    className="address-book-action"
                    onClick={() => openEditor(address)}
                    disabled={saving}
                  >
                    <Pencil size={16} aria-hidden="true" />
                    Sửa
                  </button>

                  {/* Đặt mặc định */}
                  {!address.isDefault && (
                    <button
                      type="button"
                      className="address-book-action address-book-action-default"
                      onClick={() =>
                        handleAction(
                          () => setDefaultAddress(address.id),
                          "Đã đặt địa chỉ mặc định",
                        )
                      }
                      disabled={saving}
                    >
                      <Star size={16} aria-hidden="true" />
                      Đặt làm mặc định
                    </button>
                  )}

                  {/* Xóa địa chỉ */}
                  <button
                    type="button"
                    className="address-book-delete"
                    onClick={() => {
                      const confirmed = window.confirm(
                        address.isDefault
                          ? "Xóa địa chỉ mặc định này? Địa chỉ còn lại đầu tiên sẽ trở thành mặc định."
                          : "Bạn có chắc chắn muốn xóa địa chỉ này?",
                      );

                      if (confirmed) {
                        handleAction(
                          () => deleteAddress(address.id),
                          "Đã xóa địa chỉ",
                        );
                      }
                    }}
                    disabled={saving}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                    Xóa
                  </button>
                </div>
              </article>
            ))}
          </div>
        )
      )}

      {/* Modal thêm hoặc sửa địa chỉ */}
      {editor !== null && (
        <div
          className="address-book-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setEditor(null);
            }
          }}
        >
          <div
            className="address-book-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="address-modal-title"
          >
            {/* Tiêu đề modal */}
            <div className="address-book-modal-header">
              <h3 id="address-modal-title">
                {editor.id ? "Sửa địa chỉ" : "Thêm địa chỉ"}
              </h3>

              <button
                type="button"
                className="address-book-close"
                onClick={() => setEditor(null)}
                disabled={saving}
                aria-label="Đóng"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSave}>
              {/* Nội dung form */}
              <div className="address-book-modal-body">
                <div className="address-book-field-group">
                  <label htmlFor="label">Tên gợi nhớ</label>

                  <input
                    id="label"
                    name="label"
                    type="text"
                    placeholder="Nhà riêng, Công ty..."
                    maxLength={100}
                    value={form.label}
                    disabled={saving}
                    onChange={handleChange}
                  />

                  <small>Không bắt buộc.</small>
                </div>

                <AddressFields
                  form={form}
                  onChange={handleChange}
                  disabled={saving}
                />

                <label className="address-book-checkbox">
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={Boolean(form.isDefault)}
                    onChange={handleChange}
                    disabled={
                      saving ||
                      Boolean(editor.isDefault) ||
                      addresses.length === 0
                    }
                  />

                  <span>Đặt làm địa chỉ mặc định</span>
                </label>
              </div>

              {/* Nút cuối form */}
              <div className="address-book-modal-footer">
                <button
                  type="button"
                  className="address-book-cancel"
                  onClick={() => setEditor(null)}
                  disabled={saving}
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="address-book-save"
                  disabled={saving}
                >
                  {saving ? (
                    "Đang lưu..."
                  ) : (
                    <>
                      <Check size={17} aria-hidden="true" />
                      Lưu địa chỉ
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default AddressBook;
