import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import AddressFields from "../../../components/AddressFields";

import {
  getAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../../../../../api/addressApi";

import "./AddressBook.scss";

const initialForm = {
  label: "",
  fullName: "",
  phone: "",
  provinceCode: "",
  wardCode: "",
  addressLine: "",
  isDefault: false,
};

function AddressBook() {
  const dispatch = useDispatch();

  const [editor, setEditor] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  const {
    data: addresses = [],
    loading,
    error,
  } = useSelector((state) => state.address.addressList);

  const { data: user } = useSelector((state) => state.auth.userInfo);

  useEffect(() => {
    dispatch(getAddress());
  }, [dispatch]);

  // Mở form thêm hoặc sửa địa chỉ
  const openEditor = (address = null) => {
    setActionError("");
    setEditor(address || {});

    setForm({
      ...initialForm,
      ...(address || {
        fullName: user?.name || "",
        phone: user?.phone || "",
        isDefault: addresses.length === 0,
      }),
      provinceCode: address?.provinceCode ?? "",
      wardCode: address?.wardCode ?? "",
      addressLine: address?.addressLine ?? "",
    });
  };

  // Cập nhật dữ liệu khi nhập
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => {
      const next = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      if (name === "provinceCode") {
        next.wardCode = "";
      }

      return next;
    });
  };

  // Hiển thị thông báo
  const showError = (error) => {
    if (typeof error === "string") return error;

    return (
      error?.message ||
      error?.response?.data?.message ||
      "Đã xảy ra lỗi. Vui lòng thử lại."
    );
  };

  // Lưu địa chỉ
  const handleSave = async (event) => {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setActionError("");

    try {
      const values = { ...form };

      const thunk = editor.id
        ? updateAddress({
            ...values,
            id: editor.id,
          })
        : createAddress(values);

      await dispatch(thunk).unwrap();

      setEditor(null);
      setForm(initialForm);
    } catch (error) {
      setActionError(showError(error));
    } finally {
      setSaving(false);
    }
  };

  // Xóa địa chỉ hoặc đặt địa chỉ mặc định
  const handleAction = async (thunk, successMessage) => {
    if (saving) return;

    setSaving(true);
    setActionError("");

    try {
      await dispatch(thunk).unwrap();

      // Thông báo thành công bằng giao diện của component
      setActionError("");
      window.alert(successMessage);
    } catch (error) {
      setActionError(showError(error));
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
          disabled={saving || loading || Boolean(error)}
        >
          <span aria-hidden="true">＋</span>
          Thêm địa chỉ
        </button>
      </div>

      {error && (
        <div className="address-book__alert address-book__alert--error">
          <span>{showError(error)}</span>

          <button type="button" onClick={() => dispatch(getAddress())}>
            Thử lại
          </button>
        </div>
      )}

      {actionError && (
        <div className="address-book__alert address-book__alert--error">
          {actionError}
        </div>
      )}

      {loading ? (
        <div className="address-book__loading">
          <span className="address-book__spinner" />
          <p>Đang tải danh sách địa chỉ...</p>
        </div>
      ) : !error && addresses.length === 0 ? (
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
          >
            Thêm địa chỉ ngay
          </button>
        </div>
      ) : (
        <div className="address-book__list">
          {addresses.map((address) => (
            <article className="address-book__card" key={address.id}>
              <div className="address-book__card-header">
                <div className="address-book__recipient">
                  <strong>{address.fullName}</strong>
                  <span>{address.phone}</span>
                </div>

                <div className="address-book__badges">
                  {address.label && (
                    <span className="address-book__badge">{address.label}</span>
                  )}

                  {address.isDefault && (
                    <span className="address-book__badge address-book__badge--default">
                      Mặc định
                    </span>
                  )}
                </div>
              </div>

              <p className="address-book__full-address">
                {address.fullAddress}
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
                        setDefaultAddress(address.id),
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
                      handleAction(deleteAddress(address.id), "Đã xóa địa chỉ");
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
      )}

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
                      saving || editor.isDefault || addresses.length === 0
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
