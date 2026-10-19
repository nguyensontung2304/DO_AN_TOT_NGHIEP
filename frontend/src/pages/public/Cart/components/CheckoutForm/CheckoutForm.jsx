import {
  ClipboardList,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../../../constants/router";
import AddressFields from "../../../../../components/public/AddressFields/AddressFields";
import "./checkoutForm.scss";

function CheckoutForm({
  cart,
  form,
  address,
  formErrors,
  profileComplete,
  onChangeField,
  onBack,
}) {
  return (
    <section className="checkout-form">
      {/* Tiêu đề */}
      <h2 className="checkout-form__title">
        <ClipboardList size={20} />
        <span>Thông tin đặt hàng</span>
      </h2>

      {/* Thông báo hồ sơ */}
      {profileComplete ? (
        <div className="checkout-form__profile-banner checkout-form__profile-banner--filled">
          <CheckCircle className="checkout-form__profile-icon" size={20} />

          <p className="checkout-form__profile-message">
            Thông tin từ hồ sơ của bạn đã được điền sẵn. Bạn có thể chỉnh sửa
            nếu cần.
          </p>
        </div>
      ) : (
        <div className="checkout-form__profile-banner checkout-form__profile-banner--empty">
          <AlertTriangle className="checkout-form__profile-icon" size={20} />

          <p className="checkout-form__profile-message">
            Bạn chưa cập nhật hồ sơ. Vui lòng điền đầy đủ thông tin bên dưới để
            đặt hàng.{" "}
            <Link
              to={ROUTES.USER.PROFILE}
              className="checkout-form__profile-link"
            >
              Cập nhật hồ sơ ngay
            </Link>
          </p>
        </div>
      )}

      {/* Thông tin người nhận */}
      <div className="checkout-form__fields">
        <AddressFields
          form={form}
          address={address}
          onChange={onChangeField}
          formErrors={formErrors}
        />

        {/* Ghi chú */}
        <div className="checkout-form__note">
          <label className="checkout-form__note-label" htmlFor="checkout-note">
            Ghi chú (không bắt buộc)
          </label>

          <textarea
            id="checkout-note"
            className="checkout-form__note-input"
            rows={3}
            value={form.note}
            onChange={(e) => onChangeField("note", e.target.value)}
            placeholder="Yêu cầu đặc biệt, thời gian giao hàng..."
          />
        </div>

        {/* Tóm tắt đơn hàng */}
        <section className="checkout-form__summary">
          <h3 className="checkout-form__summary-title">Tóm tắt đơn hàng</h3>

          <div className="checkout-form__product-list">
            {cart.map((item) => (
              <div key={item.productId} className="checkout-form__product">
                <div className="checkout-form__product-info">
                  <div className="checkout-form__product-image">
                    <img src={item.image} alt={item.name} />

                    <span className="checkout-form__product-quantity">
                      ×{item.qty}
                    </span>
                  </div>

                  <div className="checkout-form__product-details">
                    <span className="checkout-form__product-name">
                      {item.name}
                    </span>

                    <span className="checkout-form__product-price">
                      {Number(item.price).toLocaleString("vi-VN")} ₫ / sản phẩm
                    </span>
                  </div>
                </div>

                <strong className="checkout-form__product-total">
                  {(Number(item.price) * Number(item.qty)).toLocaleString(
                    "vi-VN",
                  )}{" "}
                  ₫
                </strong>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Quay lại giỏ hàng */}
      <button
        type="button"
        className="checkout-form__back-button"
        onClick={onBack}
      >
        <ArrowLeft size={18} />
        <span>Quay lại giỏ hàng</span>
      </button>
    </section>
  );
}

export default CheckoutForm;
