const plugin = require( '../../lib/plugins/plugin.js')
const puppeteer = require( '../../lib/puppeteer/puppeteer.js')
const gsCfg = require('../model/gsCfg.js')
const {blueprint} = require('../model/blueprint.js')
const {Calculator: cal} = require('../model/calculator.js')

class calculator extends plugin {
  constructor (ctx, session) {
    super({
      name: '养成计算',
      dsc: '角色养成材料计算器',
      event: 'message',
      priority: 700,
      rule: [
        {
          reg: '^#*(.*)(养成|计算)([0-9]|,|，| )*$',
          fnc: 'Calculator'
        },
        {
          reg: '^#*角色(养成|计算|养成计算)$',
          fnc: 'calculatorHelp'
        },
		{
		  reg: '^#*尘歌壶模数(养成|计算|养成计算)$',
		  fnc: 'blueprintHelp'
		},
		{
		  reg: '^#*尘歌壶(模数|养成|养成计算)(\\d{10,15})$',
		  fnc: 'Blueprint'
		},
      ],
      ctx: ctx,
      session: session
    })
  }
 async blueprintHelp (e) {
    let msg = '#尘歌壶模数\n指令：#尘歌壶模数\n示例：#尘歌壶模数4395499323\n参数为模数id(10-15位数字)'
    await this.e.reply(msg)
    return true
  }

  async calculatorHelp (e) {
    let msg = '#角色养成计算\n指令：#刻晴养成\n示例：#刻晴养成81 90 9 9 9\n参数为角色、武器、技能等级'
    await this.e.reply(msg)
    return true
  }
  async Blueprint(){
	  let role = this.e.msg.replace(/#/,'').match(/\d+/g);
	  let data = await new blueprint(this.e).get(role)
	  if (!data) return
	  /** 生成图片 */
	  let img = await puppeteer.screenshot('Blueprint', data)
	  if (img) await this.reply(img)
  }
  /** #刻晴养成 */
  async Calculator () {
    let role = gsCfg.getRole(this.e.msg, '#|＃|养成|计算|[0-9]|,|，| ')
    if (!role) return false

    if ([10000005, 10000007, 20000000].includes(Number(role.roleId))) {
      await this.e.reply('暂不支持旅行者养成计算')
      return true
    }
    let data = await new cal(this.e).get(role)
    if (!data) return

    /** 生成图片 */
    let img = await puppeteer.screenshot('Calculator', data)
    if (img) await this.reply(img)
  }
}
module.exports = calculator
