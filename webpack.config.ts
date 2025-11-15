import path from 'node:path';
import type { Configuration } from 'webpack';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const config: Configuration = {
  entry: './index.ts',
  target: 'node18',
  output: {
    path: path.resolve(import.meta.dirname, 'dist'),
    filename: 'index.js',
    clean: true,
    module: true,
  },
  resolve: {
    extensions: ['.ts', '.js'],
    extensionAlias: {
      '.js': ['.ts', '.js'],
      '.mjs': ['.mts', '.mjs'],
      '.cjs': ['.cts', '.cjs'],
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'front',
          to: 'front',
        },
      ],
    }),
  ],
  externals: {
    'utf-8-validate': 'commonjs utf-8-validate',
    bufferutil: 'commonjs bufferutil',
  },
  devtool: 'source-map',
  externalsPresets: { node: true },
  experiments: {
    outputModule: true,
  },
  mode: 'production',
};

export default config;
