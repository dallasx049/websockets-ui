import { readFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { createServer } from 'node:http';

import { Env } from './lib/constants.ts';

const server = createServer(async (req, res) => {
  const rootDir = dirname(process.argv[1]);
  const filePath =
    rootDir + (req.url === '/' ? '/front/index.html' : '/front' + req.url);

  try {
    const file = await readFile(filePath);
    res.writeHead(200);
    res.end(file);
  } catch (e) {
    res.writeHead(404);
    res.end(JSON.stringify(e));
  }
});

server.listen(Env.GAME_PORT, () => {
  console.log(`Game server is listening on port: ${Env.GAME_PORT}`);
  console.log(`To play the game visit: http://localhost:${Env.GAME_PORT}`);
});
