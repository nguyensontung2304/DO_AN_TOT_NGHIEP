/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from "react";

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  // ── Admin auth ────────────────────────────────────────────────────────────
  const [isAdmin, setIsAdmin] = useState(false);

  const login = (username, password) => {
    if (username === "admin" && password === "admin123") {
      setIsAdmin(true);
      return true;
    }
    return false;
  };
  const logout = () => setIsAdmin(false);

  // ── Kho vật tư ────────────────────────────────────────────────────────────
  const [materials, setMaterials] = useState([
    { id: 1, name: "Gỗ MDF", unit: "tấm", stock: 50 },
    { id: 2, name: "Đinh vít", unit: "hộp", stock: 100 },
    { id: 3, name: "Sơn PU", unit: "lít", stock: 20 },
    { id: 4, name: "Chân sắt", unit: "bộ", stock: 30 },
    { id: 5, name: "Gỗ sồi", unit: "tấm", stock: 40 },
    { id: 6, name: "Gỗ thông", unit: "tấm", stock: 35 },
    { id: 7, name: "Gỗ cao su", unit: "tấm", stock: 25 },
    { id: 8, name: "Xốp mút", unit: "kg", stock: 60 },
    { id: 9, name: "Vải nhung", unit: "m", stock: 50 },
    { id: 10, name: "Khung sắt", unit: "bộ", stock: 20 },
    { id: 11, name: "Ray trượt", unit: "bộ", stock: 30 },
    { id: 12, name: "Bản lề mềm", unit: "bộ", stock: 40 },
    { id: 13, name: "Kính cường lực", unit: "tấm", stock: 10 },
    { id: 14, name: "Kính gương", unit: "tấm", stock: 8 },
    { id: 15, name: "Da PU", unit: "m", stock: 20 },
    { id: 16, name: "Lưới ghế", unit: "m²", stock: 15 },
    { id: 17, name: "Bánh xe", unit: "bộ", stock: 25 },
    { id: 18, name: "Tay nắm inox", unit: "cái", stock: 60 },
    { id: 19, name: "Giá treo tường", unit: "bộ", stock: 20 },
    { id: 20, name: "Gỗ tần bì", unit: "tấm", stock: 15 },
    { id: 21, name: "Gỗ MDF chống ẩm", unit: "tấm", stock: 30 },
    { id: 22, name: "Ty nâng thủy lực", unit: "bộ", stock: 10 },
    { id: 23, name: "Sơn tĩnh điện", unit: "lít", stock: 8 },
    { id: 24, name: "Đá granite nhân tạo", unit: "m²", stock: 5 },
  ]);

  const addMaterial = (material) =>
    setMaterials((prev) => [...prev, { ...material, id: Date.now() }]);

  const updateMaterialStock = (id, delta) =>
    setMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, stock: m.stock + delta } : m)),
    );

  // ── Yêu cầu sản xuất ──────────────────────────────────────────────────────
  const [productionRequests, setProductionRequests] = useState([]);

  const addProductionRequest = (req) =>
    setProductionRequests((prev) => [
      ...prev,
      {
        ...req,
        id: Date.now() + Math.random(),
        status: "pending",
        createdAt: new Date().toLocaleString("vi-VN"),
      },
    ]);

  const updateProductionRequestStatus = (id, status) =>
    setProductionRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r)),
    );

  // ── Yêu cầu mua hàng ──────────────────────────────────────────────────────
  const [purchaseRequests, setPurchaseRequests] = useState([]);

  const addPurchaseRequest = (req) =>
    setPurchaseRequests((prev) => [
      ...prev,
      {
        ...req,
        id: Date.now() + Math.random(),
        status: "pending",
        createdAt: new Date().toLocaleString("vi-VN"),
      },
    ]);

  const updatePurchaseRequestStatus = (id, status) =>
    setPurchaseRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r)),
    );

  // ── Phiếu bàn giao NM ────────────────────────────────────────────────────
  const [handoverOrders, setHandoverOrders] = useState([]);

  const addHandoverOrder = (order) =>
    setHandoverOrders((prev) => [
      ...prev,
      {
        ...order,
        id: Date.now() + Math.random(),
        status: "pending",
        createdAt: new Date().toLocaleString("vi-VN"),
      },
    ]);

  const updateHandoverOrderStatus = (id, status) =>
    setHandoverOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o)),
    );

  // ── Yêu cầu bản thiết kế ──────────────────────────────────────────────────
  const [designRequests, setDesignRequests] = useState([]);

  const addDesignRequest = (req) =>
    setDesignRequests((prev) => [
      ...prev,
      {
        ...req,
        id: Date.now() + Math.random(),
        status: "pending",
        createdAt: new Date().toLocaleString("vi-VN"),
      },
    ]);

  const provideDesign = (id, designNote) =>
    setDesignRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "provided", designNote } : r,
      ),
    );

  // ── Báo cáo sản xuất ──────────────────────────────────────────────────────
  const [productionReports, setProductionReports] = useState([]);

  const addProductionReport = (report) =>
    setProductionReports((prev) => [
      ...prev,
      {
        ...report,
        id: Date.now() + Math.random(),
        status: "reported",
        createdAt: new Date().toLocaleString("vi-VN"),
      },
    ]);

  const updateProductionReportStatus = (id, status) =>
    setProductionReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r)),
    );

  // ── Kho thành phẩm ────────────────────────────────────────────────────────
  const [finishedGoods, setFinishedGoods] = useState([]);

  const receiveFinishedGoods = (items) => {
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
  };

  return (
    <AppContext.Provider
      value={{
        // admin auth
        isAdmin,
        login,
        logout,
        // materials
        materials,
        addMaterial,
        updateMaterialStock,
        // production
        productionRequests,
        addProductionRequest,
        updateProductionRequestStatus,
        // purchase
        purchaseRequests,
        addPurchaseRequest,
        updatePurchaseRequestStatus,
        // handover
        handoverOrders,
        addHandoverOrder,
        updateHandoverOrderStatus,
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
