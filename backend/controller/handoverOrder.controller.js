import models from "../models/index.js";
const { HandoverOrder } = models;

const mapHO = (r) => ({
  id: r.id,
  productionRequestId: r.production_request_id,
  productName: r.product_name,
  productQty: r.product_qty,
  materials: r.materials || [],
  status: r.status,
  createdAt: r.created_at,
});

export const getAllHandoverOrders = async (req, res) => {
  const rows = await HandoverOrder.findAll({ order: [["id", "DESC"]] });
  res.status(200).json(rows.map(mapHO));
};

// POST /handover-orders
export const createHandoverOrder = async (req, res) => {
  const { productionRequestId, productName, productQty, materials } = req.body;

  if (!productName || !productQty) {
    return res.status(400).json({ message: "Thiếu tên hoặc số lượng sản phẩm" });
  }

  const created = await HandoverOrder.create({
    production_request_id: productionRequestId ?? null,
    product_name: productName,
    product_qty: productQty,
    materials: materials || [],
    status: "pending",
  });

  res.status(201).json(mapHO(created));
};

export const updateHandoverOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const r = await HandoverOrder.findByPk(id);
  if (!r) return res.status(404).json({ message: "Không tìm thấy phiếu" });
  await r.update({ status });
  res.status(200).json(mapHO(r));
};

// DELETE /handover-orders/:id
export const deleteHandoverOrder = async (req, res) => {
  const { id } = req.params;
  const r = await HandoverOrder.findByPk(id);
  if (!r) return res.status(404).json({ message: "Không tìm thấy phiếu" });
  await r.destroy();
  res.status(200).json({ message: "Đã xoá phiếu bàn giao" });
};