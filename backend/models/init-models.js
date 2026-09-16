import _sequelize from "sequelize";
const DataTypes = _sequelize.DataTypes;
import _CartItem from  "./cartItem.js";
import _ProductRecipe from  "./productRecipe.js";
import _ProductSpec from  "./productSpec.js";
import _Product from  "./product.js";
import _User from  "./user.js";

export default function initModels(sequelize) {
  const CartItem = _CartItem.init(sequelize, DataTypes);
  const ProductRecipe = _ProductRecipe.init(sequelize, DataTypes);
  const ProductSpec = _ProductSpec.init(sequelize, DataTypes);
  const Product = _Product.init(sequelize, DataTypes);
  const User = _User.init(sequelize, DataTypes);

  CartItem.belongsTo(Product, { as: "product", foreignKey: "product_id"});
  Product.hasMany(CartItem, { as: "cart_items", foreignKey: "product_id"});
  ProductRecipe.belongsTo(Product, { as: "product", foreignKey: "product_id"});
  Product.hasMany(ProductRecipe, { as: "product_recipes", foreignKey: "product_id"});
  ProductSpec.belongsTo(Product, { as: "product", foreignKey: "product_id"});
  Product.hasMany(ProductSpec, { as: "product_specs", foreignKey: "product_id"});
  CartItem.belongsTo(User, { as: "user", foreignKey: "user_id"});
  User.hasMany(CartItem, { as: "cart_items", foreignKey: "user_id"});

  return {
    CartItem,
    ProductRecipe,
    ProductSpec,
    Product,
    User,
  };
}
