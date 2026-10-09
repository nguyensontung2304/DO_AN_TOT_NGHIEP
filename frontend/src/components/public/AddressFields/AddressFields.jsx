import { useEffect, useState } from "react";
import { getProvinces, getWards } from "../../../api/locationApi";
import "./addressFields.scss";

// Dùng chung cho Sổ địa chỉ và địa chỉ nhập mới khi checkout.
function AddressFields({ form, onChange, disabled = false }) {
  const [provinceCode, setProvinceCode] = useState(form.provinceCode || "");

  const [provinceList, setProvinceList] = useState({
    data: [],
    loading: true,
    error: null,
  });

  const [wardList, setWardList] = useState({
    code: null,
    data: [],
    loading: false,
    error: null,
  });

  const [retry, setRetry] = useState(0);

  // Tải danh sách tỉnh/thành phố
  useEffect(() => {
    let active = true;

    setProvinceList((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    getProvinces()
      .then((data) => {
        if (active) {
          setProvinceList({
            data,
            loading: false,
            error: null,
          });
        }
      })
      .catch((error) => {
        if (active) {
          setProvinceList({
            data: [],
            loading: false,
            error: error.response?.data?.message || "Không tải được tỉnh/thành",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [retry]);

  // Tải danh sách phường/xã theo tỉnh đã chọn
  useEffect(() => {
    if (!provinceCode) {
      setWardList({
        code: null,
        data: [],
        loading: false,
        error: null,
      });

      return;
    }

    let active = true;

    setWardList({
      code: provinceCode,
      data: [],
      loading: true,
      error: null,
    });

    getWards(provinceCode)
      .then((data) => {
        if (active) {
          setWardList({
            code: provinceCode,
            data,
            loading: false,
            error: null,
          });
        }
      })
      .catch((error) => {
        if (active) {
          setWardList({
            code: provinceCode,
            data: [],
            loading: false,
            error: error.response?.data?.message || "Không tải được phường/xã",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [provinceCode, retry]);

  const wards =
    wardList.code === provinceCode
      ? wardList
      : {
          data: [],
          loading: Boolean(provinceCode),
          error: null,
        };

  const error = provinceList.error || wards.error;

  // Cập nhật dữ liệu vào object form được truyền từ component cha
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    if (name === "provinceCode") {
      setProvinceCode(value);

      form.provinceCode = value;
      form.wardCode = "";
      return;
    }

    if (type === "checkbox") {
      form[name] = checked;
    } else {
      form[name] = value;
    }
  };

  return (
    <div className="address-fields">
      {error && (
        <div className="address-fields__alert">
          <span>{error}</span>

          <button
            type="button"
            className="address-fields__retry"
            onClick={() => setRetry((value) => value + 1)}
          >
            Thử lại
          </button>
        </div>
      )}

      <div className="address-fields__group">
        <label htmlFor="fullName">
          Họ tên người nhận <span>*</span>
        </label>

        <input
          id="fullName"
          name="fullName"
          value={form.fullName || ""}
          onChange={handleChange}
          disabled={disabled}
          required
        />
      </div>

      <div className="address-fields__group">
        <label htmlFor="phone">
          Số điện thoại <span>*</span>
        </label>

        <input
          id="phone"
          name="phone"
          type="tel"
          placeholder="Nhập số điện thoại"
          maxLength={10}
          pattern="0[0-9]{9}"
          title="Số điện thoại gồm 10 số, bắt đầu bằng 0"
          value={form.phone || ""}
          disabled={disabled}
          required
          onChange={handleChange}
        />
      </div>

      <div className="address-fields__row">
        <div className="address-fields__group">
          <label htmlFor="provinceCode">
            Tỉnh / Thành phố <span>*</span>
          </label>

          <select
            id="provinceCode"
            name="provinceCode"
            value={provinceCode}
            disabled={disabled || provinceList.loading}
            required
            onChange={handleChange}
          >
            <option value="">
              {provinceList.loading
                ? "Đang tải tỉnh/thành..."
                : "Chọn tỉnh/thành"}
            </option>

            {provinceList.data.map((item) => (
              <option key={item.code} value={item.code}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="address-fields__group">
          <label htmlFor="wardCode">
            Phường / Xã / Đặc khu <span>*</span>
          </label>

          <select
            id="wardCode"
            name="wardCode"
            key={provinceCode}
            defaultValue={form.wardCode || ""}
            disabled={
              disabled || !provinceCode || wards.loading || Boolean(wards.error)
            }
            required
            onChange={handleChange}
          >
            <option value="">
              {wards.loading ? "Đang tải phường/xã..." : "Chọn phường/xã"}
            </option>

            {wards.data.map((item) => (
              <option key={item.code} value={item.code}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="address-fields__group">
        <label htmlFor="addressLine">
          Địa chỉ chi tiết <span>*</span>
        </label>

        <textarea
          id="addressLine"
          name="addressLine"
          rows={2}
          maxLength={160}
          placeholder="Số nhà, tên đường, thôn / tổ dân phố..."
          defaultValue={form.addressLine || ""}
          disabled={disabled}
          required
          onChange={handleChange}
        />
      </div>
    </div>
  );
}

export default AddressFields;
