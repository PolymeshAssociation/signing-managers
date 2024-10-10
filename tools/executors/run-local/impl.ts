import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { ExecutorContext } from '@nx/devkit';
import Webpack, { Configuration } from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';

export interface RunLocalExecutorOptions {
  runInBrowser: boolean;
  path: string;
  port: number;
}

export default async function echoExecutor(
  options: RunLocalExecutorOptions,
  context: ExecutorContext
) {
  const { runInBrowser, path: scriptPath, port } = options;
  const { root } = context;

  const tsConfigPath = path.resolve(root, 'tsconfig.base.json');
  const absoluteScriptPath = path.resolve(root, scriptPath);

  if (!fs.existsSync(absoluteScriptPath)) {
    throw new Error(`There is no script to run in path "${absoluteScriptPath}". Please create one`);
  }

  if (runInBrowser) {
    return startBrowser(absoluteScriptPath, tsConfigPath, port);
  }

  return startTsNode(absoluteScriptPath, tsConfigPath);
}

function startTsNode(scriptPath: string, tsConfigPath: string) {
  try {
    execSync(`yarn ts-node --project ${tsConfigPath} ${scriptPath}`, {
      stdio: 'inherit',
      encoding: 'utf8',
    });
  } catch (err) {
    return { success: false };
  }

  return { success: true };
}

async function startBrowser(scriptPath: string, tsConfigPath: string, port: number) {
  const config: Configuration = {
    devtool: 'eval',
    entry: ['@babel/polyfill', scriptPath],
    mode: 'development',
    module: {
      rules: [
        {
          test: /\.ts$/,
          loader: 'ts-loader',
          options: {
            configFile: tsConfigPath,
          },
        },
        {
          test: /\.m?js$/,
          include: /node_modules\/@polkadot/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  {
                    exclude: ['transform-exponentiation-operator'],
                  },
                ],
              ],
              plugins: [
                '@babel/plugin-transform-modules-commonjs',
                '@babel/plugin-transform-runtime',
              ],
            },
          },
        },
        {
          test: /\.js$/,
          loader: require.resolve('@open-wc/webpack-import-meta-loader'),
        },
      ],
    },
    devServer: {
      static: {
        // This is not written to the disk, but has to be named anyways
        directory: path.join(__dirname, 'dist'),
        watch: true,
      },
      // Opens the browser when the watcher starts
      open: true,
      // No need for compression on development
      compress: false,
      port,
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: 'Signing Managers Sandbox',
      }),
      new NodePolyfillPlugin(),
    ],
    output: {
      pathinfo: true,
      filename: 'devServer.js',
      path: path.resolve(__dirname, 'dist'),
      publicPath: '/',
    },
    resolve: {
      extensions: ['.ts', '.js'],
      plugins: [
        new TsconfigPathsPlugin({
          configFile: tsConfigPath,
        }),
      ],
    },
  };

  const compiler = Webpack(config);
  const server = new WebpackDevServer(config.devServer, compiler);

  return new Promise(resolve => {
    const handleSignal = async () => {
      await server.stop();

      resolve({ success: true });
    };

    server.startCallback(() => {
      process.on('SIGINT', handleSignal);
      process.on('SIGTERM', handleSignal);
    });
  });
}
