const packInfo = require('../package.json') || ''
const yargs = require('yargs')
const fs = require('fs')
const mkdirp = require('mkdirp')
const urllib = require('urllib')
const path = require('path')
const homedir = require('node-homedir')
let boilName = 'oneql-boilerplate-simple'
const os = require('os')
const compressing = require('compressing')
const copydir = require('node-copydir')
console.log(process.argv)

module.exports = class command {
    constructor() {
        const cwd = process.cwd()
        this.packageName = boilName // packInfo.name
        this.cwd = cwd
        this.argv = yargs.argv
        // 目录
        this.dir = this.argv._[0]
        this.targetDir = path.resolve(cwd, this.dir)
        this.request = urllib.request
        this.httpClient = urllib.create();
    }

    async curl(url, options) {
        return await this.httpClient.request(url, options)
    }

    async init() {
        const flag = await this.createCustromDir()
        if (!flag) return
        // todo 选择模板

        // 下载模板包
        let tempDir = await this.downloadBoilerplate(this.packageName)
        // 第二个参数，只能给相对路径
        await this.copyFiles(tempDir, this.dir)
        this.printUsage()
    }

    // 使用信息
    printUsage() {
        this.log(`usage:
          - cd ${this.targetDir}
          - npm install
          - npm start / npm run dev / npm test
        `)
    }

    // 项目初始化自定义目录
    async createCustromDir() {
        let dir = this.dir
        // 检查是否为空文件夹
        let emptyDir = this.isEmptyDir(dir)

        // 初始化目录结构
        if (emptyDir) {
            // await this.createDir(dir)
            return true
        } else {
            let files = fs.readdirSync(dir).filter(name => name[0] !== '.');

            this.log(`${dir} already exists and not empty:` + JSON.stringify(files))
            return false
        }
    }

    log(str) {
        process.stdout.write(str)
    }

    // isEmptyDir
    isEmptyDir(dir) {
        return !fs.existsSync(dir)
    }

    // 创建文件结构
    async createDir(dir) {
        await mkdirp.sync(dir);
    }

    // 获取package包信息
    async getPackageInfo(pkg) {
        let packUrl = `${this.getRegistryByType()}/${pkg}/latest`

        console.log('pack Url ', packUrl)

        let packInfo = await this.request(packUrl)

        let pack = packInfo.data.toString()

        return JSON.parse(pack)

    }

    // 获取模板
    async downloadBoilerplate(boilName) {
        const packInfo = await this.getPackageInfo(boilName)
        const tarball = packInfo.dist.tarball
        const saveDir = path.join(os.tmpdir(), 'oneql-init-boilerplate')

        const lastOneQLversion = '^' + packInfo.dist.tarball.match(/([0-9\.]*)(.tgz)/)[1]
        // await rimraf(saveDir)
        console.log('saveDir', saveDir)
        const res = await this.curl(tarball, { streaming: true, followRedirect: true })
        await compressing.tgz.uncompress(res.res, saveDir)
        this.log(`extract to ${saveDir}`)

        try {
            let packageConfig = fs.readFileSync(path.join(saveDir, '/package/package.json'))
            packageConfig = JSON.parse(packageConfig.toString())
            packageConfig.dependencies.oneql = lastOneQLversion
            let c = fs.writeFileSync(path.join(saveDir, '/package/package.json'), JSON.stringify(packageConfig, null, 2))
        } catch (e) {
            console.log('e', e)
        }

        return path.join(saveDir, '/package')
    }

    // copy
    async copyFiles(from, to) {
        return await copydir(from, to)
    }

    getRegistryByType(_key) {

        return 'https://registry.npm.taobao.org';
        // switch (key) {
        //   case 'china':
        //     return 'https://registry.npm.taobao.org';
        //   case 'npm':
        //     return 'https://registry.npmjs.org';
        //   default: {
        //     if (/^https?:/.test(key)) {
        //       return key.replace(/\/$/, '');
        //     } else {
        //       // support .npmrc
        //       const home = homedir();
        //       let url = process.env.npm_registry || process.env.npm_config_registry || 'https://registry.npmjs.org';
        //       if (fs.existsSync(path.join(home, '.cnpmrc')) || fs.existsSync(path.join(home, '.tnpmrc'))) {
        //         url = 'https://registry.npm.taobao.org';
        //       }
        //       url = url.replace(/\/$/, '');
        //       return url;
        //     }
        //   }
        // }
    }
}