declare namespace NodeJS {
    interface ProcessEnv extends ImportMetaEnv {
        NODE_ENV: 'development' | 'production'
    }
}

interface ImportMetaEnv {
    readonly VITE_NODE_ENV: 'development' | 'production'

}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
