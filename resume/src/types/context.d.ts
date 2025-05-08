import { Context } from "koa";

interface context extends Context {
    response: {
        body: {
            success?: boolean,
            message?: string,
            data?: {
                [key: string]: any
            }
        }
    }
}

export { context }