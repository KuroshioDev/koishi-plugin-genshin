class exchangeApp {
  constructor(app, ctx, config) {
    // TODO error
    ctx.guild().command('genshin.wiki.getcode', { authority: 1 })
      .alias('#前瞻兑换码')
      .shortcut(/#*(直播|前瞻)*兑换码$/)
      .action(async ({session}) => {
        new app.exchange(ctx, session).getCode()
      })
  }
}

module.exports = exchangeApp
