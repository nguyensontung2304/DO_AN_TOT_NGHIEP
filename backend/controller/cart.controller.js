// import pool from "../config/db.js";

// // LẤY GIỎ HÀNG THEO USER
// export const getCart = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const result = await pool.query(
//       `
//       SELECT
//         cart_items.id,
//         cart_items.product_id AS "productId",
//         cart_items.qty,

//         products.name,
//         products.price,
//         products.emoji

//       FROM cart_items

//       JOIN products
//         ON cart_items.product_id = products.id

//       WHERE cart_items.user_id = $1

//       ORDER BY cart_items.id DESC
//       `,
//       [userId],
//     );

//     res.status(200).json(result.rows);
//   } catch (error) {
//     console.error("Lỗi lấy giỏ hàng:", error);

//     res.status(500).json({
//       message: "Không thể lấy giỏ hàng",
//     });
//   }
// };

// // THÊM SẢN PHẨM VÀO GIỎ
// export const addToCart = async (req, res) => {
//   try {
//     const { userId, productId } = req.body;

//     if (!userId || !productId) {
//       return res.status(400).json({
//         message: "Thiếu userId hoặc productId",
//       });
//     }

//     const result = await pool.query(
//       `
//       INSERT INTO cart_items (
//         user_id,
//         product_id,
//         qty
//       )

//       VALUES ($1, $2, 1)

//       ON CONFLICT (user_id, product_id)

//       DO UPDATE SET
//         qty = cart_items.qty + 1

//       RETURNING *
//       `,
//       [userId, productId],
//     );

//     res.status(201).json({
//       message: "Thêm sản phẩm vào giỏ hàng thành công",
//       cartItem: result.rows[0],
//     });
//   } catch (error) {
//     console.error("Lỗi thêm giỏ hàng:", error);

//     res.status(500).json({
//       message: "Không thể thêm sản phẩm vào giỏ hàng",
//     });
//   }
// };

// // CẬP NHẬT SỐ LƯỢNG
// export const updateCartQty = async (req, res) => {
//   try {
//     const { userId, productId, qty } = req.body;

//     if (!userId || !productId || qty === undefined) {
//       return res.status(400).json({
//         message: "Thiếu dữ liệu cập nhật",
//       });
//     }

//     if (qty <= 0) {
//       await pool.query(
//         `
//         DELETE FROM cart_items
//         WHERE user_id = $1
//         AND product_id = $2
//         `,
//         [userId, productId],
//       );

//       return res.status(200).json({
//         message: "Đã xóa sản phẩm vì số lượng bằng 0",
//       });
//     }

//     const result = await pool.query(
//       `
//       UPDATE cart_items

//       SET qty = $1

//       WHERE user_id = $2
//       AND product_id = $3

//       RETURNING *
//       `,
//       [qty, userId, productId],
//     );

//     res.status(200).json({
//       message: "Cập nhật số lượng thành công",
//       cartItem: result.rows[0],
//     });
//   } catch (error) {
//     console.error("Lỗi cập nhật giỏ hàng:", error);

//     res.status(500).json({
//       message: "Không thể cập nhật giỏ hàng",
//     });
//   }
// };

// // XÓA SẢN PHẨM
// export const removeFromCart = async (req, res) => {
//   try {
//     const { userId, productId } = req.params;

//     await pool.query(
//       `
//       DELETE FROM cart_items

//       WHERE user_id = $1
//       AND product_id = $2
//       `,
//       [userId, productId],
//     );

//     res.status(200).json({
//       message: "Đã xóa sản phẩm khỏi giỏ hàng",
//     });
//   } catch (error) {
//     console.error("Lỗi xóa sản phẩm:", error);

//     res.status(500).json({
//       message: "Không thể xóa sản phẩm",
//     });
//   }
// };

import models from "../models/index.js";

const { CartItem, Product } = models;

// ====================== LẤY GIỎ HÀNG THEO USER ======================
export const getCart = async (req, res) => {
  const { userId } = req.params;

  const cartItems = await CartItem.findAll({
    where: {
      user_id: userId,
    },

    include: [
      {
        model: Product,
        as: "product",
        attributes: ["name", "price", "emoji"],
      },
    ],

    order: [["id", "DESC"]],
  });

  // Đổi dữ liệu Sequelize về đúng format frontend đang dùng
  const cart = cartItems.map((item) => ({
    id: item.id,
    productId: item.product_id,
    qty: item.qty,
    name: item.product?.name,
    price: item.product?.price,
    emoji: item.product?.emoji,
  }));

  return res.status(200).json(cart);
};

// ====================== THÊM SẢN PHẨM VÀO GIỎ ======================
export const addToCart = async (req, res) => {
  const { userId, productId } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!userId || !productId) {
    return res.status(400).json({
      message: "Thiếu userId hoặc productId",
    });
  }

  // Kiểm tra sản phẩm có tồn tại không
  const product = await Product.findByPk(productId);

  if (!product) {
    return res.status(404).json({
      message: "Không tìm thấy sản phẩm",
    });
  }

  // Tìm xem sản phẩm đã có trong giỏ chưa
  const cartItem = await CartItem.findOne({
    where: {
      user_id: userId,
      product_id: productId,
    },
  });

  // Nếu đã có -> tăng qty
  if (cartItem) {
    cartItem.qty += 1;

    await cartItem.save();

    return res.status(200).json({
      message: "Tăng số lượng sản phẩm trong giỏ hàng thành công",
      cartItem,
    });
  }

  // Nếu chưa có -> tạo mới
  const newCartItem = await CartItem.create({
    user_id: userId,
    product_id: productId,
    qty: 1,
  });

  return res.status(201).json({
    message: "Thêm sản phẩm vào giỏ hàng thành công",
    cartItem: newCartItem,
  });
};

// ====================== CẬP NHẬT SỐ LƯỢNG ======================
export const updateCartQty = async (req, res) => {
  const { userId, productId, qty } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!userId || !productId || qty === undefined) {
    return res.status(400).json({
      message: "Thiếu dữ liệu cập nhật",
    });
  }

  // Nếu qty <= 0 -> xóa sản phẩm
  if (qty <= 0) {
    await CartItem.destroy({
      where: {
        user_id: userId,
        product_id: productId,
      },
    });

    return res.status(200).json({
      message: "Đã xóa sản phẩm vì số lượng bằng 0",
    });
  }

  // Tìm sản phẩm trong giỏ
  const cartItem = await CartItem.findOne({
    where: {
      user_id: userId,
      product_id: productId,
    },
  });

  if (!cartItem) {
    return res.status(404).json({
      message: "Không tìm thấy sản phẩm trong giỏ hàng",
    });
  }

  // Cập nhật số lượng
  cartItem.qty = qty;

  await cartItem.save();

  return res.status(200).json({
    message: "Cập nhật số lượng thành công",
    cartItem,
  });
};

// ====================== XÓA SẢN PHẨM ======================
export const removeFromCart = async (req, res) => {
  const { userId, productId } = req.params;

  const deleted = await CartItem.destroy({
    where: {
      user_id: userId,
      product_id: productId,
    },
  });

  // Không tìm thấy item để xóa
  if (deleted === 0) {
    return res.status(404).json({
      message: "Không tìm thấy sản phẩm trong giỏ hàng",
    });
  }

  return res.status(200).json({
    message: "Đã xóa sản phẩm khỏi giỏ hàng",
  });
};
