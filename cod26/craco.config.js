const webpack = require("webpack");

/**
 * Webpack 5 (react-scripts 5) dropped the automatic Node core-module polyfills
 * that @insforge/sdk's bundle still references. Map them to browser builds so
 * the app compiles.
 */
module.exports = {
  webpack: {
    configure: (config) => {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        buffer: require.resolve("buffer/"),
        vm: require.resolve("vm-browserify"),
      };
      // @insforge/shared-schemas ships source maps pointing at .ts files it
      // does not publish. Harmless, but it drowns out real warnings.
      config.ignoreWarnings = [
        ...(config.ignoreWarnings || []),
        /Failed to parse source map/,
      ];
      config.plugins.push(
        new webpack.ProvidePlugin({
          process: "process/browser.js",
          Buffer: ["buffer", "Buffer"],
        })
      );
      return config;
    },
  },
};
