import models from "../models/index.js";
const { Material } = models;

const mapMaterial = (m) => ({
  id: m.id,
  name: m.name,
  unit: m.unit,
  stock: m.stock,
});

export const getAllMaterials = async (req, res) => {
  const rows = await Material.findAll({ order: [["id", "ASC"]] });
  res.status(200).json(rows.map(mapMaterial));
};

// POST /materials  { name, unit, stock }
export const createMaterial = async (req, res) => {
  const { name, unit, stock } = req.body;
  if (!name || !unit) {
    return res.status(400).json({ message: "Thiếu tên hoặc đơn vị vật tư" });
  }

  const created = await Material.create({ name, unit, stock: stock ?? 0 });
  res.status(201).json(mapMaterial(created));
};

// PUT /materials/:id/stock  { delta }
export const updateMaterialStock = async (req, res) => {
  const { id } = req.params;
  const { delta } = req.body;

  const m = await Material.findByPk(id);
  if (!m) return res.status(404).json({ message: "Không tìm thấy vật tư" });
  await m.update({ stock: Number(m.stock || 0) + Number(delta || 0) });
  res.status(200).json(mapMaterial(m));
};

// PUT /materials/:id  { name, unit, stock } — sửa thông tin vật tư
export const updateMaterial = async (req, res) => {
  const { id } = req.params;
  const { name, unit, stock } = req.body;

  const m = await Material.findByPk(id);
  if (!m) return res.status(404).json({ message: "Không tìm thấy vật tư" });

  const payload = {};
  if (name !== undefined) payload.name = name;
  if (unit !== undefined) payload.unit = unit;
  if (stock !== undefined) payload.stock = stock;

  await m.update(payload);
  res.status(200).json(mapMaterial(m));
};

// DELETE /materials/:id — xoá vật tư
export const deleteMaterial = async (req, res) => {
  const { id } = req.params;

  const m = await Material.findByPk(id);
  if (!m) return res.status(404).json({ message: "Không tìm thấy vật tư" });

  await m.destroy();
  res.status(200).json({ message: "Đã xoá vật tư" });
};
