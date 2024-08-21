const path = require("path");
const Dotenv = require("dotenv-webpack");

module.exports = (env) => {
  return {
    entry: {
      main: path.resolve(__dirname, "src/index.js"),
      background: path.resolve(__dirname, "background/index.js"),
      browser: path.resolve(__dirname, "browser/index.js"),
    },
    output: {
      filename: "[name].js",
      path: path.resolve(__dirname, "dist"),
    },
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: ["css-loader"],
        },
      ],
    },
    plugins: [new Dotenv()],
  };
};
