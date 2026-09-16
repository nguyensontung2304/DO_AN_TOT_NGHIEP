import { Link } from "react-router-dom";
import { ROUTES } from "../../../constants/router";

import "./about.scss";

export default function About() {
  return (
    <div className="about-page">
      {/* Hero */}
      <section className="about-hero">
        <div className="about-hero__inner">
          <h1>Về Nội Thất Việt</h1>
          <p>
            Hơn 15 năm kiến tạo không gian sống đẹp cho hàng nghìn gia đình Việt
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="about-section">
        <div className="about-inner">
          <div className="about-story">
            <div className="about-story__text">
              <h2>Câu chuyện của chúng tôi</h2>
              <p>
                Thành lập từ năm 2009, Nội Thất Việt bắt đầu từ một xưởng mộc
                nhỏ tại TP. Hồ Chí Minh với đam mê tạo ra những món đồ nội thất
                bền đẹp, giá thành hợp lý cho người Việt.
              </p>
              <p>
                Sau 15 năm phát triển, chúng tôi đã mở rộng thành một nhà máy
                sản xuất hiện đại với hơn 200 nhân viên, phục vụ hơn 10.000
                khách hàng trên toàn quốc.
              </p>
              <p>
                Triết lý của chúng tôi đơn giản:{" "}
                <strong>chất lượng tốt nhất, giá cả phải chăng nhất</strong>,
                bởi vì mọi gia đình đều xứng đáng có một ngôi nhà đẹp.
              </p>
            </div>
            <div className="about-story__visual">
              <div className="about-visual-grid">
                {["🏭", "👷", "🪵", "🛋️"].map((icon, i) => (
                  <div key={i} className="about-visual-card">
                    <span>{icon}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="about-stats">
        <div className="about-inner">
          <div className="about-stats__grid">
            {[
              { value: "2009", label: "Năm thành lập" },
              { value: "200+", label: "Nhân viên" },
              { value: "10.000+", label: "Khách hàng" },
              { value: "22+", label: "Mẫu sản phẩm" },
              { value: "15 năm", label: "Kinh nghiệm" },
              { value: "5 năm", label: "Bảo hành" },
            ].map((s) => (
              <div key={s.label} className="about-stat">
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="about-section">
        <div className="about-inner">
          <h2 className="about-section-title">Giá trị cốt lõi</h2>
          <div className="about-values">
            {[
              {
                icon: "🏆",
                title: "Chất lượng",
                desc: "Nguyên liệu cao cấp, quy trình sản xuất nghiêm ngặt theo tiêu chuẩn quốc tế.",
              },
              {
                icon: "💡",
                title: "Sáng tạo",
                desc: "Đội ngũ thiết kế liên tục cập nhật xu hướng nội thất mới nhất từ Châu Âu và Nhật Bản.",
              },
              {
                icon: "🤝",
                title: "Tận tâm",
                desc: "Phục vụ khách hàng là ưu tiên số một — từ tư vấn đến lắp đặt và bảo hành.",
              },
              {
                icon: "🌱",
                title: "Bền vững",
                desc: "Sử dụng gỗ từ rừng trồng bền vững, giảm thiểu tác động môi trường.",
              },
            ].map((item) => (
              <div key={item.title} className="about-value">
                <span>{item.icon}</span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="about-section about-section--gray">
        <div className="about-inner">
          <h2 className="about-section-title">Đội ngũ lãnh đạo</h2>
          <div className="about-team">
            {[
              {
                name: "Nguyễn Minh Tuấn",
                role: "Giám đốc Điều hành",
                avatar: "👨‍💼",
              },

              {
                name: "Trần Thị Lan",
                role: "Giám đốc Thiết kế",
                avatar: "👩‍🎨",
              },

              {
                name: "Lê Văn Hùng",
                role: "Giám đốc Sản xuất",
                avatar: "👨‍🔧",
              },

              {
                name: "Phạm Thị Mai",
                role: "Giám đốc Kinh doanh",
                avatar: "👩‍💼",
              },
            ].map((item) => (
              <div key={item.name} className="about-member">
                <div className="about-member__avatar">{item.avatar}</div>
                <h3>{item.name}</h3>
                <p>{item.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <h2>Sẵn sàng trang trí ngôi nhà?</h2>
        <p>Khám phá 22+ mẫu sản phẩm nội thất cao cấp của chúng tôi.</p>
        <div className="about-cta__btns">
          <Link
            to={ROUTES.USER.PRODUCT_LIST}
            className="about-cta__btn about-cta__btn--primary"
          >
            Xem sản phẩm
          </Link>
          <Link
            to={ROUTES.USER.CONTACT}
            className="about-cta__btn about-cta__btn--outline"
          >
            Liên hệ ngay
          </Link>
        </div>
      </section>
    </div>
  );
}
