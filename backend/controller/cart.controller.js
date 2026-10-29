import models from "../models/index.js";
import { getImageUrl } from "../utils/format.js";

const { CartItem, Product, ProductRecipe } = models;

// ====================== LẤY GIỎ HÀNG THEO USER ======================
export const getCartByUserId = async (req, res) => {
  const { userId } = req.params;

  const cartItems = await CartItem.findAll({
    where: {
      user_id: userId,
    },

    include: [
      {
        model: Product,
        as: "product",
        attributes: ["name", "price", "image"],
        include: [
          {
            model: ProductRecipe,
            as: "product_recipes",
            attributes: ["material_name", "qty", "unit"],
          },
        ],
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
    image: getImageUrl(item.product?.image),
    recipe: (item.product?.product_recipes || []).map((recipe) => ({
      materialName: recipe.material_name,
      qty: Number(recipe.qty),
      unit: recipe.unit,
    })),
  }));

  return res.status(200).json(cart);
};

// ====================== THÊM SẢN PHẨM VÀO GIỎ ======================
export const addToCart = async (req, res) => {
  const { userId, productId } = req.body;
  const qty = Math.max(1, Math.floor(Number(req.body.qty) || 1));

  console.log(req.body);
  console.log(userId);
  console.log(productId);
  console.log(qty);

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

  // Tìm xem sản phẩm đã có trong giỏ chưa.
  // PHẢI truyền `paranoid: false` để tìm cả dòng đã bị xoá mềm.
  // CartItem bật paranoid, nên findOne bình thường không thấy dòng đã xoá.
  // Khi đó code đi vào nhánh create() và insert dòng mới cùng (user_id,
  // product_id) -> đụng ràng buộc unique "cart_items_user_id_product_id_key"
  // và trả về 500. Đây chính là lỗi "xoá khỏi giỏ rồi thêm lại thì báo Lỗi server".
  const cartItem = await CartItem.findOne({
    where: {
      user_id: userId,
      product_id: productId,
    },
    paranoid: false,
  });

  if (cartItem) {
    // Đã có trong giỏ -> tăng qty
    if (!cartItem.deletedAt) {
      cartItem.qty += qty;
      await cartItem.save();

      return res.status(200).json({
        message: "Tăng số lượng sản phẩm trong giỏ hàng thành công",
        cartItem,
      });
    }

    // Đã bị xoá mềm -> hồi sinh dòng cũ với số lượng yêu cầu
    // (không cộng vào qty cũ, vì người dùng đã chủ động xoá sản phẩm đó)
    cartItem.qty = qty;

    await cartItem.restore();
    await cartItem.save();

    return res.status(200).json({
      message: "Thêm sản phẩm vào giỏ hàng thành công",
      cartItem,
    });
  }

  // Nếu chưa có -> tạo mới
  const newCartItem = await CartItem.create({
    user_id: userId,
    product_id: productId,
    qty,
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
  // if (qty <= 0) {
  //   await CartItem.destroy({
  //     where: {
  //       user_id: userId,
  //       product_id: productId,
  //     },
  //   });

  //   return res.status(200).json({
  //     message: "Đã xóa sản phẩm vì số lượng bằng 0",
  //   });
  // }

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
