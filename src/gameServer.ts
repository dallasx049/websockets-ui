import { readFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { createServer } from 'node:http';

const port = process.env.GAME_PORT;

export const initGameServer = () => {
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

  server.listen(port, () => {
    console.log(`\n------`);
    console.log(`Game server has started on port: ${port}`);
    console.log(`To play the game visit: http://localhost:${port}`);
    console.log(`------\n`);
  });
};
