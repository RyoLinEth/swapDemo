# 🥞 Pancake Frontend

<p align="center">
  <a href="https://pancakeswap.finance">
      <img src="https://pancakeswap.finance/logo.png" height="128">
  </a>
</p>

This project contains the main features of the pancake application.

If you want to contribute, please refer to the [contributing guidelines](./CONTRIBUTING.md) of this project.

## Documentation

- [Info](doc/Info.md)
- [Cypress tests](doc/Cypress.md)

> Install dependencies using **yarn**

## `apps/web`
<details>
<summary>
How to start
</summary>

```sh
yarn
# 有时候依赖装不上报错，需要到web目录下，yarn run typechain
```

start the development server
```sh
# 跑这个 dev命令，才会映射本地的修改
yarn dev --no-daemon
```

build with production mode
```sh
# 必须加上后面这个  --no-daemon
yarn build  --no-daemon

# start the application after build。这个start命令跑的生产的配置，虽然也会在本地启动项目，但是本地修改了之后 不会触发改变
yarn start  --no-daemon
```
</details>

## `apps/aptos`
<details>
<summary>
How to start
</summary>

```sh
yarn dev:aptos
```
```sh
yarn turbo run build --filter=aptos-web
```
</details>

## `apps/blog`
<details>
<summary>
How to start
</summary>

```sh
yarn dev:blog
```
```sh
yarn turbo run build --filter=blog
```
</details>


## Packages

| Package                                                       | Description                                                                                                            |
|---------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------|
| [sdk](/packages/swap-sdk)                                     | An SDK for building applications on top of Pancakeswap                                                                 |
| [aptos-swap-sdk](/packages/aptos-swap-sdk)                    | Aptos version of Swap SDK                                                                                              |
| [swap-sdk-core](/packages/swap-sdk-core)                      | Swap SDK Shared code                                                                                                   |
| [wagmi](/packages/wagmi)                                      | Extension for [wagmi](https://github.com/wagmi-dev/wagmi), including bsc chain and binance wallet connector            |
| [awgmi](/packages/awgmi)                                      | connect to Aptos with similar wagmi React hooks.                                                                       |


>+ 主菜单：外层调用的menu，相当于layout，包括所有数据的传入 apps\web\src\components\Menu\index.tsx。传参，从这里面传入，调用的是下面的 uikit的menu
> + 主菜单，纯ui文件，数据是从上面那里传入的。最外层布局文件：packages\uikit\src\widgets\Menu\Menu.tsx。 包含头部菜单和底部菜单，内容区是通过路由传入的
> + 所有菜单的配置文件：apps\web\src\components\Menu\config\config.ts

>+ 主页面，内容区home；apps\web\src\views\Home\index.tsx；所有的列 就是这个组件

>+ swap组件：apps\web\src\views\Swap\index.tsx
> + swap的头部，设置，交易，热门代币 等一系列按钮：apps\web\src\views\Swap\components\CurrencyInputHeader.tsx
> + swap组件外层的包裹组件，是继承自uikit的swap，所有swap的基础都在uikit中: apps\web\src\views\Page.tsx
> + swap组件基础组件uikit中的的footer: packages\uikit\src\widgets\Swap\Footer.tsx

>+ 布局文件底部的footer：packages\uikit\src\components\Footer\Footer.tsx
> + footer下面展示的所有链接。关于、说明、开发者 packages\uikit\src\widgets\Menu\components\footerConfig.ts

> + footer下面的小链接图标 packages\uikit\src\components\Footer\config.tsx


>+ 页面展示的swap对应的Token和价格
> + 修改页面展示的swap代币的价格：apps\web\src\hooks\useBUSDPrice.ts
> + 修改页面展示的swap的token信息，如修改bnbtiger(Cake\usdt\usdc)之类的：packages\tokens\src\common.ts

> bngtiger: 0xAC68931B666E086E9de380CFDb0Fb5704a35dc2D