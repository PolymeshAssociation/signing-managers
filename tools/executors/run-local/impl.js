'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === 'function' &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError('Generator is already executing.');
      while (_)
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y['return']
                  : op[0]
                  ? y['throw'] || ((t = y['return']) && t.call(y), 0)
                  : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
exports.__esModule = true;
var child_process_1 = require('child_process');
var fs_1 = __importDefault(require('fs'));
var path_1 = __importDefault(require('path'));
var webpack_1 = __importDefault(require('webpack'));
var webpack_dev_server_1 = __importDefault(require('webpack-dev-server'));
var tsconfig_paths_webpack_plugin_1 = __importDefault(require('tsconfig-paths-webpack-plugin'));
var html_webpack_plugin_1 = __importDefault(require('html-webpack-plugin'));
var node_polyfill_webpack_plugin_1 = __importDefault(require('node-polyfill-webpack-plugin'));
function echoExecutor(options, context) {
  return __awaiter(this, void 0, void 0, function () {
    var runInBrowser, scriptPath, port, root, tsConfigPath, absoluteScriptPath;
    return __generator(this, function (_a) {
      (runInBrowser = options.runInBrowser), (scriptPath = options.path), (port = options.port);
      root = context.root;
      tsConfigPath = path_1['default'].resolve(root, 'tsconfig.base.json');
      absoluteScriptPath = path_1['default'].resolve(root, scriptPath);
      if (!fs_1['default'].existsSync(absoluteScriptPath)) {
        throw new Error(
          'There is no script to run in path "'.concat(absoluteScriptPath, '". Please create one')
        );
      }
      if (runInBrowser) {
        return [2 /*return*/, startBrowser(absoluteScriptPath, tsConfigPath, port)];
      }
      return [2 /*return*/, startTsNode(absoluteScriptPath, tsConfigPath)];
    });
  });
}
exports['default'] = echoExecutor;
function startTsNode(scriptPath, tsConfigPath) {
  try {
    (0, child_process_1.execSync)(
      'yarn ts-node --project '.concat(tsConfigPath, ' ').concat(scriptPath),
      {
        stdio: 'inherit',
        encoding: 'utf8',
      }
    );
  } catch (err) {
    return { success: false };
  }
  return { success: true };
}
function startBrowser(scriptPath, tsConfigPath, port) {
  return __awaiter(this, void 0, void 0, function () {
    var config, compiler, server;
    var _this = this;
    return __generator(this, function (_a) {
      config = {
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
            directory: path_1['default'].join(__dirname, 'dist'),
            watch: true,
          },
          // Opens the browser when the watcher starts
          open: true,
          // No need for compression on development
          compress: false,
          port: port,
        },
        plugins: [
          new html_webpack_plugin_1['default']({
            title: 'Signing Managers Sandbox',
          }),
          new node_polyfill_webpack_plugin_1['default'](),
        ],
        output: {
          pathinfo: true,
          filename: 'devServer.js',
          path: path_1['default'].resolve(__dirname, 'dist'),
          publicPath: '/',
        },
        resolve: {
          extensions: ['.ts', '.js'],
          plugins: [
            new tsconfig_paths_webpack_plugin_1['default']({
              configFile: tsConfigPath,
            }),
          ],
        },
      };
      compiler = (0, webpack_1['default'])(config);
      server = new webpack_dev_server_1['default'](config.devServer, compiler);
      return [
        2 /*return*/,
        new Promise(function (resolve) {
          var handleSignal = function () {
            return __awaiter(_this, void 0, void 0, function () {
              return __generator(this, function (_a) {
                switch (_a.label) {
                  case 0:
                    return [4 /*yield*/, server.stop()];
                  case 1:
                    _a.sent();
                    resolve({ success: true });
                    return [2 /*return*/];
                }
              });
            });
          };
          server.startCallback(function () {
            process.on('SIGINT', handleSignal);
            process.on('SIGTERM', handleSignal);
          });
        }),
      ];
    });
  });
}
