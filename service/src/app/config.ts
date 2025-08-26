export class AppConfig {
    environment: 'production' | 'development' = 'development';
    /** Path to SQLite DB file; default relative to service dir. Can be overridden via APP_DB_PATH env. */
    dbPath: string = 'var/data.sqlite';
}
