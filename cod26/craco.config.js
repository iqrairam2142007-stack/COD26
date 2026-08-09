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

  /**
   * @insforge/shared-schemas is published as untranspiled ESM. Jest ignores
   * node_modules by default, so it hit `export *` and the whole suite failed
   * to start. Transform the @insforge packages instead of skipping them.
   */
  jest: {
    configure: (config) => {
      config.transformIgnorePatterns = [
        "node_modules/(?!(@insforge)/)",
        "^.+\\.module\\.(css|sass|scss)$",
      ];
      return config;
    },
  },
};
