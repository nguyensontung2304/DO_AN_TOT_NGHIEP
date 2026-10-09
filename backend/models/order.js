import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Order extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    total: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "pending"
    },
    code: {
      type: DataTypes.STRING(8),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'orders',
    schema: 'public',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        name: "orders_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
