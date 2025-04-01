module.exports = function (api) {
  // キャッシュを設定し、環境に応じて異なる設定を返す
  api.cache.using(() => process.env.NODE_ENV);
  
  const isProduction = api.env('production');
  
  return {
    presets: [
      '@babel/preset-env',
      '@babel/preset-react',
      '@babel/preset-typescript',
      '@emotion/babel-preset-css-prop'
    ],
    plugins: [
      '@emotion',
      // 開発環境でのみReact Refreshプラグインを有効にする
      !isProduction && [
        require.resolve('react-refresh/babel'),
        { 
          skipEnvCheck: true 
        }
      ]
    ].filter(Boolean)
  };
};