import _sequelize from "sequelize";
const DataTypes = _sequelize.DataTypes;
import _Address from  "./address.js";
import _CartItem from  "./cartItem.js";
import _Category from  "./category.js";
import _Comment from  "./comment.js";
import _DesignRequest from  "./designRequest.js";
import _FinishedGood from  "./finishedGood.js";
import _HandoverOrder from  "./handoverOrder.js";
import _Material from  "./material.js";
import _Message from  "./message.js";
import _OrderItem from  "./orderItem.js";
import _Order from  "./order.js";
import _ProductRecipe from  "./productRecipe.js";
import _ProductSpec from  "./productSpec.js";
import _ProductionReport from  "./productionReport.js";
import _ProductionRequest from  "./productionRequest.js";
import _Product from  "./product.js";
import _PurchaseRequest from  "./purchaseRequest.js";
import _Rating from  "./rating.js";
import _User from  "./user.js";

export default function initModels(sequelize) {
  const Address = _Address.init(sequelize, DataTypes);
  const CartItem = _CartItem.init(sequelize, DataTypes);
  const Category = _Category.init(sequelize, DataTypes);
  const Comment = _Comment.init(sequelize, DataTypes);
  const DesignRequest = _DesignRequest.init(sequelize, DataTypes);
  const FinishedGood = _FinishedGood.init(sequelize, DataTypes);
  const HandoverOrder = _HandoverOrder.init(sequelize, DataTypes);
  const Material = _Material.init(sequelize, DataTypes);
  const Message = _Message.init(sequelize, DataTypes);
  const OrderItem = _OrderItem.init(sequelize, DataTypes);
  const Order = _Order.init(sequelize, DataTypes);
  const ProductRecipe = _ProductRecipe.init(sequelize, DataTypes);
  const ProductSpec = _ProductSpec.init(sequelize, DataTypes);
  const ProductionReport = _ProductionReport.init(sequelize, DataTypes);
  const ProductionRequest = _ProductionRequest.init(sequelize, DataTypes);
  const Product = _Product.init(sequelize, DataTypes);
  const PurchaseRequest = _PurchaseRequest.init(sequelize, DataTypes);
  const Rating = _Rating.init(sequelize, DataTypes);
  const User = _User.init(sequelize, DataTypes);

  Product.belongsTo(Category, { as: "category", foreignKey: "category_id"});
  Category.hasMany(Product, { as: "products", foreignKey: "category_id"});
  OrderItem.belongsTo(Order, { as: "order", foreignKey: "order_id"});
  Order.hasMany(OrderItem, { as: "order_items", foreignKey: "order_id"});
  ProductionRequest.belongsTo(Order, { as: "order", foreignKey: "order_id"});
  Order.hasMany(ProductionRequest, { as: "production_requests", foreignKey: "order_id"});
  HandoverOrder.belongsTo(ProductionRequest, { as: "production_request", foreignKey: "production_request_id"});
  ProductionRequest.hasMany(HandoverOrder, { as: "handover_orders", foreignKey: "production_request_id"});
  PurchaseRequest.belongsTo(ProductionRequest, { as: "production_request", foreignKey: "production_request_id"});
  ProductionRequest.hasMany(PurchaseRequest, { as: "purchase_requests", foreignKey: "production_request_id"});
  CartItem.belongsTo(Product, { as: "product", foreignKey: "product_id"});
  Product.hasMany(CartItem, { as: "cart_items", foreignKey: "product_id"});
  Comment.belongsTo(Product, { as: "product", foreignKey: "product_id"});
  Product.hasMany(Comment, { as: "comments", foreignKey: "product_id"});
  OrderItem.belongsTo(Product, { as: "product", foreignKey: "product_id"});
  Product.hasMany(OrderItem, { as: "order_items", foreignKey: "product_id"});
  ProductRecipe.belongsTo(Product, { as: "product", foreignKey: "product_id"});
  Product.hasMany(ProductRecipe, { as: "product_recipes", foreignKey: "product_id"});
  ProductSpec.belongsTo(Product, { as: "product", foreignKey: "product_id"});
  Product.hasMany(ProductSpec, { as: "product_specs", foreignKey: "product_id"});
  Rating.belongsTo(Product, { as: "product", foreignKey: "product_id"});
  Product.hasMany(Rating, { as: "ratings", foreignKey: "product_id"});
  Address.belongsTo(User, { as: "user", foreignKey: "user_id"});
  User.hasMany(Address, { as: "addresses", foreignKey: "user_id"});
  CartItem.belongsTo(User, { as: "user", foreignKey: "user_id"});
  User.hasMany(CartItem, { as: "cart_items", foreignKey: "user_id"});
  Comment.belongsTo(User, { as: "user", foreignKey: "user_id"});
  User.hasMany(Comment, { as: "comments", foreignKey: "user_id"});
  Message.belongsTo(User, { as: "sender", foreignKey: "sender_id"});
  User.hasMany(Message, { as: "messages", foreignKey: "sender_id"});
  Message.belongsTo(User, { as: "user", foreignKey: "user_id"});
  User.hasMany(Message, { as: "user_messages", foreignKey: "user_id"});
  Order.belongsTo(User, { as: "user", foreignKey: "user_id"});
  User.hasMany(Order, { as: "orders", foreignKey: "user_id"});
  Rating.belongsTo(User, { as: "user", foreignKey: "user_id"});
  User.hasMany(Rating, { as: "ratings", foreignKey: "user_id"});

  return {
    Address,
    CartItem,
    Category,
    Comment,
    DesignRequest,
    FinishedGood,
    HandoverOrder,
    Material,
    Message,
    OrderItem,
    Order,
    ProductRecipe,
    ProductSpec,
    ProductionReport,
    ProductionRequest,
    Product,
    PurchaseRequest,
    Rating,
    User,
  };
}
