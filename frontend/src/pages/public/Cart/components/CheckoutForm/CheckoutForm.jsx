import { ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../../../constants/router";
// import AddressFields from "../../../../../components/public/AddressFields/AddressFields";
import "./checkoutForm.scss";

// BƯỚC 2: form thông tin đặt hàng + tóm tắt đơn.
// Nếu hồ sơ đã đủ thông tin thì form được điền sẵn và hiện banner xanh.
function CheckoutForm({
  cart,
  form,
  formErrors,
  profileComplete,
  onChangeField,
  onBack,
}) {
  return (
    <>
      <h2 className="cart-section-title">
        <ClipboardList size={20} /> Thông tin đặt hàng
      </h2>

      {profileComplete ? (
        <div className="checkout-profile-banner checkout-profile-banner--filled">
          <span>✅</span>
          <span>
            Thông tin từ hồ sơ của bạn đã được điền sẵn. Bạn có thể chỉnh sửa
            nếu cần.
          </span>
        </div>
      ) : (
        <div className="checkout-profile-banner checkout-profile-banner--empty">
          <span>⚠️</span>
          <span>
            Bạn chưa cập nhật hồ sơ. Vui lòng điền đầy đủ thông tin bên dưới để
            đặt hàng.{" "}
            <Link to={ROUTES.USER.PROFILE} className="checkout-profile-link">
              Cập nhật hồ sơ ngay
            </Link>
          </span>
        </div>
      )}

      <div className="checkout-form">
        <div className="checkout-form__row">
          <div className="checkout-form__group">
            <label>
              Họ và tên <span className="req">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => onChangeField("name", e.target.value)}
              placeholder="Nguyễn Văn A"
              className={formErrors.name ? "input-error" : ""}
            />
            {formErrors.name && (
              <p className="field-error">{formErrors.name}</p>
            )}
          </div>

          <div className="checkout-form__group">
            <label>
              Số điện thoại <span className="req">*</span>
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => {
                const value = e.target.value;

                // Chỉ cho phép nhập số
                if (!/^\d*$/.test(value)) return;

                onChangeField("phone", value);
              }}
              placeholder="Nhập số điện thoại"
              className={formErrors.phone ? "input-error" : ""}
            />
            {formErrors.phone && (
              <p className="field-error">{formErrors.phone}</p>
            )}
          </div>
        </div>

        <div className="checkout-form__group">
          <label>
            Địa chỉ nhận hàng <span className="req">*</span>
          </label>
          <textarea
            rows={3}
            value={form.address}
            onChange={(e) => onChangeField("address", e.target.value)}
            placeholder="Nhập địa chỉ nhận hàng"
            className={formErrors.address ? "input-error" : ""}
          />
          {formErrors.address && (
            <p className="field-error">{formErrors.address}</p>
          )}
        </div>

        <div className="checkout-form__group">
          <label>Ghi chú (không bắt buộc)</label>
          <textarea
            rows={3}
            value={form.note}
            onChange={(e) => onChangeField("note", e.target.value)}
            placeholder="Yêu cầu đặc biệt, thời gian giao hàng..."
          />
        </div>

        {/* <AddressFields /> */}

        <div className="checkout-order-summary">
          <h3>Tóm tắt đơn hàng</h3>

          <div className="checkout-order-list">
            {cart.map((item) => (
              <div key={item.productId} className="checkout-order-row">
                <div className="checkout-order-product">
                  <div className="checkout-order-img">
                    <img src={item.image} alt={item.name} />

                    <span className="checkout-order-qty">×{item.qty}</span>
                  </div>

                  <div className="checkout-order-info">
                    <span className="checkout-order-name">{item.name}</span>

                    <span className="checkout-order-price">
                      {Number(item.price).toLocaleString("vi-VN")} ₫ / sản phẩm
                    </span>
                  </div>
                </div>

                <strong className="checkout-order-total">
                  {(Number(item.price) * Number(item.qty)).toLocaleString(
                    "vi-VN",
                  )}{" "}
                  ₫
                </strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button className="cart-btn-back" onClick={onBack}>
        ← Quay lại giỏ hàng
      </button>
    </>
  );
}

export default CheckoutForm;
