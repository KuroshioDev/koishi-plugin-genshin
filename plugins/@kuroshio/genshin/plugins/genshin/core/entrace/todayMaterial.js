class todayMaterialApp {
  constructor(app, ctx, config) {
    ctx.guild().command('genshin.profile.today', {authority: 1}).userFields(['id'])
      .shortcut(/^#(今日|今天|每日|我的)*(素材|材料|天赋)[ |0-9]*$/, { args: ['$1'] })
      .action(async ({session}) => {
        new app.todayMaterial(ctx, session).today()
      })
  }
}

module.exports = todayMaterialApp
