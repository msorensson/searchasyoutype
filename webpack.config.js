var path = require('path');

module.exports = {
  entry: {
      'searchasyoutype.jquery': './src/searchasyoutype.jquery.js',
      'searchasyoutype': './src/searchasyoutype.js'
  },

  output: {
      filename: '[name].min.js',
      path: path.join(__dirname, '/dist'),
      publicPath: '',
      libraryTarget: 'umd'
  }
};
