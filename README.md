<p align="center">
<img width="150" src="https://koishi.chat/logo.png">
 :heavy_multiplication_x:
<img width="130" src="https://gitee.com/KuroshioDev/koishi-plugin-genshin/raw/master/yunzai.png">
</p>

<h1 align="center">koishi-plugin-genshin</h1>

<div align="center">

是 koishi 版的 <a href="https://gitee.com/Le-niao/Yunzai-Bot" target="_blank">Yunzai-Bot</a>

</div>
<br />
<br />


## ✨ 功能

- [x] 云仔主体
- [x] example 插件
- [x] [csv-逍遥插件](https://github.com/KuroshioDev/kuroshio-xiaoyao-plugin)
- [x] [喵喵插件](https://github.com/KuroshioDev/kuroshio-miao-plugin)
- [x] [图鉴插件](https://github.com/KuroshioDev/atlas-plugin)
- [x] [星铁插件](https://github.com/KuroshioDev/kuroshio-starrail-plugin)



## 🖥 依赖

- [koishi](https://koishi.chat/)

## 📦 安装指南

1. 安装前准备

- 安装git
ubuntu下
  ```
    apt install git
  ```
- 安装redis

      待补充

- 安装yarn
  ```
  npm install yarn -g
  ```

2. 下载代码
    ```
    git clone https://github.com/KuroshioDev/koishi-plugin-genshin.git
    ```

2. 安装依赖

    ```
    cd koishi-plugin-genshin
    yarn
    ```

3. 运行

    ```
    yarn start
    ```

4. 开启插件

    <img src="https://github.com/KuroshioDev/koishi-plugin-genshin/blob/develop/%E6%95%99%E7%A8%8B.png?raw=true">

## 🌈 迁移云仔/喵仔插件

1. 首先这里有个一个js插件
```js
import { segment } from "oicq";
import fetch from "node-fetch";
//项目路径
const _path = process.cwd();

let siliao = true  //是否允许私聊使用，设为false则禁止私聊（主任除外）
let urls = []




export class example extends plugin {
  constructor () {
    super({
      /** 功能名称 */
      name: '可爱一下',
      /** 功能描述 */
      dsc: '可爱一下',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 5000,
      rule: [
        {
           reg: "^#*可爱一下(.*)$", //匹配消息正则，命令正则
    fnc: 'keaiyixia'
        }
      ]
    })
  }
async  keaiyixia(e) {
  if (urls.length == 0) {
       await this.downimgs()
  }
  e.reply(segment.image(urls.pop()));
  return true;//返回true 阻挡消息不再往下
}

async downimgs() {
  await fetch("https://iw233.cn/api.php?type=json&num=20&sort=random", {
    headers: { 'content-type': 'application/json'},
    method: 'GET',
    mode: 'cors',
  }).then(response => response.json()).then(data => {
    if (data.pic.length == 20) {
      urls = data.pic
    }

  })
  console.log('访问成功了')
}
}
```
2. 第一步
将import .. from .. 换成 const ... = require(...)
比如例子里面的
```
import { segment } from "oicq";
import fetch from "node-fetch";
```
换成
```
const { segment } = require("oicq")
const fetch = require("node-fetch")
# 增加一行
const plugin = require('../../lib/plugins/plugin')
```

3. 第二步
删除 类前面的export 或者 export default 然后加入ctx和session参数到构造函数
比如例子里面的
```

export class example extends plugin {
  constructor () {
    super({
      /** 功能名称 */
      name: '可爱一下',
      /** 功能描述 */
      dsc: '可爱一下',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 5000,
      rule: [
        {
           reg: "^#*可爱一下(.*)$", //匹配消息正则，命令正则
    fnc: 'keaiyixia'
        }
      ]
    })
  }
```
改成
```
class example extends plugin {
    constructor (ctx,session) {
    super({
      /** 功能名称 */
      name: '可爱一下',
      /** 功能描述 */
      dsc: '可爱一下',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 5000,
      rule: [
        {
           reg: "^#*可爱一下(.*)$", //匹配消息正则，命令正则
    fnc: 'keaiyixia'
        }
      ],
      ctx:ctx,
      session:session
    })
  }
```
4. 第三步
文件夹末尾,增加一个匹配规则和匹配成功后执行的函数
```
exports.app = keai
exports.rule = [
  {
    reg: '^#*可爱一下(.*)$',
    fnc: "keaiyixia"
  }
]
```
5. 第四步，把js扔进example插件下的apps目录



## 🌈 其他

- 素材来源于网络，仅供交流学习使用
- 严禁用于任何商业用途和非法行为
- 如果对你有帮助辛苦给个star，这是对我最大的鼓励
- 如果进行二次开发，务必带上原作者


## 🔗 链接





