/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { getProvinces, getWards } from "../../../api/locationApi";
import "./addressFields.scss";

function AddressFields({
  form = {},
  address = null,
  onChange,
  disabled = false,
  formErrors = {},
}) {
  // Ưu tiên dữ liệu form để người dùng có thể chỉnh sửa.
  // Nếu form chưa có dữ liệu thì lấy từ địa chỉ mặc định.
  const getValue = (field) => form[field] ?? address?.[field] ?? "";

  const [provinceCode, setProvinceCode] = useState(
    String(getValue("provinceCode") || ""),
  );

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

  // Đồng bộ tỉnh/thành khi form được điền từ địa chỉ mặc định.
  useEffect(() => {
    setProvinceCode(String(getValue("provinceCode") || ""));
  }, [form.provinceCode, address?.provinceCode]);

  // Tải danh sách tỉnh/thành.
  useEffect(() => {
    let active = true;

    setProvinceList({
      data: [],
      loading: true,
      error: null,
    });

    getProvinces()
      .then((data) => {
        if (!active) return;

        setProvinceList({
          data: Array.isArray(data) ? data : [],
          loading: false,
          error: null,
        });
      })
      .catch((err) => {
        if (!active) return;

        setProvinceList({
          data: [],
          loading: false,
          error:
            err?.response?.data?.message || "Không tải được tỉnh/thành phố.",
        });
      });

    return () => {
      active = false;
    };
  }, [retry]);

  // Tải danh sách phường/xã theo tỉnh/thành đã chọn.
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
        if (!active) return;

        setWardList({
          code: provinceCode,
          data: Array.isArray(data) ? data : [],
          loading: false,
          error: null,
        });
      })
      .catch((err) => {
        if (!active) return;

        setWardList({
          code: provinceCode,
          data: [],
          loading: false,
          error: err?.response?.data?.message || "Không tải được phường/xã.",
        });
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

  // Báo thay đổi về Cart.jsx.
  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "provinceCode") {
      setProvinceCode(value);

      const provinceName =
        event.target.selectedOptions?.[0]?.textContent?.trim() || "";

      onChange?.({
        target: {
          name: "provinceCode",
          value,
          type: "select-one",
        },
      });

      onChange?.({
        target: {
          name: "provinceName",
          value: provinceName,
          type: "text",
        },
      });

      // Đổi tỉnh/thành thì phải chọn lại phường/xã.
      onChange?.({
        target: {
          name: "wardCode",
          value: "",
          type: "select-one",
        },
      });

      return;
    }

    onChange?.(event);

    if (name === "wardCode") {
      const wardName =
        event.target.selectedOptions?.[0]?.textContent?.trim() || "";

      onChange?.({
        target: {
          name: "wardName",
          value: wardName,
          type: "text",
        },
      });
    }
  };

  const renderError = (field) =>
    formErrors[field] ? (
      <small className="address-fields__error">{formErrors[field]}</small>
    ) : null;

  return (
    <div className="address-fields">
      {error && (
        <div className="address-fields__alert">
          <span>{error}</span>

          <button
            type="button"
            className="address-fields__retry"
            onClick={() => setRetry((value) => value + 1)}
            disabled={disabled}
          >
            Thử lại
          </button>
        </div>
      )}

      <div className="address-fields__group">
        <label htmlFor="name">
          Họ tên người nhận <span>*</span>
        </label>

        <input
          id="name"
          name="name"
          type="text"
          value={getValue("name")}
          onChange={handleChange}
          disabled={disabled}
          required
        />

        {renderError("name")}
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
          value={getValue("phone")}
          onChange={handleChange}
          disabled={disabled}
          required
        />

        {renderError("phone")}
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
            onChange={handleChange}
            disabled={disabled || provinceList.loading}
            required
          >
            <option value="">
              {provinceList.loading
                ? "Đang tải tỉnh/thành..."
                : "Chọn tỉnh/thành"}
            </option>

            {provinceList.data.map((item) => (
              <option key={item.code} value={String(item.code)}>
                {item.name}
              </option>
            ))}
          </select>

          {renderError("provinceCode")}
        </div>

        <div className="address-fields__group">
          <label htmlFor="wardCode">
            Phường / Xã / Đặc khu <span>*</span>
          </label>

          <select
            id="wardCode"
            name="wardCode"
            value={String(getValue("wardCode") || "")}
            onChange={handleChange}
            disabled={
              disabled || !provinceCode || wards.loading || Boolean(wards.error)
            }
            required
          >
            <option value="">
              {wards.loading ? "Đang tải phường/xã..." : "Chọn phường/xã"}
            </option>

            {wards.data.map((item) => (
              <option key={item.code} value={String(item.code)}>
                {item.name}
              </option>
            ))}
          </select>

          {renderError("wardCode")}
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
          value={getValue("addressLine")}
          onChange={handleChange}
          disabled={disabled}
          required
        />

        {renderError("addressLine")}
      </div>
    </div>
  );
}

export default AddressFields;
