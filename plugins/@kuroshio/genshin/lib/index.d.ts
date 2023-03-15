import { Context, Schema } from 'koishi';
export declare const using: readonly ["qgHelper", "puppeteer"];
declare class KuroshioGenshinPlugin {
    private packageErr;
    private pluCount;
    constructor(ctx: Context, config: KuroshioGenshinPlugin.Config);
    getPlugins(): any[];
    packageTips(packageErr: any): void;
}
declare namespace KuroshioGenshinPlugin {
    interface Redisconfig {
        host: string;
        port: string;
        password: string;
        db: string;
    }
    interface Config {
        redis: Redisconfig;
    }
    let Config: Schema<Config>;
}
export default KuroshioGenshinPlugin;
