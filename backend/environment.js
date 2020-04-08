class Environment {
    static modeEnum = {
        PROD: 'prod',
        DEV: 'dev'
    };

    static dbPrefix = 'dm-trade';

    constructor(p, u, m, d) {
        this.port = p;
        this.url = u;
        this.mode = m;
        this.db = `${Environment.dbPrefix}-${this.mode}`;
    }

    static instance = null;
}

let instance;

switch (process.argv[2]) {
    case Environment.modeEnum.PROD:
        instance = new Environment(8011, 'https://joshuaevans.ca', Environment.modeEnum.PROD);
        break;
    case Environment.modeEnum.DEV:
        instance = new Environment(8013, 'http://localhost', Environment.modeEnum.DEV);
        break;
    default:
        console.log(`${process.argv[2]} is not "${Environment.modeEnum.PROD}" or "${Environment.modeEnum.DEV}"`);
        process.exit();
}

Environment.instance = instance;

module.exports = Environment;