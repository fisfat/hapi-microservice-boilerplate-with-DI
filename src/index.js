const bootstrap = require('./bootstrap');
const container = require('./bootstrap/container');
const bootstrapModules = require('./bootstrap/modules');
const serverModuleBootstrap = require('./server');
const { safeShutdownDelay } = require('./config');

(async () => {
  try {
    const { error, exit } = await bootstrap(container, bootstrapModules, {
      serverModuleBootstrap,
    });

    if (error) {
      // eslint-disable-next-line no-console
      console.error(error);

      await exit();
    }

    process.on('SIGTERM', () => {
      // eslint-disable-next-line no-console
      console.info('Got SIGTERM. Graceful shutdown start', new Date().toISOString());
      setTimeout(exit, safeShutdownDelay);
    });
    process.on('SIGINT', exit);
  }
  catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    process.exit(0);
  }
})();
