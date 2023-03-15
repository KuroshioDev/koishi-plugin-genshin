"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.using = void 0;
const koishi_1 = require("koishi");
const { redisInit } = require('../plugins/lib/redis.js');
const dbHelper_1 = __importDefault(require("./dbHelper"));
const node_fs_1 = __importDefault(require("node:fs"));
const koishi_2 = require("koishi");
const { common } = require('../plugins/lib/common/common.js');
exports.using = ['qgHelper', 'puppeteer'];
const logger = new koishi_2.Logger("Kuroshio-Genshin-Plugin");
const dir = `./plugins/${common.getProjectName()}/plugins`;
class KuroshioGenshinPlugin {
    constructor(ctx, config) {
        this.packageErr = [];
        this.pluCount = 0;
        ctx.i18n.define('zh', require('./locales/zh'));
        // 给全部命令加上user id
        ctx.before('command/attach-user', (argv, fields) => {
            fields.add('id');
        });
        // 给全部中间件加上user id
        ctx.before('attach-user', (session, fields) => {
            fields.add('id');
        });
        // ready
        ctx.on("ready", async () => {
            logger.info('---------连接redis-------');
            await redisInit(config);
            logger.info('连接redis成功');
            let dbHelper = new dbHelper_1.default(ctx);
            global.dbHelper = dbHelper;
            logger.info('------加载插件中-------');
            const files = this.getPlugins();
            for (let File of files) {
                try {
                    let tmp = await require(File.path);
                    ctx.plugin(tmp.default, config);
                    this.pluCount++;
                    if (tmp.name)
                        logger.info(`加载插件成功:${tmp.name}`);
                }
                catch (error) {
                    if (error.stack.includes('Cannot find package')) {
                        this.packageErr.push({ error, File });
                    }
                    else {
                        logger.error(`载入插件错误：${File.name}`);
                        logger.error(decodeURI(error.stack));
                    }
                }
            }
            this.packageTips(this.packageErr);
            logger.info(`加载插件完成[${this.pluCount}个]`);
        });
    }
    getPlugins() {
        let ignore = ['index.js'];
        logger.info(dir);
        let files = node_fs_1.default.readdirSync(dir, { withFileTypes: true });
        let ret = [];
        for (let val of files) {
            let filepath = common.getPluginsPath() + '/' + val.name;
            let tmp = {
                name: val.name,
                path: ""
            };
            if (val.isFile()) {
                if (!val.name.endsWith('.js'))
                    continue;
                if (ignore.includes(val.name))
                    continue;
                tmp.path = filepath;
                ret.push(tmp);
                continue;
            }
            if (node_fs_1.default.existsSync(`${dir}/${val.name}/core/index.js`)) {
                tmp.path = filepath + '/core';
                ret.push(tmp);
                continue;
            }
            continue;
        }
        return ret;
    }
    packageTips(packageErr) {
        if (!packageErr || packageErr.length <= 0)
            return;
        logger.error('--------插件载入错误--------');
        packageErr.forEach(v => {
            let pack = v.error.stack.match(/'(.+?)'/g)[0].replace(/'/g, '');
            logger.error(`${v.File.name} 缺少依赖：${pack}`);
            logger.error(`请执行安装依赖命令：${'pnpm add ' + pack + ' -w'}`);
        });
        logger.error('或者使用其他包管理工具安装依赖');
        logger.error('---------------------');
    }
}
(function (KuroshioGenshinPlugin) {
    let baseConfig = koishi_1.Schema.object({
        redis: koishi_1.Schema.object({
            host: koishi_1.Schema.string().default("127.0.0.1").description("要连接到的主机名。"),
            port: koishi_1.Schema.string().default("6379").description("要连接到的端口号。"),
            password: koishi_1.Schema.string().default("").description("要使用的密码"),
            db: koishi_1.Schema.string().default("0").description("要访问的数据库。"),
        }).description('Redis配置项'),
    });
    // load plugin config
    let ignore = ['index.js'];
    let files = node_fs_1.default.readdirSync(dir, { withFileTypes: true });
    for (let val of files) {
        if (val.isFile()) {
            if (val.name.endsWith('.js'))
                continue;
            if (ignore.includes(val.name))
                continue;
            continue;
        }
        let path = `${dir}/${val.name}/config/config.json`;
        if (node_fs_1.default.existsSync(path)) {
            const schema2 = new koishi_1.Schema(JSON.parse(node_fs_1.default.readFileSync(path, "utf-8")));
            baseConfig = koishi_1.Schema.intersect([baseConfig, schema2]);
        }
    }
    KuroshioGenshinPlugin.Config = baseConfig;
})(KuroshioGenshinPlugin || (KuroshioGenshinPlugin = {}));
exports.default = KuroshioGenshinPlugin;
