import {randomBytes,scryptSync} from 'node:crypto';
const password=randomBytes(18).toString('base64url'),salt=randomBytes(16).toString('hex');
console.log('Professor: prof_pedroneto@camporeal.edu.br\nGuarde esta senha em seu gerenciador de senhas:\n'+password+'\n\nNa Vercel, adicione a variável ADMIN_PASSWORD_HASH com este valor:\nscrypt:'+salt+':'+scryptSync(password,salt,64).toString('hex')+'\n\nDepois faça um novo deploy. Não envie estes valores pelo chat nem ao GitHub.');
