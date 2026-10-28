import {ApiError} from './service.js';
export function credentials(env=process.env){return env.UPSTASH_REDIS_REST_URL&&env.UPSTASH_REDIS_REST_TOKEN?{url:env.UPSTASH_REDIS_REST_URL,token:env.UPSTASH_REDIS_REST_TOKEN}:{url:env.KV_REST_API_URL,token:env.KV_REST_API_TOKEN};}
export function configured(env=process.env){const c=credentials(env);return !!(c.url&&c.token);}
export class RedisStore {
  constructor(env=process.env){const c=credentials(env);this.url=c.url;this.token=c.token;}
  async command(...args){const r=await fetch(this.url,{method:'POST',headers:{Authorization:'Bearer '+this.token,'Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(8000)});if(!r.ok)throw Error('Banco temporariamente indisponível');const j=await r.json();if(j.error)throw Error('Falha no banco');return j.result;}
  async get(id){const raw=await this.command('GET','cr:profile:'+id);return raw?JSON.parse(raw):null;}
  async deleted(id){return !!await this.command('GET','cr:deleted:'+id);}
  async create(record){const script="if redis.call('EXISTS',KEYS[2])==1 then return 'deleted' end; return redis.call('SET',KEYS[1],ARGV[1],'NX')";const result=await this.command('EVAL',script,2,'cr:profile:'+record.id,'cr:deleted:'+record.id,JSON.stringify(record));if(result==='deleted'){throw new ApiError(410,'Perfil excluído pelo professor.');}return result==='OK';}
  async compareSwap(id,tokenHash,revision,next){const script="local raw=redis.call('GET',KEYS[1]); if not raw then return 'missing' end; local r=cjson.decode(raw); if r.tokenHash~=ARGV[1] then return 'denied' end; if r.revision~=tonumber(ARGV[2]) then return 'conflict' end; redis.call('SET',KEYS[1],ARGV[3]); return 'ok'";return this.command('EVAL',script,1,'cr:profile:'+id,tokenHash,String(revision),JSON.stringify(next));}
  async rate(key){const script="local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],600) end; return n";return this.command('EVAL',script,1,'cr:rate:'+key);}
}
