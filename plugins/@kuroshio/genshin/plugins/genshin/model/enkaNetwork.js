// import moment from 'moment'
// import lodash from 'lodash'
// import base from './base.js'
// import MysInfo from './mys/mysInfo.js'
// import gsCfg from './gsCfg.js'
// import { EnkaClient } from 'enka-network-api'
// const { puppeteer } = require( '../../lib/puppeteer.js'
// import fs from 'node:fs'
// const { common } = require('../../lib/common/common.js')

// if (!fs.existsSync('./data/enkaNetwork/')) {
//   fs.mkdirSync('./data/enkaNetwork/')
// }

// export default class EnkaNetWork extends base {
//   constructor (e) {
//     super(e)
//     this.model = 'enkaNetwork'
//     this.urlKey = `${this.prefix}url:`
//     this.uidKey = `Yz:genshin:enka:qq-uid:${this.userId}`
//     this.path = `./data/enkaNetwork/${this.e.user_id}/`
//     this.uid
//     this.cached = false
//   }
// /**
//  *
//  * @param updateData 用于更新json数据的标记
//  * @returns
//  */
//   async getRoleDetail(updateData = false){
//     let {uid, index} = await this.getParameter()
//     if(index > 7 || index < 0){
//       this.e.reply(`请别开玩笑！角色橱柜怎么可能会有第${index + 1}个角色`)
//       return {}
//     }
//     this.uid = uid
//     let user
//     if(!updateData){
//       user = await this.readJson()//读取本地json
//       if (typeof(user)==='undefined'){
//         //没有本地缓存的json
//         try {
//           user = await this.getEnkaUserData()
//         } catch (error) {
//           logger.error(error.message)
//           this.replyException(error)
//           return{}
//         }
//       }
//     }else{
//       try {
//         this.e.reply("更新角色面板中")
//         user = await this.getEnkaUserData()
//       } catch (error) {
//         logger.error(error.message)
//         this.replyException(error)
//         return{}
//       }
//     }
//     let {text, roleData} = await this.getRoleData(user,index);
//     if(!text&&!roleData){
//       return{}
//     }
//     let data ={
//       saveId: this.uid,
//       uid: this.uid,
//       name: this.e.sender.card.replace(this.uid, '').trim(),
//       user_id: this.e.user_id,
//       roleData,
//       updateTime: user.updateTime,
//       bg: lodash.random(1, 3),
//       ...this.screenData
//     }
//     let img = await puppeteer.screenshot('enkaNetwork', data)
//     return {text, img}
//   }

//   async getParameter(){
//     let uid = this.e.msg.substring(5, this.e.msg.length);
//     let index = 1;//默认取角色橱柜的第一个角色
//     if(typeof(uid) === 'undefined' || uid === ''){
//       uid = await MysInfo.getUid(this.e)//如果用户没绑uid或者ck，由该模块自己抛出未绑定uid的信息
//     }else {
//       //有携带参数
//       //判断取到的这个uid是否是正常uid还是指示要分析角色的序号数字
//       let regex = /([1-9]{1}\d{8}([1-9])?)|(\d)/ //参数只能用1个数字(指定查询第几个角色)9个数字(指定uid并查询第一个角色)10个数字(同时指定uid和第几个角色)
//       if(regex.test(uid)) {
//         if(uid.length == 1){
//           //使用该用户当前绑定的uid查询指定的第几个角色
//           index = parseInt(uid);
//           uid = await MysInfo.getUid(this.e)//取用户当前uid,如果用户没绑uid或者ck，由该模块自己抛出未绑定uid的信息
//         }else if(uid.length == 10){
//           //使用指定的uid查询第几个角色
//           index = parseInt(uid.substring(9,10))
//           uid = uid.substring(0,9)
//         }else{
//           this.e.reply("未输入角色序号，默认橱窗第一位！")
//         }
//         //上面的if都未命中则是uid
//       }else {
//         uid = await MysInfo.getUid(this.e)//非法参数，取用户当前uid,如果用户没绑uid或者ck，由该模块自己抛出未绑定uid的信息
//       }

//     }
//     index--
//     return {uid, index}
//   }
//   async getRoleData(user,index){
//     let text,roleData
//     let data = user.data
//     if(typeof(data.playerInfo) === 'undefined'){
//       text = '该uid不存在'
//     }else if (typeof(data.avatarInfoList) != 'undefined' && data.avatarInfoList.length > 0) {
//       if(data.avatarInfoList.length - 1 < index){
//         this.e.reply(`该uid的角色橱展示了${data.avatarInfoList.length}个角色，你输入的序号已超过当前展示数量`)
//         return{}
//       }
//       text = '目前已获取的角色卡有:'
//       for (const i in data.avatarInfoList) {
//         if (Object.hasOwnProperty.call(data.avatarInfoList, i)) {
//           const avatar = data.avatarInfoList[i];
//           let avatarName = gsCfg.roleIdToName(avatar.avatarId)
//           text += `[${parseInt(i)+1}${avatarName} ]`
//           if(index == i){
//             roleData = avatar
//             roleData.uid = this.uid
//             roleData.avatarName = avatarName
//             roleData.playerName = data.playerInfo.nickname
//             roleData.element = gsCfg.getElementByRoleName(avatarName)
//             roleData.talents = []
//             //处理角色各属性数据
//             roleData.showProp = this.handleProp(roleData)
//             //已激活的命座数量
//             if(typeof(roleData.talentIdList) === "undefined"){
//               roleData.talentSize = 0
//               roleData.talents = [{},{},{},{},{},{}]
//             }else{
//               roleData.talentSize = roleData.talentIdList.length
//               //处理命座
//               for (var j=0; j<6; j++) {
//                 if (j < roleData.talentSize) {
//                   const talentId = roleData.talentIdList[j];
//                   let talent = gsCfg.getRoleTalentByTalentId(talentId)
//                   await this.cacheIcon(talent.icon)
//                   roleData.talents.push(talent)
//                 }else{
//                   roleData.talents.push({})
//                 }
//               }
//             }
//             roleData.artifacts = []
//             for (const j in avatar.equipList) {
//               if (Object.hasOwnProperty.call(avatar.equipList, j)) {
//                 const equip = avatar.equipList[j];
//                 if(typeof(equip.weapon)!=='undefined'){
//                   //处理武器
//                   roleData.weaponData = await this.handleWeapon(equip)
//                 }else{
//                   //圣遗物
//                   roleData.artifacts.push(await this.handleArtifact(equip))
//                 }
//               }
//             }
//             //技能
//             let tmp ={}
//             for(const key in avatar.skillLevelMap){
//               let skillData = gsCfg.getSkillDataByskillId(key,avatarName)
//               await this.cacheIcon(skillData.icon)
//               let exLevel = 0
//               if(skillData.name.includes('普通攻击')){
//                 tmp.a = {skillId: key, level: avatar.skillLevelMap[key], exLvl: exLevel, ...skillData}
//               }else if(!tmp.e){
//                 if(typeof(avatar.proudSkillExtraLevelMap)!== 'undefined' && Object.keys(avatar.proudSkillExtraLevelMap).length>0){
//                   //命座加成的额外元素战技等级
//                   exLevel = 3
//                 }
//                 tmp.e = {skillId: key,level: avatar.skillLevelMap[key],exLvl: exLevel,...skillData}
//               }else if(!tmp.q){
//                 if(typeof(avatar.proudSkillExtraLevelMap)!== 'undefined' && Object.keys(avatar.proudSkillExtraLevelMap).length>0){
//                   //命座加成的额外元素爆发等级
//                   exLevel = 3
//                 }
//                 tmp.q = {skillId: key, level: avatar.skillLevelMap[key], exLvl: exLevel, ...skillData}
//               }
//             }
//             avatar.skillLevelMap = Object.assign(avatar.skillLevelMap,tmp)
//           }
//         }
//       }
//       for (const i in data.playerInfo.showAvatarInfoList) {
//         if (Object.hasOwnProperty.call(data.playerInfo.showAvatarInfoList, i)) {
//           const avatarInfo = data.playerInfo.showAvatarInfoList[i];
//           if(avatarInfo.avatarId === roleData.avatarId){
//             roleData.avatarLevel = avatarInfo.level
//             break
//           }
//         }
//       }
//     }else{
//       this.e.reply('该uid未开放角色详情')
//     }
//     return {text, roleData}
//   }
//   async getEnkaUserData(){
//     let client = new EnkaClient(4000)
//     let user = await client.fetchUser(parseInt(this.uid));
//     user.updateTime = this.dateFormat(new Date(),"yyyy-MM-dd HH:mm:ss")
//     this.writeJson(user)
//     return user
//   }
//   creatFile () {
//     if (!fs.existsSync(this.path)) {
//       fs.mkdirSync(this.path)
//     }
//     if (!this.uid) return
//     let file = `${this.path}${this.uid}/`
//     if (!fs.existsSync(file)) {
//       fs.mkdirSync(file)
//     }
//   }
//   writeJson (data) {
//     this.creatFile()

//     let file = `${this.path}${this.uid}/__data.json`

//     fs.writeFileSync(file, JSON.stringify(data, '', '\t'))
//   }
//   readJson () {
//     let enkaJson
//     let file = `${this.path}/${this.uid}/__data.json`
//     if (fs.existsSync(file)) {
//     // 获取本地数据 进行数据合并
//       enkaJson = JSON.parse(fs.readFileSync(file, 'utf8'))
//     }

//     return enkaJson
//   }
//   replyException(error){
//     let uidNotFoundRegex = /User with uid \d+ was not found./
//     let requestAbortedRegex = /The user aborted a request/
//     if(uidNotFoundRegex.test(error.message)){
//       this.e.reply(`找不到uid${this.uid}的任何信息`)
//     }else if(requestAbortedRegex.test(error.message)){
//       this.e.reply("请求过于频繁，请30分钟后再试")
//     }else{
//       this.e.reply(error.message)
//     }
//   }
//   async cacheIcon(name){
//     if(!fs.existsSync(`data/enkaNetwork/cache/icon/${name}.png`)){
//       //如果图标没有缓存先缓存到本地
//       if(!this.cached){
//         this.cached = true
//         this.e.reply('云崽正在缓存素材中，时间稍微有点长，请耐心等待')
//       }
//       let param = {
//         method: 'get',
//         headers: {
//           referer: `https://enka.network/u/${this.uid}`,
//           accept: "image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
//           "sec-ch-ua": 'Microsoft Edge";v="105", "Not)A;Brand";v="8", "Chromium";v="105',
//           "sec-ch-ua-mobile": "?0",
//           "sec-ch-ua-platform": "Windows",
//           "sec-fetch-dest": "image",
//           "sec-fetch-mode": "no-cors",
//           "sec-fetch-site": "same-origin",
//           "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36 Edg/105.0.1343.27"
//         }
//       }
//       await common.downFile(`http://enka.network/ui/${name}.png`,`./data/enkaNetwork/cache/icon/${name}.png`,param)
//     }
//   }
//   /**
//    * 1:HP白字
// 2:HP绿字
// 4:ATK白字
// 5:ATK绿字-整数
// 6:ATK绿字-百分比
// 7:防御白字
// 8:防御绿字
// 20:暴击率
// 21:未知，估计是暴击率绿字的占位符
// 22:爆伤
// 23:充能
// 26:治疗加成
// 27:未知
// 28:未知
// 29:未知
// 30:物理伤害加成
// 40:火伤加成百分比
// 41:雷伤加成百分比
// 42:水伤加成百分比
// 43:草伤加成百分比
// 44:风伤加成百分比
// 45:岩伤加成百分比
// 46:冰伤加成百分比
// 50:火元素抗性
// 51:雷元素抗性
// 52:水元素抗性
// 53:草元素抗性
// 54:风元素抗性
// 55:岩元素抗性
// 56:冰元素抗性
// 76:未知
// 1006:总充能
// 1010:总HP
// 2000:总HP
// 2001:总攻击
// 2002:总防御
// 2003:未知
//    */
//   handleProp(roleData){
//     let fightPropMap = roleData.fightPropMap
//     let showProp = []
//     showProp.push(this.getPropObj(roleData,"生命值上限","1010","1","2"))//HP
//     showProp.push({
//       name: "攻击力",
//       sum: fightPropMap["2001"].toFixed(),
//       white: fightPropMap["4"].toFixed(),
//       green: (fightPropMap["5"] + fightPropMap["4"] * (fightPropMap["6"] ? fightPropMap["6"] : 0)).toFixed()}
//     )//ATK
//     showProp.push(this.getPropObj(roleData,"防御力","2002","7","8"))//防御力
//     showProp.push(this.getPropObj(roleData,"元素精通","28"))//元素精通
//     showProp.push({
//       name: "暴击率",
//       sum: (fightPropMap["20"]*100).toFixed(1) + "%"
//     })
//     showProp.push({
//       name:"暴击伤害",
//       sum: (fightPropMap["22"]*100).toFixed(1) + "%"
//     })
//     showProp.push({
//       name:"元素充能效率",
//       sum: (fightPropMap["23"]*100).toFixed(1) + "%"
//     })
//     if(fightPropMap["26"]){
//       showProp.push({
//         name:"治疗加成",
//         sum: (fightPropMap["26"]*100).toFixed(1) + "%"
//       })
//     }
//     if(fightPropMap["30"]){
//       showProp.push({
//         name:"物理伤害加成",
//         sum: (fightPropMap["30"]*100).toFixed(1) + "%"
//       })
//     }
//     if(roleData.element === '火' && fightPropMap["40"]){
//       showProp.push({
//         name:"火元素伤害加成",
//         sum: (fightPropMap["40"]*100).toFixed(1) + "%"
//       })
//     }
//     if(roleData.element === '雷' && fightPropMap["41"]){
//       showProp.push({
//         name:"雷元素伤害加成",
//         sum: (fightPropMap["41"]*100).toFixed(1) + "%"
//       })
//     }
//     if(roleData.element === '水' && fightPropMap["42"]){
//       showProp.push({
//         name:"水元素伤害加成",
//         sum: (fightPropMap["42"]*100).toFixed(1) + "%"
//       })
//     }
//     if(roleData.element === '草' && fightPropMap["43"]){
//       showProp.push({
//         name:"草元素伤害加成",
//         sum: (fightPropMap["43"]*100).toFixed(1) + "%"
//       })
//     }
//     if(roleData.element === '风' && fightPropMap["44"]){
//       showProp.push({
//         name:"风元素伤害加成",
//         sum: (fightPropMap["44"]*100).toFixed(1) + "%"
//       })
//     }
//     if(roleData.element === '岩' && fightPropMap["45"]){
//       showProp.push({
//         name:"岩元素伤害加成",
//         sum: (fightPropMap["45"]*100).toFixed(1) + "%"
//       })
//     }
//     if(roleData.element === '冰' && fightPropMap["46"]){
//       showProp.push({
//         name:"冰元素伤害加成",
//         sum: (fightPropMap["46"]*100).toFixed(1) + "%"
//       })
//     }
//     return showProp
//   }
//   getPropObj(roleData,name,sumKey,whiteKey,greenKey){
//     let prop = {}
//     prop.name = name
//     prop.sum = roleData.fightPropMap[sumKey].toFixed()//银行家舍入法
//     if(whiteKey){
//       prop.white = roleData.fightPropMap[whiteKey].toFixed()
//     }
//     if(greenKey){
//       if(roleData.fightPropMap[greenKey]){
//         prop.green = roleData.fightPropMap[greenKey].toFixed()
//       }else{
//         prop.green = 0
//       }
//     }
//     return prop
//   }
//   async handleArtifact(equip){
//     let artifact = {}
//     artifact.icon = equip.flat.icon
//     await this.cacheIcon(artifact.icon)//缓存图标
//     artifact.mainPropName = gsCfg.fightPropIdToName(equip.flat.reliquaryMainstat.mainPropId)
//     artifact.mainPropVal = equip.flat.reliquaryMainstat.statValue
//     artifact.level = equip.reliquary.level - 1//圣遗物等级
//     artifact.starLevelArray = []//圣遗物星级，用于循环星星
//     for(var i = 0;i < equip.flat.rankLevel;i++){
//       artifact.starLevelArray.push(i)
//     }
//     artifact.subProps = []
//     for (const key in equip.flat.reliquarySubstats) {
//       if (Object.hasOwnProperty.call(equip.flat.reliquarySubstats, key)) {
//         const substate = equip.flat.reliquarySubstats[key];
//         artifact.subProps.push({
//           name:gsCfg.fightPropIdToName(substate.appendPropId),
//           val:substate.statValue
//         })
//       }
//     }
//     return artifact
//   }
//   async handleWeapon(equip){
//     let weaponData = gsCfg.getWeaponDataByWeaponHash(equip.flat.nameTextMapHash)
//     await this.cacheIcon(weaponData.icon)//缓存图标
//     weaponData.rankLvlArray = []//星级，用于循环生成星星
//     weaponData.level = equip.weapon.level//等级
//     weaponData.affix = equip.weapon.affix//精炼
//     for(var i = 0;i < equip.flat.rankLevel;i++){
//       weaponData.rankLvlArray.push(i)
//     }
//     for(const key in equip.weapon.affixMap){
//       weaponData.affix = equip.weapon.affixMap[key] + 1//精炼等级
//     }
//     for (const i in equip.flat.weaponStats) {
//       if (Object.hasOwnProperty.call(equip.flat.weaponStats, i)) {
//         const weaponState = equip.flat.weaponStats[i];
//         weaponState.appendPropName = gsCfg.fightPropIdToName(weaponState.appendPropId)
//       }
//     }
//     weaponData.weaponStats = equip.flat.weaponStats
//     return weaponData
//   }
//   dateFormat (date,fmt) {
//     var o = {
//         "M+": date.getMonth() + 1, //月份
//         "d+": date.getDate(), //日
//         "H+": date.getHours(), //小时
//         "m+": date.getMinutes(), //分
//         "s+": date.getSeconds(), //秒
//         "q+": Math.floor((date.getMonth() + 3) / 3), //季度
//         "S": date.getMilliseconds() //毫秒
//     };
//     if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
//     for (var k in o)
//     if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
//     return fmt;
//   }
// }

