class dailyNoteApp {
  constructor(app, ctx, config) {
    // ctx.guild().command('genshin.profile.note', { authority: 1 }).userFields(['id'])
    //   .shortcut(/^#*(体力|树脂|查询体力)$/)
    //   .action(async ({session}) => {
    //     new app.dailyNote(ctx, session).note()
    //   })
    ctx.guild().command('genshin.user.sign', { authority: 1 }).userFields(['id'])
      .alias('#签到')
      .action(async ({session}) => {
        new app.dailyNote(ctx, session).sign()
      })
  }
}

module.exports = dailyNoteApp
