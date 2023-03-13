const { plugin } = require( '../../lib/plugins/plugin.js')
const puppeteer = require( '../../lib/puppeteer/puppeteer.js')
const {Today} = require('../model/today.js')

class todayMaterial extends plugin {
  constructor (ctx, session) {
    super({
      name: '今日素材',
      dsc: '#今日素材 #每日素材',
      event: 'message',
      priority: 500,
      rule: [
        {
          reg: '^#(今日|今天|每日|我的)*(素材|材料|天赋)[ |0-9]*$',
          fnc: 'today'
        }
      ],
      ctx: ctx,
      session: session
    })
  }

  /** #今日素材 */
  async today () {
    let data = await new Today(this.e).getData()
    if (!data) return
    /** 生成图片 */
    let img = await puppeteer.screenshot('todayMaterial', data)
    if (img) await this.reply(img)
  }
}

module.exports = todayMaterial
