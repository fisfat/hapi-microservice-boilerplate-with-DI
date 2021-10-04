const path = require('path');

const capitalize = (string) => (
  string.charAt(0).toUpperCase() + string.slice(1)
);

const formatNameWithGroup = (group) => ((filePath) => {
  const fileName = path.basename(filePath, path.extname(filePath));
  const capitalizedFileName = (
    fileName
      .split('-')
      .map(capitalize)
      .join('')
  );

  return [capitalizedFileName, group].join('');
});

module.exports = {
  formatNameWithGroup,
};
