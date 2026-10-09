import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class OrderItem extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id'
      }
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    qty: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    price: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'order_items',
    schema: 'public',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        name: "order_items_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
