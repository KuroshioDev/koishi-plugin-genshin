const { segment } = require("oicq")
const fetch = require("node-fetch")
const plugin = require('../../lib/plugins/plugin')
//项目路径
const _path = process.cwd();

let siliao = true  //是否允许私聊使用，设为false则禁止私聊（主任除外）
let urls = []




class keai extends plugin {
  constructor (ctx,session) {
    super({
      /** 功能名称 */
      name: '可爱一下',
      /** 功能描述 */
      dsc: '可爱一下',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 5000,
      rule: [
        {
           reg: "^#*可爱一下(.*)$", //匹配消息正则，命令正则
          fnc: 'keaiyixia'
        }
      ],
      ctx:ctx,
      session:session
    })
  }
async  keaiyixia(e) {
  if (urls.length == 0) {
       await this.downimgs()
  }
  e.reply(segment.image(urls.pop()));
  return true;//返回true 阻挡消息不再往下
}

async downimgs() {
  await fetch("https://iw233.cn/api.php?type=json&num=20&sort=random", {
    headers: { 'content-type': 'application/json'},
    method: 'GET',
    mode: 'cors',
  }).then(response => response.json()).then(data => {
    if (data.pic.length == 20) {
      urls = data.pic
    }

  })
  console.log('访问成功了')
}
}

exports.app = keai
exports.rule = [
  {
    reg: '^#*可爱一下(.*)$',
    fnc: "keaiyixia"
  }
]