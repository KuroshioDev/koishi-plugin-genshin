class calculatorApp {
  constructor(app, ctx, config) {

    ctx.guild().command('genshin.profile.blueprint <id:posint>', { authority: 1 }).userFields(['id'])
      .shortcut(/#尘歌壶(模数|养成|养成计算)(\d{10,15})$/)
      .action(async ({session}, id) => {
        new app.calculator(ctx, session).Blueprint()
      })

      ctx.command('genshin.help.blueprinthelp', { authority: 1 }).userFields(['id'])
      .shortcut(/#尘歌壶(养成|计算|养成计算)帮助$/)
      .action(async ({session}) => {
        new app.calculator(ctx, session).blueprintHelp()
      })

    ctx.guild().command('genshin.profile.calculator [id:posint]', { authority: 1 }).userFields(['id'])
      .shortcut(/#*(.*)(养成|计算)([0-9]|,|，| )*$/)
      .action(async ({session}) => {
        new app.calculator(ctx, session).Calculator()
      })

    ctx.guild().command('genshin.help.calculatorhelp', { authority: 1 })
      .shortcut(/#角色(养成|计算|养成计算)帮助$/)
      .action(async ({session}) => {
        new app.calculator(ctx, session).calculatorHelp()
      })
  }
}

module.exports = calculatorApp
