const winston = require('winston');

const {
  format: { combine, json, timestamp },
  transports: { Console },
} = winston;

const createErrorReplacer = (fieldsToIgnore = []) => ((_, value) => {
  if (value instanceof Buffer) {
    return value.toString('base64');
  }

  if (value instanceof Error) {
    return (
      Object.entries(value)
        .filter(([innerKey]) => !fieldsToIgnore.includes(innerKey))
        .reduce((acc, [innerKey, innerValue]) => ({
          ...acc,
          [innerKey]: innerValue,
        }), {})
    );
  }

  return value;
});

module.exports = ({ config: { log: logConfig } }) => {
  const {
    name, version, env, level,
  } = logConfig;

  return winston.createLogger({
    level,
    format: combine(
      timestamp(),
      json({
        replacer: createErrorReplacer(['output', 'isBoom', 'isServer', 'data']),
      }),
    ),
    defaultMeta: {
      name,
      version,
      env,
    },
    transports: [
      new Console(),
    ],
  });
};
