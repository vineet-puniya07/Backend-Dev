const { config } = require('./config');
const { connectToMongo } = require('./db');
const { createApp } = require('./app');

async function main() {
  const mongoUri = config.mongoUri;
  if (!mongoUri) {
    // eslint-disable-next-line no-console
    console.error('Set MONGODB_URI in .env');
    process.exit(1);
  }

  await connectToMongo(mongoUri);

  const app = createApp({ mongoUri });
  app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Listening on http://localhost:${config.port}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
