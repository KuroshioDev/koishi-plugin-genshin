const { Context, Schema } = require( 'koishi')
const {init} = require( '../index.js')
const initDB = require( './database/db.js')
const RoleApp = require( "./entrace/role.js")
const UserApp = require( "./entrace/user.js")
const todayMaterialApp = require( "./entrace/todayMaterial.js")
const strategyApp = require( "./entrace/strategy.js")
const dailyNoteApp = require( "./entrace/dailyNote.js")
const PayLogApp = require( "./entrace/payLog.js")
const MysNewsApp = require( "./entrace/mysNews.js")
const LedgerApp = require( "./entrace/ledger.js")
const materialApp = require( './entrace/material.js')
const gcLogApp = require( './entrace/gcLog.js')
const exchangeApp = require( './entrace/exchange.js')
const calculatorApp = require( './entrace/calculator.js')
const { Logger } = require( 'koishi')
const YAML = require("yaml");
const fs = require("fs");
const common = require("../../lib/common/common");

const logger = new Logger("Kuroshio-Genshin-Plugin")

class GenshinPlugin {

  constructor(ctx, config) {
    // ready
    ctx.on("ready", async ()=>{
      let locale = YAML.parse(
        fs.readFileSync(`${common.getPluginsPath()}/genshin/core/locales/zh.yml`, 'utf8')
      )
      ctx.i18n.define('zh', locale)
      initDB(ctx)
      logger.info("初始化数据库: genshin-plugin")
      this.apps = await init()
      new RoleApp(this.apps, ctx, config)
      new UserApp(this.apps, ctx, config)
      new todayMaterialApp(this.apps, ctx, config)
      new strategyApp(this.apps, ctx, config)
      new dailyNoteApp(this.apps, ctx, config)
      new PayLogApp(this.apps, ctx, config)
      new MysNewsApp(this.apps, ctx, config)
      new LedgerApp(this.apps, ctx, config)
      new materialApp(this.apps, ctx, config)
      new gcLogApp(this.apps, ctx, config)
      new exchangeApp(this.apps, ctx, config)
      new calculatorApp(this.apps, ctx, config)
    })
  }
}

const Config= Schema.object({
  strategyMod1: Schema.number().default(1)
})

exports.name = 'genshin-plugin'
exports.default = GenshinPlugin
exports.config = Config
