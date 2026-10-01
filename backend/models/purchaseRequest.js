import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class PurchaseRequest extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    product_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    items: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "pending"
    },
    production_request_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'production_requests',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'purchase_requests',
    schema: 'public',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        name: "purchase_requests_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
