const { createServer } = require('./server');

async function main() {
  const { server, logger } = await createServer();

  const port = Number(process.env.PORT || 3000);
  server.listen(port, () => {
    logger.info({ port }, 'server listening');
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
