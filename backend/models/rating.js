import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Rating extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      unique: "unique_user_product_rating"
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      },
      unique: "unique_user_product_rating"
    }
  }, {
    sequelize,
    tableName: 'ratings',
    schema: 'public',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        name: "idx_ratings_product_id",
        fields: [
          { name: "product_id" },
        ]
      },
      {
        name: "idx_ratings_user_id",
        fields: [
          { name: "user_id" },
        ]
      },
      {
        name: "ratings_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "unique_user_product_rating",
        unique: true,
        fields: [
          { name: "user_id" },
          { name: "product_id" },
        ]
      },
    ]
  });
  }
}
