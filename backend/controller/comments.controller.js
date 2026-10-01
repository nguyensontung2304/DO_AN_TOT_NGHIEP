import models from "../models/index.js";
import { getImageUrl } from "../utils/format.js";

const { Product } = models;

// Lấy tất cả bình luận của sản phẩm
export const getCommentProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findByPk(productId, {
      include: [
        {
          model: models.Comment,
          as: "comments",
          include: [
            {
              model: models.User,
              as: "user",
              attributes: ["id", "name", "avatar"],
            },
          ],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm",
      });
    }

    const comments = product.comments
      .sort((a, b) => b.id - a.id)
      .map((comment) => {
        const item = comment.toJSON();

        return {
          ...item,
          user: item.user
            ? {
                ...item.user,
                avatar: getImageUrl(item.user.avatar),
              }
            : null,
        };
      });

    res.status(200).json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);

    res.status(500).json({
      message: "Lỗi server",
    });
  }
};

// Thêm bình luận cho sản phẩm
export const postCommentProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { content } = req.body;

    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm",
      });
    }

    const comment = await models.Comment.create({
      content,
      product_id: productId,
      user_id: req.user.id,
    });

    res.status(201).json({
      message: "Bình luận thành công",
      data: comment,
    });
  } catch (error) {
    console.error("Error producting comment:", error);

    res.status(500).json({
      message: "Lỗi server",
    });
  }
};

// Sửa bình luận cho sản phẩm
export const updateCommentProduct = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const comment = await models.Comment.findByPk(commentId);

    if (!comment) {
      return res.status(404).json({
        message: "Không tìm thấy bình luận",
      });
    }

    // Chỉ người tạo comment mới được sửa
    if (comment.user_id !== userId) {
      return res.status(403).json({
        message: "Bạn không có quyền sửa bình luận này",
      });
    }

    comment.content = content;
    await comment.save();

    return res.status(200).json({
      message: "Cập nhật bình luận thành công",
      data: comment,
    });
  } catch (error) {
    console.error("Error updating comment:", error);

    return res.status(500).json({
      message: "Lỗi server",
    });
  }
};

// Xóa bình luận cho sản phẩm
export const deleteCommentProduct = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await models.Comment.findByPk(commentId);

    if (!comment) {
      return res.status(404).json({
        message: "Không tìm thấy bình luận",
      });
    }

    // Chỉ người tạo comment mới được xóa
    if (comment.user_id !== userId) {
      return res.status(403).json({
        message: "Bạn không có quyền xóa bình luận này",
      });
    }

    await comment.destroy();

    return res.status(200).json({
      message: "Xóa bình luận thành công",
    });
  } catch (error) {
    console.error("Error deleting comment:", error);

    return res.status(500).json({
      message: "Lỗi server",
    });
  }
};
