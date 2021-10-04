module.exports = async (container, helperModules, modules) => {
  let error;
  const results = {};
  const stopHandlers = [];

  // start helper modules
  await Promise.all(
    Object.entries(helperModules)
      .map(async ([key, helperModule]) => {
        try {
          const { start, stop, register } = await helperModule(container);

          results[key] = await start();

          if (register && typeof register === 'function') {
            await register(results[key]);
          }

          stopHandlers.push(stop);
        }
        catch (e) {
          error = e;
        }
      }),
  );

  // start modules
  await Promise.all(
    Object.entries(modules)
      .map(async ([key, module]) => {
        try {
          const { start, stop, register } = await module(container);

          results[key] = await start();

          if (register && typeof register === 'function') {
            await register(results[key]);
          }

          stopHandlers.push(stop);
        }
        catch (e) {
          error = e;
        }
      }),
  );

  const exit = async () => {
    await Promise.all(
      stopHandlers
        .map((stopHandler) => stopHandler()),
    );
    // eslint-disable-next-line no-console
    console.info('Successful graceful shutdown', new Date().toISOString());

    process.exit(0);
  };

  return { error, results, exit };
};
