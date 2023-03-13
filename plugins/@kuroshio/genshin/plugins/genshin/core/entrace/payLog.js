class PayLogApp {
  constructor(app, ctx, config) {
    // TODO Find authkey
    ctx.guild().command('genshin.profile.payrecord', {authority: 1}).userFields(['id'])
    .shortcut(/^#(充值|消费)(记录|统计)$/)
      .action(async (_, uid) => {
        new app.payLog(ctx, _.session).payLog()
      })

    // ctx.guild().command('genshin.profile.payupdate', {authority: 1}).userFields(['id'])
    // .shortcut(/#?(更新|获取|更新)(充值|消费)(记录|统计)/)
    //   .action(async (_, uid) => {
    //     new app.payLog(ctx, _.session).updatePayLog()
    //   })

    ctx.command('genshin.profile.payurl', {hidden: true, authority: 1}).userFields(['id'])
    .shortcut(/(.*)(bill-record-user|customer-claim|player-log|user.mihoyo.com)(.*)/)
      .action(async (_, uid) => {
        new app.payLog(ctx, _.session).getAuthKey()
      })
      //
      // ctx.command('genshin.help.payhelp', {authority: 1}).userFields(['id'])
      // .shortcut(/#?(充值|消费)(记录|统计)帮助/)
      //   .action(async (_, uid) => {
      //     new app.payLog(ctx, _.session).payLogHelp()
      //   })
  }
}

module.exports = PayLogApp
