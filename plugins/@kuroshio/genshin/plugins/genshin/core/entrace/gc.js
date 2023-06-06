class GachaApp {
  constructor(app, ctx, config) {
    ctx.command('genshin.genshin.gacha', {hidden: true, authority: 1}).userFields(['id'])
      .shortcut(/(^#*定轨|^#定轨(.*))$/)
      .action(async (_, uid) => {
        new app.gacha(ctx, _.session).weaponBing()
      })

  }
}

module.exports = GachaApp
