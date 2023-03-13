class materialApp {
  constructor(app, ctx, config) {
    ctx.guild().command('genshin.wiki.material', {authority: 1}).userFields(['id'])
      .shortcut(/#*(.*)(突破|材料|素材)$/)
      .action(async ({session}) => {
        new app.material(ctx, session).material()
      })
  }
}

module.exports = materialApp
