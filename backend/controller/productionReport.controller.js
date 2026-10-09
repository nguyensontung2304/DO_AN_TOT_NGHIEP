import models from "../models/index.js";
import { asArray, getTimestamp } from "../utils/format.js";
const { ProductionReport } = models;

const mapPR = (r) => ({
  id: r.id,
  handoverOrderId: r.handover_order_id,
  productName: r.product_name,
  finishedQty: r.finished_qty,
  scrapItems: asArray(r.scrap_items),
  note: r.note,
  status: r.status,
  createdAt: getTimestamp(r),
});

export const getAllProductionReports = async (req, res) => {
  const rows = await ProductionReport.findAll({ order: [["id", "DESC"]] });
  res.status(200).json(rows.map(mapPR));
};

export const createProductionReport = async (req, res) => {
  const { handoverOrderId, productName, finishedQty, scrapItems, note } = req.body;
  const created = await ProductionReport.create({
    handover_order_id: handoverOrderId,
    product_name: productName,
    finished_qty: finishedQty,
    scrap_items: scrapItems,
    note,
  });
  res.status(201).json(mapPR(created));
};

// PUT /production-reports/:id/status
export const updateProductionReportStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const r = await ProductionReport.findByPk(id);
  if (!r) return res.status(404).json({ message: "Không tìm thấy báo cáo" });
  await r.update({ status });
  res.status(200).json(mapPR(r));
};
