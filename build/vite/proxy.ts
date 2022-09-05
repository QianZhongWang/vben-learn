/**
 * 用于解析开发环境下的代理转发的配置
 */
import type {ProxyOptions} from 'vite';

type ProxyItem = [string, string];
type ProxyList = ProxyItem[];
type ProxyTargetList = Record<string, ProxyOptions>;


const httpsRE = /^https:\/\//;

/**
 * @description 解析代理转发的配置
 * @param list
 */
export function createProxy(list: ProxyList = []) {
  const ret: ProxyTargetList = {};
  for (const [prefix, target] of list) {
    const isHttps = httpsRE.test(target);
    ret[prefix] = {
      'target': target,
      'changeOrigin': true,
      ws: true,
      rewrite: (path) => path.replace(new RegExp(`^${prefix}`), ''),
      ...(isHttps ? {secure: false} : {})
    }
  }
  return ret;

}
