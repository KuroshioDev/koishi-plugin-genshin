class UserApp {
  constructor(app, ctx, config) {
    // middleware
    // ctx.middleware(async (session, next) => {
    //   if (/(ltoken|ltoken_v2)/.test(session.content) && /(ltuid|login_uid|ltmid_v2)/.test(session.content)) {
    //     let myapp = new app.user(ctx, session)
    //     myapp.e.ck = session.content
    //     await myapp.bingCk();
    //     return
    //   } else {
    //     // 如果去掉这一行，那么不满足上述条件的消息就不会进入下一个中间件了
    //     return next()
    //   }
    // })

    ctx.command('genshin.user.login_ticket', {hidden: true, authority: 1}).userFields(['id'])
      .shortcut(/^(.*)ltoken=(.*)$/)
      .action(async ({session}) => {
        let myapp = new app.user(ctx, session)
        myapp.e.ck = session.content
        await myapp.bingCk();
        return
      })

    ctx.command('genshin.help.ck', {authority: 1}).userFields(['id'])
      .alias('#ck帮助')
      .alias('#cookie帮助')
      .alias("#体力帮助")
      .action(({session}) => {
        new app.user(ctx, session).ckHelp()
      })

    ctx.command('genshin.user.myck', {authority: 1}).userFields(['id'])
      .alias('#我的ck')
      .alias('#ck')
      .alias('#cookie')
      .alias('#我的cookie')
      .action(({session}) => {
        if(session.subtype != 'private') return '请私聊发送'
        new app.user(ctx, session).myCk()
      })

    ctx.command('genshin.user.chekcck', {authority: 1}).userFields(['id'])
      .shortcut(/^#(检查|我的)?ck状态*$/)
      .action(({session}) => {
        new app.user(ctx, session).checkCkStatus()
      })

    ctx.command('genshin.user.delck', {authority: 1}).userFields(['id'])
      .alias('#删除ck')
      .alias('#删除cookie')
      .action(async ({session}) => {
        new app.user(ctx, session).delCk()
      })

    ctx.command('genshin.user.myuid', {authority: 1}).userFields(['id'])
      .alias('#我的uid')
      .shortcut(/^#(我的)?(uid|UID)[0-9]{0,2}$/, { args: ['$1'] })
      .action(({session}) => {
        new app.user(ctx, session).showUid()
      })

    ctx.command('genshin.user.binguid', {authority: 1}).userFields(['id'])
      .alias('#绑定uid')
      .action(async ({session}) => {
        await session.send('请发送 uid')
        const uid = (await session.prompt()).toString()
        session.content = uid
        new app.user(ctx, session).saveUid()
      })
    ctx.command('genshin.user.binguid1', {authority: 1}).userFields(['id'])
      .shortcut(/^#绑定(uid|UID)?[1-9][0-9]{8}$/)
      .action(async ({session}) => {
        new app.user(ctx, session).saveUid()
      })
  }
}

module.exports = UserApp
