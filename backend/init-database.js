import "dotenv/config";
import models, { sequelize } from "./models/index.js";

try {
  await sequelize.authenticate();
  console.log("Kết nối database thành công.");

  // Bước 1: Tạo các bảng không phụ thuộc bảng khác.
  const baseModels = [
    models.User,
    models.Category,
    models.Product,
    models.AdminComponent,
    models.Material,
    models.DesignRequest,
    models.Order, // Tạo orders trước
    models.ProductionRequest, // Phụ thuộc orders
    models.HandoverOrder, // Phụ thuộc production_requests
  ];

  for (const model of baseModels) {
    await model.sync();
    console.log(`Đã tạo bảng: ${model.tableName}`);
  }

  // Bước 2: Tạo các bảng còn lại.
  // Những bảng này có thể tham chiếu đến các bảng ở bước 1.
  const remainingModels = Object.values(models).filter(
    (model) => !baseModels.includes(model),
  );

  for (const model of remainingModels) {
    await model.sync();
    console.log(`Đã tạo bảng: ${model.tableName}`);
  }

  console.log("Đã tạo các bảng theo model thành công.");
} catch (error) {
  console.error("Lỗi khởi tạo database:", error);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
