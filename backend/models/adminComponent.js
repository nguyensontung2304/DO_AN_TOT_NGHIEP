import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class AdminComponent extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: "admin_components_code_key"
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'admin_components',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "admin_components_code_key",
        unique: true,
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "admin_components_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
