export const ROUTES = {
  USER: {
    HOME: "/",
    PRODUCT_LIST: "/products",
    PRODUCT_DETAIL: "/products/:id",
    ABOUT: "/about",
    CONTACT: "/contact",
    CART: "/cart",
    LOGIN_USER: "/login-user",
    LOGIN_ADMIN: "/login-admin",
    REGISTER: "/register",
    PROFILE: "/profile",
  },
  ADMIN: {
    DASHBOARD: "/admin",
    TECHNICAL: "/admin/technical",
    WAREHOUSE: "/admin/warehouse",
    PURCHASING: "/admin/purchasing",
    FACTORY: "/admin/factory",
    FINISHED_GOODS: "/admin/finished-goods",
  },
};

export const getPath = (route, params = {}) =>
  Object.entries(params).reduce(
    (path, [key, value]) => path.replace(`:${key}`, value),
    route,
  );
