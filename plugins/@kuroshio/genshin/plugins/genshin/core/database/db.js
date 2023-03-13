module.exports =  function initDB(ctx){
  ctx.model.extend('genshin_user_cookie', {
    // 各字段类型
    id: 'unsigned',
    uid: 'string',
    qq: 'string',
    ck: 'string',
    device_id: 'string',
    ltuid: 'string',
    login_ticket: 'string',
    isMain: "boolean",
    user_id: "string",
    create_time: "timestamp",
    update_time: "timestamp"
  }, {
    // 使用自增的主键值
    autoInc: true,
  })

  ctx.model.extend('genshin_user_ledger', {
    // 各字段类型
    id: 'unsigned',
    uid: 'string',
    data: 'json',
    user_id: "string",
    create_time: "timestamp",
    update_time: "timestamp"
  }, {
    // 使用自增的主键值
    autoInc: true,
  })

  ctx.model.extend('genshin_user_paylog', {
    // 各字段类型
    id: 'unsigned',
    uid: 'string',
    data: 'json',
    user_id: "string",
    create_time: "timestamp",
    update_time: "timestamp"
  }, {
    // 使用自增的主键值
    autoInc: true,
  })

  ctx.model.extend('genshin_user_gachalog', {
    // 各字段类型
    id: 'unsigned',
    uid: 'string',
    data: 'json',
    user_id: "string",
    type: "integer",
    create_time: "timestamp",
    update_time: "timestamp"
  }, {
    // 使用自增的主键值
    autoInc: true,
  })
}
