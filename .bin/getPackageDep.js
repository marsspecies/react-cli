module.exports = function (config = {}) {
    const {
        ifAddTs = false,
        ifAddEslint = false,
        ifAddTslint = false,
        ifAddRouter = false,
        ifAddRedux = false,
        ifAddUnitTest = false,
        ifAddMobx = false
    } = config;
    const tsPackageDep = {
        "@types/node": "^12.7.2",
        "@types/react": "^16.9.2",
        "ts-loader": "^6.0.4",
        "typescript": "^3.5.3",
    };
    const tslintPackageDep = {
        "tslint": "^5.19.0",
        "tslint-loader": "^3.5.4",
    };
    const eslintPackageDep = {
        "eslint": "^6.2.0",
        "eslint-loader": "^2.2.1",
        "eslint-plugin-babel": "^5.3.0",
        "eslint-plugin-react": "^7.14.3",
    };
    const unitTestPackageDep = {
        "jest": "^24.9.0",
    };
    const routerPackageDep = {
        "react-router-dom": "^5.0.1",
    };
    const mobxPackageDep = {
        "mobx": "^5.13.0",
        "mobx-react": "^6.1.3",
    };
    const reduxPackageDep = {
        "redux": "^4.0.4",
    };
    let basePackageJson = {
        "babel-core": "^6.26.3",
        "babel-eslint": "^10.0.2",
        "babel-loader": "^8.0.6",
        "babel-plugin-import": "^1.12.0",
        "babel-plugin-named-asset-import": "^0.3.2",
        "babel-preset-react-app": "^9.0.0",
        "clean-webpack-plugin": "^2.0.1",
        "css-loader": "^2.1.1",
        "cssnano": "^4.1.10",
        "extract-loader": "^3.1.0",
        "extract-text-webpack-plugin": "^4.0.0-beta.0",
        "file-loader": "^3.0.1",
        "html-loader": "^0.5.5",
        "html-webpack-plugin": "^3.2.0",
        "inquirer": "^6.5.0",
        "less": "^3.9.0",
        "less-loader": "^5.0.0",
        "mini-css-extract-plugin": "^0.6.0",
        "opener": "^1.5.1",
        "optimize-css-assets-webpack-plugin": "^5.0.3",
        "react": "^16.8.6",
        "react-dom": "^16.8.6",
        "style-loader": "^0.23.1",
        "terser-webpack-plugin": "^1.3.0",
        "url-loader": "^2.0.1",
        "webpack": "^4.30.0",
        "webpack-bundle-analyzer": "^3.3.2",
        "webpack-cli": "^3.3.1",
        "webpack-dev-server": "^3.3.1",
        "webpack-merge": "^4.2.1",
        "react-hot-loader": "next"
    }
    let dependencies = {...basePackageJson};
    if (ifAddTs) {
        dependencies = Object.assign({}, dependencies, tsPackageDep);
    }
    if (ifAddTslint) {
        dependencies = Object.assign({}, dependencies, tslintPackageDep);
    }
    if (ifAddEslint) {
        dependencies = Object.assign({}, dependencies, eslintPackageDep);
    }
    if (ifAddRouter) {
        dependencies = Object.assign({}, dependencies, routerPackageDep);
    }
    if (ifAddUnitTest) {
        dependencies = Object.assign({}, dependencies, unitTestPackageDep);
    }
    if (ifAddMobx) {
        dependencies = Object.assign({}, dependencies, mobxPackageDep);
    }
    if (ifAddRedux) {
        dependencies = Object.assign({}, dependencies, reduxPackageDep);
    }
    let arrDeps = Object.keys(dependencies).map((dep, i, arr) => {
        return {depName: dep, version: dependencies[dep], comma: i !== arr.length - 1 ? ',' : ''};
    });
    return arrDeps;
};
