import { formatFiles, installPackagesTask, readJson, Tree, updateJson } from '@nrwl/devkit';
import { libraryGenerator } from '@nrwl/node';
import requireFromString from 'require-from-string';

interface Schema {
  name: string;
}

export default async function (tree: Tree, schema: Schema) {
  const { name } = schema;
  const importPath = `@polymeshassociation/${name}`;
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
    // fetch latest types version
    const { version: typesVersion } = readJson(tree, 'packages/types/package.json');

    contents.publishConfig = {
      access: 'public',
    };
    contents.dependencies = {
      ...contents.dependencies,
      '@polymeshassociation/signing-manager-types': `^${typesVersion}`,
    };
    contents.peerDependencies = {
      ...contents.peerDependencies,
      '@polymeshassociation/polymesh-sdk': '>=15.0.0',
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
    testTsConfig.include = [...testTsConfig.include, '**/mocks.ts'];

    return testTsConfig;
  });

  // modify build tsconfig
  updateJson(tree, `${projectPath}/tsconfig.lib.json`, buildTsConfig => {
    buildTsConfig.exclude = [...buildTsConfig.exclude, '**/mocks.ts', 'sandbox'];

    return buildTsConfig;
  });

  // modify import paths in base tsconfig
  updateJson(tree, 'tsconfig.base.json', tsConfigBase => {
    tsConfigBase.compilerOptions.paths = {
      ...tsConfigBase.compilerOptions.paths,
      [importPath]: [srcPath],
    };

    return tsConfigBase;
  });

  // add the new package to the accepted commit scopes
  updateJsConfig(tree, 'commitlint.config.js', commitlintConfig => {
    const { rules } = commitlintConfig;
    const scopeEnumRule = rules['scope-enum'];
    commitlintConfig.rules = {
      ...rules,
      'scope-enum': [scopeEnumRule[0], scopeEnumRule[1], [...scopeEnumRule[2], name]],
    };

    return commitlintConfig;
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
