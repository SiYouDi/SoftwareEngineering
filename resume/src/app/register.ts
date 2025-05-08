import { context } from "../types/context";
import * as jwt from "jsonwebtoken";
import { secret } from "../config/secret.config";
import { User } from "../models/User";
import { createHash } from "crypto";

const register = async (ctx: context) => {
  let query = ctx.request.body;
  // 检查参数
  if (!query?.account || !query?.password) {
    ctx.response.body = {
      success: false,
      message: "参数错误",
      data: {},
    };
    return;
  }
  // 校验逻辑
  // 查询用户
  const user = await User.findOne({
    where: {
      account: query.account,
    },
  });
  if (user) {
    ctx.response.body = {
      success: false,
      message: "用户名已存在",
      data: {},
    };
    return;
  }
  //密码加密，创建用户
  const nonce = Math.floor(Math.random() * 10000);
  const newuser = await User.create({
    account: query.account,
    password: createHash("md5")
      .update(`${query.password}${nonce}`)
      .digest("hex"),
    nonce,
  });
  //下发token
  const token = jwt.sign(
    {
      account: query.account,
      id: newuser.toJSON().id,
    },
    secret,
    {
      expiresIn: "1d",
    }
  );
  ctx.response.body = {
    success: true,
    message: "ok",
    data: {
      token,
    },
  };
  return;
};

export { register };
