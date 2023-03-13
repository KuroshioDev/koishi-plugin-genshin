class RoleApp {
  constructor(app, ctx, config) {
    ctx.guild().command('genshin.profile.role [uid:string]', {authority: 1}).userFields(['id'])
      .alias('#角色查询')
      .shortcut(/^#(角色|查询|查询角色|角色查询|人物)[ |0-9]*$/)
      .shortcut( /^(#*uid|#*UID)[\s*][1|2|5-9][0-9]{8}$/)
      .action(async (_, uid) => {
        new app.role(ctx, _.session).roleIndex()
      })

    ctx.guild().command('genshin.profile.rolecard', {authority: 1}).userFields(['id'])
      .alias('#角色卡片')
      .action(async ({session}) => {
        new app.role(ctx, session).roleCard()
      })

    ctx.guild().command('genshin.profile.abyss', {authority: 1}).userFields(['id'])
      .alias('#深渊')
      .shortcut(/^#[上期|往期|本期]*(深渊|深境|深境螺旋)[上期|往期|本期]*[ |0-9]*$/)
      .action(async ({session}) => {
        new app.role(ctx, session).abyss()})

    ctx.guild().command('genshin.profile.abyssfloor', {authority: 1}).userFields(['id'])
      .shortcut(/^#*[上期|往期|本期]*(深渊|深境|深境螺旋)[上期|往期|本期]*[第]*(9|10|11|12|九|十|十一|十二)层[ |0-9]*$/)
      .action(async ({session}) => {
        new app.role(ctx, session).abyssFloor()
      })

    ctx.guild().command('genshin.profile.weapon', {authority: 1}).userFields(['id'])
      .shortcut(/#[五星|四星|5星|4星]*武器[ |0-9]*$/)
      .action(async ({session}) => {
        new app.role(ctx, session).weapon()
      })

    ctx.guild().command('genshin.profile.rolebag', {authority: 1}).userFields(['id'])
      .shortcut(/^#(五星|四星|5星|4星|命座|角色|武器)[命座|角色]*[信息|阵容]*[ |0-9]*$/)
      .action(async ({session}) => {
        new app.role(ctx, session).roleBag()
      })

    ctx.guild().command('genshin.profile.rolelist', {authority: 1}).userFields(['id'])
      .shortcut(/^#*(我的)*(技能|天赋|武器|角色|练度|五|四|5|4|星)+(汇总|统计|列表)(force|五|四|5|4|星)*[ |0-9]*$/)
      .action(async ({session}) => {
        new app.role(ctx, session).roleList()
      })

    ctx.guild().command('genshin.profile.explore', {authority: 1}).userFields(['id'])
      .shortcut(/^#(角色2|宝箱|成就|尘歌壶|家园|探索|探险|声望|探险度|探索度)[ |0-9]*$/)
      .action(async ({session}) => {
        new app.role(ctx, session).roleExplore()
      })
  }
}

module.exports = RoleApp
