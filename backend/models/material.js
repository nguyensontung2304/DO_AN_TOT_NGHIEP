import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Material extends Model {
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
      allowNull: false
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    stock: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'materials',
    schema: 'public',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        name: "materials_name_key",
        unique: true,
        fields: [
          { name: "name" },
        ]
      },
      {
        name: "materials_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
