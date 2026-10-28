import test from 'node:test';import assert from 'node:assert/strict';import {credentials,configured,RedisStore} from '../server/store.js';
test('aceita variáveis nativas Marketplace e credenciais REST diretas sem misturar pares',()=>{
  const native={KV_REST_API_URL:'https://native.test',KV_REST_API_TOKEN:'native'};assert(configured(native));assert.equal(new RedisStore(native).token,'native');assert(!configured({KV_REST_API_URL:'https://test',KV_REST_API_READ_ONLY_TOKEN:'readonly'}));assert(!configured({UPSTASH_REDIS_REST_URL:'https://test',KV_REST_API_TOKEN:'outro'}));assert.deepEqual(credentials({...native,UPSTASH_REDIS_REST_URL:'https://direct.test',UPSTASH_REDIS_REST_TOKEN:'direct'}),{url:'https://direct.test',token:'direct'});
});
