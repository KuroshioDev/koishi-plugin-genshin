const { plugin } = require( '../../lib/plugins/plugin.js')
const { EnkaNetWork} = require('../model/enkaNetwork.js')



class enka extends plugin {
  constructor () {
    super({
      /** 功能名称 */
      name: 'enka',
      /** 功能描述 */
      dsc: '查询角色橱柜的详细资料',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 5000,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^#角色面板(([1-9]{1}\\d{8}([1-9])?)|(\\d))?$',
          /** 执行方法 */
          fnc: 'enka'
        },
				{
          /** 命令正则匹配 */
          reg: '^#更新角色面板?$',
          /** 执行方法 */
          fnc: 'updateEnka'
        }
      ]
    })
  }
  async enka () {
    let enka = new EnkaNetWork(this.e);
		let {text,img} = await enka.getRoleDetail();
		if(text){
			this.e.reply(text)
		}
		if(img){
			this.e.reply(img)
		}

  }
	async updateEnka(){
		let enka = new EnkaNetWork(this.e);
		let {text,img} = await enka.getRoleDetail(true);
		this.e.reply(text)
		this.e.reply(img)
	}
}

module.exports = enka
