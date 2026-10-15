import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../constants/router";
import { forgotPassword } from "../../../api/authApi";
import "./forgotPassword.scss";

const RESEND_COOLDOWN = 60;

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sentEmail, setSentEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Vui lòng nhập email của bạn.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const result = await forgotPassword({
        email: trimmedEmail,
      });

      setSentEmail(trimmedEmail);
      setCountdown(result?.resendAfter ?? RESEND_COOLDOWN);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể gửi yêu cầu. Vui lòng thử lại sau.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (loading || countdown > 0 || !sentEmail) return;

    setError("");
    setLoading(true);

    try {
      const result = await forgotPassword({
        email: sentEmail,
      });

      setCountdown(result?.resendAfter ?? RESEND_COOLDOWN);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể gửi lại email. Vui lòng thử lại sau.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = () => {
    setSentEmail("");
    setError("");
    setCountdown(0);
  };

  return (
    <div className="forgot_password">
      {!sentEmail ? (
        <div className="forgot_password-card">
          <h1 className="forgot_password-title">Quên mật khẩu?</h1>

          <p className="forgot_password-description">
            Nhập địa chỉ email của bạn. Nếu email hợp lệ, chúng tôi sẽ gửi hướng
            dẫn đặt lại mật khẩu.
          </p>

          {error && (
            <div className="forgot_password-alert" role="alert">
              {error}
            </div>
          )}

          <form className="forgot_password-form" onSubmit={handleSubmit}>
            <div className="forgot_password-form-group">
              <label
                className="forgot_password-form-label"
                htmlFor="forgot-email"
              >
                Địa chỉ email
              </label>

              <input
                id="forgot-email"
                className="forgot_password-form-input"
                type="email"
                name="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>

            <button
              className="forgot_password-button forgot_password-button-primary"
              type="submit"
              disabled={loading}
            >
              {loading ? "Đang gửi..." : "Gửi hướng dẫn"}
            </button>
          </form>

          <div className="forgot_password-bottom">
            <Link to="/login">Quay lại đăng nhập</Link>
          </div>
        </div>
      ) : (
        <div className="forgot_password-card">
          <div className="forgot_password-result">
            <div className="forgot_password-result-icon" aria-hidden="true">
              ✉
            </div>

            <h1 className="forgot_password-title">Kiểm tra email của bạn</h1>

            <p className="forgot_password-description">
              Nếu địa chỉ <strong>{sentEmail}</strong> tồn tại trong hệ thống,
              bạn sẽ nhận được hướng dẫn đặt lại mật khẩu. Vui lòng kiểm tra cả
              thư mục spam.
            </p>

            {error && (
              <div className="forgot_password-alert" role="alert">
                {error}
              </div>
            )}

            <div className="forgot_password-result-actions">
              <button
                className="forgot_password-button forgot_password-button-primary"
                type="button"
                onClick={handleResend}
                disabled={loading || countdown > 0}
              >
                {loading
                  ? "Đang gửi..."
                  : countdown > 0
                    ? `Gửi lại sau ${countdown}s`
                    : "Gửi lại email"}
              </button>

              <button
                className="forgot_password-button forgot_password-button-secondary"
                type="button"
                onClick={handleChangeEmail}
              >
                Đổi email
              </button>
            </div>

            <div className="forgot_password-bottom">
              <Link to={ROUTES.USER.LOGIN}>Quay lại đăng nhập</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
