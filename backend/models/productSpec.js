import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class ProductSpec extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    spec_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    spec_value: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'product_specs',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "product_specs_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
