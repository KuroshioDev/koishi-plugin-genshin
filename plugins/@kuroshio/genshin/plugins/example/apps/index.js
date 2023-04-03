const {Logger} = require("koishi")
const common = require("../../lib/common/common")
const fs = require( 'node:fs')
const files = fs.readdirSync(`${common.getPluginsPath()}/example/apps`).filter(file => file.endsWith('.js') && !file.startsWith('index'))
const logger = new Logger('kuroshio')
async function init() {
  let ret = []
  let rules = {}
  files.forEach((file) => {
    ret.push(import(`./${file}`))
  })
  ret = await Promise.allSettled(ret)
  let apps = {}
  for (let i in files) {
    let name = files[i].replace('.js', '')
    if (ret[i].status != 'fulfilled') {
      logger.error(ret[i])
      continue
    }
    apps[name] = ret[i].value.default.app
    rules[name] = ret[i].value.default.rule
  }
  apps.rule = rules
  return apps
}

module.exports = init
