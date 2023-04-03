class strategyApp {
  constructor(app, ctx, config) {
    ctx.guild().command('genshin.wiki.strategy', {authority: 1}).userFields(['id'])
      .shortcut(/^(?!#米游社)#?((更新)?)\S+攻略([1-7])?$/)
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
