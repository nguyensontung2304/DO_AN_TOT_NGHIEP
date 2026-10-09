export const ROUTES = {
  USER: {
    HOME: "/",
    PRODUCT_LIST: "/products",
    PRODUCT_DETAIL: "/products/:id",
    ABOUT: "/about",
    CONTACT: "/contact",
    CART: "/cart",
    CART_CHECKOUT: "/cart/checkout",
    CART_ORDERS: "/cart/orders",
    LOGIN: "/login",
    REGISTER: "/register",
    PROFILE: "/profile",
    PROFILE_CHANGE_PASSWORD: "/profile/change-password",
  },
  ADMIN: {
    DASHBOARD: "/admin",
    ORDERS: "/admin/orders",
    TECHNICAL: "/admin/technical",
    WAREHOUSE: "/admin/warehouse",
    PURCHASING: "/admin/purchasing",
    FACTORY: "/admin/factory",
    FINISHED_GOODS: "/admin/finished-goods",
    PRODUCTS: "/admin/products",
    CHAT: "/admin/chat",
  },
};

export const getPath = (route, params = {}) =>
  Object.entries(params).reduce(
    (path, [key, value]) => path.replace(`:${key}`, value),
    route,
  );
