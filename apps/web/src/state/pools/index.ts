import { createAsyncThunk, createSlice, PayloadAction, isAnyOf } from '@reduxjs/toolkit'
import BigNumber from 'bignumber.js'
import keyBy from 'lodash/keyBy'
import poolsConfig from 'config/constants/pools'
import {
  PoolsState,
  SerializedPool,
  SerializedVaultFees,
  SerializedCakeVault,
  SerializedLockedVaultUser,
  PublicIfoData,
  SerializedVaultUser,
  SerializedLockedCakeVault,
} from 'state/types'
import { ChainId } from '@pancakeswap/sdk'
import { getPoolApr } from 'utils/apr'
import { BIG_ZERO } from '@pancakeswap/utils/bigNumber'
import cakeAbi from 'config/abi/cake.json'
import { getCakeVaultAddress, getCakeFlexibleSideVaultAddress } from 'utils/addressHelpers'
import { multicallv2 } from 'utils/multicall'
import { bscTokens } from '@pancakeswap/tokens'
import { isAddress } from 'utils'
import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'
import { bscRpcProvider } from 'utils/providers'
import { getPoolsPriceHelperLpFiles } from 'config/constants/priceHelperLps/index'
import fetchFarms from '../farms/fetchFarms'
import getFarmsPrices from '../farms/getFarmsPrices'
import {
  fetchPoolsBlockLimits,
  fetchPoolsProfileRequirement,
  fetchPoolsStakingLimits,
  fetchPoolsTotalStaking,
} from './fetchPools'
import {
  fetchPoolsAllowance,
  fetchUserBalances,
  fetchUserPendingRewards,
  fetchUserStakeBalances,
} from './fetchPoolsUser'
import { fetchPublicVaultData, fetchVaultFees, fetchPublicFlexibleSideVaultData } from './fetchVaultPublic'
import { getTokenPricesFromFarm } from './helpers'
import { resetUserState } from '../global/actions'
import { fetchUserIfoCredit, fetchPublicIfoData } from './fetchUserIfo'
import { fetchVaultUser, fetchFlexibleSideVaultUser } from './fetchVaultUser'

// 池子初始的所有数据，这个应该是样式数据之类的
export const initialPoolVaultState = Object.freeze({
  totalShares: null,
  totalLockedAmount: null,
  pricePerFullShare: null,
  totalCakeInVault: null,
  fees: {
    performanceFee: null,
    withdrawalFee: null,
    withdrawalFeePeriod: null,
  },
  userData: {
    isLoading: true,
    userShares: null,
    cakeAtLastUserAction: null,
    lastDepositedTime: null,
    lastUserActionTime: null,
    credit: null,
    locked: null,
    lockStartTime: null,
    lockEndTime: null,
    userBoostedShare: null,
    lockedAmount: null,
    currentOverdueFee: null,
    currentPerformanceFee: null,
  },
  creditStartBlock: null,
})

export const initialIfoState = Object.freeze({
  credit: null,
  ceiling: null,
})

// 池子初始的所有数据
const initialState: PoolsState = {
  data: [...poolsConfig], // 所有池子的数据
  userDataLoaded: false, // 是否加载了用户数据，用户钱包登陆之后，这个值为true
  cakeVault: initialPoolVaultState,
  ifo: initialIfoState,
  cakeFlexibleSideVault: initialPoolVaultState,
}

const cakeVaultAddress = getCakeVaultAddress()

export const fetchCakePoolPublicDataAsync = () => async (dispatch, getState) => {
  const farmsData = getState().farms.data
  const prices = getTokenPricesFromFarm(farmsData)

  const cakePool = poolsConfig.filter((p) => p.sousId === 0)[0]

  const stakingTokenAddress = isAddress(cakePool.stakingToken.address)
  const stakingTokenPrice = stakingTokenAddress ? prices[stakingTokenAddress] : 0

  const earningTokenAddress = isAddress(cakePool.earningToken.address)
  const earningTokenPrice = earningTokenAddress ? prices[earningTokenAddress] : 0

  dispatch(
    setPoolPublicData({
      sousId: 0,
      data: {
        stakingTokenPrice,
        earningTokenPrice,
      },
    }),
  )
}

export const fetchCakePoolUserDataAsync = (account: string, chainId: number = ChainId.BSC) => async (dispatch) => {
  const allowanceCall = {
    address: bscTokens.cake.address,
    name: 'allowance',
    params: [account, cakeVaultAddress],
  }
  const balanceOfCall = {
    address: bscTokens.cake.address,
    name: 'balanceOf',
    params: [account],
  }
  const cakeContractCalls = [allowanceCall, balanceOfCall]
  const [[allowance], [stakingTokenBalance]] = await multicallv2({ abi: cakeAbi, calls: cakeContractCalls, chainId })

  dispatch(
    setPoolUserData({
      sousId: 0,
      data: {
        allowance: new BigNumber(allowance.toString()).toJSON(),
        stakingTokenBalance: new BigNumber(stakingTokenBalance.toString()).toJSON(),
      },
    }),
  )
}

// 从质押合约里面读取，给每一个pools增加 totalStaked(总共质押数量)、startBlock、endBlock、stakingTokenPrice、earningTokenPrice、profileRequirement 参数
export const fetchPoolsPublicDataAsync =
  (currentBlockNumber: number, chainId: number) => async (dispatch, getState) => {
    try {
      console.log('调用合约之前');
      debugger
      // 只有进行中的池子，会调用这个函数
      const [blockLimits, totalStakings, profileRequirements, currentBlock] = await Promise.all([
        fetchPoolsBlockLimits(chainId), // 读取开始区块\结束区块
        fetchPoolsTotalStaking(chainId), // 读取总质押数量
        fetchPoolsProfileRequirement(chainId), // 读取profileRequirements
        currentBlockNumber ? Promise.resolve(currentBlockNumber) : bscRpcProvider.getBlockNumber(), // 读取当前的区块
      ])
      console.log('调用合约之后');

      const blockLimitsSousIdMap = keyBy(blockLimits, 'sousId')
      const totalStakingsSousIdMap = keyBy(totalStakings, 'sousId')

      const priceHelperLpsConfig = getPoolsPriceHelperLpFiles(chainId)
      const activePriceHelperLpsConfig = priceHelperLpsConfig.filter((priceHelperLpConfig) => {
        return (
          poolsConfig
            .filter(
              (pool) => pool.earningToken.address.toLowerCase() === priceHelperLpConfig.token.address.toLowerCase(),
            )
            .filter((pool) => {
              const poolBlockLimit = blockLimitsSousIdMap[pool.sousId]
              if (poolBlockLimit) {
                return poolBlockLimit.endBlock > currentBlock
              }
              return false
            }).length > 0
        )
      })
      const poolsWithDifferentFarmToken =
        activePriceHelperLpsConfig.length > 0 ? await fetchFarms(priceHelperLpsConfig, chainId) : []
      const farmsData = getState().farms.data
      const bnbBusdFarm =
        activePriceHelperLpsConfig.length > 0
          ? farmsData.find((farm) => farm.token.symbol === 'BUSD' && farm.quoteToken.symbol === 'WBNB')
          : null
      const farmsWithPricesOfDifferentTokenPools = bnbBusdFarm
        ? getFarmsPrices([bnbBusdFarm, ...poolsWithDifferentFarmToken], chainId)
        : []

      const prices = getTokenPricesFromFarm([...farmsData, ...farmsWithPricesOfDifferentTokenPools])

      // 给每一个pools增加 totalStaked(总共质押数量)、startBlock、endBlock、stakingTokenPrice、earningTokenPrice、profileRequirement 参数
      const liveData = poolsConfig.map((pool) => {
        const blockLimit = blockLimitsSousIdMap[pool.sousId]
        const totalStaking = totalStakingsSousIdMap[pool.sousId]
        const isPoolEndBlockExceeded =
          currentBlock > 0 && blockLimit ? currentBlock > Number(blockLimit.endBlock) : false
        const isPoolFinished = pool.isFinished || isPoolEndBlockExceeded

        const stakingTokenAddress = isAddress(pool.stakingToken.address)
        const stakingTokenPrice = stakingTokenAddress ? prices[stakingTokenAddress] : 0

        const earningTokenAddress = isAddress(pool.earningToken.address)
        const earningTokenPrice = earningTokenAddress ? prices[earningTokenAddress] : 0
        const apr = !isPoolFinished
          ? getPoolApr(
              stakingTokenPrice,
              earningTokenPrice,
              getBalanceNumber(new BigNumber(totalStaking.totalStaked), pool.stakingToken.decimals),
              parseFloat(pool.tokenPerBlock),
            )
          : 0

        const profileRequirement = profileRequirements[pool.sousId] ? profileRequirements[pool.sousId] : undefined

        return {
          ...blockLimit,
          ...totalStaking,
          profileRequirement,
          stakingTokenPrice,
          earningTokenPrice,
          apr,
          isFinished: isPoolFinished,
        }
      })

      dispatch(setPoolsPublicData(liveData))
    } catch (error) {
      console.error('[Pools Action] error when getting public data', error)
    }
  }

// 从质押合约里面读取，给每一个pools增加 numberBlocksForUserLimit、stakingLimit 参数
export const fetchPoolsStakingLimitsAsync = (chainId: number = ChainId.BSC) => async (dispatch, getState) => {
  const poolsWithStakingLimit = getState()
    .pools.data.filter(({ stakingLimit }) => stakingLimit !== null && stakingLimit !== undefined)
    .map((pool) => pool.sousId)

  try {
    const stakingLimits = await fetchPoolsStakingLimits(poolsWithStakingLimit, chainId)

    const stakingLimitData = poolsConfig.map((pool) => {
      if (poolsWithStakingLimit.includes(pool.sousId)) {
        return { sousId: pool.sousId }
      }
      const { stakingLimit, numberBlocksForUserLimit } = stakingLimits[pool.sousId] || {
        stakingLimit: BIG_ZERO,
        numberBlocksForUserLimit: 0,
      }
      return {
        sousId: pool.sousId,
        stakingLimit: stakingLimit.toJSON(),
        numberBlocksForUserLimit,
      }
    })

    // 给每一个pools增加 numberBlocksForUserLimit、stakingLimit(每个用户的单币质押上限) 参数
    dispatch(setPoolsPublicData(stakingLimitData))
  } catch (error) {
    console.error('[Pools Action] error when getting staking limits', error)
  }
}

export const fetchPoolsUserDataAsync = createAsyncThunk<
  { sousId: number; allowance: any; stakingTokenBalance: any; stakedBalance: any; pendingReward: any }[],
  { account: string; chainId: number }
>('pool/fetchPoolsUserData', async ({account, chainId = ChainId.BSC}, { rejectWithValue }) => {
  try {
    const [allowances, stakingTokenBalances, stakedBalances, pendingRewards] = await Promise.all([
      fetchPoolsAllowance(account, chainId),
      fetchUserBalances(account, chainId),
      fetchUserStakeBalances(account, chainId),
      fetchUserPendingRewards(account, chainId),
    ])

    const userData = poolsConfig.map((pool) => ({
      sousId: pool.sousId,
      allowance: allowances[pool.sousId],
      stakingTokenBalance: stakingTokenBalances[pool.sousId],
      stakedBalance: stakedBalances[pool.sousId],
      pendingReward: pendingRewards[pool.sousId],
    }))
    return userData
  } catch (e) {
    return rejectWithValue(e)
  }
})

export const updateUserAllowance = createAsyncThunk<
  { sousId: number; field: string; value: any },
  { sousId: number; account: string; chainId: number }
>('pool/updateUserAllowance', async ({ sousId, account, chainId = ChainId.BSC }) => {
  const allowances = await fetchPoolsAllowance(account,chainId)
  return { sousId, field: 'allowance', value: allowances[sousId] }
})

export const updateUserBalance = createAsyncThunk<
  { sousId: number; field: string; value: any },
  { sousId: number; account: string; chainId: number }
>('pool/updateUserBalance', async ({ sousId, account, chainId = ChainId.BSC }) => {
  const tokenBalances = await fetchUserBalances(account,chainId)
  return { sousId, field: 'stakingTokenBalance', value: tokenBalances[sousId] }
})

export const updateUserStakedBalance = createAsyncThunk<
  { sousId: number; field: string; value: any },
  { sousId: number; account: string; chainId: number }
>('pool/updateUserStakedBalance', async ({ sousId, account, chainId = ChainId.BSC }) => {
  const stakedBalances = await fetchUserStakeBalances(account,chainId)
  return { sousId, field: 'stakedBalance', value: stakedBalances[sousId] }
})

export const updateUserPendingReward = createAsyncThunk<
  { sousId: number; field: string; value: any },
  { sousId: number; account: string; chainId: number }
>('pool/updateUserPendingReward', async ({ sousId, account, chainId = ChainId.BSC }) => {
  const pendingRewards = await fetchUserPendingRewards(account,chainId)
  return { sousId, field: 'pendingReward', value: pendingRewards[sousId] }
})

export const fetchCakeVaultPublicData = createAsyncThunk<SerializedLockedCakeVault, {chainId: number}>(
  'cakeVault/fetchPublicData',
  async ({ chainId = ChainId.BSC }) => {
    const publicVaultInfo = await fetchPublicVaultData(chainId)
    return publicVaultInfo
  },
)

export const fetchCakeFlexibleSideVaultPublicData = createAsyncThunk<SerializedCakeVault, {chainId: number}>(
  'cakeFlexibleSideVault/fetchPublicData',
  async ({ chainId = ChainId.BSC }) => {
    const publicVaultInfo = await fetchPublicFlexibleSideVaultData(chainId)
    return publicVaultInfo
  },
)

export const fetchCakeVaultFees = createAsyncThunk<SerializedVaultFees, {chainId: number}>('cakeVault/fetchFees', async ({ chainId = ChainId.BSC }) => {
  const vaultFees = await fetchVaultFees(chainId, getCakeVaultAddress(chainId))
  return vaultFees
})

export const fetchCakeFlexibleSideVaultFees = createAsyncThunk<SerializedVaultFees, {chainId: number}>(
  'cakeFlexibleSideVault/fetchFees',
  async ({ chainId = ChainId.BSC }) => {
    const vaultFees = await fetchVaultFees(chainId, getCakeFlexibleSideVaultAddress(chainId))
    return vaultFees
  },
)

export const fetchCakeVaultUserData = createAsyncThunk<SerializedLockedVaultUser, { account: string,chainId: number }>(
  'cakeVault/fetchUser',
  async ({ account, chainId = ChainId.BSC }) => {
    const userData = await fetchVaultUser(account, chainId)
    return userData
  },
)

export const fetchIfoPublicDataAsync = createAsyncThunk<PublicIfoData>('ifoVault/fetchIfoPublicDataAsync', async () => {
  const publicIfoData = await fetchPublicIfoData()
  return publicIfoData
})

export const fetchUserIfoCreditDataAsync = (account: string) => async (dispatch) => {
  try {
    const credit = await fetchUserIfoCredit(account)
    dispatch(setIfoUserCreditData(credit))
  } catch (error) {
    console.error('[Ifo Credit Action] Error fetching user Ifo credit data', error)
  }
}
export const fetchCakeFlexibleSideVaultUserData = createAsyncThunk<SerializedVaultUser, { account: string }>(
  'cakeFlexibleSideVault/fetchUser',
  async ({ account }) => {
    const userData = await fetchFlexibleSideVaultUser(account)
    return userData
  },
)

// 池子Pools的reducer，存所有的数据
export const PoolsSlice = createSlice({
  name: 'Pools',
  initialState,
  reducers: {
    setPoolPublicData: (state, action) => {
      console.log('setPoolPublicData', state, action);
      const { sousId } = action.payload
      const poolIndex = state.data.findIndex((pool) => pool.sousId === sousId)
      state.data[poolIndex] = {
        ...state.data[poolIndex],
        ...action.payload.data,
      }
    },
    setPoolUserData: (state, action) => {
      console.log('setPoolUserData', state, action);
      const { sousId } = action.payload
      state.data = state.data.map((pool) => {
        if (pool.sousId === sousId) {
          return { ...pool, userDataLoaded: true, userData: action.payload.data }
        }
        return pool
      })
    },
    // 初始化的时候会调用这个函数。从质押的合约里面根据sousId读出来对应的质押相关参数，给所有的pool初始化一些参数进去，每一个pool都会在遍历的时候单独调用这个函数
    setPoolsPublicData: (state, action) => {
      // 从质押的合约里面根据sousId读出来的参数；比如totalStaked、stakingTokenPrice、earningTokenPrice等参数;放到 data上
      const livePoolsData: SerializedPool[] = action.payload
      const livePoolsSousIdMap = keyBy(livePoolsData, 'sousId')
      // console.log('setPoolsPublicData', state, '333', action);
      state.data = state.data.map((pool) => {
        const livePoolData = livePoolsSousIdMap[pool.sousId]
        return { ...pool, ...livePoolData }
      })
    },
    // IFO
    setIfoUserCreditData: (state, action) => {
      console.log('setIfoUserCreditData', state, action);
      const credit = action.payload
      state.ifo = { ...state.ifo, credit }
    },
  },
  // 处理这个reducer里面数据的时候，首先就是调用的这里这个 extraReducer，然后再调用的上面那些函数
  extraReducers: (builder) => {
    builder.addCase(resetUserState, (state) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      state.data = state.data.map(({ userData, ...pool }) => {
        return { ...pool }
      })
      state.userDataLoaded = false
      state.cakeVault = { ...state.cakeVault, userData: initialPoolVaultState.userData }
      state.cakeFlexibleSideVault = { ...state.cakeFlexibleSideVault, userData: initialPoolVaultState.userData }
    })
    builder.addCase(
      fetchPoolsUserDataAsync.fulfilled,
      (
        state,
        action: PayloadAction<
          { sousId: number; allowance: any; stakingTokenBalance: any; stakedBalance: any; pendingReward: any }[]
        >,
      ) => {
        const userData = action.payload
        const userDataSousIdMap = keyBy(userData, 'sousId')
        state.data = state.data.map((pool) => ({
          ...pool,
          userDataLoaded: true,
          userData: userDataSousIdMap[pool.sousId],
        }))
        state.userDataLoaded = true
      },
    )
    builder.addCase(fetchPoolsUserDataAsync.rejected, (state, action) => {
      console.error('[Pools Action] Error fetching pool user data', action.payload)
    })
    // Vault public data that updates frequently
    builder.addCase(fetchCakeVaultPublicData.fulfilled, (state, action: PayloadAction<SerializedLockedCakeVault>) => {
      state.cakeVault = { ...state.cakeVault, ...action.payload }
    })
    builder.addCase(
      fetchCakeFlexibleSideVaultPublicData.fulfilled,
      (state, action: PayloadAction<SerializedCakeVault>) => {
        state.cakeFlexibleSideVault = { ...state.cakeFlexibleSideVault, ...action.payload }
      },
    )
    // Vault fees
    builder.addCase(fetchCakeVaultFees.fulfilled, (state, action: PayloadAction<SerializedVaultFees>) => {
      const fees = action.payload
      state.cakeVault = { ...state.cakeVault, fees }
    })
    builder.addCase(fetchCakeFlexibleSideVaultFees.fulfilled, (state, action: PayloadAction<SerializedVaultFees>) => {
      const fees = action.payload
      state.cakeFlexibleSideVault = { ...state.cakeFlexibleSideVault, fees }
    })
    // Vault user data
    builder.addCase(fetchCakeVaultUserData.fulfilled, (state, action: PayloadAction<SerializedLockedVaultUser>) => {
      const userData = action.payload
      state.cakeVault = { ...state.cakeVault, userData }
    })
    // IFO
    builder.addCase(fetchIfoPublicDataAsync.fulfilled, (state, action: PayloadAction<PublicIfoData>) => {
      const { ceiling } = action.payload
      state.ifo = { ...state.ifo, ceiling }
    })
    builder.addCase(
      fetchCakeFlexibleSideVaultUserData.fulfilled,
      (state, action: PayloadAction<SerializedVaultUser>) => {
        const userData = action.payload
        state.cakeFlexibleSideVault = { ...state.cakeFlexibleSideVault, userData }
      },
    )
    builder.addMatcher(
      isAnyOf(
        updateUserAllowance.fulfilled,
        updateUserBalance.fulfilled,
        updateUserStakedBalance.fulfilled,
        updateUserPendingReward.fulfilled,
      ),
      (state, action: PayloadAction<{ sousId: number; field: string; value: any }>) => {
        const { field, value, sousId } = action.payload
        const index = state.data.findIndex((p) => p.sousId === sousId)

        if (index >= 0) {
          state.data[index] = { ...state.data[index], userData: { ...state.data[index].userData, [field]: value } }
        }
      },
    )
  },
})

// Actions
export const { setPoolsPublicData, setPoolPublicData, setPoolUserData, setIfoUserCreditData } = PoolsSlice.actions

export default PoolsSlice.reducer
