import {configured,RedisStore} from '../server/store.js';
import {makeAdmin,ADMIN_EMAIL} from '../server/admin.js';
import {ApiError} from '../server/service.js';
import {reply,safeOrigin,jsonBody} from '../server/http.js';
export default async function handler(req,res){
  try{
    if(!['GET','POST','DELETE'].includes(req.method)){res.setHeader('Allow','GET, POST, DELETE');return reply(res,405,{error:'Método não permitido.'});}
    if(!configured())throw new ApiError(503,'Banco de alunos ainda não configurado.');
    safeOrigin(req);
    const url=new URL(req.url,'https://localhost'),action=url.searchParams.get('action')||'session';
    const store=new RedisStore(),admin=makeAdmin(store);
    const token=String(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('cr_admin='))?.slice(9)||'';
    const cookie=value=>res.setHeader('Set-Cookie',`cr_admin=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${value?28800:0}${process.env.VERCEL?'; Secure':''}`);
    if(action==='login'&&req.method==='POST'){
      const body=await jsonBody(req),ip=String(req.headers['x-vercel-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0];
      const session=await admin.login(body.email,body.password,ip);cookie(session.token);return reply(res,200,{email:ADMIN_EMAIL,csrf:session.csrf});
    }
    const session=await admin.authenticate(token);
    if(req.method!=='GET'&&req.headers['x-admin-csrf']!==session.csrf)throw new ApiError(403,'Atualize o painel antes de continuar.');
    if(action==='session'&&req.method==='GET')return reply(res,200,{email:ADMIN_EMAIL,csrf:session.csrf});
    if(action==='students'&&req.method==='GET')return reply(res,200,await admin.list(url.searchParams.get('cursor')||'0'));
    if(action==='password'&&req.method==='POST'){const body=await jsonBody(req);const result=await admin.changePassword(token,body.currentPassword,body.newPassword);cookie('');return reply(res,200,result);}
    if(action==='logout'&&req.method==='POST'){await admin.logout(token);cookie('');return reply(res,200,{ok:true});}
    if(action==='student'&&req.method==='DELETE'){const body=await jsonBody(req);return reply(res,200,await admin.remove(body.id,body.revision,body.name));}
    throw new ApiError(404,'Operação não encontrada.');
  }catch(e){return reply(res,e instanceof ApiError?e.status:503,{error:e instanceof ApiError?e.message:'Não foi possível consultar o banco. Tente novamente.'});}
}
