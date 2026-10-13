import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class UserAdminPermission extends Model {
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
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      unique: "uq_user_admin_permission"
    },
    component_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'admin_components',
        key: 'id'
      },
      unique: "uq_user_admin_permission"
    }
  }, {
    sequelize,
    tableName: 'user_admin_permissions',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "uq_user_admin_permission",
        unique: true,
        fields: [
          { name: "user_id" },
          { name: "component_id" },
        ]
      },
      {
        name: "user_admin_permissions_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
