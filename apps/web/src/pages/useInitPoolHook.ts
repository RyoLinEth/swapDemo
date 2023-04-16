import React, { Fragment, useState, useEffect } from "react";
import { ethers } from 'ethers'
import { ChainId, ERC20Token } from "@pancakeswap/sdk";
import {allPool} from 'config/constants/pools'
import CreatePoolABI from './pools/ABI/CreatePool.json';
import TokenABI from './pools/ABI/TokenABI.json'
import { PoolCategory } from "@pancakeswap/uikit/src/widgets/Pool";
import { bscTokens } from "@pancakeswap/tokens";
import { batch, useSelector } from 'react-redux'
import { useAppDispatch } from 'state'
import { setInitPoolsData } from "state/pools";

const CreatePoolContract = "0xdFfbd6df5C039B27096e760fFD5B734dc33368F3"

const useInitPoolHook = () => {
    const dispatch = useAppDispatch()

    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);

    const [poolData, setPoolData] = useState([]);
    const [runningPool, setRunningPool] = useState([]);
    const [endPool, setEndPool] = useState([])

    const [blockNumber, setBlockNumber] = useState(0);
    const [isInit, setIsInit] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const filterData = async (poolsData, _provider, _tempSigner) => {
      if (isInit) return;
      try {
        let block = await _provider.getBlock("latest", false, true);
        console.log("Filtering")
        const tempRunningPool = [];
        const tempEndPool = [];
        for (let i = 0; i < poolsData.length; i++) {
            const [id, tempStakingToken, tempEarningToken, ...rest] = poolsData[i];
            //  結束區塊。
            let i_endBlock = ethers.utils.formatUnits(poolsData[i][6], "0")
            // 第三个参数，传provider和sign的区别是；provider不用交易，但是signer是必须要进行交易的.0xC75Cc71022Bf0EC150dfC03d954737ce027Ea12e
            const tempTokenContract = new ethers.Contract(tempStakingToken, TokenABI, _tempSigner)
            const name = await tempTokenContract.name();
            const symbol = await tempTokenContract.symbol();
            const decimals = await tempTokenContract.decimals();
            // const a = new ERC20Token(
            //   ChainId.BSC_TESTNET,
            //   '0x3304dd20f6Fe094Cb0134a6c8ae07EcE26c7b6A7',
            //   18,
            //   'BUSD',
            //   'Binance USD',
            // )
            const a = new ERC20Token(
              ChainId.BSC_TESTNET,
              tempStakingToken,
              decimals,
              name,
              symbol,
              '',
            )
            // 第三个参数，传provider和sign的区别是；provider不用交易，但是signer是必须要进行交易的
            const tempTokenContract2 = new ethers.Contract(tempEarningToken, TokenABI, _tempSigner)
            const name2 = await tempTokenContract2.name();
            const symbol2 = await tempTokenContract2.symbol();
            const decimals2 = await tempTokenContract2.decimals();
            // const b = new ERC20Token(
            //   ChainId.BSC_TESTNET,
            //   '0xE02dF9e3e622DeBdD69fb838bB799E3F168902c5',
            //   18,
            //   'BAKE',
            //   'Bakeryswap Token',
            //   'https://www.bakeryswap.org/',
            // )
            const b = new ERC20Token(
              ChainId.BSC_TESTNET,
              tempEarningToken,
              decimals2,
              name2,
              symbol2,
              '',
            )
            //  結束區塊 < 現在區塊 => 已結束
            if (i_endBlock < block.number) {
                tempEndPool.push([id, a, b, ...rest])
            }
            else {
              tempRunningPool.push([id, a, b, ...rest])
            }
        }
        const tempData = [
          ...tempRunningPool.map(item => {
            return {
              // 最后面的0是表示要在当前值后面乘以10的多少次方；默认是18，即要在当前值乘以10的18次方 。这个方法是用来把wei转换为wei的
              sousId: +ethers.utils.formatUnits(item?.[0], "0") + 1,
              stakingToken: item?.[1]?.serialize,
              earningToken: item?.[2]?.serialize,
                contractAddress: {
                97: item?.[3],
                56: item?.[3],
              },
              poolCategory: item?.[4],
              tokenPerBlock: ethers.utils.formatEther(item?.[5]),
            };
          }),
          ...tempEndPool.map(item => {
            return {
              sousId: +ethers.utils.formatUnits(item?.[0], "0") + 1,
              stakingToken: item?.[1]?.serialize,
              earningToken: item?.[2]?.serialize,
                contractAddress: {
                97: item?.[3],
                56: item?.[3],
              },
              poolCategory: item?.[4],
              tokenPerBlock: ethers.utils.formatEther(item?.[5]),
              isFinished: true, // 表示结束状态的字断
            };
          })
        ];
        // tempData.unshift({
        //   sousId: 0, // 这个0，代表cake池子，即第一个池子
        //   stakingToken: bscTokens.cake.serialize,
        //   earningToken: bscTokens.cake?.serialize,
        //   contractAddress: {
        //     97: '0xB4A466911556e39210a6bB2FaECBB59E4eB7E43d',
        //     56: '0xa5f8C5Dbd5F286960b9d90548680aE5ebFf07652',
        //   },
        //   poolCategory: PoolCategory.CORE,
        //   tokenPerBlock: '10',
        // },);
        // @ts-ignore
        allPool.pools = tempData;
        batch(() => {
          dispatch(setInitPoolsData(tempData))
        })
        sessionStorage.setItem('pool', JSON.stringify(tempData));
        setIsInit(true)
        setIsLoading(false);

      } catch(err) {
        console.log('err', err);
        setIsLoading(false);
      }
      // {
      //   sousId: 0, // 这个0，代表cake池子，即第一个池子
      //   stakingToken: bscTokens.cake,
      //   earningToken: bscTokens.cake,
      //   contractAddress: {
      //     97: '0xB4A466911556e39210a6bB2FaECBB59E4eB7E43d',
      //     56: '0xa5f8C5Dbd5F286960b9d90548680aE5ebFf07652',
      //   },
      //   poolCategory: PoolCategory.CORE,
      //   tokenPerBlock: '10',
      //   isFinished: false,
      // },
      // setIsFiltered(true)
    }

    const updateEthers = async () => {
        try {
          setIsLoading(true);
          let tempProvider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(tempProvider);

          let tempSigner = tempProvider.getSigner();
          setSigner(tempSigner);

          let tempContract = new ethers.Contract(CreatePoolContract, CreatePoolABI, tempSigner)
          setContract(tempContract);

          let poolsData = await tempContract.viewSmartChef()
          if (poolsData !== null) {
            filterData(poolsData, tempProvider, tempSigner)
          }
        } catch(err) {
          console.log('666', err);
          setIsLoading(false);
        }
    }

    const initPool = () => {
      debugger
      const data = sessionStorage.getItem('pool');
      if (data) {
        console.log('输出', data);
        return;
      }
      if (!isLoading) {
        updateEthers()
      }
    }

    // 对于这里的使用，如果session里面没值，就先调用initPool，然后取poolData；如果session有值，就直接取session得到值
    return {
      initPool,
      isInit
    };
};

export default useInitPoolHook;
