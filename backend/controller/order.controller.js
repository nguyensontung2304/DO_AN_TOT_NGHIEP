import { randomInt } from "node:crypto";
import models from "../models/index.js";
import { getTimestamp, getImageUrl } from "../utils/format.js";
import { sendOrderConfirmationEmail } from "../utils/mail.js";

const { Order, OrderItem, User, Product } = models;

// Sinh mã đơn hàng gồm 8 ký tự chữ in hoa + số, vd: "K7Q2M9XA"
// Không dùng id làm mã đơn vì id tăng dần -> người khác đoán được số lượng đơn của shop
const CODE_CHARACTERS = "ABCD1234";
const CODE_LENGTH = 8;

async function generateOrderCode() {
  while (true) {
    let code = "";
    for (let i = 0; i < CODE_LENGTH; i++) {
      code += CODE_CHARACTERS[randomInt(CODE_CHARACTERS.length)];
    }

    // Có 36^8 (~2.800 tỷ) mã nên rất hiếm khi trùng, nhưng vẫn kiểm tra cho chắc.
    // Cột code có UNIQUE trong DB nên dù có trùng cũng không lưu được 2 đơn cùng mã
    const existOrder = await Order.findOne({ where: { code: code } });
    if (!existOrder) {
      return code;
    }
  }
}

// MAP ORDER
const mapOrder = (order) => ({
  id: order.id,
  userId: order.user_id,
  userName: order.user?.name || null,
  userEmail: order.user?.email || null,
  name: order.name,
  phone: order.phone,
  address: order.address,
  note: order.note,
  total: Number(order.total),
  status: order.status,
  createdAt: getTimestamp(order),
  cart: (order.order_items || []).map((item) => ({
    id: item.id,
    productId: item.product_id,
    name: item.name || item.product?.name || "",
    qty: Number(item.qty),
    price: Number(item.price),
    image: getImageUrl(item.image || item.product?.image),
  })),
});

// INCLUDE DÙNG CHUNG
const orderInclude = [
  {
    model: User,
    as: "user",
    attributes: ["id", "name", "email", "phone"],
  },

  {
    model: OrderItem,
    as: "order_items",
    include: [
      {
        model: Product,
        as: "product",
        attributes: ["id", "name", "price", "image"],
      },
    ],
  },
];

// CREATE ORDER
export const createOrder = async (req, res) => {
  const { userId, name, phone, address, note, cart, total } = req.body;
  // Kiểm tra cart

  if (!Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({
      message: "Đơn hàng không có sản phẩm nào",
    });
  }

  // Kiểm tra user
  if (!userId) {
    return res.status(400).json({
      message: "Thiếu userId",
    });
  }

  try {
    // Sinh mã đơn hàng
    const code = await generateOrderCode();

    // 1. Tạo đơn hàng
    const order = await Order.create({
      code,
      user_id: userId,
      name,
      phone,
      address,
      note: note || null,
      total: Number(total),
      status: "pending",
    });

    // 2. Tạo các sản phẩm trong đơn
    const productIds = cart.map((item) => item.productId);

    const products = await Product.findAll({
      where: {
        id: productIds,
      },
      attributes: ["id", "name", "price", "image"],
    });

    const productMap = new Map(
      products.map((product) => [product.id, product]),
    );

    const orderItems = cart.map((item) => {
      const product = productMap.get(Number(item.productId));

      if (!product) {
        throw new Error(`Không tìm thấy sản phẩm có ID ${item.productId}`);
      }

      return {
        order_id: order.id,
        product_id: product.id,
        name: product.name,
        image: product.image,
        qty: Number(item.qty),
        price: Number(product.price),
      };
    });

    console.log("Order items lưu DB:", orderItems);

    await OrderItem.bulkCreate(orderItems);

    // 3. Lấy lại order đầy đủ
    const createdOrder = await Order.findByPk(order.id, {
      include: orderInclude,
    });

    // 4. Gửi email xác nhận đơn hàng
    // Không await để việc gửi email không làm chậm việc trả kết quả đặt hàng
    sendOrderConfirmationEmail(createdOrder.id);

    // 5. Trả kết quả
    return res.status(201).json({
      message: "Đặt hàng thành công",
      order: mapOrder(createdOrder),
    });
  } catch (err) {
    // IN LỖI SQL THẬT RA TERMINAL

    console.error("=================================");
    console.error("LỖI TẠO ĐƠN HÀNG");
    console.error("message:", err.message);
    console.error("parent:", err.parent?.message);
    console.error("original:", err.original?.message);
    console.error("sql:", err.sql);
    console.error("=================================");

    // DATABASE ERROR
    if (err.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Lỗi cơ sở dữ liệu khi tạo đơn hàng",
        error: err.parent?.message || err.original?.message || err.message,
      });
    }

    return res.status(500).json({
      message: "Đặt hàng thất bại",
      error: err.parent?.message || err.original?.message || err.message,
    });
  }
};

// GET ORDERS BY USER
export const getOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.findAll({
      where: {
        user_id: userId,
      },

      include: orderInclude,
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json(orders.map(mapOrder));
  } catch (err) {
    console.error("Lỗi lấy đơn hàng của user:", err);

    return res.status(500).json({
      message: "Không thể lấy đơn hàng",
      error: err.message,
    });
  }
};

// CANCEL ORDER - USER
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const order = await Order.findOne({
      where: {
        id,
        user_id: userId,
      },
      include: orderInclude,
    });

    if (!order) {
      return res.status(404).json({
        message: "Không tìm thấy đơn hàng",
      });
    }

    if (order.status !== "pending") {
      return res.status(400).json({
        message: "Chỉ có thể hủy đơn hàng khi đơn đang chờ xác nhận",
      });
    }

    await order.update({
      status: "cancelled",
    });

    const updatedOrder = await Order.findByPk(id, {
      include: orderInclude,
    });

    return res.status(200).json({
      message: "Hủy đơn hàng thành công",
      order: mapOrder(updatedOrder),
    });
  } catch (err) {
    console.error("Lỗi hủy đơn hàng:", err);

    return res.status(500).json({
      message: "Không thể hủy đơn hàng",
      error: err.message,
    });
  }
};

// GET ALL ORDERS
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: orderInclude,
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json(orders.map(mapOrder));
  } catch (err) {
    console.error("Lỗi lấy danh sách đơn hàng:", err);

    return res.status(500).json({
      message: "Không thể lấy danh sách đơn hàng",
      error: err.message,
    });
  }
};

// GET ORDER BY ID
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id, {
      include: orderInclude,
    });

    if (!order) {
      return res.status(404).json({
        message: "Không tìm thấy đơn hàng",
      });
    }

    return res.status(200).json(mapOrder(order));
  } catch (err) {
    console.error("Lỗi lấy chi tiết đơn hàng:", err);

    return res.status(500).json({
      message: "Không thể lấy chi tiết đơn hàng",
      error: err.message,
    });
  }
};

// UPDATE STATUS
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await Order.findByPk(id, {
      include: orderInclude,
    });

    if (!order) {
      return res.status(404).json({
        message: "Không tìm thấy đơn hàng",
      });
    }

    await order.update({
      status,
    });

    // Reload lại dữ liệu sau khi update
    const updatedOrder = await Order.findByPk(id, {
      include: orderInclude,
    });

    return res.status(200).json({
      message: "Cập nhật trạng thái đơn hàng thành công",
      order: mapOrder(updatedOrder),
    });
  } catch (err) {
    console.error("Lỗi cập nhật trạng thái:", err);

    return res.status(500).json({
      message: "Không thể cập nhật trạng thái đơn hàng",
      error: err.message,
    });
  }
};
