// Thêm các cột liên kết mới: chạy 1 lần sau khi đổi model
//   node migrate-links.mjs
import pg from "pg";
import "dotenv/config";

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const statements = [
  `ALTER TABLE production_requests ADD COLUMN IF NOT EXISTS order_id integer`,
  `ALTER TABLE production_requests ADD CONSTRAINT production_requests_order_id_fkey
     FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL`,

  `ALTER TABLE purchase_requests ADD COLUMN IF NOT EXISTS production_request_id integer`,
  `ALTER TABLE purchase_requests ADD CONSTRAINT purchase_requests_prod_req_id_fkey
     FOREIGN KEY (production_request_id) REFERENCES production_requests(id) ON DELETE SET NULL`,

  `ALTER TABLE handover_orders ADD COLUMN IF NOT EXISTS production_request_id integer`,
  `ALTER TABLE handover_orders ADD CONSTRAINT handover_orders_prod_req_id_fkey
     FOREIGN KEY (production_request_id) REFERENCES production_requests(id) ON DELETE SET NULL`,

  // received_at NOT NULL nhưng không default → thêm default cho thành phẩm mới
  `ALTER TABLE finished_goods ALTER COLUMN received_at SET DEFAULT NOW()`,
  `ALTER TABLE finished_goods ADD COLUMN IF NOT EXISTS unit varchar(20)`,
];

for (const sql of statements) {
  try {
    await pool.query(sql);
    console.log("OK  :", sql.split("\n")[0].slice(0, 70));
  } catch (e) {
    // Bỏ qua lỗi "đã tồn tại" để script chạy lại được nhiều lần
    if (e.code === "42710" || e.code === "42P01") {
      console.log("SKIP:", sql.split("\n")[0].slice(0, 70), `(${e.code})`);
    } else {
      console.error("FAIL:", sql.split("\n")[0].slice(0, 70), "->", e.message);
    }
  }
}

await pool.end();
console.log("Xong migration.");