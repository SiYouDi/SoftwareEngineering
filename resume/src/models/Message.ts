import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/sequelize";
import { User } from "./User";

const Message = sequelize.define("Message", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  roomId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

// 关联用户模型
Message.belongsTo(User, { foreignKey: "userId" });

export { Message };
