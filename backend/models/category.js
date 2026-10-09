import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Category extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: "categories_name_key"
    }
  }, {
    sequelize,
    tableName: 'categories',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "categories_name_key",
        unique: true,
        fields: [
          { name: "name" },
        ]
      },
      {
        name: "categories_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
