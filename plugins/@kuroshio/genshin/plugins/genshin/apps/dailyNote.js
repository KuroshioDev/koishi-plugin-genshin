const { plugin } = require( '../../lib/plugins/plugin.js')
const puppeteer = require( '../../lib/puppeteer/puppeteer.js')
const { Note } = require('../model/note.js')
const { MysSign } = require( '../model/mysSign.js')
const gsCfg = require( '../model/gsCfg.js')

gsCfg.cpCfg('mys', 'set')

class dailyNote extends plugin {
  constructor (ctx, session) {
    super({
      name: '体力查询',
      dsc: '原神体力、札记查询，米游社签到',
      event: 'message',
      priority: 300,
      rule: [
        {
          reg: '^#*(体力|树脂|查询体力)$',
          fnc: 'note'
        },
        {
          reg: '^(#签到|#*米游社(自动)*签到)(force)*$',
          fnc: 'sign'
        },
        {
          reg: '^#(全部签到|签到任务)(force)*$',
          permission: 'master',
          fnc: 'signTask'
        },
        {
          reg: '^#*(开启|关闭|取消)(米游社|自动|原神)*签到$',
          fnc: 'signClose'
        }
      ],
      ctx: ctx,
      session: session
    })

    this.set = gsCfg.getConfig('mys', 'set')

    /** 定时任务 */
    // this.task = {
    //   cron: this.set.signTime,
    //   name: '米游社原神签到任务',
    //   fnc: () => this.signTask()
    // }
  }

  /** #体力 */
  async note () {
    let data = await Note.get(this.e)
    if (!data) return

    /** 生成图片 */
    let img = await puppeteer.screenshot('dailyNote', data)
    if (img) await this.reply(img)
  }

  /** #签到 */
  async sign () {
    await MysSign.sign(this.e)
  }

  /** 签到任务 */
  async signTask () {
    let mysSign = new MysSign(this.e)
    await mysSign.signTask(!!this?.e?.msg)
  }

  async signClose () {
    let mysSign = new MysSign(this.e)
    await mysSign.signClose()
  }
}

module.exports = dailyNote
