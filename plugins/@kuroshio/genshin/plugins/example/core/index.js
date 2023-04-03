const myContext = require('../index.js')
const init = require('../apps/index.js')

class ExamplePlugin {
  constructor(ctx, config) {
    ctx.on("ready", async ()=>{
      this.apps = await init()
    })

    // ctx.middleware(async (session, next) => {
    //     await new myContext(ctx, session).dispatch(this.apps)
    //     return next()
    // })
  }
}
exports.default = ExamplePlugin
exports.name = 'example'
