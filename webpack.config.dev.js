import webpack from 'webpack';
import path from 'path';

export default {
  devtool: 'inline-source-map',
  entry: './src/srcServer',
  target: 'node',
  output: {
    path: __dirname + '/dist', // Note: Physical files are only output by the production build task `npm run build`.
    publicPath: '/',
    filename: 'bundle.js',
		libraryTarget: "commonjs2"
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'src')
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  module: {
    loaders: [
      
    ]
  }
};
