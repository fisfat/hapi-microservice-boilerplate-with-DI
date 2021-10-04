const awilix = require('awilix');
const Hapi = require('@hapi/hapi');

const { formatNameWithGroup } = require('../bootstrap/utils');
const { getRequestIdFromRequest } = require('./utils');

module.exports = async (container) => {
  const { server: serverConfig } = container.resolve('config');
  const { port, keepAliveTimeout, returnValidationInfoError } = serverConfig;

  const ServiceCaller = container.resolve('ServiceCaller');
  const Sentry = container.resolve('Sentry');
  const logger = container.resolve('logger');

  // load controllers
  container.loadModules(
    ['./controllers/*.js'],
    {
      cwd: __dirname,
      formatName: formatNameWithGroup('Controller'),
    },
  );

  // load plugins
  container.loadModules(
    ['./plugins/*.js'],
    {
      cwd: __dirname,
      formatName: formatNameWithGroup('Plugin'),
    },
  );

  // get plugin names
  const plugins = (
    awilix
      .listModules(
        ['./plugins/*.js'],
        {
          cwd: __dirname,
        },
      )
      .map((file) => file.name)
      .map(formatNameWithGroup('Plugin'))
      .map(container.resolve)
  );

  // resolve routes
  const routes = (
    awilix
      .listModules(
        ['./routes/*.js'],
        {
          cwd: __dirname,
        },
      )
      .map((file) => file.path)
      .map(require)
      .reduce((acc, route) => [...acc, ...route], [])
  );

  const serverOptions = {
    port,
    ...(returnValidationInfoError ? {
      routes: {
        validate: {
          failAction: async (_, __, error) => {
            throw error;
          },
        },
      },
    } : undefined),
  };

  const server = Hapi.server(serverOptions);
  server.listener.keepAliveTimeout = keepAliveTimeout;

  // register plugins
  await Promise.all(
    plugins
      .map((plugin) => server.register(plugin)),
  );

  // register routes
  await server.route(
    routes
      .map((route) => ({
        ...route,
        handler: async (request) => {
          const scoped = container.createScope();

          const requestId = getRequestIdFromRequest(request);

          ServiceCaller.assignRequestId(requestId);

          Sentry.configureScope((scope) => {
            scope.setExtra('requestId', requestId);
          });

          const scopedLogger = logger.child({ requestId });

          scoped.register('ServiceCaller', awilix.asValue(ServiceCaller));
          scoped.register('logger', awilix.asValue(scopedLogger));
          scoped.register('handler', awilix.asFunction(route.handler));

          return scoped.resolve('handler')(request);
        },
      })),
  );

  const start = async () => {
    await server.start();

    logger.info('server started.', { port });

    return server;
  };

  const stop = async () => (
    server.stop()
  );

  const register = async () => (
    container.register('server', awilix.asValue(server))
  );

  return {
    start,
    stop,
    register,
  };
};
