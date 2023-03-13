class MysNewsApp {
  constructor(app, ctx, config) {
    ctx.guild().command('genshin.wiki.announce [num:int]', {authority: 1}).userFields(['id'])
     .alias('#原神官方新闻')
    .shortcut(/^(#*官方(公告|资讯|活动)|#*原神(公告|资讯|活动)|#公告|#资讯|#活动)[0-9]*$/)
      .action(async (_, uid) => {
        new app.mysNews(ctx, _.session).news()
    })

    ctx.guild().command('genshin.mys.search [content:string]', {authority: 3}).userFields(['id'])
    .shortcut(/^(#米游社|#mys)(.*)/)
      .action(async (_, uid) => {
        new app.mysNews(ctx, _.session).mysSearch()
    })

    ctx.guild().command('genshin.wiki.budget', {authority: 1}).userFields(['id'])
    .alias('#原石预估')
    .shortcut(/#*原(石|神)(预估|盘点)$/)
      .action(async (_, uid) => {
        new app.mysNews(ctx, _.session).ysEstimate()
    })

    ctx.guild().command('genshin.mys.url', {hidden: true, authority: 3}).userFields(['id'])
    .shortcut(new RegExp('(.*)(bbs.mihoyo.com|miyoushe.com)/ys(.*)/article(.*)'))
      .action(async (_, uid) => {
        new app.mysNews(ctx, _.session).mysUrl()
    })
  }
}

module.exports = MysNewsApp
