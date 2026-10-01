import sequelize from "../config/db.js";
import initModels from "./init-models.js";

const models = initModels(sequelize);

await sequelize.sync();

export { sequelize };
export default models;
