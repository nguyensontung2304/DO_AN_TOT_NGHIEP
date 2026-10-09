import { ClipboardList, CheckCircle, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../../../constants/router";
import AddressFields from "../../../../../components/public/AddressFields/AddressFields";
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
          <div>
            <CheckCircle size={20} color="green" />
          </div>
          <span>
            Thông tin từ hồ sơ của bạn đã được điền sẵn. Bạn có thể chỉnh sửa
            nếu cần.
          </span>
        </div>
      ) : (
        <div className="checkout-profile-banner checkout-profile-banner--empty">
          <div>
            <AlertTriangle size={20} color="#EAB308" />
          </div>
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
        <AddressFields
          form={form}
          onChange={onChangeField}
        />

        <div className="checkout-form__group">
          <label>Ghi chú (không bắt buộc)</label>
          <textarea
            rows={3}
            value={form.note}
            onChange={(e) => onChangeField("note", e.target.value)}
            placeholder="Yêu cầu đặc biệt, thời gian giao hàng..."
          />
        </div>

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
