import models from "../models/index.js";
const { DesignRequest } = models;

const mapDR = (r) => ({
  id: r.id,
  handoverOrderId: r.handover_order_id,
  productName: r.product_name,
  note: r.note,
  status: r.status,
  designNote: r.design_note,
  createdAt: r.created_at,
});

export const getAllDesignRequests = async (req, res) => {
  const rows = await DesignRequest.findAll({ order: [["id", "DESC"]] });
  res.status(200).json(rows.map(mapDR));
};

export const createDesignRequest = async (req, res) => {
  const { handoverOrderId, productName, note } = req.body;
  const created = await DesignRequest.create({
    handover_order_id: handoverOrderId,
    product_name: productName,
    note,
  });
  res.status(201).json(mapDR(created));
};

// PUT /design-requests/:id/design  { designNote }
export const provideDesign = async (req, res) => {
  const { id } = req.params;
  const { designNote } = req.body;
  const r = await DesignRequest.findByPk(id);
  if (!r) return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
  await r.update({ status: "provided", design_note: designNote });
  res.status(200).json(mapDR(r));
};
