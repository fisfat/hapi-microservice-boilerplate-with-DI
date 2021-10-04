const { Types: { ObjectId } } = require('mongoose');

const deepObjectIdToString = (value) => {
  if (value instanceof ObjectId) {
    return value.toString();
  }

  if (Array.isArray(value)) {
    return value.map(deepObjectIdToString);
  }

  if (value instanceof Object) {
    return (
      Object.entries(value)
        .reduce((acc, [innerKey, innerValue]) => ({
          ...acc,
          [innerKey]: deepObjectIdToString(innerValue),
        }), {})
    );
  }

  return value;
};

module.exports = {
  deepObjectIdToString,
};
