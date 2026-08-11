import path from 'node:path';

import webpack, {
  type Configuration,
  type StatsCompilation,
  type StatsModule,
} from 'webpack';

import type { PackageFixture } from '../../artifact/helpers/package-fixture';

export type DependencyKind = 'esm' | 'cjs';

export type ConsumerBuildResult = Readonly<{
  bundlePath: string;
  errors: unknown[];
  moduleResources: string[];
  warnings: unknown[];
}>;

function collectModuleResources(modules: StatsModule[] | undefined): string[] {
  const resources = new Set<string>();

  const visit = (module: StatsModule): void => {
    const candidates = [module.name, module.identifier];
    for (const candidate of candidates) {
      if (typeof candidate !== 'string') continue;
      const normalized = candidate
        .replaceAll('\\', '/')
        .replace(/^.*!/, '')
        .replace(/^\.\//, '/');
      resources.add(normalized);
    }

    module.modules?.forEach(visit);
  };

  modules?.forEach(visit);
  return [...resources].sort();
}

export function buildConsumer(
  fixture: PackageFixture,
  dependencyKind: DependencyKind,
): Promise<ConsumerBuildResult> {
  const entry = path.join(
    fixture.packageRoot,
    'test',
    'fixtures',
    'consumer',
    dependencyKind === 'esm' ? 'esm-entry.tsx' : 'cjs-entry.cjs',
  );
  const outputPath = path.join(fixture.artifactRoot, `webpack-${dependencyKind}`);
  const localizationModulePath = path.join(
    fixture.packageRoot,
    'test',
    'fixtures',
    'SPFxProvisioningUIStrings.ts',
  );
  const workspaceNodeModules = path.resolve(fixture.packageRoot, '..', '..', 'node_modules');
  const config: Configuration = {
    mode: 'development',
    target: 'web',
    context: fixture.fixtureRoot,
    devtool: false,
    entry,
    output: {
      path: outputPath,
      filename: 'bundle.js',
      library: { type: 'commonjs2' },
    },
    externals: ({ request }, callback) => {
      if (request?.startsWith('@microsoft/sp-')) {
        callback(undefined, `commonjs ${request}`);
        return;
      }
      callback();
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js', '.cjs'],
      conditionNames: dependencyKind === 'esm'
        ? ['import', 'webpack', 'browser', 'default']
        : ['require', 'webpack', 'browser', 'default'],
      mainFields: ['browser', 'module', 'main'],
      modules: [path.join(fixture.fixtureRoot, 'node_modules')],
      alias: {
        SPFxProvisioningUIStrings: localizationModulePath,
      },
    },
    resolveLoader: {
      modules: [workspaceNodeModules],
    },
    module: {
      rules: [
        {
          test: /\.m?js$/,
          include: /node_modules[\\/]@griffel[\\/]/,
          resolve: { fullySpecified: false },
        },
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: {
            loader: path.join(workspaceNodeModules, 'ts-loader'),
            options: {
              transpileOnly: true,
              compilerOptions: {
                jsx: 'react',
                module: 'esnext',
                rootDir: fixture.packageRoot,
              },
            },
          },
        },
      ],
    },
  };

  return new Promise((resolve, reject) => {
    webpack(config, (error, stats) => {
      if (error) {
        reject(error);
        return;
      }
      if (!stats) {
        reject(new Error(`Webpack returned no stats for the ${dependencyKind} consumer.`));
        return;
      }

      const compilation = stats.toJson({
        all: false,
        errors: true,
        warnings: true,
        modules: true,
        nestedModules: true,
      }) as StatsCompilation;
      resolve({
        bundlePath: path.join(outputPath, 'bundle.js'),
        errors: compilation.errors ?? [],
        moduleResources: collectModuleResources(compilation.modules),
        warnings: compilation.warnings ?? [],
      });
    });
  });
}
