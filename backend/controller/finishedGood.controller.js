import models from "../models/index.js";
import { getTimestamp } from "../utils/format.js";
const { FinishedGood } = models;

const mapFG = (r) => ({
  id: r.id,
  name: r.name,
  qty: r.qty,
  unit: r.unit,
  receivedAt: getTimestamp(r, "receivedAt") ?? getTimestamp(r),
});

export const getAllFinishedGoods = async (req, res) => {
  const rows = await FinishedGood.findAll({ order: [["id", "DESC"]] });
  res.status(200).json(rows.map(mapFG));
};

// POST /finished-goods  { name, qty, unit }
// Mỗi lần nhập kho là một lô riêng, kể cả khi trùng tên sản phẩm.
export const createFinishedGood = async (req, res) => {
  const { name, qty, unit } = req.body;
  if (!name || qty === undefined) {
    return res.status(400).json({ message: "Thiếu tên hoặc số lượng thành phẩm" });
  }

  const amount = Number(qty);
  const created = await FinishedGood.create({ name, qty: amount, unit });
  res.status(201).json(mapFG(created));
};

// PUT /finished-goods/:id  { name, qty, unit }
export const updateFinishedGood = async (req, res) => {
  const { id } = req.params;
  const { name, qty, unit } = req.body;

  const fg = await FinishedGood.findByPk(id);
  if (!fg) return res.status(404).json({ message: "Không tìm thấy thành phẩm" });

  const payload = {};
  if (name !== undefined) payload.name = name;
  if (qty !== undefined) payload.qty = Number(qty);
  if (unit !== undefined) payload.unit = unit;

  await fg.update(payload);
  res.status(200).json(mapFG(fg));
};

// DELETE /finished-goods/:id
export const deleteFinishedGood = async (req, res) => {
  const { id } = req.params;
  const fg = await FinishedGood.findByPk(id);
  if (!fg) return res.status(404).json({ message: "Không tìm thấy thành phẩm" });
  await fg.destroy();
  res.status(200).json({ message: "Đã xoá thành phẩm" });
};
