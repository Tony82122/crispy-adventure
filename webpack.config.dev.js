const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    liveReload: true,
    hot: true,
    open: true,
    static: [
      './',
      { directory: './node_modules/mathjax', publicPath: '/mathjax' },
      { directory: './node_modules/@mathjax/mathjax-newcm-font/chtml', publicPath: '/mathjax-font' },
    ],
  },
});
