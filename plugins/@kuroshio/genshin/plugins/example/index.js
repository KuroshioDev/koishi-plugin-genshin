const plugin = require("../lib/plugins/plugin.js");

class Example extends plugin {
  constructor (ctx, session) {
    super({
      ctx: ctx,
      session: session
    })
  }
  async dispatch (apps) {
    let e = this.e
    let msg = e.original_msg || ''
    if (!msg) {
      return false
    }
    msg = msg.replace(/#|＃/, '#').trim()
    for (let app in apps.rule) {
      let cfg = apps.rule[app]
      for (const config of cfg) {
        let reg = config.reg
        let fnc = config.fnc
        if (apps[app] && new RegExp(reg).test(msg)) {
          let ret = await new apps[app](this.ctx, this.session)[fnc](e)
          if (ret === true) {
            return true;
          }
        }
      }
    }

    return false
  }
}

module.exports = Example
