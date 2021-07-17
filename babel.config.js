module.exports = function (api) {
  api.cache(true);

  return {
    comments: false,
    presets: [
      "@babel/env",
      "@babel/preset-typescript",
    ], 
    plugins: [
      "@babel/proposal-class-properties",
      "@babel/proposal-object-rest-spread",
    ],
  }
}