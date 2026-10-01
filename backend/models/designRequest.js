import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class DesignRequest extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    handover_order_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    product_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "pending"
    },
    design_note: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'design_requests',
    schema: 'public',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        name: "design_requests_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
