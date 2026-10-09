import { Link } from "react-router-dom";

import { ROUTES } from "../../../../../constants/router";

import "./cartView.scss";

// BƯỚC 1: danh sách sản phẩm trong giỏ.
// Mỗi dòng cho phép đổi số lượng, xem nguyên vật liệu cần dùng và xoá sản phẩm.
export default function CartView({ cart, onUpdateQty, onRemoveItem }) {
  return (
    <>
      <h2 className="cart-section-title">
        🛒 Giỏ hàng của bạn
        <span className="cart-count">({cart.length} sản phẩm)</span>
      </h2>

      <div className="cart-items">
        {cart.map((item) => (
          <div key={item.productId} className="cart-item">
            <div className="cart-item__img">
              <img src={item.image} alt={item.name} />
            </div>

            <div className="cart-item__info">
              <h3>{item.name}</h3>
              <p className="cart-item__price">
                {Number(item.price).toLocaleString("vi-VN")}₫
              </p>

              {item.recipe && item.recipe.length > 0 && (
                <details className="cart-item__recipe">
                  <summary>
                    Nguyên vật liệu cần ({item.recipe.length} loại)
                  </summary>
                  <ul>
                    {item.recipe.map((r, i) => (
                      <li key={i}>
                        {r.materialName}:{" "}
                        <strong>
                          {r.qty * item.qty} {r.unit}
                        </strong>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>

            <div className="cart-item__actions">
              <div className="cart-qty">
                <button
                  onClick={() => onUpdateQty(item.productId, item.qty - 1)}
                >
                  −
                </button>
                <span>{item.qty}</span>
                <button
                  onClick={() => onUpdateQty(item.productId, item.qty + 1)}
                >
                  +
                </button>
              </div>

              <p className="cart-item__subtotal">
                {(Number(item.price) * Number(item.qty)).toLocaleString(
                  "vi-VN",
                )}
                ₫
              </p>

              <button
                className="cart-item__remove"
                onClick={() => onRemoveItem(item.productId)}
                aria-label="Xóa sản phẩm"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      <Link to={ROUTES.USER.PRODUCT_LIST} className="cart-continue">
        ← Tiếp tục mua sắm
      </Link>
    </>
  );
}
