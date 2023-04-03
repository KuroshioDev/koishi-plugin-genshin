const { Runtime } = require( './runtime.js')
const { segment, Logger } = require( 'koishi')
let stateArr = {}

class plugin {
  /**
   * @param name 插件名称
   * @param dsc 插件描述
   * @param event 执行事件，默认message
   * @param priority 优先级，数字越小优先级越高
   * @param rule.reg 命令正则
   * @param rule.fnc 命令执行方法
   * @param rule.event 执行事件，默认message
   * @param rule.log  false时不显示执行日志
   * @param rule.permission 权限 master,owner,admin,all
   * @param task.name 定时任务名称
   * @param task.cron 定时任务cron表达式
   * @param task.fnc 定时任务方法名
   * @param task.log  false时不显示执行日志
   */
  constructor (data) {
    /** 插件名称 */
    this.name = data.name
    /** 插件描述 */
    this.dsc = data.dsc
    /** 监听事件，默认message https://oicqjs.github.io/oicq/#events */
    this.event = data.event || 'message'
    /** 优先级 */
    this.priority = data.priority || 5000
    /** 定时任务，可以是数组 */
    this.task = {
      /** 任务名 */
      name: '',
      /** 任务方法名 */
      fnc: data.task?.fnc || '',
      /** 任务cron表达式 */
      cron: data.task?.cron || ''
    }

    /** 命令规则 */
    this.rule = data.rule || [],
    /** 上下文 */
    this.ctx = data.ctx
    /** session  */
    this.session = data.session
    this.e = this.createEvent()
    this.e.config = data.config
    this.logger = new Logger(this.name ? this.name : "plugin")
  }

  createEvent() {
    let session = {
      session: this.session,
      context: this.ctx,
      post_type: this.session.type,
      message_id: this.session.messageId,
      user_id: this.session.user.id || this.session.userId,
      sub_type: this.session.subtype,
      sender: {
        user_id: this.session.author.userId,
        nickname: this.session.author.username,
        card: this.session.author.username,
        // guild_id: message.msg.guild_id
      },
      isPrivate: this.session.subtype == 'private' ? true : false,
      isGroup: this.session.subtype == 'group' ? true : false,
      group_id: this.session.channelId,
      group_name: this.session.selfId,
      ...this
    }
    this.createMsg(this.session, session)
    session.reply = this.reply
    session.dealMessage = this.dealMessage
    session.logFnc = this.logFnc()
    Runtime.init(session)
    return session;
  }

  createMsg(session, newSeesion){
    session.elements.forEach(e => {
      switch (e.type) {
        case 'text':
          newSeesion.msg = e.attrs.content.trim()
          newSeesion.message = e.attrs.content.trim()
          newSeesion.original_msg = e.attrs.content.trim()
        case 'at':
          if (session.selfId == e.attrs.id){
            newSeesion.atBot = true
          }
      }
    })
  }
  /**
 * @param msg 发送的消息
 * @param quote 是否引用回复
 * @param data.recallMsg 群聊是否撤回消息，0-120秒，0不撤回
 * @param data.at 是否at用户
 */
  reply (msg = '', quote = false, data = {}) {
    if (!this.reply || !msg) return false
    if(Array.isArray(msg)) {
      msg.forEach(m => this.dealMessage(m))
    }else {
      return this.dealMessage(msg)
    }
  }

  dealMessage(msg) {
    switch (msg.type) {
      case "image":
        if(msg.file instanceof Object) {
          return this.session.send(segment.image(msg.file, "image/png"))
        }else {
          return this.session.send(segment.image(msg.file, "image/png"))
        }
      case "video":
          return this.session.send(segment.video(msg.file))
      case "at":
        return
      default:
        if(msg && (msg.startsWith('file:///') || msg.startsWith('base64://'))) return this.session.send(segment.image(msg, "image/png"))
        return this.session.send(msg)
    }
  }

  logFnc(){
    return `[${this.name}]`
  }

  info(text) {
    this.logger.info(text)
  }

  error(text) {
    this.logger.error(text)
  }

  /**
   * @param type 执行方法
   * @param isGroup 是否群聊
   * @param time 操作时间，默认120秒
   */
  setContext (type, isGroup = false, time = 120) {
  }

  getContext () {
  }
  /**
   * @param type 执行方法
   * @param isGroup 是否群聊
   */
  finish (type, isGroup = false) {
  }
}

module.exports = plugin
