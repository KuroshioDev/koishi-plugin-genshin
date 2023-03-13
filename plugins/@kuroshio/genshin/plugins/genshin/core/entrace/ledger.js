class LedgerApp {
  constructor(app, ctx, config) {
    ctx.guild().command('genshin.profile.ledger [month:integer]', {authority: 1}).userFields(['id'])
    .shortcut(/^(#原石|#*札记)([0-9]|[一二两三四五六七八九十]+)*月*$/)
      .action(async (_, uid) => {
        new app.ledger(ctx, _.session).ledger()
      })


    ctx.guild().command('genshin.profile.ledgercount', {authority: 1}).userFields(['id'])
    .shortcut(/^#*(原石|札记)统计$/)
      .action(async (_, uid) => {
        new app.ledger(ctx, _.session).ledgerCount()
      })

  }
}

module.exports = LedgerApp
