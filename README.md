# 软工概论后端概述

## 📜有什么？
1. nodemon热重载
2. esbuild打包
3. sequelize，koa等基本框架
4. 示例的方法与逻辑

## 💻怎么用？

开发运行

```shell
npm run dev
```

项目打包

```shell
npm run build
```

## 开发要求

### 贡献方式

开发者对项目提交pull request，经审核review并同意后，合并版本并发布

### 开发规范

- 应当把每一个业务函数单独放在app目录下，不要直接写在index.ts中
- 按业务划分每个app
- 每一个app必须是一个单独的单词，避免出现userLogin等形式
- 其他命名使用小驼峰命名法
- 不乱用any，为ts写类型是必要的
- 业务代码按照以下规范：

```typescript
// src/app/user/login.ts

import { context } from "../../types/context"

const login = async (ctx: context) => {
    let a = ctx.request.body
    console.log(a)
    ctx.response.body = {
        success: true,
        message: "ok",
        data: {
        }
    }
    return;
}

export { login }
```
