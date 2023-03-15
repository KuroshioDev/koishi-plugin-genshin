import { Context, Keys, Tables } from "koishi";
import { Query } from "@minatojs/core";
export default class DBHelper {
    private context;
    constructor(ctx: Context);
    get(tableName: Keys<Tables, string>, query: Query<never>): Promise<Pick<never, never>>;
    list(tableName: Keys<Tables, string>, query: Query<never>, filed: any): Promise<Pick<never, never>[]>;
    create(tableName: Keys<Tables, string>, data: never): Promise<boolean>;
    update(tableName: Keys<Tables, string>, query: Query<never>, data: any): Promise<void>;
    /**
     * update or insert
     * @param tableName
     * @param data
     */
    upsert(tableName: Keys<Tables, string>, data: any): Promise<void>;
    remove(tableName: Keys<Tables, string>, query: Query<never>): Promise<void>;
}
