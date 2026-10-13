import "./cartSummary.scss";
import { Truck, ShieldCheck } from "lucide-react";

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
    <aside className="cart-sidebar">
      <div className="cart-summary">
        <h3>Tổng đơn hàng</h3>

        <div className="cart-summary__rows">
          {cart.map((item) => (
            <div key={item.productId} className="cart-summary__row">
              <div className="cart-summary__product">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="cart-summary__image"
                  />
                )}

                <span>
                  {item.name} × {item.qty}
                </span>
              </div>

              <span>
                {(Number(item.price) * Number(item.qty)).toLocaleString(
                  "vi-VN",
                )}
                ₫
              </span>
            </div>
          ))}
        </div>

        <div className="cart-summary__divider" />

        <div className="cart-summary__total">
          <span>Tổng cộng</span>
          <strong>{cartTotal.toLocaleString("vi-VN")}₫</strong>
        </div>

        <div className="cart-summary__note">
          <div className="cart-summary__note-text">
            <Truck size={20} />
            Miễn phí giao hàng &amp; lắp đặt trong 50km
          </div>
          <div className="cart-summary__note-text">
            <ShieldCheck size={20} /> Bảo hành 5 năm chính hãng
          </div>
        </div>

        {step === "cart" && (
          <button
            className="cart-btn cart-btn--primary cart-btn--full"
            onClick={onProceedCheckout}
          >
            {isLoggedIn ? "Tiến hành đặt hàng →" : "🔒 Đăng nhập để đặt hàng"}
          </button>
        )}

        {step === "checkout" && (
          <button
            className="cart-btn cart-btn--primary cart-btn--full"
            onClick={onConfirmOrder}
          >
            ✅ Xác nhận đặt hàng
          </button>
        )}
      </div>
    </aside>
  );
}

export default CartSummary;
