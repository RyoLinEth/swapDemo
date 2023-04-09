import { useMemo } from 'react'
import {
  Text,
  Flex,
  Box,
  CheckmarkCircleIcon,
  FlexProps,
  HelpIcon,
  useTooltip,
  Button,
  AutoRenewIcon,
  BunnyPlaceholderIcon,
  Message,
  MessageText,
  ErrorIcon,
  BalanceWithLoading,
  IfoSkeletonCardTokens,
  IfoPercentageOfTotal,
  IfoVestingAvailableToClaim,
  useToast
} from '@pancakeswap/uikit'
import styled from 'styled-components'
import { useAccount } from 'wagmi'
import { Token } from '@pancakeswap/sdk'
import { Ifo, PoolIds } from 'config/constants/types'
import { bscTokens } from '@pancakeswap/tokens'
import { cakeBnbLpToken } from 'config/constants/ifo'
import { PublicIfoData, WalletIfoData } from 'views/Ifos/types'
import { useTranslation } from '@pancakeswap/localization'
import { getBalanceNumber, formatNumber } from '@pancakeswap/utils/formatBalance'
import { useIfoCredit } from 'state/pools/hooks'
import { TokenImage, TokenPairImage } from 'components/TokenImage'
import { EnableStatus } from '../types'
import IFORequirements from './IFORequirements'
import { MessageTextLink } from '../../IfoCardStyles'
import StakeVaultButton from '../StakeVaultButton'
// import swal from 'sweetalert'
// import { CopyToClipboard } from 'react-copy-to-clipboard';

const StyleBox = styled.div`
  margin-bottom: 10px;
`
const StyleLabel = styled.div`
  display: flex;
  margin-bottom: 10px;
  color: var(--colors-secondary);
  font-weight: 600;
  line-height: 1.5;
  font-size: 14px;
  .invite {
    color: var(--colors-textSubtle);
    font-size: 12px;
    .invite-text {
      color: var(--colors-text);
      margin-left: 4px;
      font-size: 14px;
      font-weight: 600;
    }
    .invite-text:first-child {
      margin-right: 4px;
    }
    .right-text {
      margin-left: auto;
      cursor: pointer;
    }
  }
`

const IfoTopInviteInfo = () => {
  const { address: account } = useAccount()
  const { t } = useTranslation()
  const { toastSuccess } = useToast()
  toastSuccess('666')
  return (
    <>
      <StyleBox>
        <StyleLabel>
          上级地址:
        </StyleLabel>
        <Text bold fontSize="14px" color="textSubtle" textTransform="uppercase">OXXXXX</Text>
      </StyleBox>
      <StyleLabel>
         我的邀请链接 : <span className='invite'><span className='invite-text'>邀请好友</span>获得<span className='invite-text'>usdt</span></span>
         <span className='right-text'>
          {/* <CopyToClipboard
              text={personalLink}
              onCopy={copyLink}
          >
              <span>点击复制</span>
          </CopyToClipboard> */}
         </span>
         {/* {t('Hide')} : */}
      </StyleLabel>
      <Text bold fontSize="14px" color="textSubtle" textTransform="uppercase">OXXXXX</Text>
    </>
  )
}

export default IfoTopInviteInfo
