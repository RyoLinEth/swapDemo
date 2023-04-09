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
import swal from 'sweetalert'
import { CopyToClipboard } from 'react-copy-to-clipboard';
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


const StyleBox = styled.div`
  margin-bottom: 10px;
  .buy-box {
    display: flex;
    .buy-item {
      cursor: pointer;
      margin-right: 10px;
      padding: 0 20px;
      border: 1px solid var(--colors-textSubtle);
      border-radius: 8px;
    }
  }
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
  }
  .right-text {
    margin-left: auto;
    cursor: pointer;
  }

`

const IfoTopInviteInfo = () => {
  const { address: account } = useAccount()
  const { t } = useTranslation()

  const copyLink = () => {
    if (account === null) {
        // if (language === "中") {
        //     swal("錯誤", "請先連結錢包來獲得邀請連結", "error");
        //     return;
        // }
        swal("Error", "Connect wallet first to get your invitation link", "error");
        return;
    }
    try {
        // setCopied(true)
        // if (language === "中") {
        //     swal("成功", `成功複製連結 ${personalLink}`, "success")
        //     return;
        // }
        swal("Success", `You invitaion link ${'oxxxx'} has been successfully copied`, "success")
    } catch (err) {
        // alert(err)
    }
}
  return (
    <>
      <StyleBox>
        <StyleLabel>
          上级地址:
        </StyleLabel>
        <Text bold fontSize="14px" color="textSubtle" textTransform="uppercase">OXXXXX</Text>
      </StyleBox>

       <StyleBox>
        <StyleLabel>
          我的邀请链接 : <span className='invite'><span className='invite-text'>邀请好友</span>获得<span className='invite-text'>usdt</span></span>
          <span className='right-text'>
              <CopyToClipboard
                  text={'OXXXXXXXXX'}
                  onCopy={copyLink}
              >
                  <span>点击复制</span>
              </CopyToClipboard>
          </span>
        </StyleLabel>
        <Text bold fontSize="14px" color="textSubtle" textTransform="uppercase">OXXXXX</Text>
      </StyleBox>

       <StyleBox>
        <StyleLabel>
          认购额度 : <span className='invite'><span className='invite-text'>6666666666666666</span></span>
          <span className='right-text'>
          提币
          </span>
        </StyleLabel>
      </StyleBox>

       <StyleBox>
        <StyleLabel>
          邀请奖励(自动到账) : <span className='invite'><span className='invite-text'>10 usdt</span></span>
        </StyleLabel>
      </StyleBox>

       <StyleBox>
        <StyleLabel>
          认购 : <span className='invite'><span className='invite-text'>用 usdt 认购</span></span>
        </StyleLabel>
        <div className="buy-box">
          {
            ['50U', '100U', '200U'].map(item => {
              return <span className="buy-item">
                <Text bold fontSize="20px" color="primary" textTransform="uppercase">{item}</Text>
              </span>
            })
          }
        </div>
      </StyleBox>
    </>
  )
}

export default IfoTopInviteInfo
