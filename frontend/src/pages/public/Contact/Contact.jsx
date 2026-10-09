import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faYoutube } from "@fortawesome/free-brands-svg-icons";
import { faComment } from "@fortawesome/free-solid-svg-icons";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Inbox,
  CircleCheck,
  SquarePen,
  User,
  Map as MapIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { sendContactMessage } from "../../../api/contactApi";
import "./contact.scss";
import Map from "./map/map";

export default function Contact() {
  const currentUser = useSelector((state) => state.user.currentUser);

  // Kiểm tra profile đã đủ thông tin chưa
  const profileComplete =
    currentUser && currentUser.name?.trim() && currentUser.phone?.trim();

  //  Form state
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [sent, setSent] = useState(false);

  // Lỗi validate từng field
  const [formErrors, setFormErrors] = useState({
    name: "",
    phone: "",
    message: "",
  });

  //  Auto-fill thông tin user khi đăng nhập
  // Chỉ điền khi form chưa có giá trị (tránh ghi đè khi user đã sửa)
  useEffect(() => {
    if (currentUser) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || currentUser.name || "",
        phone: prev.phone || currentUser.phone || "",
        email: prev.email || currentUser.email || "",
      }));
    }
  }, [currentUser]);

  //  Validate form
  const validateForm = () => {
    const errors = { name: "", phone: "", message: "" };
    let valid = true;

    if (!form.name.trim()) {
      errors.name = "Vui lòng nhập họ và tên.";
      valid = false;
    }
    if (!form.phone.trim()) {
      errors.phone = "Vui lòng nhập số điện thoại.";
      valid = false;
    }
    if (!form.message.trim()) {
      errors.message = "Vui lòng nhập nội dung tin nhắn.";
      valid = false;
    }

    setFormErrors(errors);
    return valid;
  };

  //  Helper cập nhật field + xóa lỗi
  const updateField = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  //  Gửi form liên hệ
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await sendContactMessage(form);
      setSent(true);
    } catch (error) {
      console.error("Lỗi gửi tin nhắn:", error);
      alert("Gửi tin nhắn thất bại. Vui lòng thử lại sau.");
    }
  };

  return (
    <div className="contact-page">
      {/* Intro Banner */}
      <section className="contact-intro">
        <div className="contact-intro__overlay">
          <div className="contact-intro__content">
            <span>
              NỘI THẤT <em>VIỆT</em>
            </span>

            <h1>Chạm tinh tế – Mở không gian đẳng cấp.</h1>

            <p>Trọn vẹn chất lượng – Sẵn sàng tư vấn 24/7.</p>
          </div>
        </div>
      </section>

      {/*  HERO  */}
      <section className="contact-hero">
        <div className="contact-hero__inner">
          <span>VỀ CHÚNG TÔI</span>

          <div className="contact-hero__tag">
            <Inbox size={20} strokeWidth={2} />
            Hỗ trợ 7 ngày/tuần
          </div>

          <h1>Liên hệ với chúng tôi</h1>

          <p>
            Đội ngũ tư vấn sẵn sàng hỗ trợ bạn mọi lúc — hãy để lại tin nhắn!
          </p>
        </div>
      </section>

      <div className="contact-content">
        <div className="contact-inner">
          <div className="contact-layout">
            {/*  THÔNG TIN LIÊN HỆ  */}
            <div className="contact-info">
              <h2>Thông tin liên hệ</h2>

              {[
                {
                  icon: MapPin,
                  title: "Địa chỉ xưởng",
                  text: "34/16 Đường Bắc Đẩu\nThành Phố Đà Nẵng",
                },
                {
                  icon: Phone,
                  title: "Hotline",
                  text: "0795 789 458\n(8h00 – 20h00 mỗi ngày)",
                },
                {
                  icon: Mail,
                  title: "Email",
                  text: "nguyensontung@gmail.com\nsupport@noithatviet.vn",
                },
                {
                  icon: Clock,
                  title: "Giờ làm việc",
                  text: "Thứ 2 – Thứ 7: 8h00 – 20h00\nChủ nhật: 9h00 – 17h00",
                },
              ].map((item) => (
                <div key={item.title} className="contact-info__item">
                  <div className="contact-info__icon-wrap">
                    <item.icon size={24} strokeWidth={2} />
                  </div>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </div>
              ))}

              {/* Mạng xã hội */}
              <div className="contact-socials">
                <a href="#" aria-label="Facebook">
                  <FontAwesomeIcon icon={faFacebook} /> Facebook
                </a>

                <a href="#" aria-label="Zalo">
                  <FontAwesomeIcon icon={faComment} /> Zalo
                </a>

                <a href="#" aria-label="Youtube">
                  <FontAwesomeIcon icon={faYoutube} /> Youtube
                </a>
              </div>
            </div>

            {/*  FORM GỬI TIN NHẮN  */}
            <div className="contact-form-wrap">
              <h2>Gửi tin nhắn cho chúng tôi</h2>

              {/* Banner trạng thái người dùng */}
              {!sent && (
                <>
                  {currentUser && profileComplete && (
                    <div className="contact-user-banner contact-user-banner--filled">
                      <span>
                        <CircleCheck size={20} strokeWidth={2} />
                      </span>
                      <span>
                        Xin chào <strong>{currentUser.name}</strong>! Thông tin
                        của bạn đã được điền sẵn. Bạn có thể chỉnh sửa nếu cần.
                      </span>
                    </div>
                  )}
                  {currentUser && !profileComplete && (
                    <div className="contact-user-banner contact-user-banner--partial">
                      <span>
                        <SquarePen size={20} strokeWidth={2} />
                      </span>
                      <span>
                        Hồ sơ của bạn chưa đầy đủ. Vui lòng điền thông tin bên
                        dưới.
                      </span>
                    </div>
                  )}
                  {!currentUser && (
                    <div className="contact-user-banner contact-user-banner--guest">
                      <span>
                        <User size={20} strokeWidth={2} />
                      </span>
                      <span>
                        Bạn chưa đăng nhập. Vui lòng điền đầy đủ thông tin bên
                        dưới để gửi liên hệ.
                      </span>
                    </div>
                  )}
                </>
              )}

              {sent ? (
                /* Trạng thái gửi thành công */
                <div className="contact-success">
                  <div className="contact-success__icon">
                    <CircleCheck size={20} strokeWidth={2} />
                  </div>
                  <h3>Gửi thành công!</h3>
                  <p>Chúng tôi sẽ phản hồi trong vòng 24 giờ. Cảm ơn bạn!</p>
                  <button
                    onClick={() => {
                      setSent(false);
                      // Reset form nhưng giữ lại thông tin cá nhân nếu đã đăng nhập
                      setForm({
                        name: currentUser?.name || "",
                        phone: currentUser?.phone || "",
                        email: currentUser?.email || "",
                        message: "",
                      });
                      setFormErrors({ name: "", phone: "", message: "" });
                    }}
                  >
                    Gửi tin nhắn khác
                  </button>
                </div>
              ) : (
                <form
                  className="contact-form"
                  onSubmit={handleSubmit}
                  noValidate
                >
                  {/* Họ tên + Điện thoại */}
                  <div className="contact-form__row">
                    <div className="contact-form__group">
                      <label>
                        Họ và tên <span className="req">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        placeholder="Nguyễn Văn A"
                        className={formErrors.name ? "input-error" : ""}
                      />
                      {formErrors.name && (
                        <p className="contact-field-error">{formErrors.name}</p>
                      )}
                    </div>
                    <div className="contact-form__group">
                      <label>
                        Số điện thoại <span className="req">*</span>
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        placeholder="0909 123 456"
                        className={formErrors.phone ? "input-error" : ""}
                      />
                      {formErrors.phone && (
                        <p className="contact-field-error">
                          {formErrors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="contact-form__group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="email@example.com"
                    />
                  </div>

                  {/* Nội dung */}
                  <div className="contact-form__group">
                    <label>
                      Nội dung <span className="req">*</span>
                    </label>
                    <textarea
                      rows={5}
                      value={form.message}
                      onChange={(e) => updateField("message", e.target.value)}
                      placeholder="Bạn cần tư vấn về sản phẩm, báo giá, hay đặt lịch tham quan showroom?"
                      className={formErrors.message ? "input-error" : ""}
                    />
                    {formErrors.message && (
                      <p className="contact-field-error">
                        {formErrors.message}
                      </p>
                    )}
                  </div>

                  <button type="submit" className="contact-form__submit">
                    📤 Gửi tin nhắn
                  </button>
                </form>
              )}
            </div>
          </div>

          {/*  BẢN ĐỒ  */}
          <div className="contact-map">
            <div className="contact-map__label">
              <span>
                <MapIcon size={20} strokeWidth={2} />
              </span>
              <span>
                K34/16 Đường Bắc Đẩu, Quận Hải Châu, Thành Phố Đà Nẵng
              </span>
            </div>
            <div className="contact-map__placeholder">
              <Map />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
