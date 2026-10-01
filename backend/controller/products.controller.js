import models from "../models/index.js";
import { Op, fn, col } from "sequelize";

const { Product, ProductSpec, ProductRecipe, Rating, Comment } = models;

// ====================== LẤY TẤT CẢ SẢN PHẨM ======================
export const getProducts = async (req, res) => {
  const {
    category,
    search,
    sort = "default",
    page = 1,
    limit = 12,
  } = req.query;

  // 1. Xử lý page / limit
  //    limit=all (hoặc <= 0) → lấy về tất cả, dùng cho trang quản trị admin
  const pageNumber = Math.max(Number(page) || 1, 1);
  const rawLimit = String(limit).toLowerCase();
  const isAll = rawLimit === "all" || Number(rawLimit) <= 0;
  const limitNumber = isAll ? null : Number(rawLimit);

  const offset = isAll ? 0 : (pageNumber - 1) * limitNumber;

  // 2. Điều kiện lọc
  const where = {};

  // Lọc theo danh mục
  if (category && category !== "Tất cả") {
    where.category = category;
  }

  // Tìm kiếm theo tên hoặc danh mục
  if (search && search.trim() !== "") {
    const keyword = search.trim();

    where[Op.or] = [
      {
        name: {
          [Op.iLike]: `%${keyword}%`,
        },
      },
      {
        category: {
          [Op.iLike]: `%${keyword}%`,
        },
      },
    ];
  }

  // 3. Sắp xếp
  let order = [["id", "ASC"]];

  if (sort === "price-asc") {
    order = [["price", "ASC"]];
  }

  if (sort === "price-desc") {
    order = [["price", "DESC"]];
  }

  if (sort === "name") {
    order = [["name", "ASC"]];
  }

  // 4. Lấy sản phẩm
  const { count, rows } = await Product.findAndCountAll({
    where,
    order,
    ...(isAll ? {} : { limit: limitNumber, offset }),
  });

  // 5. Lấy danh mục + số lượng
  const categoryRows = await Product.findAll({
    attributes: ["category", [fn("COUNT", col("id")), "count"]],
    where: {
      category: {
        [Op.ne]: null,
      },
    },
    group: ["category"],
    order: [["category", "ASC"]],
    raw: true,
  });

  const categories = categoryRows.map((item) => ({
    name: item.category,
    count: Number(item.count),
  }));

  // 6. Tính tổng số trang
  const totalPages = isAll ? 1 : Math.ceil(count / limitNumber);

  // 7. Thêm commentsCount và ratingsCount vào từng sản phẩm
  const products = await Promise.all(
    rows.map(async (product) => {
      // Lấy comment của sản phẩm này
      const comments = await Comment.findAll({
        where: {
          product_id: product.id,
        },
      });

      // Đếm comment
      const commentsCount = comments.length;

      // Lấy rating của sản phẩm này
      const ratings = await Rating.findAll({
        where: {
          product_id: product.id,
        },
      });

      // Đếm rating
      const ratingsCount = ratings.length;

      // Trả về product + 2 dữ liệu mới
      return {
        ...product.toJSON(),
        commentsCount,
        ratingsCount,
      };
    }),
  );

  // 8. Trả kết quả
  return res.status(200).json({
    products,
    total: count,
    totalPages,
    currentPage: pageNumber,
    limit: limitNumber ?? "all",
    categories,
  });
};

// ====================== LẤY CHI TIẾT SẢN PHẨM ======================
export const getProductDetail = async (req, res) => {
  const { id } = req.params;

  const product = await Product.findByPk(id);

  if (!product) {
    return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
  }

  // 2. Lấy tất cả bình luận của sản phẩm
  const comments = await Comment.findAll({
    where: {
      product_id: req.params.id,
    },
  });

  // 3. Đếm số lượng bình luận
  const commentsCount = comments.length;

  // 4. Lấy tất cả đánh giá của sản phẩm
  const ratings = await Rating.findAll({
    where: {
      product_id: req.params.id,
    },
  });

  // 5. Đếm số lượt đánh giá
  const ratingsCount = ratings.length;

  // 6. Tính điểm trung bình
  const totalScore = ratings.reduce((sum, item) => sum + item.score, 0);

  const averageRating = ratingsCount > 0 ? totalScore / ratingsCount : 0;

  const specs = await ProductSpec.findAll({ where: { product_id: id } });
  const recipe = await ProductRecipe.findAll({ where: { product_id: id } });

  return res.status(200).json({
    ...product.toJSON(),
    specs,
    recipe,
    averageRating,
    ratingsCount,
    commentsCount,
  });
};

// ====================== TẠO SẢN PHẨM MỚI ======================
export const createProduct = async (req, res) => {
  const {
    name,
    category,
    price,
    old_price,
    emoji,
    badge,
    description,
    long_description,
    specs,
    recipe,
  } = req.body;

  if (!name || !category || !price) {
    return res
      .status(400)
      .json({ message: "Tên, danh mục và giá là bắt buộc" });
  }

  // Lấy id lớn nhất hiện tại rồi +1 (vì cột id không auto-increment trong model)
  const maxProduct = await Product.findOne({ order: [["id", "DESC"]] });
  const newId = maxProduct ? maxProduct.id + 1 : 1;

  const product = await Product.create({
    id: newId,
    name,
    category,
    price: Number(price),
    old_price: old_price ? Number(old_price) : null,
    emoji: emoji || null,
    badge: badge || null,
    description: description || null,
    long_description: long_description || null,
  });

  // Tạo specs nếu có
  if (Array.isArray(specs) && specs.length > 0) {
    await ProductSpec.bulkCreate(
      specs.map((s) => ({
        product_id: product.id,
        spec_name: s.spec_name,
        spec_value: s.spec_value,
      })),
    );
  }

  // Tạo recipe nếu có
  if (Array.isArray(recipe) && recipe.length > 0) {
    await ProductRecipe.bulkCreate(
      recipe.map((r) => ({
        product_id: product.id,
        material_name: r.material_name,
        unit: r.unit,
        qty: r.qty,
      })),
    );
  }

  const createdSpecs = await ProductSpec.findAll({
    where: { product_id: product.id },
  });
  const createdRecipe = await ProductRecipe.findAll({
    where: { product_id: product.id },
  });

  return res
    .status(201)
    .json({ ...product.toJSON(), specs: createdSpecs, recipe: createdRecipe });
};

// ====================== CẬP NHẬT SẢN PHẨM ======================
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    category,
    price,
    old_price,
    emoji,
    badge,
    description,
    long_description,
    specs,
    recipe,
  } = req.body;

  const product = await Product.findByPk(id);
  if (!product) {
    return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
  }

  await product.update({
    name: name ?? product.name,
    category: category ?? product.category,
    price: price !== undefined ? Number(price) : product.price,
    old_price:
      old_price !== undefined
        ? old_price
          ? Number(old_price)
          : null
        : product.old_price,
    emoji: emoji !== undefined ? emoji : product.emoji,
    badge: badge !== undefined ? badge : product.badge,
    description: description !== undefined ? description : product.description,
    long_description:
      long_description !== undefined
        ? long_description
        : product.long_description,
  });

  // Cập nhật specs: xóa cũ rồi tạo lại
  if (Array.isArray(specs)) {
    await ProductSpec.destroy({ where: { product_id: id } });
    if (specs.length > 0) {
      await ProductSpec.bulkCreate(
        specs.map((s) => ({
          product_id: Number(id),
          spec_name: s.spec_name,
          spec_value: s.spec_value,
        })),
      );
    }
  }

  // Cập nhật recipe: xóa cũ rồi tạo lại
  if (Array.isArray(recipe)) {
    await ProductRecipe.destroy({ where: { product_id: id } });
    if (recipe.length > 0) {
      await ProductRecipe.bulkCreate(
        recipe.map((r) => ({
          product_id: Number(id),
          material_name: r.material_name,
          unit: r.unit,
          qty: r.qty,
        })),
      );
    }
  }

  const updatedSpecs = await ProductSpec.findAll({ where: { product_id: id } });
  const updatedRecipe = await ProductRecipe.findAll({
    where: { product_id: id },
  });

  return res
    .status(200)
    .json({ ...product.toJSON(), specs: updatedSpecs, recipe: updatedRecipe });
};

// ====================== XÓA SẢN PHẨM ======================
export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  const product = await Product.findByPk(id);
  if (!product) {
    return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
  }

  // Xóa specs và recipe trước (foreign key)
  await ProductSpec.destroy({ where: { product_id: id } });
  await ProductRecipe.destroy({ where: { product_id: id } });
  await product.destroy();

  return res.status(200).json({ message: "Xóa sản phẩm thành công" });
};
