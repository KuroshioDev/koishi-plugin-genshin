const { plugin } = require( '../../lib/plugins/plugin.js')
const { PayData, renderImg } = require( '../model/payLogData.js')
const url = require( 'url')
const fs  = require( 'fs')
const path = require( 'path')

class payLog extends plugin {
  constructor (ctx, session) {
    super({
      name: '充值记录',
      dsc: '充值记录,消费记录,充值统计,消费统计',
      event: 'message',
      priority: 299,
      rule: [
        {
          reg: '^#?(充值|消费)(记录|统计)$',
          fnc: 'payLog'
        },
        {
          reg: '^#?更新(充值|消费)(记录|统计)',
          fnc: 'updatePayLog'
        },
        {
          // 优先级高于抽卡记录，但是发送抽卡链接时不会抢指令，对比过米游社链接和抽卡链接，该字段为米游社链接字段
          reg: '(.*)(bill-record-user|customer-claim|player-log|user.mihoyo.com)(.*)',
          fnc: 'getAuthKey'
        },
        {
          reg: '^#?(充值|消费)(记录|统计)帮助',
          fnc: 'payLogHelp'
        }
      ],
      ctx: ctx,
      session: session
    })
  }

  dirPath = path.resolve('./data/payLog/')
  authKey = ''

  async payLog (e) {
    // 判断是否存有已经生成的数据
    let dbData = await global.dbHelper.get('genshin_user_paylog', {
      user_id: [this.e.user_id]
    })

    if (!dbData) {
      // 如果没有则判断是否已经缓存了authkey，这个主要针对使用抽卡链接的，和苹果用户
      await this.updatePayLog()
      return true
    }

    // 如果有就判断用户的主分支uid是什么
    const mainUid = await this.isMain(this.e.user_id)

    // 再读取现有数据
    // const _path = path.resolve(`./data/payLog/${e.user_id}.yaml`)
    let data =dbData.data

    // 如果用户没有绑定ck，就直接发送保存的数据
    if (!mainUid) {
      let key = Object.keys(data)
      let img = await renderImg(data[key[0]])
      this.reply(img)
      return true
    }

    // 判断已有数据里是否有该uid的数据
    if (data) {
      // 如果有该uid的数据，就发送
      let img = await renderImg(data)
      this.reply(img)
      return true
    } else {
      // 没有就获取
      this.reply('当前绑定的uid未获取数据，请私聊获取')
      return false
    }
  }

  // 获取authKey
  async getAuthKey () {
    // 判断是否为群聊发送
    if (this.e.isGroup) {
      return false
    }

    // 判断字段中是否有authkey
    if (!this.e.msg.includes('authkey')) {
      this.reply('链接无效,请重新发送')
      return false
    }

    // 解析出authKey
    let userUrl = this.e.msg.replace(/[\u4e00-\u9fa5]/g, '').replace(/\s+/g, '')
    this.authKey = url.parse(userUrl, true, true).query.authkey

    // 获取数据
    this.reply('正在获取消费数据,可能需要30s~~')
    let data = new PayData(this.authKey)
    let imgData = await data.filtrateData()
    if (imgData?.errorMsg) {
      this.reply(imgData?.errorMsg)
      return true
    }

    // 发送图片
    let img = await renderImg(imgData)
    this.reply(img)

    // 存储数据
    await this.writeData(imgData)
    await redis.setEx(`Yz:genshin:mys:qq-uid:${this.e.user_id}`, 3600 * 24 * 30, imgData.uid)
    await redis.setEx(`Yz:genshin:payLog:${imgData.uid}`, 3600 * 24, this.authKey)
    return true
  }

  /** 更新充值统计 */
  async updatePayLog (e) {
    // 读一下uid
    let uid = await this.isMain(this.e.user_id)
    if (uid) {
      let mainUid = await this.isMain(this.e.user_id)
      if (mainUid) uid = mainUid
      // 读米游社链接的authkey
      // 读抽卡链接的authkey
      this.authKey = await redis.get(`Yz:genshin:payLog:${uid}`) || await redis.get(`Yz:genshin:gachaLog:url:${uid}`)
      if (this.authKey) {
        this.reply('正在获取数据,可能需要30s')
        let imgData = await new PayData(this.authKey).filtrateData()
        if (imgData?.errorMsg) {
          this.reply(imgData.errorMsg)
        } else {
          let img = await renderImg(imgData)
          this.reply(img)
          await this.writeData(imgData)
        }
        return true
      } else {
        this.reply('请私聊发送米游社链接，可以发送【#充值统计帮助】查看链接教程', false)
      }
    } else {
      this.reply('请私聊发送米游社链接，可以发送【#充值统计帮助】查看链接教程', false)
    }
    return true
  }

  payLogHelp (e) {
    this.e.reply('安卓教程： https://b23.tv/K5qfLad\n苹果用户可【先】发送最新获取的抽卡记录链接，【再】发送【#充值记录】或【#更新充值统计】来获取')
  }

  /** 判断主uid，若没有则返回false,有则返回主uid */
  async isMain (id) {
    let ckData = await global.dbHelper.list('genshin_user_cookie', {
      user_id: [id]
    })
    if (ckData || ckData.length > 0) {
      for (let k in ckData) {
        if (ckData[k].isMain) return ckData[k].uid
      }
    } else {
      return false
    }
  }

  /** 存储数据 */
  async writeData (imgData) {
    let dbData = await global.dbHelper.get('genshin_user_paylog', {
      user_id: [this.e.user_id]
    })
    if (dbData) {
      dbData["data"] = imgData
      dbData["update_time"] = new Date()
      await global.dbHelper.upsert('genshin_user_paylog', dbData)
    } else {
      let data = {
        user_id: this.e.user_id,
        data: imgData,
        uid: imgData.uid,
        create_time: new Date(),
        update_time: new Date()
      }
      await global.dbHelper.create('genshin_user_paylog', data)
    }
  }
}

module.exports = payLog
