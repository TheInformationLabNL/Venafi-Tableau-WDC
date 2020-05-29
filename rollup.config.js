// heavy use of modern javascript functions running in an old environment.
import buble from "@rollup/plugin-buble";
import nodent from "rollup-plugin-nodent";

// To (hopefully) autofix weirdness in css-compatibility in older engines
import scss from "rollup-plugin-scss";
import postcss from "rollup-plugin-postcss";
import postcssPresetEnv from "postcss-preset-env";

// to copy the index.html file
import copy from "rollup-plugin-copy";
import watchAssets from "rollup-plugin-watch-assets";

// dev server
import serve from "rollup-plugin-serve";
import { eslint } from "rollup-plugin-eslint";

const production = !process.env.ROLLUP_WATCH;

module.exports = {
    input: "src/index.js",
    output: {
        sourcemap: production ? false : "inline",
        dir: "dist/",
        format: "iife",
        strict: false,
    },
    plugins: [
        watchAssets({
            assets: ["public/index.html"],
        }),
        eslint({
            include: "src/**.js",
            exclude: "node_modules/**",
            envs: ["browser"],
        }),
        postcss({
            preprocessor: (content, id) =>
                new Promise((resolve) => {
                    const result = scss.renderSync({ file: id });
                    resolve({ code: result.css.toString() });
                }),

            plugins: [postcssPresetEnv()],
            sourceMap: production ? false : "inline",
            minimize: production ? true : false,
            extract: true,
        }),
        nodent({
            promises: true,
            noRuntime: true,
            sourceMap: true,
        }),
        buble({
            transforms: {
                asyncAwait: false,
            },
        }),
        copy({
            targets: [
                { src: "public/index.html", dest: "dist/", rename: "index.html" },
                { src: "src/img", dest: "dist/" }
            ],
        }),
        !production &&
            serve({
                contentBase: "dist",
                host: "172.18.96.210",
                port: "8080",
            }),
    ],
    watch: {
        clearScreen: false,
    },
};
