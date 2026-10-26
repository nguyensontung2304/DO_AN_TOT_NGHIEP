/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useCallback, useRef } from "react";

import {
  getMaterials,
  createMaterial,
  updateMaterialStock as apiUpdateMaterialStock,
  updateMaterial as apiUpdateMaterial,
  deleteMaterial as apiDeleteMaterial,
} from "../api/materialApi";

import {
  getProductionRequests,
  createProductionRequest as apiCreateProductionRequest,
  updateProductionRequestStatus as apiUpdateProductionRequestStatus,
  deleteProductionRequest as apiDeleteProductionRequest,
} from "../api/productionRequestApi";

import {
  updateOrderStatus as apiUpdateOrderStatus,
  getAllOrders,
} from "../api/orderApi";

import {
  getPurchaseRequests,
  createPurchaseRequest,
  updatePurchaseRequestStatus as apiUpdatePurchaseRequestStatus,
  deletePurchaseRequest as apiDeletePurchaseRequest,
} from "../api/purchaseRequestApi";

import {
  getHandoverOrders,
  createHandoverOrder as apiCreateHandoverOrder,
  updateHandoverOrderStatus as apiUpdateHandoverOrderStatus,
  deleteHandoverOrder as apiDeleteHandoverOrder,
} from "../api/handoverOrderApi";

import {
  getDesignRequests,
  createDesignRequest as apiCreateDesignRequest,
  provideDesign as apiProvideDesign,
} from "../api/designRequestApi";

import {
  getProductionReports,
  createProductionReport as apiCreateProductionReport,
  updateProductionReportStatus as apiUpdateProductionReportStatus,
} from "../api/productionReportApi";

import {
  getFinishedGoods,
  createFinishedGood,
  updateFinishedGood as apiUpdateFinishedGood,
  deleteFinishedGood as apiDeleteFinishedGood,
} from "../api/finishedGoodApi";

export const AppContext = createContext(null);

const ADMIN_ORDERS_KEY = "admin_orders";

const NOTIFY_KEY = "technical_notifications";

// Thông báo toàn cục cho tất cả bước trong quy trình ERP
const GLOBAL_NOTIFY_KEY = "erp_global_notifications";

function getLocalOrders() {
  try {
    const raw = localStorage.getItem(ADMIN_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalOrders(orders) {
  localStorage.setItem(ADMIN_ORDERS_KEY, JSON.stringify(orders));
}

// ── Các bước trong quy trình sản xuất (dùng để tạo global notifications) ──
const STEP_LABEL = {
  order_created: {
    label: "Có đơn hàng mới",
    dept: "Đơn hàng",
    color: "red",
  },

  order_confirmed: {
    label: "Đơn hàng được xác nhận",
    dept: "Kỹ thuật",
    color: "blue",
  },

  order_processing: {
    label: "Đơn hàng bắt đầu sản xuất",
    dept: "Đơn hàng",
    color: "purple",
  },

  production_created: {
    label: "Yêu cầu sản xuất được tạo",
    dept: "Thủ kho",
    color: "purple",
  },

  purchasing_created: {
    label: "Yêu cầu mua hàng được tạo",
    dept: "Mua hàng",
    color: "orange",
  },

  goods_stocked: {
    label: "Vật tư đã nhập kho",
    dept: "Thủ kho",
    color: "teal",
  },

  handover_created: {
    label: "Phiếu bàn giao cho Nhà máy",
    dept: "Nhà máy",
    color: "purple",
  },

  production_reported: {
    label: "Báo cáo sản xuất từ Nhà máy",
    dept: "Thủ kho",
    color: "green",
  },

  finished_received: {
    label: "Thành phẩm đã nhập kho",
    dept: "Thành phẩm",
    color: "green",
  },

  design_requested: {
    label: "Nhà máy yêu cầu bản thiết kế",
    dept: "Kỹ thuật",
    color: "purple",
  },

  design_provided: {
    label: "Kỹ thuật đã gửi bản thiết kế",
    dept: "Nhà máy",
    color: "blue",
  },

  order_delivered: {
    label: "Đơn hàng đã bàn giao cho khách",
    dept: "Đơn hàng",
    color: "green",
  },

  order_completed: {
    label: "Đơn hàng đã hoàn thành và nhập kho",
    dept: "Đơn hàng",
    color: "green",
  },
};

const FG_HANDED_KEY = "fg_handed_over";

function getHandedOverIds() {
  try {
    const raw = localStorage.getItem(FG_HANDED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHandedOverIds(ids) {
  localStorage.setItem(FG_HANDED_KEY, JSON.stringify(ids));
}

function asList(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function normalizeProductionRequest(item) {
  if (!item) return item;
  return {
    ...item,
    materials: asList(item.materials),
    createdAt: item.createdAt || item.created_at || new Date().toISOString(),
  };
}

export function AppProvider({ children }) {
  const [materials, setMaterials] = useState([]);
  // ── Global ERP step notifications (hiển thị trên AdminHeader) ────────────
  const [globalNotifications, setGlobalNotifications] = useState(() => {
    try {
      const raw = localStorage.getItem(GLOBAL_NOTIFY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const pushGlobalNotify = (type, meta = {}) => {
    const step = STEP_LABEL[type];
    if (!step) return;
    const note = {
      // id: \\`${type}-${Date.now()}\\`,
      type,
      label: step.label,
      dept: step.dept,
      color: step.color,
      meta,
      time: new Date().toISOString(),
      read: false,
    };

    setGlobalNotifications((prev) => {
      const alreadyUnread =
        meta.orderId != null &&
        prev.some(
          (existing) =>
            !existing.read &&
            !existing.isRead &&
            existing.type === type &&
            String(existing.meta?.orderId) === String(meta.orderId),
        );
      if (alreadyUnread) return prev;
      const next = [note, ...prev].slice(0, 50); // giữ tối đa 50
      localStorage.setItem(GLOBAL_NOTIFY_KEY, JSON.stringify(next));
      return next;
    });
  };

  const markAllGlobalRead = () => {
    setGlobalNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      localStorage.setItem(GLOBAL_NOTIFY_KEY, JSON.stringify(next));
      return next;
    });
  };

  const markGlobalReadForDept = useCallback((dept) => {
    setGlobalNotifications((prev) => {
      if (
        !prev.some((note) => note.dept === dept && !note.read && !note.isRead)
      ) {
        return prev;
      }

      const next = prev.map((note) =>
        note.dept === dept ? { ...note, read: true, isRead: true } : note,
      );

      localStorage.setItem(GLOBAL_NOTIFY_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearGlobalNotifications = () => {
    setGlobalNotifications([]);
    localStorage.removeItem(GLOBAL_NOTIFY_KEY);
  };

  const addMaterial = async (material) => {
    try {
      const res = await createMaterial(material);
      setMaterials((prev) => [...prev, res.data]);
    } catch {
      setMaterials((prev) => [...prev, { ...material, id: Date.now() }]);
    }
  };

  const updateMaterialStock = async (id, delta) => {
    const material = materials.find((m) => Number(m.id) === Number(id));

    if (!material) {
      throw new Error("Không tìm thấy vật tư trong state");
    }

    // Ép kiểu số để tránh lỗi string concatenation (4 + 1 = 41)
    const currentStock = Number(material.stock || 0);
    const deltaNum = Number(delta);
    const newStock = currentStock + deltaNum;
    const res = await apiUpdateMaterial(id, {
      stock: newStock,
    });

    setMaterials((prev) =>
      prev.map((m) => (Number(m.id) === Number(id) ? res.data : m)),
    );
    return res.data;
  };

  // Sửa thông tin vật tư (tên / đơn vị / tồn kho)
  const updateMaterial = async (id, payload) => {
    const res = await apiUpdateMaterial(id, payload);
    setMaterials((prev) => prev.map((m) => (m.id === id ? res.data : m)));
    return res.data;
  };

  // Xoá vật tư
  const removeMaterial = async (id) => {
    await apiDeleteMaterial(id);
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  // Yêu cầu sản xuất
  const [productionRequests, setProductionRequests] = useState([]);

  const addProductionRequest = async (req) => {
    try {
      // Gửi orderId lên backend để lưu
      const res = await apiCreateProductionRequest(req);

      // res.data có thể là 1 object hoặc mảng objects
      const newItems = (Array.isArray(res.data) ? res.data : [res.data]).map(
        normalizeProductionRequest,
      );
      setProductionRequests((prev) => [...newItems, ...prev]);

      // Thông báo cho Thủ kho
      newItems.forEach((item) => {
        pushGlobalNotify("production_created", {
          productName: item.productName,
          productQty: item.productQty,
        });
      });

      return res.data;
    } catch (error) {
      console.error("Lỗi tạo yêu cầu sản xuất:", error);
      // Tạo từng yêu cầu riêng cho từng sản phẩm khi tạo theo lô
      const batch = Array.isArray(req.items) ? req.items : [req];

      const fallback = batch.map((it) => ({
        id: Date.now() + Math.random(),
        orderId: req.orderId ?? null,
        productName: it.productName,
        productQty: it.productQty,
        note: it.note ?? req.note,
        materials: asList(it.materials),
        status: "pending",
        createdAt: new Date().toISOString(),
      }));
      setProductionRequests((prev) => [...fallback, ...prev]);

      fallback.forEach((item) => {
        pushGlobalNotify("production_created", {
          productName: item.productName,
          productQty: item.productQty,
        });
      });
      return fallback;
    }
  };

  const updateProductionRequestStatus = (id, status) => {
    if (status === "in_production") {
      const request = productionRequests.find(
        (item) => Number(item.id) === Number(id),
      );

      if (request?.orderId) {
        assignOrderToProduction(request.orderId, request.id);
      }
    }

    setProductionRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r)),
    );
    apiUpdateProductionRequestStatus(id, status).catch(() => null);
  };

  const deleteProductionRequest = async (id) => {
    await apiDeleteProductionRequest(id);
    setProductionRequests((prev) => prev.filter((r) => r.id !== id));
  };

  // Yêu cầu mua hàng
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  // KHÔNG có endpoint tạo yêu cầu mua → giữ in-memory, cập nhật UI ngay
  // const addPurchaseRequest = (req) =>
  //   setPurchaseRequests((prev) => [
  //     ...prev,
  //     {
  //       ...req,
  //       id: Date.now() + Math.random(),
  //       status: "pending",
  //       createdAt: new Date().toLocaleString("vi-VN"),
  //     },
  //   ]);

  const addPurchaseRequest = async (req) => {
    try {
      const res = await createPurchaseRequest(req);
      setPurchaseRequests((prev) => [res.data, ...prev]);
      pushGlobalNotify("purchasing_created", {
        productName: res.data.productName,
      });
      return res.data;
    } catch (error) {
      console.error("Lỗi tạo yêu cầu mua hàng:", error);
    }
  };

  const updatePurchaseRequestStatus = (id, status) => {
    setPurchaseRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r)),
    );
    apiUpdatePurchaseRequestStatus(id, status).catch(() => null);
  };

  // Bộ phận Mua hàng xác nhận "đã mua" → cộng thẳng vào tồn kho
  const confirmPurchase = (id) => {
    const pr = purchaseRequests.find((r) => r.id === id);
    if (!pr) return;
    pr.items.forEach((item) =>
      apiUpdateMaterialStock(item.materialId, item.qtyToBuy).catch(() => null),
    );

    setMaterials((prev) =>
      prev.map((m) => {
        const bought = pr.items.find((i) => i.materialId === m.id);
        // Ép kiểu số để tránh string concatenation
        const currentStock = Number(m.stock || 0);
        const buyQty = Number(bought?.qtyToBuy || 0);
        return bought ? { ...m, stock: currentStock + buyQty } : m;
      }),
    );

    setPurchaseRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "stocked" } : r)),
    );

    apiUpdatePurchaseRequestStatus(id, "stocked").catch(() => null);

    // Sau khi vật tư của yêu cầu SX được nhập kho, đưa yêu cầu về hàng chờ
    // kiểm kê để Thủ kho xác nhận lại tồn kho và chuyển sang sẵn sàng sản xuất.
    if (pr.productionRequestId != null) {
      updateProductionRequestStatus(pr.productionRequestId, "pending");
    }
    pushGlobalNotify("goods_stocked", { productName: pr.productName });
  };

  const deletePurchaseRequest = async (id) => {
    await apiDeletePurchaseRequest(id);

    setPurchaseRequests((prev) => prev.filter((r) => r.id !== id));
  };

  // Phiếu bàn giao NM
  const [handoverOrders, setHandoverOrders] = useState([]);

  const addHandoverOrder = async (order) => {
    try {
      const res = await apiCreateHandoverOrder(order);

      setHandoverOrders((prev) => [res.data, ...prev]);

      pushGlobalNotify("handover_created", {
        productName: res.data.productName,
      });

      return res.data;
    } catch (error) {
      console.error("Lỗi tạo phiếu bàn giao:", error);

      const fallback = {
        ...order,
        id: Date.now() + Math.random(),
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      setHandoverOrders((prev) => [fallback, ...prev]);
      pushGlobalNotify("handover_created", { productName: order.productName });
      return fallback;
    }
  };

  const updateHandoverOrderStatus = (id, status) => {
    setHandoverOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o)),
    );

    apiUpdateHandoverOrderStatus(id, status).catch(() => null);
  };

  const deleteHandoverOrder = async (id) => {
    await apiDeleteHandoverOrder(id);
    setHandoverOrders((prev) => prev.filter((o) => o.id !== id));
  };

  // Yêu cầu bản thiết kế
  const [designRequests, setDesignRequests] = useState([]);

  const addDesignRequest = async (req) => {
    try {
      const res = await apiCreateDesignRequest(req);

      setDesignRequests((prev) => [res.data, ...prev]);

      pushGlobalNotify("design_requested", {
        productName: res.data.productName,
      });
    } catch {
      setDesignRequests((prev) => [
        ...prev,
        {
          ...req,
          id: Date.now() + Math.random(),
          status: "pending",
          createdAt: new Date().toLocaleString("vi-VN"),
        },
      ]);
    }
  };

  const provideDesign = (id, designNote) => {
    setDesignRequests((prev) => {
      const current = prev.find((r) => r.id === id);

      if (current) {
        pushGlobalNotify("design_provided", {
          productName: current.productName,
        });
      }

      return prev.map((r) =>
        r.id === id ? { ...r, status: "provided", designNote } : r,
      );
    });
    apiProvideDesign(id, designNote).catch(() => null);
  };

  // Báo cáo sản xuất
  const [productionReports, setProductionReports] = useState([]);

  const addProductionReport = async (report) => {
    try {
      const res = await apiCreateProductionReport(report);
      setProductionReports((prev) => [res.data, ...prev]);
      pushGlobalNotify("production_reported", {
        productName: res.data.productName,
      });
    } catch {
      setProductionReports((prev) => [
        ...prev,
        {
          ...report,
          id: Date.now() + Math.random(),
          status: "reported",
          createdAt: new Date().toISOString(),
        },
      ]);

      pushGlobalNotify("production_reported", {
        productName: report.productName,
      });
    }
  };

  const updateProductionReportStatus = (id, status) => {
    const report = productionReports.find(
      (item) => Number(item.id) === Number(id),
    );

    setProductionReports((prev) =>
      prev.map((item) =>
        Number(item.id) === Number(id) ? { ...item, status } : item,
      ),
    );

    // Chỉ cập nhật đơn hàng gắn với báo cáo đang thay đổi.
    if (report && status === "handed_over") {
      const handover = handoverOrders.find(
        (item) => Number(item.id) === Number(report.handoverOrderId),
      );

      const request = productionRequests.find(
        (item) => Number(item.id) === Number(handover?.productionRequestId),
      );

      if (request?.orderId) {
        updateOrderStatus(request.orderId, "shipping");
      }
    }
    apiUpdateProductionReportStatus(id, status).catch(() => null);
  };

  // Kho thành phẩm
  const [finishedGoods, setFinishedGoods] = useState([]);

  const finishedGoodsRevision = useRef(0);

  const receiveFinishedGoods = async (items, handoverOrderId = null) => {
    const receivedItems = Array.isArray(items)
      ? items
          .filter((item) => item && String(item.name || "").trim())
          .map((item) => ({
            ...item,
            name: String(item.name).trim(),
            qty: Number(item.qty || 0),
          }))
      : [];

    if (receivedItems.length === 0) return;

    finishedGoodsRevision.current += 1;

    // Mỗi lần nhập kho tạo một bản ghi riêng, kể cả khi tên sản phẩm đã tồn tại.
    // Không gộp theo tên và không cập nhật số lượng của bản ghi cũ.
    const receivedAt = new Date().toISOString();
    const doneIds = new Set();

    if (handoverOrderId != null) {
      const handover = handoverOrders.find(
        (order) => Number(order.id) === Number(handoverOrderId),
      );
      if (handover?.productionRequestId != null) {
        doneIds.add(handover.productionRequestId);
      }
    }

    receivedItems.forEach((item) => {
      productionRequests.forEach((request) => {
        const sameName =
          (request.productName || "").trim().toLowerCase() ===
          item.name.trim().toLowerCase();

        if (
          sameName &&
          [
            "in_production",
            "ready",
            "purchasing",
            "pending",
            "checked",
          ].includes(request.status)
        ) {
          doneIds.add(request.id);
        }
      });

      pushGlobalNotify("finished_received", {
        productName: item.name,
        qty: item.qty,
      });
    });

    const affectedOrderIds = new Set();

    doneIds.forEach((id) => {
      updateProductionRequestStatus(id, "done");

      const request = productionRequests.find(
        (item) => Number(item.id) === Number(id),
      );
      if (request?.orderId != null) affectedOrderIds.add(request.orderId);
    });

    affectedOrderIds.forEach((orderId) => {
      const requestsForOrder = productionRequests.filter(
        (request) => String(request.orderId) === String(orderId),
      );

      const allRequestsReceived = requestsForOrder.every(
        (request) =>
          request.status === "done" ||
          [...doneIds].some((id) => Number(id) === Number(request.id)),
      );

      if (requestsForOrder.length > 0 && allRequestsReceived) {
        updateOrderStatus(orderId, "done");
      }
    });

    // Gán ID tạm riêng cho từng dòng để khi API trả về có thể thay đúng dòng,
    // tuyệt đối không tìm/cập nhật bản ghi dựa trên tên sản phẩm.
    const pendingRows = receivedItems.map((item) => ({
      ...item,
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      qty: Number(item.qty || 0),
      receivedAt,
      status: "in_warehouse",
      handedOver: false,
    }));

    setFinishedGoods((prev) => [...pendingRows, ...prev]);

    const persistenceResults = await Promise.allSettled(
      pendingRows.map(async (row) => {
        const response = await createFinishedGood({
          name: row.name,
          qty: Number(row.qty || 0),
          unit: row.unit,
          receivedAt,
          status: "in_warehouse",
        });
        return {
          localId: row.id,
          saved: response?.data ?? response,
        };
      }),
    );

    finishedGoodsRevision.current += 1;

    setFinishedGoods((prev) => {
      let next = [...prev];

      persistenceResults.forEach((result, index) => {
        const localRow = pendingRows[index];

        if (result.status !== "fulfilled" || !result.value?.saved) {
          if (result.status === "rejected") {
            console.error(
              `Không thể lưu thành phẩm "${localRow.name}" vào cơ sở dữ liệu:`,
              result.reason,
            );
          }
          return;
        }

        const saved = result.value.saved;
        const localIndex = next.findIndex(
          (good) => String(good.id) === String(result.value.localId),
        );

        if (localIndex >= 0) {
          next[localIndex] = {
            ...next[localIndex],
            ...saved,
            id: saved.id ?? next[localIndex].id,
            name: saved.name || localRow.name,
            qty: Number(saved.qty ?? localRow.qty),
            receivedAt: saved.receivedAt || receivedAt,
            status: "in_warehouse",
            handedOver: false,
          };
        } else if (saved && saved.id != null) {
          // Nếu dòng tạm đã biến mất, chỉ thêm theo ID DB; không dò theo tên.
          const alreadyExists = next.some(
            (good) => String(good.id) === String(saved.id),
          );
          if (!alreadyExists) {
            next.unshift({
              ...saved,
              qty: Number(saved.qty ?? localRow.qty),
              receivedAt: saved.receivedAt || receivedAt,
              status: "in_warehouse",
              handedOver: false,
            });
          }
        }
      });
      return next;
    });
  };

  const updateFinishedGood = async (id, payload) => {
    const res = await apiUpdateFinishedGood(id, payload);
    finishedGoodsRevision.current += 1;
    setFinishedGoods((prev) => prev.map((g) => (g.id === id ? res.data : g)));
    return res.data;
  };

  const deleteFinishedGood = async (id) => {
    await apiDeleteFinishedGood(id);
    finishedGoodsRevision.current += 1;
    setFinishedGoods((prev) => prev.filter((g) => g.id !== id));
  };

  // Đơn hàng từ khách hàng (chia sẻ qua localStorage)
  const [orders, setOrders] = useState(() => getLocalOrders());
  const addOrder = (order) => {
    console.log(order);

    const newOrder = {
      ...order,
      id: order.id,
      createdAt: order.createdAt,
      status: order.status,
    };

    setOrders((prev) => {
      const updated = [newOrder, ...prev];
      saveLocalOrders(updated);
      return updated;
    });
  };

  // Đơn hàng vừa được xác nhận → dùng để auto-fill form Kỹ thuật
  const [confirmedOrderDraft, setConfirmedOrderDraft] = useState(null);

  const clearConfirmedOrderDraft = () => setConfirmedOrderDraft(null);

  // Đơn đã xác nhận nhưng chưa tạo yêu cầu SX → thông báo cho bộ phận Kỹ thuật
  // Lưu localStorage để thông báo không mất khi tải lại trang
  const [pendingNotifications, setPendingNotifications] = useState(() => {
    try {
      const raw = localStorage.getItem(NOTIFY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const saveNotifications = (list) => {
    localStorage.setItem(NOTIFY_KEY, JSON.stringify(list));
    return list;
  };

  // Thêm / gỡ đơn khỏi danh sách thông báo của Kỹ thuật
  const notifyTechnical = (order) =>
    setPendingNotifications((prev) =>
      saveNotifications([order, ...prev.filter((o) => o.id !== order.id)]),
    );

  const dismissNotification = (orderId) =>
    setPendingNotifications((prev) =>
      saveNotifications(prev.filter((o) => o.id !== orderId)),
    );

  const updateOrderStatus = (id, status) => {
    const order = orders.find((item) => String(item.id) === String(id));

    setOrders((prev) => {
      const updated = prev.map((item) =>
        String(item.id) === String(id) ? { ...item, status } : item,
      );
      saveLocalOrders(updated);
      return updated;
    });

    // Khi xác nhận đơn → lưu draft để Kỹ thuật auto-fill form
    if (status === "confirmed" && order) {
      const confirmedOrder = { ...order, status };
      setConfirmedOrderDraft(confirmedOrder);
      notifyTechnical(confirmedOrder);
      pushGlobalNotify("order_confirmed", {
        orderId: id,
        name: order.name,
      });
    }

    if (order && (status === "done" || status === "shipping")) {
      pushGlobalNotify(
        status === "done" ? "order_completed" : "order_delivered",
        { orderId: id, name: order.name },
      );
    }

    if (order && status === "shipping") {
      const productNames = new Set(
        (order.cart || []).map((item) =>
          (item.name || "").toLowerCase().trim(),
        ),
      );
      finishedGoodsRevision.current += 1;

      setFinishedGoods((prev) => {
        const ids = prev
          .filter((good) =>
            productNames.has((good.name || "").toLowerCase().trim()),
          )
          .map((good) => good.id);

        if (ids.length > 0) {
          saveHandedOverIds([...new Set([...getHandedOverIds(), ...ids])]);
        }

        return prev.map((good) =>
          productNames.has((good.name || "").toLowerCase().trim())
            ? { ...good, status: "handed_over", handedOver: true }
            : good,
        );
      });

      const requestIds = new Set(
        productionRequests
          .filter((request) => String(request.orderId) === String(id))
          .map((request) => Number(request.id)),
      );

      const handoverIds = new Set(
        handoverOrders
          .filter((handover) =>
            requestIds.has(Number(handover.productionRequestId)),
          )
          .map((handover) => Number(handover.id)),
      );

      const reportsToHandover = productionReports.filter(
        (report) =>
          handoverIds.has(Number(report.handoverOrderId)) &&
          report.status !== "handed_over",
      );

      if (reportsToHandover.length > 0) {
        const reportIds = new Set(reportsToHandover.map((report) => report.id));

        setProductionReports((prev) =>
          prev.map((report) =>
            reportIds.has(report.id)
              ? { ...report, status: "handed_over" }
              : report,
          ),
        );

        reportsToHandover.forEach((report) =>
          apiUpdateProductionReportStatus(report.id, "handed_over").catch(
            () => null,
          ),
        );
      }
    }
    // Đồng bộ trạng thái sang DB
    apiUpdateOrderStatus(id, status).catch(() => null);
  };

  // Bàn giao thành phẩm cho khách → đơn trên FE hiện "Hoàn thành — đang giao"
  const deliverToCustomer = (finishedGood) => {
    const name =
      typeof finishedGood === "string" ? finishedGood : finishedGood?.name;

    const fgId = typeof finishedGood === "object" ? finishedGood?.id : null;

    if (!name) return null;

    const matchOrder = orders.find(
      (o) =>
        ["processing", "confirmed", "pending", "done"].includes(o.status) &&
        (o.cart || []).some(
          (c) =>
            (c.name || "").toLowerCase().trim() === name.toLowerCase().trim(),
        ),
    );

    if (fgId != null) {
      finishedGoodsRevision.current += 1;
      setFinishedGoods((prev) =>
        prev.map((g) =>
          g.id === fgId ? { ...g, status: "handed_over", handedOver: true } : g,
        ),
      );
      const ids = [...new Set([...getHandedOverIds(), fgId])];
      saveHandedOverIds(ids);
    }

    const ordersToShip = new Set(matchOrder ? [matchOrder.id] : []);
    const matchingReports = productionReports.filter(
      (report) =>
        report.productName?.toLowerCase().trim() ===
          name.toLowerCase().trim() && report.status !== "handed_over",
    );

    matchingReports.forEach((report) => {
      const handover = handoverOrders.find(
        (item) => Number(item.id) === Number(report.handoverOrderId),
      );
      const request = productionRequests.find(
        (item) => Number(item.id) === Number(handover?.productionRequestId),
      );
      if (request?.orderId) ordersToShip.add(request.orderId);
      else updateProductionReportStatus(report.id, "handed_over");
    });
    ordersToShip.forEach((orderId) => updateOrderStatus(orderId, "shipping"));
    return matchOrder;
  };

  const assignOrderToProduction = (orderId, productionRequestId) => {
    setOrders((prev) => {
      const updated = prev.map((o) =>
        String(o.id) === String(orderId)
          ? { ...o, status: "processing", productionRequestId }
          : o,
      );
      saveLocalOrders(updated);
      return updated;
    });
    apiUpdateOrderStatus(orderId, "processing").catch(() => null);
    pushGlobalNotify("order_processing", { orderId });
  };

  // Tải dữ liệu ERP từ DB khi là admin
  // Chạy khi mount + mỗi khi có thay đổi user (login / logout qua event userChanged)
  useEffect(() => {
    const loadERP = async () => {
      const isAdmin =
        localStorage.getItem("userRole") === "admin" &&
        !!localStorage.getItem("accessToken");

      if (!isAdmin) {
        setMaterials([]);
        setProductionRequests([]);
        setPurchaseRequests([]);
        setHandoverOrders([]);
        setDesignRequests([]);
        setProductionReports([]);
        setFinishedGoods([]);
        return;
      }

      try {
        const finishedGoodsRevisionAtStart = finishedGoodsRevision.current;
        const [m, pr, pur, ho, dr, rep, fg, ord] = await Promise.allSettled([
          getMaterials(),
          getProductionRequests(),
          getPurchaseRequests(),
          getHandoverOrders(),
          getDesignRequests(),
          getProductionReports(),
          getFinishedGoods(),
          getAllOrders(),
        ]);
        if (m.status === "fulfilled") setMaterials(m.value.data || []);

        if (pr.status === "fulfilled") {
          setProductionRequests(
            (pr.value.data || []).map(normalizeProductionRequest),
          );
        }

        if (pur.status === "fulfilled") {
          setPurchaseRequests(
            (pur.value.data || []).map((r) => ({
              ...r,
              items: asList(r.items),
            })),
          );
        }

        if (ho.status === "fulfilled") {
          setHandoverOrders(
            (ho.value.data || []).map((r) => ({
              ...r,
              materials: asList(r.materials),
            })),
          );
        }
        if (dr.status === "fulfilled") setDesignRequests(dr.value.data || []);

        if (rep.status === "fulfilled") {
          setProductionReports(
            (rep.value.data || []).map((r) => ({
              ...r,
              scrapItems: asList(r.scrapItems),
            })),
          );
        }

        if (
          fg.status === "fulfilled" &&
          finishedGoodsRevisionAtStart === finishedGoodsRevision.current
        ) {
          const handed = getHandedOverIds();
          setFinishedGoods(
            (fg.value.data || []).map((g) => ({
              ...g,
              handedOver: handed.includes(g.id),
            })),
          );
        }

        if (ord.status === "fulfilled" && Array.isArray(ord.value.data)) {
          setOrders(ord.value.data);
          saveLocalOrders(ord.value.data);
        }
      } catch (e) {
        console.error("Lỗi tải dữ liệu ERP:", e);
      }
    };

    loadERP();
    const handler = () => loadERP();
    window.addEventListener("userChanged", handler);

    return () => window.removeEventListener("userChanged", handler);
  }, []);

  // Đồng bộ across tabs qua sự kiện storage
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === ADMIN_ORDERS_KEY && e.newValue) {
        try {
          setOrders(JSON.parse(e.newValue));
        } catch {
          setOrders([]);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <AppContext.Provider
      value={{
        // materials
        materials,
        addMaterial,
        updateMaterialStock,
        updateMaterial,
        removeMaterial,
        // production
        productionRequests,
        addProductionRequest,
        updateProductionRequestStatus,
        deleteProductionRequest,
        // purchase
        purchaseRequests,
        addPurchaseRequest,
        updatePurchaseRequestStatus,
        confirmPurchase,
        deletePurchaseRequest,
        // handover
        handoverOrders,
        addHandoverOrder,
        updateHandoverOrderStatus,
        deleteHandoverOrder,
        // design
        designRequests,
        addDesignRequest,
        provideDesign,
        // reports
        productionReports,
        addProductionReport,
        updateProductionReportStatus,
        // finished goods
        finishedGoods,
        receiveFinishedGoods,
        updateFinishedGood,
        deleteFinishedGood,
        // orders (from users)
        orders,
        addOrder,
        updateOrderStatus,
        assignOrderToProduction,
        deliverToCustomer,
        confirmedOrderDraft,
        clearConfirmedOrderDraft,
        setConfirmedOrderDraft,
        pendingNotifications,
        notifyTechnical,
        dismissNotification,
        // global ERP step notifications
        globalNotifications,
        pushGlobalNotify,
        markAllGlobalRead,
        markGlobalReadForDept,
        clearGlobalNotifications,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
