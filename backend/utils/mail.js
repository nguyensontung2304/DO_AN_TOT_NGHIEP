import models from "../models/index.js";

import transporter, { isMailConfigured } from "../config/mail.js";

const { Order, OrderItem, Product, User } = models;

// ESCAPE HTML
function escapeHtml(text) {
  return String(text ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// FORMAT GIÁ
const formatPrice = (price) =>
  `${Number(price || 0).toLocaleString("vi-VN")} đ`;

// TẠO HTML EMAIL
function buildOrderEmailHtml(order) {
  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const orderCode = order.code || "Đang cập nhật";

  const orderUrl = `${process.env.CLIENT_URL}/cart/orders`;

  const itemRows = (order.order_items || [])
    .map(
      (item) => `
        <tr>
          <td style="
            padding: 14px 12px;
            border-bottom: 1px solid #eee5dc;
            color: #493629;
            font-size: 14px;
          ">
            <strong style="font-weight: 600;">
              ${escapeHtml(
                item.product?.name || item.name || "Sản phẩm đã bị xóa",
              )}
            </strong>
          </td>

          <td style="
            padding: 14px 8px;
            border-bottom: 1px solid #eee5dc;
            text-align: center;
            color: #666666;
            font-size: 14px;
          ">
            ${Number(item.qty)}
          </td>

          <td style="
            padding: 14px 8px;
            border-bottom: 1px solid #eee5dc;
            text-align: right;
            color: #666666;
            font-size: 14px;
            white-space: nowrap;
          ">
            ${formatPrice(item.price)}
          </td>

          <td style="
            padding: 14px 12px;
            border-bottom: 1px solid #eee5dc;
            text-align: right;
            color: #493629;
            font-size: 14px;
            font-weight: 600;
            white-space: nowrap;
          ">
            ${formatPrice(Number(item.price) * Number(item.qty))}
          </td>
        </tr>
      `,
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Xác nhận đơn hàng</title>
</head>

<body style="
  margin: 0;
  padding: 0;
  background-color: #f5f2ed;
  font-family: Arial, Helvetica, sans-serif;
  color: #493629;
">
  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
      background-color: #f5f2ed;
      padding: 30px 12px;
    "
  >
    <tr>
      <td align="center">

        <!-- CONTAINER -->
        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            max-width: 680px;
            background-color: #ffffff;
            border: 1px solid #e8e0d6;
            border-radius: 12px;
            overflow: hidden;
          "
        >

          <!-- HEADER -->
          <tr>
            <td style="
              background-color: #493629;
              padding: 28px 30px;
              text-align: center;
            ">
              <div style="
                font-size: 26px;
                font-weight: 700;
                color: #ffffff;
                letter-spacing: 1px;
              ">
                NỘI THẤT VIỆT
              </div>

              <div style="
                margin-top: 8px;
                font-size: 12px;
                letter-spacing: 2px;
                color: #e5d2bc;
              ">
                KIẾN TẠO KHÔNG GIAN SỐNG
              </div>
            </td>
          </tr>

          <!-- SUCCESS -->
          <tr>
            <td style="
              padding: 36px 30px 24px;
              text-align: center;
            ">
              <div style="
                display: inline-block;
                width: 58px;
                height: 58px;
                line-height: 58px;
                margin-bottom: 18px;
                border-radius: 50%;
                background-color: #f3ebe2;
                color: #8b6548;
                font-size: 30px;
                font-weight: bold;
              ">
                ✓
              </div>

              <div style="
                font-size: 25px;
                line-height: 1.4;
                font-weight: 700;
                color: #493629;
              ">
                Đặt hàng thành công
              </div>

              <div style="
                margin-top: 10px;
                font-size: 14px;
                line-height: 1.8;
                color: #666666;
              ">
                Cảm ơn bạn đã tin tưởng và mua sắm
                tại Nội Thất Việt.
              </div>
            </td>
          </tr>

          <!-- GREETING -->
          <tr>
            <td style="padding: 0 30px 25px;">
              <div style="
                font-size: 15px;
                line-height: 1.8;
                color: #493629;
              ">
                Xin chào
                <strong>
                  ${escapeHtml(order.user?.name || "Quý khách")}
                </strong>,
              </div>

              <div style="
                margin-top: 8px;
                font-size: 14px;
                line-height: 1.8;
                color: #666666;
              ">
                Đơn hàng của bạn đã được tiếp nhận thành công.
                Dưới đây là thông tin chi tiết đơn hàng:
              </div>
            </td>
          </tr>

          <!-- ORDER INFO -->
          <tr>
            <td style="padding: 0 30px 25px;">
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  background-color: #faf7f3;
                  border: 1px solid #eee5dc;
                  border-radius: 8px;
                "
              >
                <tr>
                  <td
                    width="50%"
                    style="
                      padding: 18px;
                      border-right: 1px solid #eee5dc;
                    "
                  >
                    <div style="
                      font-size: 12px;
                      color: #8b6548;
                      margin-bottom: 8px;
                    ">
                      MÃ ĐƠN HÀNG
                    </div>

                    <div style="
                      font-size: 18px;
                      font-weight: 700;
                      color: #493629;
                      letter-spacing: 1px;
                    ">
                      #${escapeHtml(orderCode)}
                    </div>
                  </td>

                  <td width="50%" style="padding: 18px;">
                    <div style="
                      font-size: 12px;
                      color: #8b6548;
                      margin-bottom: 8px;
                    ">
                      NGÀY ĐẶT HÀNG
                    </div>

                    <div style="
                      font-size: 15px;
                      font-weight: 600;
                      color: #493629;
                    ">
                      ${escapeHtml(orderDate)}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- PRODUCTS TITLE -->
          <tr>
            <td style="padding: 0 30px 12px;">
              <div style="
                font-size: 17px;
                font-weight: 700;
                color: #493629;
              ">
                Chi tiết đơn hàng
              </div>
            </td>
          </tr>

          <!-- PRODUCTS -->
          <tr>
            <td style="padding: 0 30px;">
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  border: 1px solid #eee5dc;
                  border-radius: 8px;
                  overflow: hidden;
                "
              >
                <thead>
                  <tr style="background-color: #f3ebe2;">
                    <th
                      align="left"
                      style="
                        padding: 12px;
                        font-size: 12px;
                        color: #493629;
                        text-transform: uppercase;
                      "
                    >
                      Sản phẩm
                    </th>

                    <th style="
                      padding: 12px 8px;
                      font-size: 12px;
                      color: #493629;
                      text-transform: uppercase;
                    ">
                      SL
                    </th>

                    <th
                      align="right"
                      style="
                        padding: 12px 8px;
                        font-size: 12px;
                        color: #493629;
                        text-transform: uppercase;
                      "
                    >
                      Đơn giá
                    </th>

                    <th
                      align="right"
                      style="
                        padding: 12px;
                        font-size: 12px;
                        color: #493629;
                        text-transform: uppercase;
                      "
                    >
                      Thành tiền
                    </th>
                  </tr>
                </thead>

                <tbody>
                  ${itemRows}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- TOTAL -->
          <tr>
            <td style="padding: 20px 30px 28px;">
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  background-color: #faf7f3;
                  border-radius: 8px;
                "
              >
                <tr>
                  <td style="
                    padding: 18px;
                    font-size: 14px;
                    font-weight: 600;
                    color: #493629;
                  ">
                    Tổng tiền
                  </td>

                  <td
                    align="right"
                    width="180"
                    style="
                      padding: 18px;
                      font-size: 22px;
                      font-weight: 700;
                      color: #8b6548;
                    "
                  >
                    ${formatPrice(order.total)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- DELIVERY INFO -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="
                font-size: 17px;
                font-weight: 700;
                color: #493629;
                margin-bottom: 12px;
              ">
                Thông tin giao hàng
              </div>

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  border: 1px solid #eee5dc;
                  border-radius: 8px;
                "
              >
                <tr>
                  <td style="
                    padding: 12px 15px 5px;
                    font-size: 12px;
                    color: #8b6548;
                  ">
                    NGƯỜI NHẬN
                  </td>
                </tr>

                <tr>
                  <td style="
                    padding: 0 15px 12px;
                    font-size: 15px;
                    font-weight: 600;
                    color: #493629;
                  ">
                    ${escapeHtml(order.name)}
                  </td>
                </tr>

                <tr>
                  <td style="
                    padding: 0 15px 5px;
                    font-size: 12px;
                    color: #8b6548;
                  ">
                    SỐ ĐIỆN THOẠI
                  </td>
                </tr>

                <tr>
                  <td style="
                    padding: 0 15px 12px;
                    font-size: 15px;
                    color: #493629;
                  ">
                    ${escapeHtml(order.phone)}
                  </td>
                </tr>

                <tr>
                  <td style="
                    padding: 0 15px 5px;
                    font-size: 12px;
                    color: #8b6548;
                  ">
                    ĐỊA CHỈ GIAO HÀNG
                  </td>
                </tr>

                <tr>
                  <td style="
                    padding: 0 15px 12px;
                    font-size: 15px;
                    line-height: 1.8;
                    color: #493629;
                  ">
                    ${escapeHtml(order.address)}
                  </td>
                </tr>

                ${
                  order.note
                    ? `
                    <tr>
                      <td style="
                        padding: 0 15px 5px;
                        font-size: 12px;
                        color: #8b6548;
                      ">
                        GHI CHÚ
                      </td>
                    </tr>

                    <tr>
                      <td style="
                        padding: 0 15px 15px;
                        font-size: 14px;
                        line-height: 1.8;
                        color: #493629;
                      ">
                        ${escapeHtml(order.note)}
                      </td>
                    </tr>
                    `
                    : ""
                }
              </table>
            </td>
          </tr>

          <!-- BUTTON -->
          <tr>
            <td align="center" style="padding: 0 30px 35px;">
              <a
                href="${orderUrl}"
                style="
                  display: inline-block;
                  padding: 15px 30px;
                  background-color: #8b6548;
                  color: #ffffff;
                  text-decoration: none;
                  font-size: 15px;
                  font-weight: 700;
                  border-radius: 6px;
                "
              >
                XEM ĐƠN HÀNG
              </a>
            </td>
          </tr>

          <!-- DIVIDER -->
          <tr>
            <td style="padding: 0 30px;">
              <div style="border-top: 1px solid #eee5dc;"></div>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td
              align="center"
              style="
                padding: 24px 30px 28px;
                background-color: #f8f5f1;
              "
            >
              <div style="
                font-size: 14px;
                font-weight: 700;
                color: #493629;
              ">
                NỘI THẤT VIỆT
              </div>

              <div style="
                margin-top: 8px;
                font-size: 12px;
                line-height: 1.8;
                color: #888888;
              ">
                Cảm ơn bạn đã tin tưởng và lựa chọn
                sản phẩm của chúng tôi.
              </div>

              <div style="
                margin-top: 10px;
                font-size: 11px;
                line-height: 1.7;
                color: #888888;
              ">
                Đây là email tự động, vui lòng không trả lời email này.
              </div>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// GỬI EMAIL XÁC NHẬN ĐƠN HÀNG
export async function sendOrderConfirmationEmail(orderId) {
  if (!isMailConfigured) {
    console.warn(
      "Chưa cấu hình MAIL_* trong .env -> bỏ qua gửi email đơn hàng",
    );

    return;
  }

  try {
    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },

        {
          model: OrderItem,
          as: "order_items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "price", "image"],
              paranoid: false,
            },
          ],
        },
      ],

      order: [
        [
          {
            model: OrderItem,
            as: "order_items",
          },
          "id",
          "ASC",
        ],
      ],
    });

    if (!order) {
      console.error(`Không tìm thấy đơn hàng ID ${orderId} để gửi email`);

      return;
    }

    if (!order.user) {
      console.error(`Không tìm thấy user của đơn hàng ${orderId}`);

      return;
    }

    if (!order.user.email) {
      console.error(`User của đơn hàng ${order.id} không có email`);

      return;
    }

    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.MAIL_USER,

      to: order.user.email,

      subject: `[Nội Thất Việt] Xác nhận đơn hàng #${order.code}`,

      html: buildOrderEmailHtml(order),
    });

    console.log(`Đã gửi email đơn hàng ${order.code} tới ${order.user.email}`);
  } catch (error) {
    console.error("Gửi email đơn hàng thất bại:", error);
  }
}

// Reset password phải báo lỗi cho caller để hủy token nếu SMTP không nhận thư.
// URL lấy từ CLIENT_URL tin cậy; token trong fragment không bị gửi vào log HTTP frontend.
export async function sendPasswordResetEmail(user, token) {
  const resetUrl = new URL("/reset-password", process.env.CLIENT_URL);
  resetUrl.hash = new URLSearchParams({ token }).toString();
  const link = resetUrl.toString();
  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.MAIL_USER,
    to: user.email,
    subject: "[Nội Thất Việt] Yêu cầu đặt lại mật khẩu",
    text: `Xin chào ${user.name},
Nội Thất Việt nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
Vui lòng truy cập đường dẫn bên dưới để tạo mật khẩu mới:
${link}
Lưu ý:
- Đường dẫn chỉ có hiệu lực trong 15 phút.
- Đường dẫn chỉ được sử dụng một lần.
- Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email. Mật khẩu hiện tại của bạn vẫn được giữ nguyên.
Trân trọng,
Đội ngũ Nội Thất Việt`,
    html: `
<div style="margin:0;padding:32px 12px;background:#f5f2ed;font-family:Arial,Helvetica,sans-serif;color:#333333;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e8e0d6;">
    <!-- HEADER -->
    <div style="padding:28px 24px;text-align:center;background:#493629;">
      <div style="font-size:26px;font-weight:bold;letter-spacing:1px;color:#ffffff;">
        NỘI THẤT VIỆT
      </div>
      <div style="margin-top:8px;font-size:12px;letter-spacing:2px;color:#e5d2bc;">
        KIẾN TẠO KHÔNG GIAN SỐNG
      </div>
    </div>
    <!-- CONTENT -->
    <div style="padding:36px 30px 30px;">
      <div style="margin-bottom:20px;text-align:center;">
        <div style="display:inline-block;width:58px;height:58px;line-height:58px;border-radius:50%;background:#f3ebe2;font-size:28px;color:#8b6548;">
          &#128274;
        </div>
      </div>
      <h2 style="margin:0 0 18px;text-align:center;font-size:24px;line-height:1.4;color:#493629;">
        Đặt lại mật khẩu
      </h2>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.8;">
        Xin chào <strong>${escapeHtml(user.name)}</strong>,
      </p>
      <p style="margin:0 0 18px;font-size:15px;line-height:1.8;color:#555555;">
        Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản Nội Thất Việt của bạn.
        Nhấn vào nút bên dưới để thiết lập mật khẩu mới và tiếp tục sử dụng tài khoản.
      </p>
      <div style="margin:28px 0;text-align:center;">
        <a
          href="${escapeHtml(link)}"
          style="display:inline-block;padding:15px 30px;background:#8b6548;color:#ffffff;text-decoration:none;font-size:15px;font-weight:bold;border-radius:6px;"
        >
          ĐẶT LẠI MẬT KHẨU
        </a>
      </div>
      <div style="margin:24px 0;padding:16px 18px;background:#faf7f3;border-left:4px solid #b28a65;border-radius:4px;">
        <p style="margin:0 0 8px;font-size:14px;font-weight:bold;color:#493629;">
          Lưu ý bảo mật
        </p>
        <p style="margin:0;font-size:13px;line-height:1.8;color:#666666;">
          • Liên kết có hiệu lực trong <strong>15 phút</strong>.<br>
          • Liên kết chỉ sử dụng được <strong>một lần</strong>.<br>
          • Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này. Mật khẩu hiện tại vẫn được giữ nguyên.
        </p>
      </div>
      <p style="margin:24px 0 8px;font-size:13px;line-height:1.7;color:#777777;">
        Nếu nút bên trên không hoạt động, bạn có thể sao chép đường dẫn sau và mở bằng trình duyệt:
      </p>
      <p style="margin:0;padding:12px;background:#f7f7f7;border:1px solid #eeeeee;border-radius:4px;font-size:12px;line-height:1.7;word-break:break-all;">
        <a href="${escapeHtml(link)}" style="color:#8b6548;text-decoration:underline;">
          ${escapeHtml(link)}
        </a>
      </p>
      <p style="margin:24px 0 0;font-size:14px;line-height:1.8;color:#555555;">
        Cảm ơn bạn đã tin tưởng và đồng hành cùng Nội Thất Việt.
      </p>
    </div>
    <!-- FOOTER -->
    <div style="padding:20px 24px;background:#f8f5f1;border-top:1px solid #eee5dc;text-align:center;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:bold;color:#493629;">
        NỘI THẤT VIỆT
      </p>
      <p style="margin:0;font-size:12px;line-height:1.8;color:#888888;">
        Không gian đẹp, cuộc sống trọn vẹn hơn.<br>
        Đây là email tự động, vui lòng không trả lời email này.
      </p>
    </div>
  </div>
</div>
`,
    disableFileAccess: true,
    disableUrlAccess: true,
  });
  if (!info.accepted?.length) throw new Error("SMTP_REJECTED");
}
