import {Context, Keys, Tables} from "koishi";
import {Query} from "@minatojs/core";


export default class DBHelper {
  private context: Context

  constructor(ctx: Context) {
    this.context = ctx;
  }

  public async get(tableName: Keys<Tables, string>, query: Query<never>) {
    let data = await this.context.database.get(tableName, query)
    if (data && data.length > 0) {
      return data[0];
    } else {
      return null;
    }
  }

  public async list(tableName: Keys<Tables, string>, query: Query<never>, filed) {
    let data = await this.context.database.get(tableName, query, filed)
    if(!data) {
      return []
    }
    return data;
  }

  public async create(tableName: Keys<Tables, string>, data: never) {
    if(!data){
      return false
    }else {
      return await this.context.database.create(tableName, data)
    }
  }

  public async update(tableName: Keys<Tables, string>, query: Query<never>, data: any) {
    return await this.context.database.set(tableName, query, data)
  }
  /**
   * update or insert
   * @param tableName
   * @param data
   */
  public async upsert(tableName: Keys<Tables, string>, data: any) {
    if (Array.isArray(data)) {
      return await this.context.database.upsert(tableName, data)
    }else {
      return await this.context.database.upsert(tableName, [data])
    }

  }

  public async remove(tableName: Keys<Tables, string>, query: Query<never>) {
    await this.context.database.remove(tableName, query)
  }
}
