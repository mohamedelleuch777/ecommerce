import path from "path";
import TerserPlugin from "terser-webpack-plugin";
import JavaScriptObfuscator from "webpack-obfuscator";
import nodeExternals from "webpack-node-externals";

export default {
  mode: "production",
  entry: "./server.js",
  target: "node",
  output: {
    path: path.resolve("build"),
    filename: "bundle.cjs",
    libraryTarget: "commonjs2"
  },
  externals: [
    nodeExternals({
      // Include all node_modules in the bundle (set allowlist to match everything)
      allowlist: /.*/
    })
  ],
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()]
  },
  plugins: [
    // new JavaScriptObfuscator({
    //   rotateStringArray: true,
    //   stringArray: true,
    //   stringArrayThreshold: 0.75
    // })
  ],
  resolve: {
    extensions: [".js", ".json"],
    alias: {
      "aws-sdk": false, // ✅ Prevent bundling AWS SDK (if unused)
      "mock-aws-s3": false,
      "nock": false,
      "bluebird": false // ✅ Remove unneeded promise library
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"]
          }
        }
      }
    ]
  }
};
