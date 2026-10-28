import {randomBytes,scryptSync,timingSafeEqual} from 'node:crypto';
import {ApiError,digest,ID,publicProfile} from './service.js';
export const ADMIN_EMAIL='prof_pedroneto@camporeal.edu.br';
export function verifyPassword(password,encoded){
  if(typeof password!=='string'||password.length>256)return false;
  const [kind,salt,hash]=String(encoded||'').split(':');
  if(kind!=='scrypt'||!/^[a-f0-9]{32}$/.test(salt)||!/^[a-f0-9]{128}$/.test(hash))return false;
  const expected=Buffer.from(hash,'hex'),actual=scryptSync(password,salt,64);
  return timingSafeEqual(expected,actual);
}
export function makeAdmin(store,env=process.env){
  const required=()=>{if(!env.ADMIN_PASSWORD_HASH)throw new ApiError(503,'Acesso do professor ainda não configurado. Configure ADMIN_PASSWORD_HASH na Vercel.');};
  const sessionKey=token=>'cr:admin:'+digest(String(token));
  return {
    async login(email,password,ip){required();if(await store.rate('admin:'+digest(ip))>10)throw new ApiError(429,'Muitas tentativas. Aguarde dez minutos.');if(email!==ADMIN_EMAIL||!verifyPassword(password,env.ADMIN_PASSWORD_HASH))throw new ApiError(401,'E-mail ou senha inválidos.');const token=randomBytes(32).toString('base64url'),csrf=randomBytes(32).toString('base64url');await store.command('SET',sessionKey(token),JSON.stringify({csrf,version:digest(env.ADMIN_PASSWORD_HASH)}),'EX',28800);return{token,csrf};},
    async authenticate(token){required();if(!/^[A-Za-z0-9_-]{43}$/.test(token||''))throw new ApiError(401,'Entre na área do professor.');const raw=await store.command('GET',sessionKey(token));const session=raw?JSON.parse(raw):null;if(!session||session.version!==digest(env.ADMIN_PASSWORD_HASH))throw new ApiError(401,'Sessão encerrada. Entre novamente.');return session;},
    async logout(token){await store.command('DEL',sessionKey(token));},
    async list(cursor='0'){if(!/^\d{1,20}$/.test(cursor))throw new ApiError(400,'Página inválida.');const [next,keys]=await store.command('SCAN',cursor,'MATCH','cr:profile:*','COUNT',50);const records=[];for(const key of keys){const id=key.slice('cr:profile:'.length);if(ID.test(id)){const record=await store.get(id);if(record)records.push(publicProfile(record));}}return{cursor:String(next),students:records};},
    async remove(id,revision,name){if(!ID.test(id)||!Number.isInteger(revision)||typeof name!=='string')throw new ApiError(400,'Exclusão inválida.');const script="local raw=redis.call('GET',KEYS[1]); if not raw then return 'missing' end; local r=cjson.decode(raw); if r.revision~=tonumber(ARGV[1]) or r.name~=ARGV[2] then return 'conflict' end; redis.call('SET',KEYS[2],'1'); redis.call('DEL',KEYS[1]); return 'ok'";const result=await store.command('EVAL',script,2,'cr:profile:'+id,'cr:deleted:'+id,String(revision),name);if(result!=='ok')throw new ApiError(409,'Perfil atualizado ou já excluído. Atualize a lista antes de excluir.');return{deleted:true};}
  };
}
