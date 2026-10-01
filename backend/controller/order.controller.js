import models from "../models/index.js";

const { Order, OrderItem, User, Product } = models;

// Đổi dữ liệu đơn hàng từ DB về đúng shape frontend đang dùng:
// cart = danh sách sản phẩm, createdAt = thời gian tạo
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
  createdAt: order.created_at,
  cart: (order.order_items || []).map((item) => ({
    id: item.id,
    productId: item.product_id,
    name: item.name || item.product?.name,
    qty: item.qty,
    price: Number(item.price),
    emoji: item.emoji || item.product?.emoji || null,
  })),
});

// Thông tin sản phẩm lấy chung cho các query đơn hàng
const orderInclude = [
  {
    model: User,
    as: "user",
    attributes: ["id", "name", "email", "phone", "address"],
  },
  {
    model: OrderItem,
    as: "order_items",
    include: [
      {
        model: Product,
        as: "product",
        attributes: ["name", "price", "emoji"],
      },
    ],
  },
];

export const createOrder = async (req, res) => {
  const { userId, name, phone, address, note, cart, total } = req.body;

  if (!Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ message: "Đơn hàng không có sản phẩm nào" });
  }

  const order = await Order.create({
    user_id: userId,
    name,
    phone,
    address,
    note: note || null,
    total,
    status: "pending",
  });

  const orderItems = cart.map((item) => ({
    order_id: order.id,
    product_id: item.productId || null,
    name: item.name,
    qty: item.qty,
    price: item.price,
    emoji: item.emoji || null,
  }));

  await OrderItem.bulkCreate(orderItems);

  const createdOrder = await Order.findByPk(order.id, { include: orderInclude });

  res.status(201).json({
    message: "Đặt hàng thành công",
    order: mapOrder(createdOrder),
  });
};

export const getAllOrders = async (req, res) => {
  const orders = await Order.findAll({
    include: orderInclude,
    order: [["created_at", "DESC"]],
  });

  res.status(200).json(orders.map(mapOrder));
};

export const getOrdersByUserId = async (req, res) => {
  const { userId } = req.params;

  const orders = await Order.findAll({
    where: { user_id: userId },
    include: orderInclude,
    order: [["created_at", "DESC"]],
  });

  res.status(200).json(orders.map(mapOrder));
};

export const getOrderById = async (req, res) => {
  const { id } = req.params;

  const order = await Order.findByPk(id, { include: orderInclude });

  if (!order) {
    return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
  }

  res.status(200).json(mapOrder(order));
};

export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = await Order.findByPk(id, { include: orderInclude });

  if (!order) {
    return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
  }

  await order.update({ status });

  res.status(200).json({
    message: "Cập nhật trạng thái đơn hàng thành công",
    order: mapOrder(order),
  });
};