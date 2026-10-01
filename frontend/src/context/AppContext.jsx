/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from "react";

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

import { updateOrderStatus as apiUpdateOrderStatus } from "../api/orderApi";

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

export function AppProvider({ children }) {
  const [materials, setMaterials] = useState([]);

  const addMaterial = async (material) => {
    try {
      const res = await createMaterial(material);
      setMaterials((prev) => [...prev, res.data]);
    } catch {
      setMaterials((prev) => [...prev, { ...material, id: Date.now() }]);
    }
  };

  const updateMaterialStock = (id, delta) => {
    setMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, stock: m.stock + delta } : m)),
    );
    apiUpdateMaterialStock(id, delta).catch(() => null);
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
      const res = await apiCreateProductionRequest(req);
      setProductionRequests((prev) => [...res.data, ...prev]);
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
        materials: it.materials || [],
        status: "pending",
        createdAt: new Date().toLocaleString("vi-VN"),
      }));
      setProductionRequests((prev) => [...fallback, ...prev]);
      return fallback;
    }
  };

  const updateProductionRequestStatus = (id, status) => {
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
        return bought ? { ...m, stock: m.stock + bought.qtyToBuy } : m;
      }),
    );

    setPurchaseRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "stocked" } : r)),
    );
    apiUpdatePurchaseRequestStatus(id, "stocked").catch(() => null);
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
      return res.data;
    } catch (error) {
      console.error("Lỗi tạo phiếu bàn giao:", error);
      const fallback = {
        ...order,
        id: Date.now() + Math.random(),
        status: "pending",
        createdAt: new Date().toLocaleString("vi-VN"),
      };
      setHandoverOrders((prev) => [fallback, ...prev]);
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
    setDesignRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "provided", designNote } : r,
      ),
    );
    apiProvideDesign(id, designNote).catch(() => null);
  };

  // Báo cáo sản xuất
  const [productionReports, setProductionReports] = useState([]);

  const addProductionReport = async (report) => {
    try {
      const res = await apiCreateProductionReport(report);
      setProductionReports((prev) => [res.data, ...prev]);
    } catch {
      setProductionReports((prev) => [
        ...prev,
        {
          ...report,
          id: Date.now() + Math.random(),
          status: "reported",
          createdAt: new Date().toLocaleString("vi-VN"),
        },
      ]);
    }
  };

  const updateProductionReportStatus = (id, status) => {
    setProductionReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r)),
    );
    apiUpdateProductionReportStatus(id, status).catch(() => null);
  };

  // Kho thành phẩm
  const [finishedGoods, setFinishedGoods] = useState([]);

  const receiveFinishedGoods = async (items) => {
    // Cộng dồn vào kho thành phẩm (backend tự gộp theo tên)
    setFinishedGoods((prev) => {
      const updated = [...prev];
      items.forEach((item) => {
        const existing = updated.find((g) => g.name === item.name);
        if (existing) {
          existing.qty += item.qty;
        } else {
          updated.push({
            ...item,
            id: Date.now() + Math.random(),
            receivedAt: new Date().toLocaleString("vi-VN"),
          });
        }
      });
      return updated;
    });

    await Promise.all(
      items.map((item) =>
        createFinishedGood({ name: item.name, qty: item.qty, unit: item.unit }),
      ),
    );
  };

  const updateFinishedGood = async (id, payload) => {
    const res = await apiUpdateFinishedGood(id, payload);
    setFinishedGoods((prev) => prev.map((g) => (g.id === id ? res.data : g)));
    return res.data;
  };

  const deleteFinishedGood = async (id) => {
    await apiDeleteFinishedGood(id);
    setFinishedGoods((prev) => prev.filter((g) => g.id !== id));
  };

  // Đơn hàng từ khách hàng (chia sẻ qua localStorage)
  const [orders, setOrders] = useState(() => getLocalOrders());

  const addOrder = (order) => {
    const newOrder = {
      ...order,
      id: order.id || Date.now() + Math.random(),
      createdAt: order.createdAt || new Date().toISOString(),
      status: order.status || "pending",
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
    setOrders((prev) => {
      const updated = prev.map((o) => (o.id === id ? { ...o, status } : o));
      saveLocalOrders(updated);
      return updated;
    });

    // Khi xác nhận đơn → lưu draft để Kỹ thuật auto-fill form
    if (status === "confirmed") {
      setOrders((prev) => {
        const order = prev.find((o) => o.id === id);
        if (order) {
          setConfirmedOrderDraft(order);
          notifyTechnical(order);
        }
        return prev;
      });
    }

    // Đồng bộ trạng thái sang DB
    apiUpdateOrderStatus(id, status).catch(() => null);
  };

  const assignOrderToProduction = (orderId, productionRequestId) => {
    setOrders((prev) => {
      const updated = prev.map((o) =>
        o.id === orderId
          ? { ...o, status: "processing", productionRequestId }
          : o,
      );
      saveLocalOrders(updated);
      return updated;
    });
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
        const [m, pr, pur, ho, dr, rep, fg] = await Promise.all([
          getMaterials(),
          getProductionRequests(),
          getPurchaseRequests(),
          getHandoverOrders(),
          getDesignRequests(),
          getProductionReports(),
          getFinishedGoods(),
        ]);
        setMaterials(m.data || []);
        setProductionRequests(pr.data || []);
        setPurchaseRequests(pur.data || []);
        setHandoverOrders(ho.data || []);
        setDesignRequests(dr.data || []);
        setProductionReports(rep.data || []);
        setFinishedGoods(fg.data || []);
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
        confirmedOrderDraft,
        clearConfirmedOrderDraft,
        setConfirmedOrderDraft,
        pendingNotifications,
        notifyTechnical,
        dismissNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
