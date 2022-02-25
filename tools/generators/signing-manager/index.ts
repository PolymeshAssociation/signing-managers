import { Tree, formatFiles, installPackagesTask, updateJson } from '@nrwl/devkit';
import { libraryGenerator } from '@nrwl/node';
import requireFromString from 'require-from-string';

interface Schema {
  name: string;
}

export default async function (tree: Tree, schema: Schema) {
  const { name } = schema;
  const importPath = `@polymathnetwork/${name}`;
  const projectPath = `packages/${name}`;
  const srcPath = `${projectPath}/src`;

  await libraryGenerator(tree, {
    name,
    buildable: true,
    publishable: true,
    importPath,
  });

  // add types dependency and publish config
  updateJson(tree, `${projectPath}/package.json`, contents => {
    contents.publishConfig = {
      access: 'public',
    };
    contents.dependencies = {
      ...contents.dependencies,
      '@polymathnetwork/signing-manager-types': '*',
    };
    contents.peerDependencies = {
      ...contents.peerDependencies,
      '@polymathnetwork/polymesh-sdk': '>=13.0.0',
    };

    return contents;
  });

  // fix jest config to support ESM dependencies (remove "transform property")
  updateJsConfig(tree, `${projectPath}/jest.config.js`, jestConfig => {
    const { transform: _, ...rest } = jestConfig;

    return rest;
  });

  // modify build config and add release config
  updateJson(tree, `${projectPath}/project.json`, projectConfig => {
    projectConfig.targets.build.options = {
      ...projectConfig.targets.build.options,
      srcRootForCompilationRoot: srcPath,
    };

    projectConfig.targets.release = {
      executor: '@ng-easy/builders:semantic-release',
      configurations: {
        local: {
          force: true,
        },
      },
    };

    projectConfig.targets['run-local'] = {
      executor: './tools/executors/run-local:run-local',
      options: {
        runInBrowser: false,
        path: `${projectPath}/sandbox/index.ts`,
        port: 9000,
      },
    };

    return projectConfig;
  });

  // modify project tsconfig
  updateJson(tree, `${projectPath}/tsconfig.json`, tsConfig => {
    tsConfig.compilerOptions = {
      ...tsConfig.compilerOptions,
      forceConsistentCasingInFileNames: true,
      strict: true,
      noImplicitReturns: true,
      noFallthroughCasesInSwitch: true,
    };

    return tsConfig;
  });

  // modify test tsconfig
  updateJson(tree, `${projectPath}/tsconfig.spec.json`, testTsConfig => {
    testTsConfig.compilerOptions = {
      ...testTsConfig.compilerOptions,
      allowJs: true,
      esModuleInterop: true,
    };

    return testTsConfig;
  });

  // modify import paths in base tsconfig
  updateJson(tree, 'tsconfig.base.json', tsConfigBase => {
    tsConfigBase.compilerOptions.paths = {
      ...tsConfigBase.compilerOptions.paths,
      [importPath]: [srcPath],
    };

    return tsConfigBase;
  });

  await formatFiles(tree);
  return () => {
    installPackagesTask(tree);
  };
}

/**
 * Update a .config.js file's contents
 */
function updateJsConfig(tree: Tree, path: string, updater: (contents: any) => any) {
  const contents = tree.read(path, 'utf8');

  const contentsAsObject = requireFromString(contents);

  const updatedContents = updater(contentsAsObject);

  tree.write(path, `module.exports = ${JSON.stringify(updatedContents, null, 2)}`);
}
