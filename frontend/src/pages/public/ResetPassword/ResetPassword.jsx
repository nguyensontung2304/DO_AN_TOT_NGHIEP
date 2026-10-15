import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { validateResetPasswordLink, resetPassword } from "../../../api/authApi";
import { ROUTES } from "../../../constants/router";
import "./resetPassword.scss";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Token được truyền trong URL fragment: /reset-password#token=...
  const token = new URLSearchParams(location.hash.slice(1)).get("token") || "";
  const hasToken = /^[a-f0-9]{64}$/.test(token);

  const [validation, setValidation] = useState({
    token: null,
    valid: false,
  });
  console.log(validation);

  const [retry, setRetry] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  useEffect(() => {
    if (!hasToken || completed) return;

    const controller = new AbortController();

    const validateLink = async () => {
      setChecking(true);
      setValidation({ token: null, valid: false });
      setError("");

      try {
        await validateResetPasswordLink(token, controller.signal);

        if (controller.signal.aborted) return;

        setValidation({
          token,
          valid: true,
        });
      } catch (err) {
        if (controller.signal.aborted) return;

        const code = err?.response?.data?.code;

        setValidation({
          token,
          valid: false,
          invalid: code === "INVALID_RESET_LINK",
          message:
            err?.response?.data?.message ||
            "Không thể kiểm tra link. Vui lòng thử lại.",
        });
      } finally {
        if (!controller.signal.aborted) {
          setChecking(false);
        }
      }
    };

    validateLink();

    return () => controller.abort();
  }, [token, hasToken, completed, retry]);

  const validatePassword = (value) => {
    if (!value) {
      return "Vui lòng nhập mật khẩu mới.";
    }

    if (value.trim().length === 0) {
      return "Mật khẩu không được chỉ chứa khoảng trắng.";
    }

    if (value.length < 8) {
      return "Mật khẩu phải có ít nhất 8 ký tự.";
    }

    if (new TextEncoder().encode(value).length > 72) {
      return "Mật khẩu tối đa 72 byte UTF-8.";
    }

    return "";
  };

  const handlePasswordChange = (event) => {
    const value = event.target.value;

    setNewPassword(value);
    setPasswordError(validatePassword(value));

    if (confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError("Mật khẩu xác nhận không khớp.");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleConfirmPasswordChange = (event) => {
    const value = event.target.value;

    setConfirmPassword(value);

    if (!value) {
      setConfirmPasswordError("Vui lòng xác nhận mật khẩu mới.");
    } else if (value !== newPassword) {
      setConfirmPasswordError("Mật khẩu xác nhận không khớp.");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextPasswordError = validatePassword(newPassword);
    const nextConfirmPasswordError = !confirmPassword
      ? "Vui lòng xác nhận mật khẩu mới."
      : confirmPassword !== newPassword
        ? "Mật khẩu xác nhận không khớp."
        : "";

    setPasswordError(nextPasswordError);
    setConfirmPasswordError(nextConfirmPasswordError);
    setError("");

    if (nextPasswordError || nextConfirmPasswordError) return;
    if (!hasToken || !validation.valid || loading) return;

    setLoading(true);

    try {
      await resetPassword({
        token,
        newPassword,
        confirmPassword,
      });

      setCompleted(true);

      // Xóa token khỏi URL sau khi sử dụng thành công.
      navigate(ROUTES.USER.RESET_PASSWORD, { replace: true });
    } catch (err) {
      const code = err?.response?.data?.code;
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể đặt lại mật khẩu. Vui lòng thử lại.";

      if (code === "INVALID_RESET_LINK") {
        setValidation({
          token,
          valid: false,
          invalid: true,
          message,
        });
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setValidation({ token: null, valid: false });
    setRetry((value) => value + 1);
  };

  let content;

  if (completed) {
    content = (
      <div className="reset_password-result">
        <div
          className="reset_password-result-icon reset_password-result-icon-success"
          aria-hidden="true"
        >
          ✓
        </div>

        <h1 className="reset_password-result-title">
          Đặt lại mật khẩu thành công
        </h1>

        <p className="reset_password-result-description">
          Bạn có thể đăng nhập bằng mật khẩu mới. Các phiên đăng nhập cũ đã hết
          hiệu lực.
        </p>

        <Link
          className="reset_password-button reset_password-button-primary"
          to={ROUTES.USER.LOGIN}
        >
          Đăng nhập
        </Link>
      </div>
    );
  } else if (!hasToken) {
    content = (
      <div className="reset_password-result">
        <div
          className="reset_password-result-icon reset_password-result-icon-warning"
          aria-hidden="true"
        >
          !
        </div>

        <h1 className="reset_password-result-title">Link không hợp lệ</h1>

        <p className="reset_password-result-description">
          Link đặt lại mật khẩu bị thiếu hoặc không đúng định dạng. Vui lòng yêu
          cầu một link mới.
        </p>

        <Link
          className="reset_password-button reset_password-button-primary"
          to={ROUTES.USER.FORGOT_PASSWORD}
        >
          Yêu cầu link mới
        </Link>
      </div>
    );
  } else if (validation.token !== token || checking) {
    content = (
      <div className="reset_password-status">
        <div className="reset_password-spinner" aria-label="Đang tải" />
        <p className="reset_password-status-text">Đang kiểm tra link...</p>
      </div>
    );
  } else if (validation.invalid) {
    content = (
      <div className="reset_password-result">
        <div
          className="reset_password-result-icon reset_password-result-icon-warning"
          aria-hidden="true"
        >
          !
        </div>

        <h1 className="reset_password-result-title">Link không còn hiệu lực</h1>

        <p className="reset_password-result-description">
          {validation.message ||
            "Link đã hết hạn hoặc đã được sử dụng. Vui lòng yêu cầu link mới."}
        </p>

        <Link
          className="reset_password-button reset_password-button-primary"
          to={ROUTES.USER.FORGOT_PASSWORD}
        >
          Yêu cầu link mới
        </Link>
      </div>
    );
  } else if (!validation.valid) {
    content = (
      <div className="reset_password-result">
        <h1 className="reset_password-result-title">Chưa kiểm tra được link</h1>

        <p className="reset_password-result-description">
          {validation.message || "Đã xảy ra lỗi khi kiểm tra link."}
        </p>

        <button
          className="reset_password-button reset_password-button-primary"
          type="button"
          onClick={handleRetry}
        >
          Thử lại
        </button>
      </div>
    );
  } else {
    content = (
      <>
        <h1 className="reset_password-title">Đặt lại mật khẩu</h1>

        <p className="reset_password-description">
          Nhập mật khẩu mới cho tài khoản của bạn. Link chỉ sử dụng được một
          lần.
        </p>

        {error && (
          <div className="reset_password-alert" role="alert">
            {error}
          </div>
        )}

        <form
          className="reset_password-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="reset_password-form-group">
            <label className="reset_password-form-label" htmlFor="new-password">
              Mật khẩu mới
            </label>

            <input
              className={`reset_password-form-input${
                passwordError ? " reset_password-form-input-error" : ""
              }`}
              id="new-password"
              name="newPassword"
              type="password"
              placeholder="Ít nhất 8 ký tự"
              autoComplete="new-password"
              value={newPassword}
              onChange={handlePasswordChange}
              maxLength={72}
              disabled={loading}
              required
            />

            {passwordError && (
              <p className="reset_password-form-error">{passwordError}</p>
            )}
          </div>

          <div className="reset_password-form-group">
            <label
              className="reset_password-form-label"
              htmlFor="confirm-password"
            >
              Xác nhận mật khẩu mới
            </label>

            <input
              className={`reset_password-form-input${
                confirmPasswordError ? " reset_password-form-input-error" : ""
              }`}
              id="confirm-password"
              name="confirmPassword"
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              maxLength={72}
              disabled={loading}
              required
            />

            {confirmPasswordError && (
              <p className="reset_password-form-error">
                {confirmPasswordError}
              </p>
            )}
          </div>

          <button
            className="reset_password-button reset_password-button-primary"
            type="submit"
            disabled={loading}
          >
            {loading ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
          </button>
        </form>
      </>
    );
  }

  return (
    <div className="reset_password">
      <div className="reset_password-card">
        {content}

        {!completed && (
          <div className="reset_password-bottom">
            <Link to={ROUTES.USER.LOGIN}>Quay lại đăng nhập</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
