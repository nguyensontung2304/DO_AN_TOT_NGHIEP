import "./cartSummary.scss";
import {
  Truck,
  ShieldCheck,
  ArrowRight,
  LockKeyhole,
  CheckCircle,
} from "lucide-react";

// Sidebar: tóm tắt đơn hàng + nút hành động theo bước hiện tại.
function CartSummary({
  cart,
  cartTotal,
  step,
  isLoggedIn,
  onProceedCheckout,
  onConfirmOrder,
}) {
  return (
    <aside className="cart-summary">
      {/* Tiêu đề */}
      <h3 className="cart-summary__title">Tổng đơn hàng</h3>

      {/* Danh sách sản phẩm */}
      <div className="cart-summary__list">
        {cart.map((item) => (
          <div key={item.productId} className="cart-summary__item">
            <div className="cart-summary__product">
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="cart-summary__product-image"
                />
              )}

              <span className="cart-summary__product-name">
                {item.name} × {item.qty}
              </span>
            </div>

            <span className="cart-summary__item-price">
              {(Number(item.price) * Number(item.qty)).toLocaleString("vi-VN")}{" "}
              ₫
            </span>
          </div>
        ))}
      </div>

      {/* Đường phân cách */}
      <div className="cart-summary__divider" />

      {/* Tổng tiền */}
      <div className="cart-summary__total">
        <span className="cart-summary__total-label">Tổng cộng</span>

        <strong className="cart-summary__total-price">
          {cartTotal.toLocaleString("vi-VN")} ₫
        </strong>
      </div>

      {/* Chính sách */}
      <div className="cart-summary__policies">
        <div className="cart-summary__policy">
          <Truck size={20} className="cart-summary__policy-icon" />
          <span>Miễn phí giao hàng &amp; lắp đặt trong 50km</span>
        </div>

        <div className="cart-summary__policy">
          <ShieldCheck size={20} className="cart-summary__policy-icon" />
          <span>Bảo hành 5 năm chính hãng</span>
        </div>
      </div>

      {/* Hành động theo bước */}
      {step === "cart" && (
        <button
          type="button"
          className="cart-summary__button public-button-gradient"
          onClick={onProceedCheckout}
        >
          {isLoggedIn ? (
            <>
              <span>Tiến hành đặt hàng</span>
              <ArrowRight size={18} />
            </>
          ) : (
            <>
              <LockKeyhole size={18} />
              <span>Đăng nhập để đặt hàng</span>
            </>
          )}
        </button>
      )}

      {step === "checkout" && (
        <button
          type="button"
          className="cart-summary__button public-button-gradient"
          onClick={onConfirmOrder}
        >
          <CheckCircle size={18} />
          <span>Xác nhận đặt hàng</span>
        </button>
      )}
    </aside>
  );
}

export default CartSummary;
