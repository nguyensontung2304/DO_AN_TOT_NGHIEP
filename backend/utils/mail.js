import models from "../models/index.js";

import transporter, { isMailConfigured } from "../config/mail.js";

const { Order, OrderItem, Product, User } = models;

// ==================================================
// ESCAPE HTML
// ==================================================

function escapeHtml(text) {
  return String(text ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// ==================================================
// FORMAT GIÁ
// ==================================================

const formatPrice = (price) =>
  `${Number(price || 0).toLocaleString("vi-VN")} đ`;

// ==================================================
// TẠO HTML EMAIL
// ==================================================

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
          <td
            style="
              padding: 14px 12px;
              border-bottom: 1px solid #eeeeee;
              color: #333333;
              font-size: 14px;
            "
          >
            <strong style="font-weight: 600;">
              ${escapeHtml(
                item.product?.name || item.name || "Sản phẩm đã bị xóa",
              )}
            </strong>
          </td>

          <td
            style="
              padding: 14px 8px;
              border-bottom: 1px solid #eeeeee;
              text-align: center;
              color: #555555;
              font-size: 14px;
            "
          >
            ${Number(item.qty)}
          </td>

          <td
            style="
              padding: 14px 8px;
              border-bottom: 1px solid #eeeeee;
              text-align: right;
              color: #555555;
              font-size: 14px;
              white-space: nowrap;
            "
          >
            ${formatPrice(item.price)}
          </td>

          <td
            style="
              padding: 14px 12px;
              border-bottom: 1px solid #eeeeee;
              text-align: right;
              color: #222222;
              font-size: 14px;
              font-weight: 600;
              white-space: nowrap;
            "
          >
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

<body
  style="
    margin: 0;
    padding: 0;
    background-color: #f4f6f8;
    font-family: Arial, Helvetica, sans-serif;
    color: #333333;
  "
>
  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
      background-color: #f4f6f8;
      padding: 30px 15px;
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
            border-radius: 12px;
            overflow: hidden;
          "
        >

          <!-- HEADER -->
          <tr>
            <td
              style="
                background-color: #111827;
                padding: 28px 35px;
              "
            >
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
              >
                <tr>

                  <td>
                    <div
                      style="
                        font-size: 24px;
                        font-weight: 700;
                        color: #ffffff;
                        letter-spacing: 0.3px;
                      "
                    >
                      Nội Thất Việt
                    </div>

                    <div
                      style="
                        margin-top: 5px;
                        font-size: 13px;
                        color: #cbd5e1;
                      "
                    >
                      Nội thất cao cấp - Trực tiếp từ xưởng
                    </div>
                  </td>

                  <td
                    align="right"
                    valign="middle"
                    style="
                      font-size: 13px;
                      color: #cbd5e1;
                    "
                  >
                    XÁC NHẬN ĐƠN HÀNG
                  </td>

                </tr>
              </table>
            </td>
          </tr>


          <!-- SUCCESS -->
          <tr>
            <td
              style="
                padding: 38px 35px 25px;
                text-align: center;
              "
            >

              <div
                style="
                  width: 58px;
                  height: 58px;
                  line-height: 58px;
                  margin: 0 auto 18px;
                  border-radius: 50%;
                  background-color: #eaf8ef;
                  color: #16a34a;
                  font-size: 30px;
                  font-weight: bold;
                "
              >
                ✓
              </div>

              <div
                style="
                  font-size: 25px;
                  font-weight: 700;
                  color: #111827;
                "
              >
                Đặt hàng thành công
              </div>

              <div
                style="
                  margin-top: 10px;
                  font-size: 14px;
                  line-height: 1.6;
                  color: #6b7280;
                "
              >
                Cảm ơn bạn đã tin tưởng và mua sắm
                tại Nội Thất Việt.
              </div>

            </td>
          </tr>


          <!-- GREETING -->
          <tr>
            <td
              style="
                padding: 0 35px 25px;
              "
            >

              <div
                style="
                  font-size: 15px;
                  line-height: 1.7;
                  color: #374151;
                "
              >
                Xin chào
                <strong style="color: #111827;">
                  ${escapeHtml(order.user?.name || "Quý khách")}
                </strong>,
              </div>

              <div
                style="
                  margin-top: 8px;
                  font-size: 14px;
                  line-height: 1.7;
                  color: #6b7280;
                "
              >
                Đơn hàng của bạn đã được tiếp nhận thành công.
                Dưới đây là thông tin chi tiết đơn hàng:
              </div>

            </td>
          </tr>


          <!-- ORDER INFO -->
          <tr>
            <td
              style="
                padding: 0 35px 25px;
              "
            >

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  background-color: #f8fafc;
                  border: 1px solid #e5e7eb;
                  border-radius: 8px;
                "
              >
                <tr>

                  <td
                    width="50%"
                    style="
                      padding: 18px;
                      border-right: 1px solid #e5e7eb;
                    "
                  >
                    <div
                      style="
                        font-size: 12px;
                        color: #6b7280;
                        margin-bottom: 6px;
                      "
                    >
                      MÃ ĐƠN HÀNG
                    </div>

                    <div
                      style="
                        font-size: 18px;
                        font-weight: 700;
                        color: #111827;
                        letter-spacing: 1px;
                      "
                    >
                      #${escapeHtml(orderCode)}
                    </div>
                  </td>

                  <td
                    width="50%"
                    style="
                      padding: 18px;
                    "
                  >
                    <div
                      style="
                        font-size: 12px;
                        color: #6b7280;
                        margin-bottom: 6px;
                      "
                    >
                      NGÀY ĐẶT HÀNG
                    </div>

                    <div
                      style="
                        font-size: 15px;
                        font-weight: 600;
                        color: #111827;
                      "
                    >
                      ${escapeHtml(orderDate)}
                    </div>
                  </td>

                </tr>
              </table>

            </td>
          </tr>


          <!-- PRODUCTS TITLE -->
          <tr>
            <td
              style="
                padding: 0 35px 12px;
              "
            >

              <div
                style="
                  font-size: 17px;
                  font-weight: 700;
                  color: #111827;
                "
              >
                Chi tiết đơn hàng
              </div>

            </td>
          </tr>


          <!-- PRODUCTS -->
          <tr>
            <td
              style="
                padding: 0 35px;
              "
            >

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  border: 1px solid #e5e7eb;
                  border-radius: 8px;
                  overflow: hidden;
                "
              >

                <thead>
                  <tr
                    style="
                      background-color: #f8fafc;
                    "
                  >

                    <th
                      align="left"
                      style="
                        padding: 12px;
                        font-size: 12px;
                        color: #6b7280;
                        text-transform: uppercase;
                      "
                    >
                      Sản phẩm
                    </th>

                    <th
                      style="
                        padding: 12px 8px;
                        font-size: 12px;
                        color: #6b7280;
                        text-transform: uppercase;
                      "
                    >
                      SL
                    </th>

                    <th
                      align="right"
                      style="
                        padding: 12px 8px;
                        font-size: 12px;
                        color: #6b7280;
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
                        color: #6b7280;
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
            <td
              style="
                padding: 20px 35px 28px;
              "
            >

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
              >
                <tr>

                  <td
                    align="right"
                    style="
                      font-size: 14px;
                      color: #6b7280;
                    "
                  >
                    Tổng tiền
                  </td>

                  <td
                    align="right"
                    width="180"
                    style="
                      font-size: 22px;
                      font-weight: 700;
                      color: #dc2626;
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
            <td
              style="
                padding: 0 35px 30px;
              "
            >

              <div
                style="
                  font-size: 17px;
                  font-weight: 700;
                  color: #111827;
                  margin-bottom: 12px;
                "
              >
                Thông tin giao hàng
              </div>

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  border: 1px solid #e5e7eb;
                  border-radius: 8px;
                "
              >

                <tr>
                  <td
                    style="
                      padding: 12px 15px 5px;
                      font-size: 12px;
                      color: #6b7280;
                    "
                  >
                    NGƯỜI NHẬN
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding: 0 15px 12px;
                      font-size: 15px;
                      font-weight: 600;
                      color: #111827;
                    "
                  >
                    ${escapeHtml(order.name)}
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding: 0 15px 5px;
                      font-size: 12px;
                      color: #6b7280;
                    "
                  >
                    SỐ ĐIỆN THOẠI
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding: 0 15px 12px;
                      font-size: 15px;
                      color: #374151;
                    "
                  >
                    ${escapeHtml(order.phone)}
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding: 0 15px 5px;
                      font-size: 12px;
                      color: #6b7280;
                    "
                  >
                    ĐỊA CHỈ GIAO HÀNG
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding: 0 15px 12px;
                      font-size: 15px;
                      line-height: 1.6;
                      color: #374151;
                    "
                  >
                    ${escapeHtml(order.address)}
                  </td>
                </tr>

                ${
                  order.note
                    ? `
                    <tr>
                      <td
                        style="
                          padding: 0 15px 5px;
                          font-size: 12px;
                          color: #6b7280;
                        "
                      >
                        GHI CHÚ
                      </td>
                    </tr>

                    <tr>
                      <td
                        style="
                          padding: 0 15px 15px;
                          font-size: 14px;
                          color: #374151;
                        "
                      >
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
            <td
              align="center"
              style="
                padding: 0 35px 35px;
              "
            >

              <a
                href="${orderUrl}"
                style="
                  display: inline-block;
                  padding: 13px 30px;
                  background-color: #111827;
                  color: #ffffff;
                  text-decoration: none;
                  font-size: 15px;
                  font-weight: 600;
                  border-radius: 7px;
                "
              >
                Xem đơn hàng
              </a>

            </td>
          </tr>


          <!-- DIVIDER -->
          <tr>
            <td
              style="
                padding: 0 35px;
              "
            >
              <div
                style="
                  border-top: 1px solid #eeeeee;
                "
              ></div>
            </td>
          </tr>


          <!-- FOOTER -->
          <tr>
            <td
              align="center"
              style="
                padding: 25px 35px 30px;
              "
            >

              <div
                style="
                  font-size: 14px;
                  font-weight: 600;
                  color: #374151;
                "
              >
                Nội Thất Việt
              </div>

              <div
                style="
                  margin-top: 6px;
                  font-size: 12px;
                  line-height: 1.6;
                  color: #9ca3af;
                "
              >
                Cảm ơn bạn đã tin tưởng và lựa chọn
                sản phẩm của chúng tôi.
              </div>

              <div
                style="
                  margin-top: 10px;
                  font-size: 11px;
                  color: #9ca3af;
                "
              >
                Email này được gửi tự động, vui lòng không trả lời email này.
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

// ==================================================
// GỬI EMAIL XÁC NHẬN ĐƠN HÀNG
// ==================================================

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
