
const { pipeline } = require( 'stream')
const { promisify } = require( 'util')
const fetch = require( 'node-fetch')
const fs = require( 'node:fs')
const path = require( 'node:path')
const { Logger } = require( 'koishi')

const logger = new Logger("genshin-lib-common")
const _path = process.cwd().replace(/\\/g, '/')

function getProjectName(){
  return "@kuroshio/genshin"
}
/**
 * 获取根目录
 * @returns {string}
 */
function getRootPath(){
  return `${_path}/plugins/@kuroshio/genshin`
}

/**
 * 获取代码目录
 * @returns {string}
 */
function getSourcePath(){
  return `${_path}/plugins/@kuroshio/genshin/src`
}
/**
 * 获取资源路径
 * @returns {string}
 */
function getResourcePath() {
  return `${_path}/plugins/@kuroshio/genshin/resources`
}

/**
 * 获取数据路径
 * @returns {string}
 */
function getDataPath(){
  return `${_path}/plugins/@kuroshio/genshin/data`
}

/**
 * 获取配置路径
 * @returns {string}
 */
function getConfigPath() {
  return `${_path}/plugins/@kuroshio/genshin/config`
}

/**
 * 获取插件路径
 * @returns {string}
 */
function getPluginsPath() {
  return `${_path}/plugins/@kuroshio/genshin/plugins`
}
/**
 * 发送私聊消息，仅给好友发送
 * @param user_id qq号
 * @param msg 消息
 */
async function relpyPrivate (userId, msg) {
  userId = Number(userId)

  let friend = Bot.fl.get(userId)
  if (friend) {
    logger.info(`发送好友消息[${friend.nickname}](${userId})`)
    return await Bot.pickUser(userId).sendMsg(msg).catch((err) => {
      logger.error(err)
    })
  }
}

/**
 * 休眠函数
 * @param ms 毫秒
 */
function sleep (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 下载保存文件
 * @param fileUrl 下载地址
 * @param savePath 保存路径
 */
async function downFile (fileUrl, savePath,param = {}) {
  try {
    mkdirs(path.dirname(savePath))
    logger.debug(`[下载文件] ${fileUrl}`)
    const response = await fetch(fileUrl,param)
    const streamPipeline = promisify(pipeline)
    await streamPipeline(response.body, fs.createWriteStream(savePath))
    return true
  } catch (err) {
    logger.error(`下载文件错误：${err}`)
    return false
  }
}

function mkdirs (dirname) {
  if (fs.existsSync(dirname)) {
    return true
  } else {
    if (mkdirs(path.dirname(dirname))) {
      fs.mkdirSync(dirname)
      return true
    }
  }
}

/**
 * 制作转发消息
 * @param e oicq消息e
 * @param msg 消息数组
 * @param dec 转发描述
 */
async function makeForwardMsg (e, msg = [], dec = '') {
  let nickname = Bot.nickname
  if (e.isGroup) {
    let info = await Bot.getGroupMemberInfo(e.group_id, Bot.uin)
    nickname = info.card || info.nickname
  }
  let userInfo = {
    user_id: Bot.uin,
    nickname
  }

  let forwardMsg = []
  msg.forEach(v => {
    forwardMsg.push({
      ...userInfo,
      message: v
    })
  })

  /** 制作转发内容 */
  if (e.isGroup) {
    forwardMsg = await e.group.makeForwardMsg(forwardMsg)
  } else if (e.friend) {
    forwardMsg = await e.friend.makeForwardMsg(forwardMsg)
  } else {
    return false
  }

  if (dec) {
    /** 处理描述 */
    forwardMsg.data = forwardMsg.data
      .replace(/\n/g, '')
      .replace(/<title color="#777777" size="26">(.+?)<\/title>/g, '___')
      .replace(/___+/, `<title color="#777777" size="26">${dec}</title>`)
  }

  return forwardMsg
}

module.exports = { sleep, relpyPrivate, downFile, makeForwardMsg, getRootPath, getConfigPath, getDataPath, getResourcePath, getPluginsPath, getProjectName, getSourcePath}
