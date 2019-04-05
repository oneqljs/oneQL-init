let packInfo = require('../package.json') || ''

module.exports = class command {
    constructor() {
        const currentPath = process.cwd()
        console.log('currentPath---', currentPath, ' package ', packInfo)
        this.packageName = packInfo.name
        this.currentPath = currentPath  

    }

    init() {
        // 初始化目录结构


    }

    // 创建文件结构
    createDirTree() {

    }

    // 获取package包信息
    getPackageInfo() {

    }

    // 获取模板
    downloadBoilerplate(boilName) {

    }
}