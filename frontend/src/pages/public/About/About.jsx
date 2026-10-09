import {
  Trophy,
  Lightbulb,
  Handshake,
  Leaf,
  BriefcaseBusiness,
  Palette,
  Factory,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../constants/router";
import "./about.scss";

export default function About() {
  const values = [
    {
      title: "Chất lượng",
      desc: "Cam kết mang đến những sản phẩm nội thất bền đẹp và chất lượng cao.",
      icon: Trophy,
      className: "quality",
    },
    {
      title: "Sáng tạo",
      desc: "Không ngừng đổi mới trong thiết kế để tạo nên những không gian sống hiện đại.",
      icon: Lightbulb,
      className: "creative",
    },
    {
      title: "Tận tâm",
      desc: "Luôn đặt khách hàng làm trung tâm và đồng hành trong từng trải nghiệm.",
      icon: Handshake,
      className: "dedication",
    },
    {
      title: "Bền vững",
      desc: "Ưu tiên vật liệu chất lượng và quy trình sản xuất thân thiện với môi trường.",
      icon: Leaf,
      className: "sustainable",
    },
  ];

  const team = [
    {
      name: "Nguyễn Minh Tuấn",
      role: "Giám đốc Điều hành",
      icon: BriefcaseBusiness,
      className: "business",
    },
    {
      name: "Trần Thị Lan",
      role: "Giám đốc Thiết kế",
      icon: Palette,
      className: "design",
    },
    {
      name: "Lê Văn Hùng",
      role: "Giám đốc Sản xuất",
      icon: Factory,
      className: "factory",
    },
    {
      name: "Phạm Thị Mai",
      role: "Giám đốc Kinh doanh",
      icon: TrendingUp,
      className: "sales",
    },
  ];

  const stats = [
    {
      value: "2009",
      label: "Năm thành lập",
    },
    {
      value: "200+",
      label: "Nhân viên",
    },
    {
      value: "10.000+",
      label: "Khách hàng",
    },
    {
      value: "22+",
      label: "Mẫu sản phẩm",
    },
    {
      value: "15 năm",
      label: "Kinh nghiệm",
    },
    {
      value: "5 năm",
      label: "Bảo hành",
    },
  ];

  return (
    <div className="about">
      {/* INTRO BANNER */}
      <section className="about-intro">
        <div className="about-intro-overlay">
          <div className="about-intro-overlay-content">
            <span className="about-intro-overlay-content-brand">
              NỘI THẤT <em>VIỆT</em>
            </span>

            <h1 className="about-intro-overlay-content-title">
              Sản phẩm tinh tế - Chất lượng vượt trội
            </h1>

            <p className="about-intro-overlay-content-desc">
              Chất liệu tuyển chọn – Tối ưu công năng – Đẳng cấp vượt thời gian.
            </p>
          </div>
        </div>
      </section>

      {/* HERO */}
      <section className="about-hero">
        <div className="about-hero-inner">
          <span className="about-hero-inner-eyebrow">VỀ CHÚNG TÔI</span>

          <h1 className="about-hero-inner-title">Về Nội Thất Việt</h1>

          <p className="about-hero-inner-desc">
            Hơn 15 năm kiến tạo không gian sống đẹp cho hàng nghìn gia đình Việt
          </p>
        </div>
      </section>

      {/* STORY */}
      <section className="about-story">
        <div className="about-story-inner">
          <div className="about-story-inner-content">
            <div className="about-story-inner-content-text">
              <span className="about-story-inner-content-text-label">
                CÂU CHUYỆN THƯƠNG HIỆU
              </span>

              <h2 className="about-story-inner-content-text-title">
                Câu chuyện của chúng tôi
              </h2>

              <p className="about-story-inner-content-text-desc">
                Thành lập từ năm 2009, Nội Thất Việt bắt đầu từ một xưởng mộc
                nhỏ tại TP. Hồ Chí Minh với đam mê tạo ra những món đồ nội thất
                bền đẹp, giá thành hợp lý cho người Việt.
              </p>

              <p className="about-story-inner-content-text-desc">
                Sau 15 năm phát triển, chúng tôi đã mở rộng thành một nhà máy
                sản xuất hiện đại với hơn 200 nhân viên, phục vụ hơn 10.000
                khách hàng trên toàn quốc.
              </p>

              <p className="about-story-inner-content-text-desc">
                Triết lý của chúng tôi đơn giản:{" "}
                <strong>chất lượng tốt nhất, giá cả phải chăng nhất</strong>,
                bởi vì mọi gia đình đều xứng đáng có một ngôi nhà đẹp.
              </p>
            </div>

            <div className="about-story-inner-content-image">
              <img
                src="/images/about.png"
                alt="Không gian nội thất Nội Thất Việt"
              />
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="about-stats">
        <div className="about-stats-inner">
          <div className="about-stats-inner-grid">
            {stats.map((item) => (
              <div className="about-stats-inner-grid-stat" key={item.label}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="about-values">
        <div className="about-values-inner">
          <div className="about-values-inner-heading">
            <span className="about-values-inner-heading-eyebrow">
              GIÁ TRỊ CỐT LÕI
            </span>

            <h2 className="about-values-inner-heading-title">
              Những điều tạo nên Nội Thất Việt
            </h2>

            <p className="about-values-inner-heading-desc">
              Chúng tôi luôn đặt chất lượng, sự sáng tạo và trải nghiệm khách
              hàng làm nền tảng cho mọi sản phẩm.
            </p>
          </div>

          <div className="about-values-inner-list">
            {values.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className={`about-values-inner-list-value about-values-inner-list-value--${item.className}`}
                >
                  <div className="about-values-inner-list-value-icon">
                    <Icon size={30} strokeWidth={1.8} />
                  </div>

                  <div className="about-values-inner-list-value-content">
                    <h3 className="about-values-inner-list-value-content-title">
                      {item.title}
                    </h3>

                    <p className="about-values-inner-list-value-content-desc">
                      {item.desc}
                    </p>

                    <div className="about-values-inner-list-value-content-line">
                      <ArrowRight size={17} strokeWidth={1.8} />
                      <span></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="about-team">
        <div className="about-team-inner">
          <div className="about-team-inner-heading">
            <span className="about-team-inner-heading-eyebrow">
              ĐỘI NGŨ CỦA CHÚNG TÔI
            </span>

            <h2 className="about-team-inner-heading-title">Đội ngũ lãnh đạo</h2>

            <p className="about-team-inner-heading-desc">
              Những con người đứng sau mỗi sản phẩm và hành trình phát triển của
              Nội Thất Việt.
            </p>
          </div>

          <div className="about-team-inner-list">
            {team.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.name}
                  className={`about-team-inner-list-member about-team-inner-list-member--${item.className}`}
                >
                  <div className="about-team-inner-list-member-avatar">
                    <Icon size={32} strokeWidth={1.8} />
                  </div>

                  <div className="about-team-inner-list-member-info">
                    <h3 className="about-team-inner-list-member-info-name">
                      {item.name}
                    </h3>

                    <p className="about-team-inner-list-member-info-role">
                      {item.role}
                    </p>

                    <span className="about-team-inner-list-member-info-line"></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <div className="about-cta-inner">
          <span className="about-cta-inner-eyebrow">KHÁM PHÁ NGAY</span>

          <h2 className="about-cta-inner-title">
            Sẵn sàng trang trí ngôi nhà?
          </h2>

          <p className="about-cta-inner-desc">
            Khám phá 22+ mẫu sản phẩm nội thất cao cấp của chúng tôi.
          </p>

          <div className="about-cta-inner-buttons">
            <Link
              to={ROUTES.USER.PRODUCT_LIST}
              className="about-cta-inner-buttons-primary"
            >
              Xem sản phẩm
              <ArrowRight
                className="about-cta-inner-buttons-primary-icon"
                size={18}
              />
            </Link>

            <Link
              to={ROUTES.USER.CONTACT}
              className="about-cta-inner-buttons-outline"
            >
              Liên hệ ngay
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
