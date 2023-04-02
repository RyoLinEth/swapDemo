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


## -1 代币相关

> bngtiger: 0xAC68931B666E086E9de380CFDb0Fb5704a35dc2D

> 官网: https://www.bnbtiger.top/static/picture/05.png

## 0 合约交互相关

>+ **合约交互操作**：交互操作需要一个json文件和一个需要交互的合约
> + json文件用来指定和合约交互的各种方法，如用type来指定event或者function或者constructor
> + 合约：合约只要和上面的json文件契合就行了

## 1 主页面

>+ 主菜单：外层调用的menu，相当于layout，包括所有数据的传入 apps\web\src\components\Menu\index.tsx。传参，从这里面传入，调用的是下面的 uikit的menu
> + 主菜单，纯ui文件，数据是从上面那里传入的。最外层布局文件：packages\uikit\src\widgets\Menu\Menu.tsx。 包含头部菜单和底部菜单，内容区是通过路由传入的
> + 所有菜单的配置文件：apps\web\src\components\Menu\config\config.ts

>+ 网络配置: 网络选择(展开与屏蔽测试网) apps\web\src\components\NetworkSwitcher.tsx
> + 修改网络配置(主网测试网什么的): apps\web\src\utils\wagmi.ts

>+ 主页面，内容区home；apps\web\src\views\Home\index.tsx；所有的列 就是这个组件

>+ 布局文件底部的footer：packages\uikit\src\components\Footer\Footer.tsx
> + footer下面展示的所有链接。关于、说明、开发者 packages\uikit\src\widgets\Menu\components\footerConfig.ts

> + footer下面的小链接图标 packages\uikit\src\components\Footer\config.tsx


## 2 swap页面

>+ swap组件：apps\web\src\views\Swap\index.tsx
> + swap的头部，设置，交易，热门代币 等一系列按钮：apps\web\src\views\Swap\components\CurrencyInputHeader.tsx
> + swap组件外层的包裹组件，是继承自uikit的swap，所有swap的基础都在uikit中: apps\web\src\views\Page.tsx
> + swap组件基础组件uikit中的的footer: packages\uikit\src\widgets\Swap\Footer.tsx
> + swap页面和添加流动性界面，选择token的整个代币选择框外层的**整个model**；管理代币的清单和代币也是这个父页面；apps\web\src\components\SearchModal\CurrencySearchModal.tsx
>   + swap页面和添加流动性界面，选择token里层整个**选择代币页面**(搜索代币的框，和下面代币列表的框；加流动性也是弹出这个框);apps\web\src\components\SearchModal\CurrencySearch.tsx
>   + swap页面和添加流动性界面，选择token里层整个**管理代币页面**;apps\web\src\components\SearchModal\Manage.tsx
>     + **管理代币页面下面默认展示的代币清单cmc、cg等**;apps\web\src\config\constants\lists.ts

>+ Token相关
>   + 处理swap页面，展示的token的hook，apps\web\src\state\lists\hooks.ts
>   + 处理swap页面，展示的所有默认代币，简单说也就是白名单token的json，apps\web\src\config\constants\tokenLists\pancake-default.tokenlist.json
>   + 所有页面Token对应的挖矿页面的图标(图标需要有一个svg一个png,并且需要用token的名字做后缀): apps\web\public\images\tokens

>+ 页面展示的swap对应的Token和价格
> + 修改页面展示的swap代币的价格：apps\web\src\hooks\useBUSDPrice.ts
> + 修改页面展示的swap的token信息，如修改bnbtiger(Cake\usdt\usdc)之类的：packages\tokens\src\common.ts


## 3 挖矿页面

>+ 单币质押挖矿页面Pool:
>   + 包裹下面PoolControls内容的外层页面,这个页面没什么逻辑,只传入一个pool: apps\web\src\views\Pools\index.tsx
>   + Pool最上面的search条件和下面列表的内容区主wrapper,和对应的pool列表的数据处理: packages\uikit\src\widgets\Pool\PoolControls.tsx

>+ 数据相关： 所有页面，pool和farm页面的所有reducer，apps\web\src\state\index.ts
>   + 存所有数据的Pool的reducer，state的key为pools： apps\web\src\state\pools\index.ts
>   + 从reducer的state里面获取pool数据的selector： apps\web\src\state\pools\selectors.ts
>   + **配置所有池子的配置文件**，结束的池子和未结束的池子都是这里：apps\web\src\config\constants\pools.tsx

>+ 合约交互操作：
>   + 类似service，从合约里面读取pool相关的各种参数：apps\web\src\state\pools\fetchPools.ts
>   + pool交互相关abi配置：apps\web\src\config\abi\sousChef.json

> 每一个pool都会调用setPoolsPublicData方法，来初始化质押相关的参数，这些都是从质押合约里面读出来的

>+ Token相关
>   + Token图标: 所有页面Token对应的挖矿页面的图标(图标需要有一个svg一个png,并且需要用token的名字做后缀): apps\web\public\images\tokens