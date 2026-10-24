import models from "../models/index.js";

const { Rating } = models;

// Lấy đánh giá của user hiện tại cho sản phẩm
export const getMyRating = async (req, res) => {
  try {
    const rating = await Rating.findOne({
      where: {
        product_id: req.params.id,
        user_id: req.user.id,
      },
    });

    res.status(200).json({ rating: rating ? rating.score : null });
    console.log("=======> GET MY RATING:", rating);
  } catch (error) {
    console.error("=======> GET MY RATING ERROR:", error);

    res.status(500).json({
      message: "Lỗi server",
    });
  }
};

// Lấy tất cả đánh giá của sản phẩm
// export const getRatingProduct = async (req, res) => {
//   try {
//     const rating = await Rating.findOne({
//       where: {
//         product_id: req.params.id,
//         user_id: req.user.id,
//       },
//     });

//     res.status(200).json(rating);
//   } catch (error) {
//     console.error("=======> GET RATING PRODUCT ERROR:", error);

//     res.status(500).json({
//       message: "Lỗi server",
//     });
//   }
// };

// Đánh giá sản phẩm
export const postRatingProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    console.log("=======> POST RATING PRODUCT:", id);
    console.log("=======> POST RATING SCORE:", rating);

    // Kiểm tra user đã đánh giá sản phẩm này chưa
    const existingRating = await Rating.findOne({
      where: {
        product_id: id,
        user_id: req.user.id,
      },
    });

    // Nếu đã đánh giá rồi -> không cho đánh giá lại
    if (existingRating) {
      return res
        .status(400)
        .json({ message: "Bạn đã đánh giá sản phẩm này rồi" });
    }

    // Nếu chưa đánh giá -> tạo mới
    const newRating = await Rating.create({
      score: rating,
      user_id: req.user.id,
      product_id: id,
    });

    res.status(201).json({
      message: "Đánh giá thành công",
      rating: newRating.score,
    });
  } catch (error) {
    console.error("=======> POST RATING ERROR:", error);

    res.status(500).json({
      message: "Lỗi server",
    });
  }
};
