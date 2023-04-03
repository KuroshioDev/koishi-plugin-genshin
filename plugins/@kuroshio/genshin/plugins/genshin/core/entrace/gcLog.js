class gcLogApp {
  constructor(app, ctx, config) {
    ctx.command('genshin.profile.url', {hidden: true, authority: 1}).userFields(['id'])
      .shortcut(/(.*)authkey=(.*)/)
      .action(async ({session}) => {
        new app.gcLog(ctx, session).logUrl()
      })

    // ctx.guild().command('genshin.profile.gclog', {authority: 1})
    // .shortcut(/#*(抽卡|抽奖|角色|武器|常驻|up)池*(记录|祈愿|分析)$/).userFields(['id'])
    // .action(async ({session}) => {
    //   new app.gcLog(ctx, session).getLog()
    // })

    ctx.command('genshin.help.gcloghelp', {authority: 1})
    .shortcut(/^#*(记录帮助|抽卡记录帮助)$/)
    .action(async ({session}) => {
      new app.gcLog(ctx, session).help()
    })

    // ctx.command('gcLogApp.helpPort')
    // .shortcut(/#*(安卓|苹果|电脑|pc|ios)帮助$/)
    // .action(async ({session}) => {
    //   new app.gcLog(ctx, session).helpPort()
    // })

    // ctx.guild().command('genshin.profile.gachacount', {authority: 1}).userFields(['id'])
    // .shortcut(/#*(抽卡|抽奖|角色|武器|常驻|up)池*统计$/)
    // .action(async ({session}) => {
    //   new app.gcLog(ctx, session).logCount()
    // })
  }
}

module.exports = gcLogApp
