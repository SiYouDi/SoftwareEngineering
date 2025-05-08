// 导入类型和模型
import { context } from "../types/context"; // 自定义的Koa上下文类型
import { Socket } from "socket.io"; // Socket.IO的Socket类型
import { Message } from "../models/Message"; // 消息模型
import { User } from "../models/User"; // 用户模型

// 初始化WebSocket功能的函数
export const chat = (io: any) => {
  // 监听客户端连接事件（当用户打开聊天页面时触发）
  io.on("connection", (socket: Socket) => {
    console.log(`用户 ${socket.data.user.account} 已连接`);

    // 监听"join_room"事件（用户加入聊天室）
    socket.on("join_room", (roomId: string) => {
      socket.join(roomId); // 将用户加入指定房间
      // 向房间内所有用户广播"user_joined"事件
      io.to(roomId).emit("user_joined", {
        account: socket.data.user.account,
        timestamp: Date.now(),
      });
    });

    // 监听"send_message"事件（用户发送消息）
    socket.on(
      "send_message",
      async (data: { roomId: string; content: string }) => {
        try {
          // 从数据库查询用户
          const user = await User.findByPk(socket.data.user.id);
          if (!user) throw new Error("用户不存在");

          // 创建消息记录
          const message = await Message.create({
            content: data.content,
            roomId: data.roomId,
            userId: user.dataValues.id,
          });

          // 向房间内所有用户发送消息（包括发送者自己）
          io.to(data.roomId).emit("receive_message", {
            id: message.dataValues.id,
            content: message.dataValues.content,
            account: user.dataValues.account,
            timestamp: message.dataValues.createdAt,
          });
        } catch (error:any) {
          // 发送错误信息给当前用户
          socket.emit("chat_error", error.message);
        }
      }
    );

    // 监听断开连接事件（用户关闭页面或刷新时触发）
    socket.on("disconnect", () => {
      console.log(`用户 ${socket.data.user.account} 已断开`);
    });
  });
};

// 获取历史消息的HTTP接口
export const getMessages = async (ctx: context) => {
  try {
    // 从数据库查询消息（关联用户表）
    const messages = await Message.findAll({
      where: { roomId: ctx.params.roomId }, // 按房间ID过滤
      order: [["createdAt", "DESC"]], // 按时间倒序
      limit: 50, // 最多50条
      include: [{ model: User, attributes: ["account"] }], // 关联用户表
    });

    // 返回格式化后的数据
    ctx.response.body = {
      success: true,
      data: messages.map((msg) => ({
        id: msg.dataValues.id,
        content: msg.dataValues.content,
        account: msg.dataValues.User?.account,
        timestamp: msg.dataValues.createdAt,
      })),
    };
  } catch (error:any) {
    // 错误处理
    ctx.response.body = {
      success: false,
      message: error.message,
      data: [],
    };
  }
};
