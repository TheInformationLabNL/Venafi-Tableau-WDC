const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/index.pug"
        })
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.styl$/,
                use: ["style-loader", "css-loader", "stylus-loader"]
            },
            {
                test: /\.(png|jpg)$/,
                loader: "file-loader",
                options: {
                    name: "[name].[ext]",
                    useRelativePath: true,
                    outputPath: "img",
                    publicPath: ""
                }
            },
            {
                test: /index\.html/,
                use: ["html-loader"]
            },
            {
                test: /\.pug$/,
                use: ["pug-loader"]
            },
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: ["babel-loader"]
            }
        ]
    },
    devServer: {
        contentBase: "./dist",
        compress: false,
        port: 8080,
        host: '0.0.0.0',
        public: 'devvm.dev.local:8080',
        allowedHosts: [
            '.dev.local'
        ]
    }
};
