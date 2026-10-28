import {endpoint,jsonBody,bearer} from '../server/http.js';
export default endpoint(['GET','POST'],async(req,service)=>req.method==='GET'?{profile:await service.read(bearer(req))}:{profile:await service.create(await jsonBody(req),String(req.headers['x-vercel-forwarded-for']||req.headers['x-forwarded-for']||'unknown').split(',')[0].trim())});
