const plugin = require( '../../lib/plugins/plugin.js')
const { MysNews } = require( '../model/mysNews.js')
const fs  = require( 'node:fs')
const lodash = require( 'lodash')
const gsCfg  = require( '../model/gsCfg.js')
const YAML  = require( 'yaml')
const {Logger} = require('koishi')
const logger = new Logger('mysNews')
gsCfg.cpCfg('mys', 'pushNews')
class mysNews extends plugin {
  constructor (ctx, session) {
    super({
      name: '米游社公告',
      dsc: '#公告 #资讯 #活动',
      event: 'message',
      priority: 700,
      rule: [
        {
          reg: '^(#*官方(公告|资讯|活动)|#*原神(公告|资讯|活动)|#公告|#资讯|#活动)[0-9]*$',
          fnc: 'news'
        },
        {
          reg: '^(#米游社|#mys)(.*)',
          fnc: 'mysSearch'
        },
        {
          reg: '(.*)(bbs.mihoyo.com|miyoushe.com)/ys(.*)/article(.*)',
          fnc: 'mysUrl'
        },
        {
          reg: '#*原(石|神)(预估|盘点)$',
          fnc: 'ysEstimate'
        },
        {
          reg: '^#*(开启|关闭)(公告|资讯)推送$',
          fnc: 'setPush'
        },
        {
          reg: '^#推送(公告|资讯)$',
          permission: 'master',
          fnc: 'mysNewsTask'
        }
      ],
      ctx: ctx,
      session: session
    })

    this.file = './plugins/genshin/config/mys.pushNews.yaml'

    /** 定时任务 */
    // this.task = {
    //   cron: gsCfg.getConfig('mys', 'pushNews').pushTime,
    //   name: '米游社公告推送任务',
    //   fnc: () => this.mysNewsTask(),
    //   log: false
    // }
  }

  async init () {
    if (fs.existsSync(this.file)) return

    fs.copyFileSync('./plugins/genshin/defSet/mys/pushNews.yaml', this.file)
  }

  async news () {
    let data = await new MysNews(this.e).getNews()
    if (!data) return
    await this.reply(data)
  }

  async mysNewsTask () {
    let mysNews = new MysNews(this.e)
    await mysNews.mysNewsTask()
  }

  async mysSearch () {
    if (/签到/g.test(this.e.msg)) return false
    let data = await new MysNews(this.e).mysSearch()
    if (!data) return
    await this.reply(data)
  }

  async mysUrl () {
    let data = await new MysNews(this.e).mysUrl()
    if (!data) return
    await this.reply(data)
  }

  async ysEstimate () {
    let data = await new MysNews(this.e).ysEstimate()
    if (!data) return
    await this.reply(data)
  }

  async setPush () {
    if (!this.e.isGroup) {
      await this.reply('推送请在群聊中设置')
      return
    }
    if (!this.e.member?.is_admin && !this.e.isMaster) {
      await this.reply('暂无权限，只有管理员才能操作', true)
      return true
    }

    let cfg = gsCfg.getConfig('mys', 'pushNews')

    let type = 'announceGroup'
    let typeName = '公告'
    if (this.e.msg.includes('资讯')) {
      type = 'infoGroup'
      typeName = '资讯'
    }

    let model
    let msg = `原神${typeName}推送已`
    if (this.e.msg.includes('开启')) {
      model = '开启'
      cfg[type].push(this.e.group_id)
      cfg[type] = lodash.uniq(cfg[type])
      msg += `${model}\n如有最新${typeName}将自动推送至此`
    } else {
      model = '关闭'
      msg += `${model}`
      cfg[type] = lodash.difference(cfg[type], [this.e.group_id])
    }

    let yaml = YAML.stringify(cfg)
    fs.writeFileSync(this.file, yaml, 'utf8')

    logger.info(`${this.e.logFnc} ${model}${typeName}推送：${this.e.group_id}`)
    await this.reply(msg)
  }
}

module.exports = mysNews
