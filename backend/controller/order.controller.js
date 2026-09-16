export const createOrder = async (req, res) => {
  try {
    const { userId, name, phone, address, note, cart, total } = req.body;

    console.log("Dữ liệu nhận được:", req.body);

    res.status(201).json({
      message: "Đặt hàng thành công",
    });
  } catch (error) {
    console.error("Lỗi tạo đơn hàng:", error);

    res.status(500).json({
      message: "Đặt hàng thất bại",
    });
  }
};
