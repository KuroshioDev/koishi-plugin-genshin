"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DBHelper {
    constructor(ctx) {
        this.context = ctx;
    }
    async get(tableName, query) {
        let data = await this.context.database.get(tableName, query);
        if (data && data.length > 0) {
            return data[0];
        }
        else {
            return null;
        }
    }
    async list(tableName, query, filed) {
        let data = await this.context.database.get(tableName, query, filed);
        if (!data) {
            return [];
        }
        return data;
    }
    async create(tableName, data) {
        if (!data) {
            return false;
        }
        else {
            return await this.context.database.create(tableName, data);
        }
    }
    async update(tableName, query, data) {
        return await this.context.database.set(tableName, query, data);
    }
    /**
     * update or insert
     * @param tableName
     * @param data
     */
    async upsert(tableName, data) {
        if (Array.isArray(data)) {
            return await this.context.database.upsert(tableName, data);
        }
        else {
            return await this.context.database.upsert(tableName, [data]);
        }
    }
    async remove(tableName, query) {
        await this.context.database.remove(tableName, query);
    }
}
exports.default = DBHelper;
