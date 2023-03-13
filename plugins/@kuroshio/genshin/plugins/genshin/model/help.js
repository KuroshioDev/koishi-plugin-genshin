const { base } = require( './base.js')
const gsCfg = require( './gsCfg.js')
const cfg = require( '../../lib/config/config')

class Help extends base {
  constructor (e) {
    super(e)
    this.model = 'help'
  }

  static async get (e) {
    let html = new Help(e)
    return await html.getData()
  }

  async getData () {
    let helpData = gsCfg.getdefSet('bot', 'help')

    return {
      ...this.screenData,
      saveId: 'help',
      version: cfg.package.version,
      helpData
    }
  }
}

exports.Help = Help
