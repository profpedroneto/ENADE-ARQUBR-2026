import {configured} from '../server/store.js';import {reply} from '../server/http.js';
export default function(req,res){if(req.method!=='GET')return reply(res,405,{error:'Método não permitido.'});reply(res,200,{cloudEnabled:configured(),version:'2.0.0'});}
