const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // パスの解決
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        path: false, 
        fs: false
      };
      
      // Fast Refreshが絶対パスでreact-refreshをインポートする問題を修正
      
      // React Refreshの設定を適切に修正 - 相対パスを使用するよう強制
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        'react-refresh/runtime': require.resolve('react-refresh/runtime')
      };
      
      // react-refresh-webpack-pluginの設定を修正して絶対パスを避ける
      if (webpackConfig.plugins) {
        for (const plugin of webpackConfig.plugins) {
          if (plugin.constructor && plugin.constructor.name === 'ReactRefreshPlugin') {
            plugin.options = {
              ...plugin.options,
              exclude: [/node_modules/],
              include: [/\.([jt]sx?|flow)$/i],
              overlay: false // オーバーレイを無効化して問題を回避
            };
          }
        }
      }
      
      // Babel loaderの設定を更新
      const babelLoaderRule = webpackConfig.module.rules.find(
        (rule) => rule.oneOf && Array.isArray(rule.oneOf)
      ).oneOf.find(
        (rule) => 
          rule.use && 
          Array.isArray(rule.use) && 
          rule.use.some(useEntry => useEntry.loader && useEntry.loader.includes('babel-loader'))
      );

      if (babelLoaderRule && babelLoaderRule.use) {
        const babelLoaderUse = babelLoaderRule.use.find(
          useEntry => useEntry.loader && useEntry.loader.includes('babel-loader')
        );
        
        if (babelLoaderUse && babelLoaderUse.options && babelLoaderUse.options.plugins) {
          // react-refreshプラグインが絶対パスを使わないようにする
          babelLoaderUse.options.plugins = babelLoaderUse.options.plugins.map(plugin => {
            if (Array.isArray(plugin) && plugin[0] && plugin[0].includes && plugin[0].includes('react-refresh/babel')) {
              return [require.resolve('react-refresh/babel'), { 
                ...plugin[1],
                skipEnvCheck: true 
              }];
            }
            return plugin;
          });
        }
      }
      
      // src外のモジュールへの制限を緩和 (プロダクションビルドのみ)
      if (process.env.NODE_ENV === 'production') {
        webpackConfig.module.rules.forEach(rule => {
          if (rule.oneOf) {
            rule.oneOf.forEach(oneOfRule => {
              if (oneOfRule.loader && oneOfRule.loader.includes('file-loader')) {
                oneOfRule.exclude = [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/];
              }
            });
          }
        });
      }

      // ビルドプロセスで絶対パスを許可する特殊な設定（開発・本番共通）
      // ModuleScopePluginを無効化 (これによりsrc外のファイルのインポートを許可)
      const moduleScopePlugin = webpackConfig.resolve.plugins && webpackConfig.resolve.plugins.find(
        plugin => plugin.constructor && plugin.constructor.name === 'ModuleScopePlugin'
      );
      if (moduleScopePlugin) {
        webpackConfig.resolve.plugins = webpackConfig.resolve.plugins.filter(
          plugin => !(plugin.constructor && plugin.constructor.name === 'ModuleScopePlugin')
        );
      }
      
      // react-refreshの問題を解決するための追加対応（特にutils内のファイル向け）
      if (webpackConfig.module && webpackConfig.module.rules) {
        // 特定のファイルに対する例外処理を追加
        const problematicFiles = [
          '/src/utils/offline.utils.ts',
          '/src/utils/sharedTypes.ts', 
          '/src/utils/storage.utils.ts'
        ];
        
        // 問題のあるファイルを特別に処理する代わりに、ModuleScopePluginのチェックをスキップ
        // より適切な方法として、module scope チェックを無効化するだけに留める
      }

      return webpackConfig;
    }
  }
};