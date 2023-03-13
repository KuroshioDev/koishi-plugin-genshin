class test  {
  async sendLog (e) {
    e.reply("example test ok")
    return true
  }
}

exports.app = test
exports.rule = [
  {
    reg: '#日志',
    fnc: "sendLog"
  }
]
