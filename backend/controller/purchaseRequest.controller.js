import models from "../models/index.js";
import { asArray, getTimestamp } from "../utils/format.js";
const { PurchaseRequest } = models;

const mapPR = (r) => ({
  id: r.id,
  productionRequestId: r.production_request_id,
  productName: r.product_name,
  items: asArray(r.items),
  status: r.status,
  createdAt: getTimestamp(r),
});

export const getAllPurchaseRequests = async (req, res) => {
  const rows = await PurchaseRequest.findAll({ order: [["id", "DESC"]] });
  res.status(200).json(rows.map(mapPR));
};

export const createPurchaseRequest = async (req, res) => {
  const { productionRequestId, productName, items } = req.body;

  if (!productName || !Array.isArray(items)) {
    return res.status(400).json({ message: "Thiếu tên sản phẩm hoặc danh sách vật tư" });
  }

  const created = await PurchaseRequest.create({
    production_request_id: productionRequestId ?? null,
    product_name: productName,
    items,
    status: "pending",
  });

  res.status(201).json(mapPR(created));
};

export const updatePurchaseRequestStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const r = await PurchaseRequest.findByPk(id);
  if (!r) return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
  await r.update({ status });
  res.status(200).json(mapPR(r));
};

// DELETE /purchase-requests/:id
export const deletePurchaseRequest = async (req, res) => {
  const { id } = req.params;
  const r = await PurchaseRequest.findByPk(id);
  if (!r) return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
  await r.destroy();
  res.status(200).json({ message: "Đã xoá yêu cầu mua hàng" });
};