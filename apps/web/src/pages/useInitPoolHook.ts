import React, { Fragment, useState, useEffect } from "react";
import { ethers } from 'ethers'
import CreatePoolABI from './pools/ABI/CreatePool.json';

const CreatePoolContract = "0xdFfbd6df5C039B27096e760fFD5B734dc33368F3"

const useInitPoolHook = () => {

    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);

    const [poolData, setPoolData] = useState([]);
    const [runningPool, setRunningPool] = useState([]);
    const [endPool, setEndPool] = useState([])

    const [blockNumber, setBlockNumber] = useState(0);
    const [isInit, setIsInit] = useState(false);

    const filterData = async (poolsData, _provider) => {
      if (isInit) return;
      let block = await _provider.getBlock("latest", false, true);
      console.log("Filtering")
      const tempRunningPool = [];
      const tempEndPool = [];
      for (let i = 0; i < poolsData.length; i++) {
          //  結束區塊
          let i_endBlock = ethers.utils.formatUnits(poolsData[i][6], "0")

          //  結束區塊 < 現在區塊 => 已結束
          if (i_endBlock < block.number) {
              tempEndPool.push(poolsData[i])
          }
          else {
            tempRunningPool.push(poolsData[i])
          }
      }
      const tempData = [
        ...tempRunningPool,
        ...tempEndPool
      ];
      sessionStorage.setItem('pool', JSON.stringify(tempData));
      setIsInit(true)
      // setIsFiltered(true)
    }

    const updateEthers = async () => {
        try {
          let tempProvider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(tempProvider);

          let tempSigner = tempProvider.getSigner();
          setSigner(tempSigner);

          let tempContract = new ethers.Contract(CreatePoolContract, CreatePoolABI, tempSigner)
          setContract(tempContract);

          let poolsData = await tempContract.viewSmartChef()
          if (poolsData !== null) {
            filterData(poolsData, tempProvider)
          }
        } catch(err) {
          console.log('666', err);
        }
    }

    const initPool = () => {
      debugger
      const data = sessionStorage.getItem('pool');
      if (data) {
        console.log('输出', data);
        return;
      }
      updateEthers()
    }

    // 对于这里的使用，如果session里面没值，就先调用initPool，然后取poolData；如果session有值，就直接取session得到值
    return {
      initPool,
      isInit
    };
};

export default useInitPoolHook;
