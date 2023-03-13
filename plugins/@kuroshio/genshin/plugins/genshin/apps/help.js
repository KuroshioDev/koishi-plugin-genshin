const { plugin } = require( '../../lib/plugins/plugin.js')
const puppeteer = require( '../../lib/puppeteer/puppeteer.js')
const { Help } = require( '../model/help.js')
const md5 = require( 'md5')

let helpData = {
  md5: '',
  img: ''
}

class help extends plugin {
  constructor (e) {
    super({
      name: '云崽帮助',
      dsc: '云崽帮助',
      event: 'message',
      priority: 500,
      rule: [
        {
          reg: '^(#|云崽)*(命令|帮助|菜单|help|说明|功能|指令|使用说明)$',
          fnc: 'help'
        }
      ]
    })
  }

  async help () {
    let data = await Help.get(this.e)
    if (!data) return

    let img = await this.cache(data)
    await this.reply(img)
  }

  async cache (data) {
    let tmp = md5(JSON.stringify(data))
    if (helpData.md5 == tmp) return helpData.img

    helpData.img = await puppeteer.screenshot('help', data)
    helpData.md5 = tmp

    return helpData.img
  }
}

module.exports = help
