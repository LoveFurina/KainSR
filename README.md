# 支持 [freesr-data.json](https://freesr-tools.pages.dev/) 配置导入，支持2.4.5X

# Fork of https://github.com/AzenKain/KainSR
如果有疑问，可以在discord上私聊我，请勿在reversed rooms里直接问这个
<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## *懒人步骤：先双击install.bat安装依赖，再双击run.bat一键编译启动服务端和代理（电脑需要安装nodejs）*
# 安装

```bash
# 前提步骤
$ npm install
```

## 1. 自动运行:
```bash
$ 双击文件 run.bat 即可一键运行
```
首次启动会花费较长时间进行编译，待提示`Server listening on port 23301`时说明启动完成


## 2. 手动运行:

### 2.1 流量代理

```bash
$ 您需要运行 FireFly.Proxy.v2 中的 FireflySR.Tool.Proxy.exe
```

### 2.2 运行应用

```bash
# development
$ npm run start

# watch mode 
$ npm run start:dev 

# production mode
$ npm run start:prod
```
## 3. 设置 freesr-data:
### 3.1 更新新的 freesr-data.json

```bash
$ 您可以在 src/data 中更新新的 freesr-data.json
```
### 3.2 在游戏内更新 data

```bash
$ 您可以在游戏中输入 /update 以从新的 freesr-data.json 更新新数据
```
### 3.3 改变多命途角色的命途

```bash
$ 您可以在游戏中输入 /id + 角色id 例如: /id 8006 (女同谐)来更新该角色的新命途
```
## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
