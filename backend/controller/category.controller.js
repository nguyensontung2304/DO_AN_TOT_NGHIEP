import models from "../models/index.js";
import { Op, fn, col } from "sequelize";

const { Category, Product } = models;

// Định dạng category trả về frontend (không trả thuộc tính nội bộ Sequelize)
const mapCategory = (c) => ({
  id: c.id,
  name: c.name,
});

// ====================== LẤY TẤT CẢ DANH MỤC ======================
// Public: danh sách danh mục kèm số sản phẩm (dùng cho filter, footer, select admin)
export const getAllCategories = async (req, res) => {
  try {
    const all = await Category.findAll({
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    });

    // Đếm số sản phẩm của từng danh mục (chỉ tính sản phẩm có category_id)
    const counts = await Product.findAll({
      attributes: ["category_id", [fn("COUNT", col("id")), "count"]],
      where: { category_id: { [Op.ne]: null } },
      group: ["category_id"],
      raw: true,
    });

    const countMap = Object.fromEntries(
      counts.map((c) => [c.category_id, Number(c.count)]),
    );

    const result = all.map((c) => ({
      ...mapCategory(c),
      productCount: countMap[c.id] ?? 0,
    }));

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ message: "Lỗi khi lấy danh sách danh mục" });
  }
};

// ====================== TẠO DANH MỤC MỚI ======================
// Admin
export const createCategory = async (req, res) => {
  const { name } = req.body;

  if (!name || !String(name).trim()) {
    return res
      .status(400)
      .json({ message: "Tên danh mục không được để trống" });
  }

  try {
    const created = await Category.create({ name: String(name).trim() });
    return res.status(201).json(mapCategory(created));
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ message: "Tên danh mục đã tồn tại" });
    }
    return res.status(400).json({ message: err.message });
  }
};

// ====================== CẬP NHẬT DANH MỤC ======================
// Admin
export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const category = await Category.findByPk(id);
  if (!category) {
    return res.status(404).json({ message: "Không tìm thấy danh mục" });
  }

  if (name !== undefined && name !== null) {
    if (!String(name).trim()) {
      return res
        .status(400)
        .json({ message: "Tên danh mục không được để trống" });
    }
    category.name = String(name).trim();
    try {
      await category.save();
    } catch (err) {
      if (err.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({ message: "Tên danh mục đã tồn tại" });
      }
      return res.status(400).json({ message: err.message });
    }
  }

  return res.status(200).json(mapCategory(category));
};

// ====================== XÓA DANH MỤC ======================
// Admin — chỉ xóa khi không còn sản phẩm thuộc danh mục này
export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  const category = await Category.findByPk(id);
  if (!category) {
    return res.status(404).json({ message: "Không tìm thấy danh mục" });
  }

  const productCount = await Product.count({ where: { category_id: id } });
  if (productCount > 0) {
    return res.status(400).json({
      message: `Danh mục đang có ${productCount} sản phẩm, không thể xóa`,
    });
  }

  await category.destroy();
  return res.status(200).json({ message: "Đã xóa danh mục" });
};
