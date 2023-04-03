"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DBHelper {
    constructor(ctx) {
        this.context = ctx;
    }
    async get(tableName, query, field) {
        let data = await this.context.database.get(tableName, query, field);
        if (data && data.length > 0) {
            return data[0];
        }
        else {
            return null;
        }
    }
    async list(tableName, query, offset = 1, limit, order) {
        let sql = await this.context.database.select(tableName, query);
        if (limit) {
            sql.limit(offset, limit);
        }
        if (order) {
            order.forEach(o => {
                sql.orderBy(o.field, o.direction);
            });
        }
        let data = sql.execute();
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
    async select(tableName, query, filed) {
        let data = await this.context.database;
    }
}
exports.default = DBHelper;
