import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class ProductionReport extends Model {
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
    finished_qty: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    scrap_items: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "reported"
    }
  }, {
    sequelize,
    tableName: 'production_reports',
    schema: 'public',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        name: "production_reports_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
