import { Package, PartyPopper } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../../../constants/router";
import "./orderSuccess.scss";

// Màn hình báo đặt hàng thành công.
function OrderSuccess({ form, onViewOrders }) {
  return (
    <div className="cart-success">
      <div className="cart-success__icon">
        <PartyPopper size={48} strokeWidth={1.8} />
      </div>
      <h2>Đặt hàng thành công!</h2>
      <p>
        Cảm ơn <strong>{form.name}</strong>! Đơn hàng đã được ghi nhận.
      </p>
      <p className="cart-success__sub">
        Chúng tôi sẽ liên hệ qua <strong>{form.phone}</strong> để xác nhận.
      </p>
      <div className="cart-success__btns">
        <button className="cart-btn cart-btn--primary" onClick={onViewOrders}>
          <Package size={20} strokeWidth={1.8} /> Xem đơn hàng của tôi
        </button>
        <Link
          to={ROUTES.USER.PRODUCT_LIST}
          className="cart-btn cart-btn--outline"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    </div>
  );
}

export default OrderSuccess;
