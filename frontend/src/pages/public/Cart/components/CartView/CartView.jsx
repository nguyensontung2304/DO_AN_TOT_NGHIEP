import { Package } from "lucide-react";
import { Link } from "react-router-dom";
import { ShoppingCart, Trash2, Minus, Plus, ArrowLeft } from "lucide-react";
import { ROUTES } from "../../../../../constants/router";
import "./cartView.scss";

// Danh sách sản phẩm trong giỏ hàng
export default function CartView({ cart, onUpdateQty, onRemoveItem }) {
  console.log("=======> cart :", cart);

  return (
    <div className="cart-view">
      <h2 className="cart-view-title">
        <span className="cart-view-title-icon">
          <ShoppingCart size={22} />
        </span>
        <span className="cart-view-title-text">Giỏ hàng của bạn</span>
        <span className="cart-view-title-count">({cart.length} sản phẩm)</span>
      </h2>

      <div className="cart-view-items">
        {cart.map((item) => (
          <article key={item.productId} className="cart-view-item">
            <div className="cart-view-item-image">
              <img src={item.image} alt={item.name} />
            </div>

            <div className="cart-view-item-info">
              <h3 className="cart-view-item-info-name">{item.name}</h3>

              <p className="cart-view-item-info-price">
                {Number(item.price).toLocaleString("vi-VN")}₫
              </p>

              {item.recipe && item.recipe.length > 0 && (
                <details className="cart-view-item-recipe">
                  <summary className="cart-view-item-recipe-summary">
                    <Package size={15} />
                    Nguyên vật liệu cần ({item.recipe.length} loại)
                  </summary>

                  <ul className="cart-view-item-recipe-list">
                    {item.recipe.map((r, i) => (
                      <li key={i} className="cart-view-item-recipe-item">
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

            <div className="cart-view-item-actions">
              <div className="cart-view-item-actions-quantity">
                <button
                  type="button"
                  aria-label="Giảm số lượng"
                  disabled={Number(item.qty) <= 1}
                  onClick={() => onUpdateQty(item.productId, item.qty - 1)}
                >
                  <Minus size={14} />
                </button>

                <span>{item.qty}</span>

                <button
                  type="button"
                  aria-label="Tăng số lượng"
                  onClick={() => onUpdateQty(item.productId, item.qty + 1)}
                >
                  <Plus size={14} />
                </button>
              </div>

              <p className="cart-view-item-actions-subtotal">
                {(Number(item.price) * Number(item.qty)).toLocaleString(
                  "vi-VN",
                )}
                ₫
              </p>

              <button
                type="button"
                className="cart-view-item-actions-remove"
                onClick={() => onRemoveItem(item.productId)}
                aria-label="Xóa sản phẩm"
              >
                <Trash2 size={23} />
              </button>
            </div>
          </article>
        ))}
      </div>

      <Link to={ROUTES.USER.PRODUCT_LIST} className="cart-view-continue">
        <ArrowLeft size={18} /> Tiếp tục mua sắm
      </Link>
    </div>
  );
}
