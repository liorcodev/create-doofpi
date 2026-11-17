declare namespace NodeJS {
  interface ProcessEnv {
    CLOUDFLARE_ACCOUNT_ID: string;
    CLOUDFLARE_DATABASE_ID_PRODUCTION: string;
    CLOUDFLARE_DATABASE_ID_PREVIEW: string;
    CLOUDFLARE_D1_TOKEN: string;
    LOCAL_DATABASE_PATH?: string;
  }
}
