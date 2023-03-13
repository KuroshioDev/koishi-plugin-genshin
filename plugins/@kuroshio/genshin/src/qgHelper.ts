import {Bot, Context, Logger, Schema, Service, Session} from "koishi";
import axios from 'axios'
declare module 'koishi' {
  interface Context {
    qgHelper: QgHelper
  }
}

class QgHelper extends Service {
    private logger: Logger;

    constructor(ctx: Context) {
      // 这样写你就不需要手动给 ctx 赋值了
      super(ctx, 'qgHelper', true)
      this.logger = new Logger("QgHelper")
    }

    public async post(session: Session, channelId: string, data:QgHelper.Article) {
      const bot = session.bot
      if (bot.platform != "qqguild") {
        return
      }
      console.log(JSON.stringify(data.paragraphs))
      const cfg: any = bot.config
      const response = await this.ctx.http("PUT", `https://api.sgroup.qq.com/channels/${channelId}/threads`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bot ${cfg.app.id}.${cfg.app.token}`
        },
        data: JSON.stringify({
          "title": data.title,
          "content": JSON.stringify(data),
          "format": 4
        })

      }).then(async res => {
        console.log(res)
        const msg = JSON.stringify(res)
        this.logger.info(`发帖：`, msg)
        if (res.code) {
          this.logger.error(`发帖错误：`, msg)
          throw new Error(msg);
        }
      }).catch(error => {
        this.logger.error(`发帖错误：`, JSON.stringify(error))
      })
    }
  }

namespace QgHelper {
  export interface paragraph {
    elems: Array<elems>,
    props?: props
  }

  export interface elems {
    text?: TextElem,
    image?: ImageElem,
    video?: VideoElem,
    url?: URLElem,
    type: ElemType
  }

  export interface TextElem {
    text: string
  }

  export interface ImageElem {
    third_url: string
    width_percent: number
  }

  export interface VideoElem {
    third_url: string
  }

  export interface URLElem {
    url: string,
    desc: string
  }

  export enum ElemType {
    TEXT = 1,
    IMAGE = 2,
    VIDEO = 3,
    URL = 4
  }

  export interface props {
    alignment: number
  }

  export interface Article {
    title: string,
    paragraphs: Array<paragraph>
  }
}


export default QgHelper
