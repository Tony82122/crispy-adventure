const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
    new CopyPlugin({
      patterns: [
        { from: 'img', to: 'img' },
        { from: 'css', to: 'css' },
        { from: 'js/huffman.js', to: 'js/huffman.js' },
        { from: 'js/vendor', to: 'js/vendor' },
        { from: 'icon.svg', to: 'icon.svg' },
        { from: 'favicon.ico', to: 'favicon.ico' },
        { from: 'robots.txt', to: 'robots.txt' },
        { from: 'icon.png', to: 'icon.png' },
        { from: '404.html', to: '404.html' },
        { from: 'site.webmanifest', to: 'site.webmanifest' },
        { from: 'node_modules/mathjax/tex-mml-chtml.js', to: 'mathjax/tex-mml-chtml.js' },
        { from: 'node_modules/mathjax/input', to: 'mathjax/input' },
        { from: 'node_modules/mathjax/output', to: 'mathjax/output' },
        { from: 'node_modules/mathjax/a11y', to: 'mathjax/a11y' },
        { from: 'node_modules/mathjax/sre', to: 'mathjax/sre' },
        { from: 'node_modules/mathjax/ui', to: 'mathjax/ui' },
        { from: 'node_modules/@mathjax/mathjax-newcm-font/chtml', to: 'mathjax-font' },
      ],
    }),
  ],
});
