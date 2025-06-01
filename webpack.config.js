import path, { dirname } from "path";
import { fileURLToPath } from "url";
import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import { GenerateSW } from "workbox-webpack-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isProd = process.env.NODE_ENV === "production";

/** @type {import('webpack').Configuration} */
export default {
  mode: isProd ? "production" : "development",

  entry: "./src/index.js",

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.[contenthash].js",
    clean: true
  },

  resolve: {
    extensions: [".js", ".jsx"]
  },

  devServer: {
    static: {
      directory: path.resolve(__dirname, "public")
    },
    port: 8080,
    open: true
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      inject: "body"
    }),

    new CopyWebpackPlugin({
      patterns: [
        { from: path.resolve(__dirname, "public/manifest.webmanifest"), to: "." },
        { from: path.resolve(__dirname, "public/icons"), to: "icons" },
        { from: path.resolve(__dirname, "public/images"), to: "images" },
        { from: path.resolve(__dirname, "public/rules"), to: "rules" }
      ]
    }),

    ...(isProd ? [
      new GenerateSW({
        clientsClaim: true,
        skipWaiting: true,
        cleanupOutdatedCaches: true,
        additionalManifestEntries: [
          { url: "icons/icon-192.png", revision: null },
          { url: "icons/icon-512.png", revision: null }
        ]
      })
    ] : [])
  ],

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.json$/,
        type: "json"
      },
      {
        test: /\.(png|jpg|jpeg|svg)$/i,
        type: "asset/resource"
      }
    ]
  }
};
