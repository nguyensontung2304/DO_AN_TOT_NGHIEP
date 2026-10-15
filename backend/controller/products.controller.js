// import models from "../models/index.js";
// import { Op, fn, col } from "sequelize";
// import { formatProduct } from "../utils/format.js";

// const { Product, ProductSpec, ProductRecipe, Rating, Comment, Category } =
//   models;

// // ====================== LẤY TẤT CẢ SẢN PHẨM ======================
// export const getProducts = async (req, res) => {
//   const {
//     category,
//     search,
//     sort = "default",
//     page = 1,
//     limit = 12,
//   } = req.query;

//   // 1. Xử lý page / limit
//   //    limit=all (hoặc <= 0) → lấy về tất cả, dùng cho trang quản trị admin
//   const pageNumber = Math.max(Number(page) || 1, 1);
//   const rawLimit = String(limit).toLowerCase();
//   const isAll = rawLimit === "all" || Number(rawLimit) <= 0;
//   const limitNumber = isAll ? null : Number(rawLimit);

//   const offset = isAll ? 0 : (pageNumber - 1) * limitNumber;

//   // 2. Điều kiện lọc
//   const where = {};

//   // Lọc theo danh mục: frontend truyền tên danh mục → backend giải mã sang category_id
//   let categoryId = null;
//   let categoryNotFound = false;

//   if (category && category !== "Tất cả" && String(category).trim() !== "") {
//     const cat = await Category.findOne({
//       where: { name: String(category).trim() },
//     });

//     // Danh mục không tồn tại → trả về rỗng kèm danh sách danh mục
//     if (!cat) {
//       categoryNotFound = true;
//     } else {
//       categoryId = cat.id;
//     }
//   }

//   if (categoryId) {
//     where.category_id = categoryId;
//   }

//   // Tìm kiếm theo tên sản phẩm hoặc tên danh mục (qua bảng categories)
//   if (search && search.trim() !== "") {
//     const keyword = search.trim();
//     where[Op.or] = [{ name: { [Op.iLike]: `%${keyword}%` } }];

//     const matchingCats = await Category.findAll({
//       where: { name: { [Op.iLike]: `%${keyword}%` } },
//       attributes: ["id"],
//       raw: true,
//     });

//     if (matchingCats.length > 0) {
//       where[Op.or].push({
//         category_id: { [Op.in]: matchingCats.map((c) => c.id) },
//       });
//     }
//   }

//   // 3. Sắp xếp
//   let order = [["id", "ASC"]];

//   if (sort === "price-asc") {
//     order = [["price", "ASC"]];
//   }

//   if (sort === "price-desc") {
//     order = [["price", "DESC"]];
//   }

//   if (sort === "name") {
//     order = [["name", "ASC"]];
//   }

//   // 4. Lấy danh sách danh mục kèm số lượng
//   // const categories = await getCategoriesWithProductCount();

//   // Nếu tên danh mục tìm kiếm không tồn tại → trả về rỗng
//   if (categoryNotFound) {
//     return res.status(200).json({
//       products: [],
//       total: 0,
//       totalPages: 1,
//       currentPage: pageNumber,
//       limit: limitNumber ?? "all",
//       // categories,
//     });
//   }

//   // 5. Lấy sản phẩm (kèm association category để lấy categoryName)
//   const { count, rows } = await Product.findAndCountAll({
//     where,
//     include: [{ model: Category, as: "category" }],
//     distinct: true,
//     order,
//     ...(isAll ? {} : { limit: limitNumber, offset }),
//   });

//   // 6. Tổng số trang
//   const total = count;
//   const totalPages = isAll ? 1 : Math.ceil(total / limitNumber);

//   // 7. Thêm commentsCount, ratingsCount và categoryName vào từng sản phẩm
//   const products = await Promise.all(
//     rows.map(async (product) => {
//       // Lấy comment của sản phẩm này
//       const comments = await Comment.findAll({
//         where: {
//           product_id: product.id,
//         },
//       });

//       // Đếm comment
//       const commentsCount = comments.length;

//       // Lấy rating của sản phẩm này
//       const ratings = await Rating.findAll({
//         where: {
//           product_id: product.id,
//         },
//       });

//       // Đếm rating
//       const ratingsCount = ratings.length;

//       const formattedProduct = formatProduct(product.toJSON());

//       // Trả về product + 2 dữ liệu mới
//       return {
//         ...formattedProduct,
//         commentsCount,
//         ratingsCount,
//       };
//     }),
//   );

//   // 8. Trả kết quả
//   return res.status(200).json({
//     products,
//     total,
//     totalPages,
//     currentPage: pageNumber,
//     limit: limitNumber ?? "all",
//     // categories,
//   });
// };

// // ====================== LẤY CHI TIẾT SẢN PHẨM ======================
// export const getProductDetail = async (req, res) => {
//   const { id } = req.params;

//   const product = await Product.findByPk(id, {
//     include: [{ model: Category, as: "category" }],
//   });

//   if (!product) {
//     return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
//   }

//   // 2. Lấy tất cả bình luận của sản phẩm
//   const comments = await Comment.findAll({
//     where: {
//       product_id: req.params.id,
//     },
//   });

//   // 3. Đếm số lượng bình luận
//   const commentsCount = comments.length;

//   // 4. Lấy tất cả đánh giá của sản phẩm
//   const ratings = await Rating.findAll({
//     where: {
//       product_id: req.params.id,
//     },
//   });

//   // 5. Đếm số lượt đánh giá
//   const ratingsCount = ratings.length;

//   // 6. Tính điểm trung bình
//   const totalScore = ratings.reduce((sum, item) => sum + item.score, 0);

//   const averageRating = ratingsCount > 0 ? totalScore / ratingsCount : 0;

//   const specs = await ProductSpec.findAll({ where: { product_id: id } });
//   const recipe = await ProductRecipe.findAll({ where: { product_id: id } });

//   const formattedProduct = formatProduct(product.toJSON());

//   return res.status(200).json({
//     ...formattedProduct,
//     categoryId: product.category_id,
//     categoryName: product.category?.name,
//     specs,
//     recipe,
//     averageRating,
//     ratingsCount,
//     commentsCount,
//   });
// };

// // ====================== TẠO SẢN PHẨM MỚI ======================
// export const createProduct = async (req, res) => {
//   const {
//     name,
//     category,
//     category_id,
//     price,
//     old_price,
//     badge,
//     description,
//     long_description,
//     specs,
//     recipe,
//   } = req.body;

//   if (!name || (!category && !category_id) || !price) {
//     return res
//       .status(400)
//       .json({ message: "Tên, danh mục và giá là bắt buộc" });
//   }

//   // Giải mã tên danh mục → category_id (hỗ trợ cả category_id trựng tiếp)
//   let cat;
//   let categoryId;

//   if (category_id) {
//     categoryId = Number(category_id);
//     cat = await Category.findByPk(categoryId);
//   } else {
//     cat = await Category.findOne({
//       where: { name: String(category).trim() },
//     });
//     if (cat) {
//       categoryId = cat.id;
//     }
//   }

//   if (!cat) {
//     return res.status(400).json({
//       message: `Danh mục "${category || category_id}" không tồn tại`,
//     });
//   }

//   // XỬ LÝ ẢNH
//   // req.file được tạo bởi multer
//   const image = req.file ? `/uploads/products/${req.file.filename}` : null;

//   // PARSE SPECS
//   let parsedSpecs = [];

//   if (specs) {
//     try {
//       parsedSpecs = JSON.parse(specs);
//     } catch {
//       return res.status(400).json({
//         message: "Dữ liệu thông số kỹ thuật không hợp lệ",
//       });
//     }
//   }

//   // PARSE RECIPE
//   let parsedRecipe = [];

//   if (recipe) {
//     try {
//       parsedRecipe = JSON.parse(recipe);
//     } catch {
//       return res.status(400).json({
//         message: "Dữ liệu nguyên vật liệu không hợp lệ",
//       });
//     }
//   }

//   // TẠO ID
//   const maxProduct = await Product.findOne({
//     order: [["id", "DESC"]],
//   });

//   const newId = maxProduct ? maxProduct.id + 1 : 1;

//   // TẠO PRODUCT
//   const product = await Product.create({
//     id: newId,
//     name,
//     category_id: categoryId,
//     price: Number(price),
//     old_price: old_price ? Number(old_price) : null,
//     image,
//     badge: badge || null,
//     description: description || null,
//     long_description: long_description || null,
//   });

//   // TẠO SPECS
//   if (Array.isArray(parsedSpecs) && parsedSpecs.length > 0) {
//     await ProductSpec.bulkCreate(
//       parsedSpecs.map((s) => ({
//         product_id: product.id,
//         spec_name: s.spec_name,
//         spec_value: s.spec_value,
//       })),
//     );
//   }

//   // TẠO RECIPE
//   if (Array.isArray(parsedRecipe) && parsedRecipe.length > 0) {
//     await ProductRecipe.bulkCreate(
//       parsedRecipe.map((r) => ({
//         product_id: product.id,
//         material_name: r.material_name,
//         unit: r.unit,
//         qty: r.qty,
//       })),
//     );
//   }

//   // LẤY LẠI DỮ LIỆU
//   const createdSpecs = await ProductSpec.findAll({
//     where: {
//       product_id: product.id,
//     },
//   });

//   const createdRecipe = await ProductRecipe.findAll({
//     where: {
//       product_id: product.id,
//     },
//   });

//   return res.status(201).json({
//     ...product.toJSON(),
//     categoryId: product.category_id,
//     categoryName: cat.name,
//     specs: createdSpecs,
//     recipe: createdRecipe,
//   });
// };

// // ====================== CẬP NHẬT SẢN PHẨM ======================
// export const updateProduct = async (req, res) => {
//   const { id } = req.params;

//   const {
//     name,
//     category,
//     category_id,
//     price,
//     old_price,
//     badge,
//     description,
//     long_description,
//     specs,
//     recipe,
//   } = req.body;

//   const product = await Product.findByPk(id, {
//     include: [{ model: Category, as: "category" }],
//   });

//   if (!product) {
//     return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
//   }

//   // XỬ LÝ ẢNH
//   // Nếu chọn ảnh mới → dùng ảnh mới
//   // Nếu không chọn → giữ ảnh cũ
//   const image = req.file
//     ? `/uploads/products/${req.file.filename}`
//     : product.image;

//   // PARSE SPECS
//   let parsedSpecs;

//   if (specs !== undefined) {
//     try {
//       parsedSpecs = JSON.parse(specs);
//     } catch {
//       return res.status(400).json({
//         message: "Dữ liệu thông số kỹ thuật không hợp lệ",
//       });
//     }
//   }

//   // PARSE RECIPE
//   let parsedRecipe;

//   if (recipe !== undefined) {
//     try {
//       parsedRecipe = JSON.parse(recipe);
//     } catch {
//       return res.status(400).json({
//         message: "Dữ liệu nguyên vật liệu không hợp lệ",
//       });
//     }
//   }

//   // Giải mã tên danh mục → category_id (hỗ trợ cả category_id trực tiếp)
//   let categoryId = product.category_id;
//   let cat = null;
//   if (category_id !== undefined && String(category_id).trim() !== "") {
//     categoryId = Number(category_id);
//     cat = await Category.findByPk(categoryId);
//     if (!cat) {
//       return res
//         .status(400)
//         .json({ message: `Danh mục ID "${category_id}" không tồn tại` });
//     }
//   } else if (category !== undefined && String(category).trim() !== "") {
//     cat = await Category.findOne({
//       where: { name: String(category).trim() },
//     });

//     if (!cat) {
//       return res
//         .status(400)
//         .json({ message: `Danh mục "${category}" không tồn tại` });
//     }

//     categoryId = cat.id;
//   }

//   // UPDATE PRODUCT
//   await product.update({
//     name: name ?? product.name,

//     category_id: categoryId,

//     price: price !== undefined ? Number(price) : product.price,

//     old_price:
//       old_price !== undefined
//         ? old_price
//           ? Number(old_price)
//           : null
//         : product.old_price,

//     image,

//     badge: badge !== undefined ? badge : product.badge,

//     description: description !== undefined ? description : product.description,

//     long_description:
//       long_description !== undefined
//         ? long_description
//         : product.long_description,
//   });

//   // CẬP NHẬT SPECS
//   if (Array.isArray(parsedSpecs)) {
//     await ProductSpec.destroy({
//       where: {
//         product_id: id,
//       },
//     });

//     if (parsedSpecs.length > 0) {
//       await ProductSpec.bulkCreate(
//         parsedSpecs.map((s) => ({
//           product_id: Number(id),
//           spec_name: s.spec_name,
//           spec_value: s.spec_value,
//         })),
//       );
//     }
//   }

//   // CẬP NHẬT RECIPE
//   if (Array.isArray(parsedRecipe)) {
//     await ProductRecipe.destroy({
//       where: {
//         product_id: id,
//       },
//     });

//     if (parsedRecipe.length > 0) {
//       await ProductRecipe.bulkCreate(
//         parsedRecipe.map((r) => ({
//           product_id: Number(id),
//           material_name: r.material_name,
//           unit: r.unit,
//           qty: r.qty,
//         })),
//       );
//     }
//   }

//   // LẤY LẠI SPECS + RECIPE
//   const updatedSpecs = await ProductSpec.findAll({
//     where: {
//       product_id: id,
//     },
//   });

//   const updatedRecipe = await ProductRecipe.findAll({
//     where: {
//       product_id: id,
//     },
//   });

//   return res.status(200).json({
//     ...product.toJSON(),
//     categoryId: product.category_id,
//     categoryName: cat?.name ?? product.category?.name,
//     specs: updatedSpecs,
//     recipe: updatedRecipe,
//   });
// };

// // ====================== XÓA SẢN PHẨM ======================
// export const deleteProduct = async (req, res) => {
//   const { id } = req.params;

//   const product = await Product.findByPk(id);
//   if (!product) {
//     return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
//   }

//   // Xóa specs và recipe trước (foreign key)
//   await ProductSpec.destroy({ where: { product_id: id } });
//   await ProductRecipe.destroy({ where: { product_id: id } });
//   await product.destroy();

//   return res.status(200).json({ message: "Xóa sản phẩm thành công" });
// };

// ====================== đổi thành cách này để deploy ======================
import models from "../models/index.js";
import { Op } from "sequelize";
import { formatProduct } from "../utils/format.js";
import { uploadImage } from "../utils/storage.js";

const { Product, ProductSpec, ProductRecipe, Rating, Comment, Category } =
  models;

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

  // Lọc theo danh mục: frontend truyền tên danh mục → backend giải mã sang category_id
  let categoryId = null;
  let categoryNotFound = false;

  if (category && category !== "Tất cả" && String(category).trim() !== "") {
    const cat = await Category.findOne({
      where: { name: String(category).trim() },
    });

    // Danh mục không tồn tại → trả về rỗng kèm danh sách danh mục
    if (!cat) {
      categoryNotFound = true;
    } else {
      categoryId = cat.id;
    }
  }

  if (categoryId) {
    where.category_id = categoryId;
  }

  // Tìm kiếm theo tên sản phẩm hoặc tên danh mục (qua bảng categories)
  if (search && search.trim() !== "") {
    const keyword = search.trim();
    where[Op.or] = [{ name: { [Op.iLike]: `%${keyword}%` } }];

    const matchingCats = await Category.findAll({
      where: { name: { [Op.iLike]: `%${keyword}%` } },
      attributes: ["id"],
      raw: true,
    });

    if (matchingCats.length > 0) {
      where[Op.or].push({
        category_id: { [Op.in]: matchingCats.map((c) => c.id) },
      });
    }
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

  // 4. Lấy danh sách danh mục kèm số lượng
  // const categories = await getCategoriesWithProductCount();

  // Nếu tên danh mục tìm kiếm không tồn tại → trả về rỗng
  if (categoryNotFound) {
    return res.status(200).json({
      products: [],
      total: 0,
      totalPages: 1,
      currentPage: pageNumber,
      limit: limitNumber ?? "all",
      // categories,
    });
  }

  // 5. Lấy sản phẩm (kèm association category để lấy categoryName)
  const { count, rows } = await Product.findAndCountAll({
    where,
    include: [{ model: Category, as: "category" }],
    distinct: true,
    order,
    ...(isAll ? {} : { limit: limitNumber, offset }),
  });

  // 6. Tổng số trang
  const total = count;
  const totalPages = isAll ? 1 : Math.ceil(total / limitNumber);

  // 7. Thêm commentsCount, ratingsCount và categoryName vào từng sản phẩm
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

      const formattedProduct = formatProduct(product.toJSON());

      // Trả về product + 2 dữ liệu mới
      return {
        ...formattedProduct,
        commentsCount,
        ratingsCount,
      };
    }),
  );

  // 8. Trả kết quả
  return res.status(200).json({
    products,
    total,
    totalPages,
    currentPage: pageNumber,
    limit: limitNumber ?? "all",
    // categories,
  });
};

// ====================== LẤY CHI TIẾT SẢN PHẨM ======================
export const getProductDetail = async (req, res) => {
  const { id } = req.params;

  const product = await Product.findByPk(id, {
    include: [{ model: Category, as: "category" }],
  });

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

  const formattedProduct = formatProduct(product.toJSON());

  return res.status(200).json({
    ...formattedProduct,
    categoryId: product.category_id,
    categoryName: product.category?.name,
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
    category_id,
    price,
    old_price,
    badge,
    description,
    long_description,
    specs,
    recipe,
  } = req.body;

  if (!name || (!category && !category_id) || !price) {
    return res
      .status(400)
      .json({ message: "Tên, danh mục và giá là bắt buộc" });
  }

  // Giải mã tên danh mục → category_id (hỗ trợ cả category_id trựng tiếp)
  let cat;
  let categoryId;

  if (category_id) {
    categoryId = Number(category_id);
    cat = await Category.findByPk(categoryId);
  } else {
    cat = await Category.findOne({
      where: { name: String(category).trim() },
    });
    if (cat) {
      categoryId = cat.id;
    }
  }

  if (!cat) {
    return res.status(400).json({
      message: `Danh mục "${category || category_id}" không tồn tại`,
    });
  }

  // XỬ LÝ ẢNH
  // req.file do upload.single('image') tạo ra -> upload lên Supabase Storage, lưu URL public đầy đủ
  const image = req.file ? await uploadImage(req.file) : null;

  // PARSE SPECS
  let parsedSpecs = [];

  if (specs) {
    try {
      parsedSpecs = JSON.parse(specs);
    } catch {
      return res.status(400).json({
        message: "Dữ liệu thông số kỹ thuật không hợp lệ",
      });
    }
  }

  // PARSE RECIPE
  let parsedRecipe = [];

  if (recipe) {
    try {
      parsedRecipe = JSON.parse(recipe);
    } catch {
      return res.status(400).json({
        message: "Dữ liệu nguyên vật liệu không hợp lệ",
      });
    }
  }

  // TẠO ID
  const maxProduct = await Product.findOne({
    order: [["id", "DESC"]],
  });

  const newId = maxProduct ? maxProduct.id + 1 : 1;

  // TẠO PRODUCT
  const product = await Product.create({
    id: newId,
    name,
    category_id: categoryId,
    price: Number(price),
    old_price: old_price ? Number(old_price) : null,
    image,
    badge: badge || null,
    description: description || null,
    long_description: long_description || null,
  });

  // TẠO SPECS
  if (Array.isArray(parsedSpecs) && parsedSpecs.length > 0) {
    await ProductSpec.bulkCreate(
      parsedSpecs.map((s) => ({
        product_id: product.id,
        spec_name: s.spec_name,
        spec_value: s.spec_value,
      })),
    );
  }

  // TẠO RECIPE
  if (Array.isArray(parsedRecipe) && parsedRecipe.length > 0) {
    await ProductRecipe.bulkCreate(
      parsedRecipe.map((r) => ({
        product_id: product.id,
        material_name: r.material_name,
        unit: r.unit,
        qty: r.qty,
      })),
    );
  }

  // LẤY LẠI DỮ LIỆU
  const createdSpecs = await ProductSpec.findAll({
    where: {
      product_id: product.id,
    },
  });

  const createdRecipe = await ProductRecipe.findAll({
    where: {
      product_id: product.id,
    },
  });

  return res.status(201).json({
    ...product.toJSON(),
    categoryId: product.category_id,
    categoryName: cat.name,
    specs: createdSpecs,
    recipe: createdRecipe,
  });
};

// ====================== CẬP NHẬT SẢN PHẨM ======================
export const updateProduct = async (req, res) => {
  const { id } = req.params;

  const {
    name,
    category,
    category_id,
    price,
    old_price,
    badge,
    description,
    long_description,
    specs,
    recipe,
  } = req.body;

  const product = await Product.findByPk(id, {
    include: [{ model: Category, as: "category" }],
  });

  if (!product) {
    return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
  }

  // XỬ LÝ ẢNH
  // Nếu chọn ảnh mới → dùng ảnh mới
  // Nếu không chọn → giữ ảnh cũ
  const image = req.file ? await uploadImage(req.file) : product.image;

  // PARSE SPECS
  let parsedSpecs;

  if (specs !== undefined) {
    try {
      parsedSpecs = JSON.parse(specs);
    } catch {
      return res.status(400).json({
        message: "Dữ liệu thông số kỹ thuật không hợp lệ",
      });
    }
  }

  // PARSE RECIPE
  let parsedRecipe;

  if (recipe !== undefined) {
    try {
      parsedRecipe = JSON.parse(recipe);
    } catch {
      return res.status(400).json({
        message: "Dữ liệu nguyên vật liệu không hợp lệ",
      });
    }
  }

  // Giải mã tên danh mục → category_id (hỗ trợ cả category_id trực tiếp)
  let categoryId = product.category_id;
  let cat = null;
  if (category_id !== undefined && String(category_id).trim() !== "") {
    categoryId = Number(category_id);
    cat = await Category.findByPk(categoryId);
    if (!cat) {
      return res
        .status(400)
        .json({ message: `Danh mục ID "${category_id}" không tồn tại` });
    }
  } else if (category !== undefined && String(category).trim() !== "") {
    cat = await Category.findOne({
      where: { name: String(category).trim() },
    });

    if (!cat) {
      return res
        .status(400)
        .json({ message: `Danh mục "${category}" không tồn tại` });
    }

    categoryId = cat.id;
  }

  // UPDATE PRODUCT
  await product.update({
    name: name ?? product.name,

    category_id: categoryId,

    price: price !== undefined ? Number(price) : product.price,

    old_price:
      old_price !== undefined
        ? old_price
          ? Number(old_price)
          : null
        : product.old_price,

    image,

    badge: badge !== undefined ? badge : product.badge,

    description: description !== undefined ? description : product.description,

    long_description:
      long_description !== undefined
        ? long_description
        : product.long_description,
  });

  // CẬP NHẬT SPECS
  if (Array.isArray(parsedSpecs)) {
    await ProductSpec.destroy({
      where: {
        product_id: id,
      },
    });

    if (parsedSpecs.length > 0) {
      await ProductSpec.bulkCreate(
        parsedSpecs.map((s) => ({
          product_id: Number(id),
          spec_name: s.spec_name,
          spec_value: s.spec_value,
        })),
      );
    }
  }

  // CẬP NHẬT RECIPE
  if (Array.isArray(parsedRecipe)) {
    await ProductRecipe.destroy({
      where: {
        product_id: id,
      },
    });

    if (parsedRecipe.length > 0) {
      await ProductRecipe.bulkCreate(
        parsedRecipe.map((r) => ({
          product_id: Number(id),
          material_name: r.material_name,
          unit: r.unit,
          qty: r.qty,
        })),
      );
    }
  }

  // LẤY LẠI SPECS + RECIPE
  const updatedSpecs = await ProductSpec.findAll({
    where: {
      product_id: id,
    },
  });

  const updatedRecipe = await ProductRecipe.findAll({
    where: {
      product_id: id,
    },
  });

  return res.status(200).json({
    ...product.toJSON(),
    categoryId: product.category_id,
    categoryName: cat?.name ?? product.category?.name,
    specs: updatedSpecs,
    recipe: updatedRecipe,
  });
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
