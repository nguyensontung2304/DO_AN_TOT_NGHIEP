// import pool from "../config/db.js";

// // ====================== LẤY TẤT CẢ SẢN PHẨM ======================
// export const products = async (req, res) => {
//   try {
//     const result = await pool.query(`
//       SELECT *
//       FROM products
//       ORDER BY id ASC
//     `);

//     return res.status(200).json(result.rows);
//   } catch (error) {
//     console.error("Lỗi lấy danh sách sản phẩm:", error);

//     return res.status(500).json({
//       message: "Lỗi server",
//     });
//   }
// };

// // ====================== LẤY CHI TIẾT SẢN PHẨM ======================
// export const getProductDetail = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // ====================== LẤY SẢN PHẨM ======================
//     const productResult = await pool.query(
//       `
//         SELECT *
//         FROM products
//         WHERE id = $1
//       `,
//       [id],
//     );

//     if (productResult.rows.length === 0) {
//       return res.status(404).json({
//         message: "Không tìm thấy sản phẩm",
//       });
//     }

//     const product = productResult.rows[0];

//     // ====================== LẤY THÔNG SỐ ======================
//     const specsResult = await pool.query(
//       `
//         SELECT
//         id,
//         product_id,
//         spec_name,
//         spec_value
//         FROM product_specs
//         WHERE product_id = $1
//       `,
//       [id],
//     );

//     product.specs = specsResult.rows;

//     // ====================== LẤY NGUYÊN VẬT LIỆU ======================
//     const recipeResult = await pool.query(
//       `
//         SELECT
//         id,
//         product_id,
//         material_name,
//         unit,
//         qty
//         FROM product_recipes
//         WHERE product_id = $1
//       `,
//       [id],
//     );

//     product.recipe = recipeResult.rows;

//     // ====================== TRẢ VỀ FRONTEND ======================
//     return res.status(200).json(product);
//   } catch (error) {
//     console.error("Lỗi lấy chi tiết sản phẩm:", error);

//     return res.status(500).json({
//       message: "Lỗi server",
//     });
//   }
// };

import models from "../models/index.js";

const { Product, ProductSpec, ProductRecipe } = models;

// ====================== LẤY TẤT CẢ SẢN PHẨM ======================
export const products = async (req, res) => {
  const result = await Product.findAll({
    order: [["id", "ASC"]],
  });

  return res.status(200).json(result);
};

// ====================== LẤY CHI TIẾT SẢN PHẨM ======================
export const getProductDetail = async (req, res) => {
  const { id } = req.params;

  // ====================== LẤY SẢN PHẨM ======================
  const product = await Product.findByPk(id);

  // Không tìm thấy sản phẩm
  if (!product) {
    return res.status(404).json({
      message: "Không tìm thấy sản phẩm",
    });
  }

  // ====================== LẤY THÔNG SỐ ======================
  const specs = await ProductSpec.findAll({
    where: {
      product_id: id,
    },
  });

  // ====================== LẤY NGUYÊN VẬT LIỆU ======================
  const recipe = await ProductRecipe.findAll({
    where: {
      product_id: id,
    },
  });

  // ====================== GẮN VÀO PRODUCT ======================
  const result = {
    ...product.toJSON(),
    specs,
    recipe,
  };

  // ====================== TRẢ VỀ FRONTEND ======================
  return res.status(200).json(result);
};
