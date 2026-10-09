import models from "../models/index.js";
import { asArray, getTimestamp } from "../utils/format.js";
const { ProductionRequest } = models;

const mapProductionRequest = (r) => ({
  id: r.id,
  orderId: r.order_id,
  productName: r.product_name,
  productQty: r.product_qty,
  note: r.note,
  materials: asArray(r.materials),
  status: r.status,
  createdAt: getTimestamp(r),
});

export const getAllProductionRequests = async (req, res) => {
  const rows = await ProductionRequest.findAll({ order: [["id", "DESC"]] });
  res.status(200).json(rows.map(mapProductionRequest));
};

// POST /production-requests
// Nhận 1 sản phẩm kèm vật tư, hoặc nhiều sản phẩm (items) để tạo nhiều yêu cầu
export const createProductionRequest = async (req, res) => {
  const { orderId, productName, productQty, note, materials, items } = req.body;

  // Dạng nhiều sản phẩm: mỗi sản phẩm có vật tư riêng
  if (Array.isArray(items) && items.length > 0) {
    const created = await ProductionRequest.bulkCreate(
      items.map((it) => ({
        order_id: orderId ?? null,
        product_name: it.productName,
        product_qty: it.productQty,
        note: note || null,
        materials: it.materials || [],
      })),
      { returning: true },
    );
    const ids = created.map((r) => r.id).filter(Boolean);
    if (ids.length > 0) {
      const rows = await ProductionRequest.findAll({
        where: { id: ids },
        order: [["id", "DESC"]],
      });
      return res.status(201).json(rows.map(mapProductionRequest));
    }
    return res.status(201).json(created.map(mapProductionRequest));
  }

  const created = await ProductionRequest.create({
    order_id: orderId ?? null,
    product_name: productName,
    product_qty: productQty,
    note,
    materials,
  });
  res.status(201).json(mapProductionRequest(created));
};

export const updateProductionRequestStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const r = await ProductionRequest.findByPk(id);
  if (!r) return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
  await r.update({ status });
  res.status(200).json(mapProductionRequest(r));
};

// DELETE /production-requests/:id
export const deleteProductionRequest = async (req, res) => {
  const { id } = req.params;
  const r = await ProductionRequest.findByPk(id);
  if (!r) return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
  await r.destroy();
  res.status(200).json({ message: "Đã xoá yêu cầu sản xuất" });
};