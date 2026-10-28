import {endpoint,jsonBody,bearer} from '../server/http.js';
export default endpoint(['PUT'],async(req,service)=>({profile:await service.save(bearer(req),await jsonBody(req))}));
