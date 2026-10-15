// import { Sequelize } from "sequelize";

// // Thông tin kết nối đọc từ file .env
// const sequelize = new Sequelize(
//   process.env.DB_NAME, // database name
//   process.env.DB_USER, // username
//   process.env.DB_PASSWORD, // password
//   {
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     dialect: "postgres",
//     logging: false,
//     define: {
//       freezeTableName: true,
//       timestamps: false,
//       // created_at / updated_at / deleted_at trong DB viết snake_case
//       underscored: true,
//     },
//   },
// );

// await sequelize.authenticate();

// export default sequelize;

// ====================== đổi thành cách này để deploy ======================
import pg from "pg";
import { Sequelize } from "sequelize";

const options = {
  dialect: "postgres",
  // Truyền thẳng thư viện pg: Vercel đóng gói code không tự thấy pg nếu Sequelize require động
  dialectModule: pg,
  logging: false,
  define: {
    freezeTableName: true,
    // Các bảng hiện có dùng created_at / updated_at / deleted_at.
    // Giữ naming convention này cho các model có timestamps/paranoid.
    underscored: true,
  },
};

// Deploy (Supabase): dùng 1 chuỗi DATABASE_URL, bắt buộc SSL
// Local: thông tin kết nối đọc từ DB_NAME / DB_USER / ... trong file .env như cũ
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      ...options,
      dialectOptions: {
        ssl: { require: true, rejectUnauthorized: false },
      },
      // Serverless: mỗi instance chỉ giữ ít kết nối, pooler của Supabase lo phần còn lại
      pool: { max: 3, min: 0, idle: 10000 },
    })
  : new Sequelize(
      process.env.DB_NAME, // database name
      process.env.DB_USER, // username
      process.env.DB_PASSWORD, // password
      {
        ...options,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
      },
    );

await sequelize.authenticate();

export default sequelize;
