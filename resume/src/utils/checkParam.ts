import { context } from "../types/context";

export const checkParam = (ctx: context, params: Array<string>) => {
    let checked = params.filter((param) => {
        if (ctx.request.body[param] === undefined) {
            return false
        } else {
            return true
        }
    })
    return checked.length == params.length
}
