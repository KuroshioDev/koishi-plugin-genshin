class strategyApp {
  constructor(app, ctx, config) {
    ctx.guild().command('genshin.wiki.strategy', {authority: 1}).userFields(['id'])
      .shortcut(/^#\S+攻略$/)
      .shortcut(/^#\S+攻略(?:[1-4])$/)
      .action(async ({session}) => {
        new app.strategy(ctx, session).strategy()
      })

    ctx.command('genshin.help.strategy', {authority: 1}).userFields(['id'])
      .shortcut(/^#?攻略(?:说明|帮助)$/)
      .action(async ({session}) => {
        new app.strategy(ctx, session).strategy_help()
      })
  }
}

module.exports = strategyApp
