const moment = require( 'moment')
const lodash = require( 'lodash')
const { base } = require( './base.js')
const MysApi = require( './mys/mysApi.js')
const gsCfg = require( './gsCfg.js')
const User = require( './user.js')
const common = require('../../lib/common/common.js')
const cfg = require( '../../lib/config/config.js')
const {Logger} = require( "koishi")
const fetch = require('node-fetch')
const logger = new Logger('genshin-plugin-MysSign')
let signing = false
class MysSign extends base {
  constructor(e) {
    super(e)
    this.model = 'sign'
    this.isTask = false
    this.force = false

    this.cfg = gsCfg.getConfig('mys', 'set')
  }

  static async sign(e) {
    let mysSign = new MysSign(e)

    if (e.msg.includes('force')) mysSign.force = true

    /** 获取个人ck */
    let ck = await gsCfg.getBingCkSingle(e.user_id)

    if (lodash.isEmpty(ck)) {
      e.reply('无法签到，请先绑定cookie\n发送【#扫码登录】后用米游社扫码二维码即可', false, { at: true })
      return false
    }

    if (signing) {
      e.reply('原神自动签到进行中，暂不能手动签到...')
      return false
    }

    if (Object.keys(ck).length > 1) {
      await e.reply('多账号签到中...')
    }
    let i = 0
    let msg = []
    for (let key in ck) {
      mysSign.ckNum = Number(i) + 1
      if (Object.keys(ck).length >= 1) await common.sleep(5000)
      let uid = key
      let res = await mysSign.doSign(ck[uid])
      if (res) msg.push(res.msg)
    }

    msg = msg.join('\n\n')

    await e.reply(msg)
  }

  async doSign(ck, isLog = true) {
    if ( ck.region_name =="星穹铁道") {
      ck.uid = ck.starrail_uid
      this.isSr = true
    }else {
      this.isSr = false
    }

    ck = this.setCk(ck)
    this.mysApi = new MysApi(ck.uid, ck.ck, { log: isLog, device_id: ck.device_id }, this.isSr)
    this.key = `${this.prefix}isSign:${this.mysApi.uid}`
    this.log = `[uid:${ck.uid}][qq:${lodash.padEnd(this.e.user_id, 10, ' ')}]`

    let isSigned = await redis.get(this.key)
    if (isSigned && this.isTask && !this.force) {
      let reward = await this.getReward(isSigned)
      return {
        retcode: 0,
        msg: `${ck.region_name}\nuid:${ck.uid}，今天已签到\n第${isSigned}天奖励：${reward}`,
        is_sign: true
      }
    }

    /** 判断是否已经签到 */
    let signInfo = await this.mysApi.getData('bbs_sign_info')

    await common.sleep(100)

    if (!signInfo) return false

    if (signInfo.retcode == -100 && signInfo.message == '尚未登录') {
      logger.error(`[原神签到失败]${this.log} 绑定cookie已失效`)
      let userAdmin = new User(this.e)
      if (userAdmin) {
        await userAdmin.delCk(ck.uid)
      }
      return {
        retcode: -100,
        msg: `签到失败，${ck.region_name}\nuid:${ck.uid}，绑定cookie已失效`,
        is_invalid: true
      }
    }

    if (signInfo.retcode !== 0) {
      return {
        retcode: signInfo.retcode,
        msg: `签到失败：${signInfo.message || '未知错误'}`
      }
    }

    if (signInfo.first_bind) {
      return {
        retcode: 100,
        msg: '签到失败：首次请先手动签到'
      }
    }

    this.signInfo = signInfo.data

    if (this.signInfo.is_sign && !this.force) {
      // logger.mark(`[原神已签到][uid:${this.mysApi.uid}][qq:${lodash.padEnd(this.e.user_id,11,' ')}]`)
      let reward = await this.getReward(this.signInfo.total_sign_day)
      this.setCache(this.signInfo.total_sign_day)
      return {
        retcode: 0,
        msg: `${ck.region_name}\nuid:${ck.uid}，今天已签到\n第${this.signInfo.total_sign_day}天奖励：${reward}`,
        is_sign: true
      }
    }

    /** 签到 */
    let res = await this.bbsSign(this.isSr)

    if (res) {
      let totalSignDay = this.signInfo.total_sign_day
      if (!this.signInfo.is_sign) {
        totalSignDay++
      }

      let tips = '签到成功'

      if (this.signed) {
        tips = '今天已签到'
      }

      let reward = await this.getReward(totalSignDay)

      this.setCache(totalSignDay)

      return {
        retcode: 0,
        msg: `${ck.region_name}\nuid:${ck.uid}，${tips}\n第${totalSignDay}天奖励：${reward}`
      }
    }

    return {
      retcode: -1000,
      msg: `${ck.region_name}\nuid:${ck.uid}，签到失败：${this.signMsg}`
    }
  }

  setCk(ck) {
    ck.ck = lodash.trim(ck.ck, ';') + `; _MHYUUID=${ck.device_id}; `
    return ck
  }

  // 缓存签到奖励
  async getReward(signDay) {
    let key = `${this.prefix}reward`
    if (this.isSr) key = `Yz:StarRail:StarRail:reward`
    let reward = await redis.get(key)

    if (reward) {
      reward = JSON.parse(reward)
    } else {
      let res = await this.mysApi.getData('bbs_sign_home')
      if (!res || Number(res.retcode) !== 0) return false

      let data = res.data
      if (data && data.awards && data.awards.length > 0) {
        reward = data.awards

        let monthEnd = Number(moment().endOf('month').format('X')) - Number(moment().format('X'))
        redis.setEx(key, monthEnd, JSON.stringify(reward))
      }
    }
    if (reward && reward.length > 0) {
      reward = reward[signDay - 1] || ''
      if (reward.name && reward.cnt) {
        reward = `${reward.name}*${reward.cnt}`
      }
    } else {
      reward = ''
    }

    return reward
  }

  async bbsSign(isSr) {
    this.signApi = true
    this.is_verify = false
    let sign
    if (isSr) {
      sign = await this.mysApi.getData('bh_sign')
    } else {
      sign = await this.mysApi.getData('bbs_sign')
    }
    this.signMsg = sign?.message ?? 'Too Many Requests'

    if (!sign) {
      logger.info(`[原神签到失败]${this.log}：${sign.message || this.signMsg}`)
      return false
    }

    /** 签到成功 */
    if (sign.retcode === -5003) {
      this.signed = true
      logger.info(`[原神已经签到]${this.log} 第${this.ckNum}个`)
      return true
    }

    if (sign.data && sign.data.risk_code === 375) {
      this.signMsg = '验证码失败'
      sign.message = '验证码失败'
      this.is_verify = true
      await common.sleep(1000)
      if (!signing && !this?.msgYz) {
        if(this.e.session.platform == 'qqguild' && this.e.session.guildId != '9627516829995618702') {
          this.e?.reply("遇见验证码,请前往官方频道签到绕过验证码")
          return false
        }
        this.msgYz = true
        this.e?.reply("遇见验证码正在尝试绕过，请稍等....")
      }
      await common.sleep(5000)
      try {
        let res = await this.mysApi.getData('validate', sign.data)
        let challenge = res?.data["challenge"]
        let validate = res?.data?.validate
        if (validate) {
          let header = {}
          header["x-rpc-challenge"] = challenge
          header["x-rpc-validate"] = validate
          header["x-rpc-seccode"] = `${validate}|jordan`
          let data = {
            headers: header
          }
          sign = await this.mysApi.getData('bbs_sign', data)
          if (sign.data && sign.data.risk_code === 375) {
            logger.info(`[原神签到失败]${this.log}：${sign.message} 第${this.ckNum}个`)
            return false
          } else {
            this.is_verify = false
            this.signMsg = '验证码成功'
            logger.info(`[原神签到成功]${this.log}:验证码成功 第${this.ckNum}个`)
            return true
          }
        }
      } catch (error) {
        logger.error('签到异常：' + error)
        // 尝试手动过码
        let msg = [
          "无法绕过验证码,请打开链接自行验证"
        ];
        await common.sleep(500);
        this.e.reply(msg);
        /** 调用手动验证码 */
        let res = await this.crack_geetest(sign.data.gt, sign.data.challenge);
        logger.info(`验证结果：${JSON.stringify(res)}`);
        /** 发送验证结果 */
        if (res?.data?.validate) {
          let validate = res["data"]["validate"];
          let header = {};
          header["x-rpc-challenge"] = res["data"]["challenge"];
          header["x-rpc-validate"] = validate;
          header["x-rpc-seccode"] = `${validate}|jordan`;
          let data = {
            headers: header,
          };
          console.log("验证码签到");
          sign = await this.mysApi.getData("bbs_sign", data);
          if (sign.data && sign.data.risk_code === 375) {
            logger.info(
              `[原神签到失败]${this.log}：${sign.message} 第${this.ckNum}个`
            );
            await this.bbsSign(this.isSr);
            return false;
          } else {
            this.is_verify = false;
            this.signMsg = "验证码成功";
            logger.info(
              `[原神签到成功]${this.log}:验证码成功 第${this.ckNum}个`
            );
            return true;
          }
        } else if (res.msg === "识别失败") {
          logger.info(
            `[原神签到失败]${this.log}：${sign.message} 第${this.ckNum}个`
          );
          await this.bbsSign(this.isSr);
          //return false
        } else {
          logger.info(
            `[原神签到失败]${this.log}：${sign.message} 第${this.ckNum}个`
          );
          return false;
        }
        //await this.bbsSign()
      }

      logger.info(`[原神签到失败]${this.log}：${sign.message} 第${this.ckNum}个`)
      return false
    }

    if (sign.retcode === 0 && (sign?.data.success === 0 || sign?.message === 'OK')) {
      logger.info(`[原神签到成功]${this.log} 第${this.ckNum}个`)
      return true
    }

    logger.info(`[原神签到失败]${this.log}：${sign.message} 第${this.ckNum}个`)
    return false
  }

  async signTask(manual) {
    if (this.cfg.isAutoSign != 1 && !manual) return

    if (signing && manual) {
      await this.e.reply('原神签到任务进行中，完成前请勿重复执行')
      return false
    }

    this.isTask = true

    let cks = (await gsCfg.getBingCk()).ck
    let uids = lodash.filter(cks, (o) => {
      return o.autoSign !== false
    })
    uids = lodash.map(uids, 'uid')

    if (uids.length <= 0) {
      if (manual) await this.e.reply('暂无ck需要签到')
      return
    }

    signing = true

    let tips = ['开始原神签到任务']

    let { noSignNum } = await this.getsignNum(uids)
    let time = noSignNum * 6.1 + noSignNum * 0.2 + uids.length * 0.02 + 5
    let finishTime = moment().add(time, 's').format('MM-DD HH:mm:ss')

    tips.push(`\n签到ck：${uids.length}个`)
    if (uids.length != noSignNum) tips.push(`\n未签ck：${noSignNum}个`)
    tips.push(`\n预计需要：${this.countTime(time)}`)

    if (time > 120) {
      tips.push(`\n完成时间：${finishTime}`)
    }

    logger.info(`签到ck:${uids.length}个，预计需要${this.countTime(time)} ${finishTime} 完成`)

    if (manual) {
      await this.e.reply(tips)
      if (this.e.msg.includes('force')) this.force = true
    } else {
      await common.relpyPrivate(cfg.masterQQ[0], tips)
      await common.sleep(lodash.random(1, 20) * 1000)
    }

    let sucNum = 0
    let finshNum = 0
    let failNum = 0
    let invalidNum = 0
    let verifyNum = 0
    let contiNum = 0
    let failSignCount = 5

    for (let i in uids) {
      this.ckNum = Number(i) + 1
      let uid = uids[i]
      let ck = cks[uid]
      if (!ck || !ck.qq) continue
      if (ck.autoSign === false) continue

      this.e.user_id = ck.qq

      let ret = await this.doSign(ck, false)
      if (ret.retcode === 0) {
        if (ret.is_sign) {
          finshNum++
        } else {
          sucNum++
        }
      } else {
        if (this.is_verify) {
          verifyNum++
          contiNum++
        } else {
          contiNum = 0
        }
        if (ret.is_invalid) {
          invalidNum++
        } else {
          failNum++
        }
      }

      if (this.cfg.failSignCountCfg > 0) {
        failSignCount = this.cfg.failSignCountCfg
        if (contiNum >= failSignCount) {
          break
        }
      }

      if (this.signApi) {
        await common.sleep(6.1 * 1000)
        this.signApi = false
      }
    }

    let msg = `原神签到任务完成：${uids.length}个\n已签：${finshNum}个\n成功：${sucNum}个\n失败：${failNum}个`
    if (invalidNum > 0) {
      msg += `\n失效：${invalidNum}个`
    }

    if (this.cfg.failSignCountCfg > 0) {
      if (contiNum >= failSignCount) {
        msg += '\n\n签到失败次数过多，已停止自动签到任务'
      }
    }

    if (manual) {
      this.e.reply(msg)
    } else {
      common.relpyPrivate(cfg.masterQQ[0], msg)
    }

    signing = false
  }

  async setCache(day) {
    let end = Number(moment().endOf('day').format('X')) - Number(moment().format('X'))
    redis.setEx(this.key, end, String(day))
  }

  async getsignNum(uids) {
    let signNum = (await redis.KEYS(`${this.prefix}isSign*`)).length

    let noSignNum = uids.length - signNum

    noSignNum = noSignNum > 0 ? noSignNum : 0

    return { noSignNum, signNum }
  }

  countTime(time) {
    let hour = Math.floor((time / 3600) % 24)
    let min = Math.floor((time / 60) % 60)
    let sec = Math.floor(time % 60)
    let msg = ''
    if (hour > 0) msg += `${hour}小时`
    if (min > 0) msg += `${min}分钟`
    if (sec > 0) msg += `${sec}秒`
    return msg
  }

  async signClose() {
    let model = '开启'
    if (/关闭|取消/.test(this.e.msg)) {
      model = '关闭'
    }

    /** 获取个人ck */
    let ck = await gsCfg.getBingCkSingle(this.e.user_id)

    if (lodash.isEmpty(ck)) {
      await this.e.reply(`${model}签到失败，请先#绑定cookie\n发送【cookie帮助】查看配置教程`, false, { at: true })
      return false
    }

    let autoCk = {}
    for (let i in ck) {
      if (!ck[i].isMain) continue
      autoCk = ck[i]
      if (model == '开启') {
        ck[i].autoSign = true
      } else {
        ck[i].autoSign = false
      }
    }

    if (lodash.isEmpty(autoCk)) return

    gsCfg.saveBingCk(this.e.user_id, ck)

    let msg = `uid:${autoCk.uid}，原神自动签到已${model}`
    if (model == '开启') {
      msg += '\n每天将为你自动签到~'
    }
    await this.e.reply(msg)
  }
  /** 手动过验证 */
  async crack_geetest(gt, challenge) {
    let url = `http://url.charlotte.ac.cn`
    let gethtml = await fetch(url, {
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
      },
      body: `inturl=https%3A%2F%2Fapi.charlotte.ac.cn/manual_geetest?gt=${gt}%26challenge=${challenge}&outurl=&operat=inturl`,
      method: 'post'
    })
    let text = await gethtml.text();
    let match = text.match(/<input type="text" value="+\S+" disabled="disabled">/g)
    let shorturl = match.toString().replace(/<input type="text" value="|" disabled="disabled">/g, "")
    let tohttps = shorturl.replace(/http/g, "https")
    await this.e.reply(`请尽快完成验证：${tohttps}`, false, {
      at: true
    })
    let res;
    for (let n = 1; n < 60; n++) {
      await common.sleep(5000)
      try {
        res = await fetch(`https://api.charlotte.ac.cn/callback?challenge=${challenge}`)
        res = await res.json()
        if (res.data) {
          return res
        }
      } catch (err) {
        logger.error(`验证码签到 错误：${logger.red(err)}`)
      }
    }
    await this.e.reply("验证超时", false, {
      at: true
    })
    return false
  }
}

exports.MysSign = MysSign
