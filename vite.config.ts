import type {UserConfig, ConfigEnv} from 'vite'
import pkg from "./package.json";
import dayjs from 'dayjs'
import {loadEnv} from "vite";
import {resolve} from "path";
import {wrapperEnv} from "./build/utils"
import {createProxy} from "./build/vite/proxy"
import {OUTPUT_DIR} from './build/constant'


function pathResolve(dir: string) {
  return resolve(process.cwd(), '.', dir)
}

const {devDependencies, dependencies, version, name} = pkg;

const __APP_INFO__ = {
  pkg: {dependencies, devDependencies, name, version},
  lastBuildTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
}

export default ({command, mode}: ConfigEnv): UserConfig => {
  const root = process.cwd();
  const env = loadEnv(mode, root);
  const viteEnv = wrapperEnv(env);
  const {VITE_PORT, VITE_PUBLIC_PATH, VITE_PROXY, VITE_DROP_CONSOLE} = viteEnv;
  return {
    base: VITE_PUBLIC_PATH,
    root,
    resolve: {
      alias: [
        // /@/xxx => /src/xxx
        {
          find: /\/@\//,
          replacement: pathResolve('src') + '/'
        },
        // /#/xxx => /type/xxx
        {
          find: /\/#\//,
          replacement: pathResolve('type') + '/'
        }
      ]
    },
    server: {
      https: false,
      host: true,
      port: VITE_PORT,
      proxy: createProxy(VITE_PROXY),
    },
    esbuild: {
      pure: VITE_DROP_CONSOLE ? ['console.log', 'debugger'] : []
    },
    build: {
      target: 'es2015',
      cssTarget: 'chrome80',
      outDir: OUTPUT_DIR,
      chunkSizeWarningLimit: 1024 * 2
    },
    define: {
      __INTLIFY_PROD_DEVTOOLS__: false,
      __APP_INFO__: JSON.stringify(__APP_INFO__)
    },
    css: {
      preprocessorOptions: {
        less: {}
      }
    },
    plugins: [],
    optimizeDeps: {}
  }
}
