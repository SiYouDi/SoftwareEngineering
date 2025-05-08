import { context } from "../types/context";
import * as jwt from "jsonwebtoken";
import { secret } from "../config/secret.config";
import { User } from "../models/User";
import { createHash } from "crypto";

const login = async (ctx: context) => {
  try {
    let query = ctx.request.body;
    if (!query?.account || !query?.password) {
      ctx.response.body = {
        success: false,
        message: "参数错误",
        data: [],
      };
    }
    const user = await User.findOne({
      where: {
        account: query.account,
      },
    });
    if (!user) {
      ctx.response.body = {
        success: false,
        message: "用户名不存在",
        data: {},
      };
      return;
    }
    const password = createHash("md5")
      .update(`${query.password}${user.dataValues.nonce}`)
      .digest("hex");
    if (password != query.password) {
      ctx.response.body = {
        success: false,
        message: "密码错误",
        data: {},
      };
    }
    const token = jwt.sign(
      {
        account: query.account,
        id: user.toJSON().id,
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
  } catch (error: any) {
    ctx.response.body = {
      success: false,
      message: error.message,
      data: {},
    };
  }
};
export { login };
