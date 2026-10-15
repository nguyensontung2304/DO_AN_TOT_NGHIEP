import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
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
  // Danh sách địa chỉ lấy trực tiếp từ API
  const [addresses, setAddresses] = useState([]);

  // Trạng thái tải dữ liệu
  const [loading, setLoading] = useState(true);

  // Trạng thái lưu, sửa, xóa hoặc đặt mặc định
  const [saving, setSaving] = useState(false);

  // Lỗi tải danh sách
  const [error, setError] = useState("");

  // Lỗi thao tác
  const [actionError, setActionError] = useState("");

  // Modal thêm hoặc sửa địa chỉ
  const [editor, setEditor] = useState(null);

  // Dữ liệu form
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

  // Lấy danh sách địa chỉ từ backend
  const fetchAddress = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getAddress();

      // API hiện tại trả về một mảng địa chỉ.
      // Hỗ trợ cả trường hợp dữ liệu được bọc trong data.
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

  // Tải danh sách khi component được mở
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

  // Cập nhật dữ liệu khi người dùng nhập
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => {
      const next = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      // Khi đổi tỉnh/thành, phải chọn lại phường/xã
      if (name === "provinceCode") {
        next.wardCode = "";
      }

      return next;
    });
  };

  // Thêm hoặc cập nhật địa chỉ qua API
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

      // Lấy lại dữ liệu mới nhất từ backend
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
      <div className="address-book__header">
        <h2>Sổ địa chỉ</h2>

        <button
          type="button"
          className="address-book__add"
          onClick={() => openEditor()}
          disabled={saving || loading}
        >
          <span aria-hidden="true">＋</span>
          Thêm địa chỉ
        </button>
      </div>

      {/* Lỗi tải danh sách */}
      {error && (
        <div className="address-book__alert address-book__alert--error">
          <span>{error}</span>

          <button
            type="button"
            onClick={fetchAddresses}
            disabled={loading || saving}
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Lỗi thêm, sửa, xóa hoặc đặt mặc định */}
      {actionError && (
        <div className="address-book__alert address-book__alert--error">
          {actionError}
        </div>
      )}

      {/* Trạng thái tải dữ liệu */}
      {loading ? (
        <div className="address-book__loading">
          <span className="address-book__spinner" />
          <p>Đang tải danh sách địa chỉ...</p>
        </div>
      ) : !error && addresses.length === 0 ? (
        /* Chưa có địa chỉ */
        <div className="address-book__empty">
          <div className="address-book__empty-icon">⌖</div>

          <h3>Chưa có địa chỉ</h3>

          <p>
            Bạn chưa có địa chỉ giao hàng. Địa chỉ đầu tiên sẽ được đặt làm mặc
            định.
          </p>

          <button
            type="button"
            className="address-book__add"
            onClick={() => openEditor()}
            disabled={saving}
          >
            <MapPin size={18} />
            Thêm địa chỉ ngay
          </button>
        </div>
      ) : (
        /* Danh sách địa chỉ */
        !error && (
          <div className="address-book__list">
            {addresses.map((address) => (
              <article className="address-book__card" key={address.id}>
                <div className="address-book__card-header">
                  <div className="address-book__recipient">
                    <strong>{address.name}</strong>
                    <span>{address.phone}</span>
                  </div>

                  <div className="address-book__badges">
                    {address.label && (
                      <span className="address-book__badge">
                        {address.label}
                      </span>
                    )}

                    {address.isDefault && (
                      <span className="address-book__badge address-book__badge--default">
                        Mặc định
                      </span>
                    )}
                  </div>
                </div>

                <p className="address-book__full-address">
                  {address.fullAddress ||
                    [
                      address.addressLine,
                      address.wardName,
                      address.provinceName,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                </p>

                <div className="address-book__actions">
                  <button
                    type="button"
                    onClick={() => openEditor(address)}
                    disabled={saving}
                  >
                    Sửa
                  </button>

                  {!address.isDefault && (
                    <button
                      type="button"
                      onClick={() =>
                        handleAction(
                          () => setDefaultAddress(address.id),
                          "Đã đặt địa chỉ mặc định",
                        )
                      }
                      disabled={saving}
                    >
                      Đặt làm mặc định
                    </button>
                  )}

                  <button
                    type="button"
                    className="address-book__delete"
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
          className="address-book__overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setEditor(null);
            }
          }}
        >
          <div
            className="address-book__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="address-modal-title"
          >
            <div className="address-book__modal-header">
              <h3 id="address-modal-title">
                {editor.id ? "Sửa địa chỉ" : "Thêm địa chỉ"}
              </h3>

              <button
                type="button"
                className="address-book__close"
                onClick={() => setEditor(null)}
                disabled={saving}
                aria-label="Đóng"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="address-book__modal-body">
                <div className="address-fields__group">
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

                <label className="address-book__checkbox">
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

              <div className="address-book__modal-footer">
                <button
                  type="button"
                  className="address-book__cancel"
                  onClick={() => setEditor(null)}
                  disabled={saving}
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="address-book__save"
                  disabled={saving}
                >
                  {saving ? "Đang lưu..." : "Lưu địa chỉ"}
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
