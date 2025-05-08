import Koa, { Context } from "koa"; 
import Router from "koa-router"; 
import koaBody from "koa-body"; 
import { login } from "./src/app/login"; 
import { register } from "./src/app/register"; 
import { sequelize } from "./src/config/sequelize"; 
import http from "http"; 
import { Server as SocketIOServer } from "socket.io"; 
import { chat,getMessages } from "./src/app/chat"; 
import cors from "@koa/cors"; 
import helmet from "koa-helmet";
import * as jwt from "jsonwebtoken";
import { secret } from "./src/config/secret.config";

sequelize.sync({ force: false });

const server = new Koa();
const router = new Router();
const httpServer = http.createServer(server.callback());

const io = new SocketIOServer(httpServer, {
  cors: {
    //origin: "http://localhost:3001", // 允许前端域名跨域访问
    origin: "*", // 生产环境应限制为特定域名
    methods: ["GET", "POST"],
  },
  // 确保以下配置正确
  connectTimeout: 5000,
  pingTimeout: 5000,
  pingInterval: 25000,
  path: "/chat/socket.io", // WebSocket的连接路径
});

io.on("connection", (socket) => {
  console.log("New connection:", socket.id);
  socket.on("error", (err) => console.error("Socket error:", err));
  console.log("User:", socket.data.user); // 检查认证信息
});

//Socket.IO的认证中间件（类似门卫检查通行证）
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: Token missing"));
    }
    const decoded = jwt.verify(token, secret);
    socket.data.user = decoded;
    next();
  } catch (err) {
    console.error("Socket auth error:", err);
    if (err instanceof jwt.TokenExpiredError) {
      return next(new Error("Authentication error: Token expired"));
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return next(new Error("Authentication error: Invalid token"));
    }
    next(new Error("Authentication error"));
  }
});

// 调用自定义函数初始化聊天功能（传入Socket.IO实例）
chat(io);

// 定义路由：POST /login 和 POST /register
router.post("/login", login);
router.post("/register", register);
router.get("/messages/:roomId", getMessages); 

// 使用中间件（按顺序执行）
server.use(helmet()); // 1. 安全防护（戴头盔）
server.use(
  cors({
    // 2. 跨域配置
    //origin: "http://localhost:3001", // 允许的域名
    origin: "*", // 一般来说这里要限制一下访问的域名，但为了避免麻烦，就直接放开了
    credentials: true, // 允许携带Cookie等凭证
  })
);
server.use(koaBody({ multipart: true })); // 3. 解析请求体（支持文件上传）
server.use(router.routes()); // 4. 注册路由
server.use(router.allowedMethods()); // 5. 自动处理不支持的HTTP方法

// 404处理中间件（当请求未匹配任何路由时触发）
server.use(async (ctx: Context) => {
  ctx.response.status = 404;
});

// 启动HTTP服务器（同时支持WebSocket）
httpServer.listen(3000, () => {
  console.log("server is running on http://localhost:3000");
});
