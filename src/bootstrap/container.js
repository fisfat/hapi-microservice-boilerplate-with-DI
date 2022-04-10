const awilix = require('awilix');
const Sentry = require('@sentry/node');

const config = require('../config');
const logger = require('../logger');
// const catcher = require('../logger/catcher');
const ServiceCaller = require('../utils/service-caller');

const { formatNameWithGroup } = require('./utils');

// create container
const container = awilix.createContainer();

// register Sentry
container.register('Sentry', awilix.asValue(Sentry));

// register the global config object
container.register('config', awilix.asValue(config));

// register root logger
container.register('logger', awilix.asFunction(logger));

// register capture exception
// container.register('catcher', awilix.asFunction(catcher));

// register service caller class
container.register('ServiceCaller', awilix.asClass(ServiceCaller));

// load models
container.loadModules(
  ['../models/*.js'],
  {
    cwd: __dirname,
    formatName: formatNameWithGroup('Model'),
    resolverOptions: {
      lifetime: awilix.Lifetime.SINGLETON,
    },
  },
);

// load data access classes
container.loadModules(
  ['../data-access/*.js'],
  {
    cwd: __dirname,
    formatName: formatNameWithGroup('DataAccess'),
    resolverOptions: {
      lifetime: awilix.Lifetime.SINGLETON,
    },
  },
);

// load services
container.loadModules(
  ['../services/*.js'],
  {
    cwd: __dirname,
    formatName: formatNameWithGroup('Service'),
  },
);

// load service callers
container.loadModules(
  ['../service-callers/*.js'],
  {
    cwd: __dirname,
    formatName: formatNameWithGroup('ServiceCaller'),
  },
);

// load logic
container.loadModules(
  ['../logics/*.js'],
  {
    cwd: __dirname,
    formatName: formatNameWithGroup('Logic'),
  },
);

module.exports = container;
