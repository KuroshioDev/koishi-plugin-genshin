const myContext = require('../index.js')
const init = require('../apps/index.js')

class ExamplePlugin {
  constructor(ctx, config) {
    ctx.on("ready", async ()=>{
      this.apps = await init()
    })

    // 自动匹配指令
    // ctx.middleware(async (session, next) => {
    //     await new myContext(ctx, session).dispatch(this.apps)
    //     return next()
    // })
    // 手写匹配指令
    ctx.command('#日志').action(async () => {
      await new myContext(ctx, session).dispatch(this.apps)
    })
  }
}
exports.default = ExamplePlugin
exports.name = 'example'
