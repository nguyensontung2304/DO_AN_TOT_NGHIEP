import "./cartSteps.scss";

// Thanh tiến trình 3 bước của luồng đặt hàng.
//
// Đặt ở cấp trang (trên .cart-layout) chứ không nằm trong .cart-main:
// .cart-layout là grid 2 cột, nếu đặt bên trong cột trái thì thanh này bị
// bóp theo bề rộng cột và không trải hết chiều ngang như thiết kế.
export default function CartSteps({ currentStep }) {
  return (
    <div className="cart-steps">
      <div
        className={`cart-steps__item ${currentStep === "cart" ? "active" : "done"}`}
      >
        <span>1</span>
        Giỏ hàng
      </div>
      <div className="cart-steps__line" />
      <div
        className={`cart-steps__item ${currentStep === "checkout" ? "active" : ""}`}
      >
        <span>2</span>
        Thông tin đặt hàng
      </div>
      <div className="cart-steps__line" />
      <div
        className={`cart-steps__item ${currentStep === "success" ? "active" : ""}`}
      >
        <span>3</span>
        Xác nhận
      </div>
    </div>
  );
}