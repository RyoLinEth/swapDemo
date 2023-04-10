/* eslint-disable no-restricted-globals */
import { useState, useEffect } from 'react'
import {
  Text
} from '@pancakeswap/uikit'
import swal from 'sweetalert'
import { CopyToClipboard } from 'react-copy-to-clipboard';
import styled from 'styled-components'
import { useAccount } from 'wagmi'
import contractABI from 'config/abi/ido-idoABI.json';
import usdtABI from 'config/abi/ido-usdtABI.json';
import ClaimABI from 'config/abi/ido-ClaimABI.json'
import { ethers } from 'ethers';
import { useTranslation } from '@pancakeswap/localization'



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
const claimContractAddress = "0xBA8CC2640264B84B1FA32B4AA5dEC7058AF1Ca16"; // 此合约暂时还没有
const usdtAddress = "0xbd4E07164F583c2Cb87655BDdE1b7050D9aecE05";
const contractAddress = "0x8A426d810A80D33C943fcBe6219476Ff85f1b376";
const defaultInviter = "0x16c21c28FED3e3B545493e111dB87842D11281AD";

const IfoTopInviteInfo = () => {
  const { address: account } = useAccount()
  const { t } = useTranslation()
  const [contributionAmount, setContributionAmount] = useState<string>('0');
  // 分享的奖励 usdt
  const [referralAmount, setReferralAmount] = useState<string>('0');
  const [isJoined, setIsJoined] = useState(false);
  const [isClaimActive, setIsClaimActive] = useState(false);
  const [isIDOActive, setIsIDOActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);

  // const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [usdtContract, setUsdtContract] = useState(null);

  const [claimContract, setClaimContract] = useState(null);


  // 当前用户的邀请url
  const [personalLink, setPersonalLink] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [parentAddress, setParentAddress] = useState("0x...")
  // 设置了邀请人
  const [isInviterSet, setIsInviterSet] = useState(false)
  // 邀请的地址address.即 上级的address，和上面的parentAddress好像冲突了
  const [inviterAddress, setInviterAddress] = useState(defaultInviter)

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
        swal("Success", `You invitaion link ${personalLink} has been successfully copied`, "success")
    } catch (err) {
        // alert(err)
    }
  }

  // 初始化inviterAddress
  const initInviterAddress = () => {
    if (isInviterSet) return;
    try {
        const inputString = window.location.search;

        if (inputString.includes("0x")) {
            const start = inputString.indexOf("0x");
            const publicAddress = inputString.substring(start, start + 42);
            setInviterAddress(publicAddress);
            setIsInviterSet(true);
        }
    } catch (error) {
        const inputArray = document.URL.split("/")
        const inputString = inputArray[inputArray.length - 1]
        if (inputString.includes("0x")) {
            console.log("6")
            const start = inputString.indexOf("0x");
            console.log(inputString)
            const publicAddress = inputString.substring(start, start + 42);
            setInviterAddress(publicAddress);
            setIsInviterSet(true);
        }
    }
  }

  // 初始化合约相关函数
  const initContract = async () => {
    try {
        const tempProvider = new ethers.providers.Web3Provider(window.ethereum as any);
        // setProvider(tempProvider);

        const tempSigner = tempProvider.getSigner();
        setSigner(tempSigner);

        const tempContract = new ethers.Contract(contractAddress, contractABI, tempSigner)
        setContract(tempContract);
        setUsdtContract(new ethers.Contract(usdtAddress, usdtABI, tempSigner));

        // const tempClaimContract = new ethers.Contract(claimContractAddress, ClaimABI, tempSigner)
        // setClaimContract(tempClaimContract)

        // let tempContributionHex = await tempContract.AddressToJoinUsdtAmount(defaultAccount);
            // let tempContribution = ethers.utils.formatEther(`${tempContributionHex}`);
            // setContributionAmount(tempContribution);

        // const tempContributionHex = await tempClaimContract.claimAmount(account);
        // const tempContribution = ethers.utils.formatEther(`${tempContributionHex}`);
        // if (tempContribution !== '0.0')
        //     setContributionAmount(`${tempContribution.slice(0, tempContribution.length - 2)}000000000`);

        const tempReferralHex = await tempContract.AddressToRewardAmount(account);
        const tempReferral = ethers.utils.formatEther(`${tempReferralHex}`);
        setReferralAmount(tempReferral);

        // let tempJoin = await tempContract.isAddressJoined(defaultAccount);
        // setIsJoined(tempJoin);
        const tempParent = await tempContract.fatherAddress(account);
        if (tempParent === "0x0000000000000000000000000000000000000000")
            setParentAddress("0x...");
        if (tempParent !== "0x0000000000000000000000000000000000000000")
            setParentAddress(`${tempParent.slice(0, 4)}...${tempParent.slice(-4)}`);

        // const tempClaimActive = await tempClaimContract.canClaim();
        // setIsClaimActive(tempClaimActive);

        // let tempClaimActive = await tempContract.isClaimActive();
            // setIsClaimActive(tempClaimActive);

        // 关闭时候，需要注释
        const tempIDOActive = await tempContract.isIDOActive();
        setIsIDOActive(tempIDOActive);

        // const tempIsClaimed = await tempClaimContract.canAddressClaim(account);
        // setIsClaimed(!tempIsClaimed);
    } catch {}
  }

  // 查看钱包地址，剩余得 usdt数量
  const checkBalance = async () => {
    const tempBalanceHex = await usdtContract.balanceOf(account);
    const tempBalance = ethers.utils.formatEther(`${tempBalanceHex}`, 'ether');
    return tempBalance;
  }

  // 查看钱包授权得usdt数量
  const checkAllowance = async () => {
    const allowance = await usdtContract.allowance(account, contractAddress);
    const allowanceAmount = ethers.utils.formatEther(`${allowance}`, 'ether');
    return allowanceAmount;
  }

  // 再次向用户查看授权，然后购买
  const checkAllowanceAgain = async (value) => {
    const result = await checkAllowance()

    if (result < value) {
        setIsLoading(true);
        setTimeout(() => {
           checkAllowanceAgain(value)
        }, 3000)
    }
    else
        handleContribute(value);
  }

  // 应该是购买相关得函数了，进行ido购买
  const handleContribute = async (value) => {
    setIsLoading(false);
    try {
        const etherAmount = ethers.utils.parseEther(`${value}`);

        const result = await contract.makeIDO(
            inviterAddress?.toLowerCase(), etherAmount, { gasLimit: "600000" }
        );

        if (result) {
            setIsJoined(true);
            setContributionAmount(value);
            if (inviterAddress !== account)
                setParentAddress(`${inviterAddress.slice(0, 4)}...${inviterAddress.slice(-4)}`);
            else
                setParentAddress(`${defaultInviter.slice(0, 4)}...${defaultInviter.slice(-4)}`);

            // if (language === "中") {
            //     if (value === 0)
            //         swal("成功", "成功認購 50 USDT", "success");
            //     if (value === 1)
            //         swal("成功", "成功認購 100 USDT", "success");
            //     if (value === 2)
            //         swal("成功", "成功認購 200 USDT", "success");
            //     return;
            // }
            if (value === 0)
                swal("Success", "Successfully Contribute With 50 USDT", "success");
            if (value === 1)
                swal("Success", "Successfully Contribute With 100 USDT", "success");
            if (value === 2)
                swal("Success", "Successfully Contribute With 200 USDT", "success");
        } else {
            // if (language === "中") {
            //     swal("錯誤", "認購失敗", "error");
            //     return;
            // }
            swal("Error", "Failed to Contribute", "error");
        }

    } catch (err) {
      console.log(err);
    }
  }

  // 购买ido
  const makeApprove = async (value) => {
    if (!account) {
        // if (language === "中") {
        //     swal("錯誤", "請先連接錢包", "error");
        //     return;
        // }
        swal("Error", "Please Connect Your Wallet", "error");
        return;
    }
    if (!isIDOActive) {
        // if (language === "中") {
        //     swal("錯誤", "IDO 未開放", "error");
        //     // swal("錯誤", "請檢查連線VPN 或 重新整理網頁", "error");
        //     return;
        // }
        // swal("Error", "Please check your network connection or refresh the page", "error");
        swal("Error", "IDO is not active", "error");
        return;
    }

    let amount = 0;
    if (value === 0) amount = 50;
    if (value === 1) amount = 100;
    if (value === 2) amount = 200;

    if (isJoined) {
        // if (language === "中") {
        //     swal("錯誤", "您已參加過IDO", "error");
        //     return;
        // }
        swal("Error", "You have already joined before!!", "error");
        return;
    }

    const balance = await checkBalance();
    if (+balance < +amount) {
        // if (language === "中") {
        //     swal("錯誤", "您沒有足夠的USDT", "error");
        //     return;
        // }
        swal("Error", "You don't have enough USDT", "error");
        return;
    }


    const result = await checkAllowance()
    const approveAmount = ethers.utils.parseEther(`${amount}`);

    if (+result >= +amount) {
        handleContribute(amount)
    }
    else
        try {
            const result2 = await usdtContract.approve(contractAddress, approveAmount);
            if (result2)
                checkAllowanceAgain(amount);
        } catch {
            // if (language === "中") {
            //     swal("錯誤", "授權USDT失敗", "error");
            //     return;
            // }
            swal("Error", "Failed to approve", "error");
        }
  }

  // 领币
  const handleClaim = async () => {
    // if (language === "中") {
    //     if (contributionAmount == 0) {
    //         swal("錯誤", "您並未進行任何認購", "error")
    //         return;
    //     }
    //     if (isClaimed) {
    //         swal("錯誤", "您已領取過，無法重複領取", "error");
    //         return;
    //     }
    //     if (!isClaimActive) {
    //         swal("錯誤", "現在還不能領幣，領幣時間請關注官方電報", "error")
    //         return;
    //     }
    // }
    if (+contributionAmount === 0) {
        swal("Error", "You haven't make any contribution yet", "error")
        return;
    }
    if (isClaimed) {
        swal("Error", "You have already claimed", "error");
        return;
    }
    if (!isClaimActive && account !== "0x2678ecc61df4f476930069c801786efa5f1ca72f") {
        swal("Error", "Cannot Claim Right Now. The time able to claim will be informed in our official telegram.", "error")
        return
    }

    const result = await claimContract.claim()
    console.log(result)
}

  useEffect(() => {
    initInviterAddress();
  }, []);

  useEffect(() => {
    if (account) {

      // eslint-disable-next-line prefer-destructuring
      const href = location.href;
      let tempLink = '';
      const regStr = `INVITER=${inviterAddress}`;
      if (href?.includes(`INVITER=${inviterAddress}`)) {
        const reg = new RegExp(regStr,'g');
        tempLink = href.replace(reg, `INVITER=${account}`);
      } else if (href?.includes('?')) {
          tempLink = `${href}&INVITER=${account}`
        } else {
          tempLink = `${href}?INVITER=${account}`
        }
      setPersonalLink(tempLink);
      initContract();
    }
  }, [account]);

  return (
    <>
      <StyleBox>
        <StyleLabel>
          上级地址:
        </StyleLabel>
        <Text bold fontSize="14px" color="textSubtle">{parentAddress === '0x...' ? '无上级地址' : parentAddress}</Text>
      </StyleBox>

       <StyleBox>
        <StyleLabel>
          我的邀请链接 : <span className='invite'><span className='invite-text'>邀请好友</span>获得<span className='invite-text'>usdt</span></span>
          {
            !!personalLink && (
              <span className='right-text'>
                  <CopyToClipboard
                      text={personalLink}
                      onCopy={copyLink}
                  >
                      <span>点击复制</span>
                  </CopyToClipboard>
              </span>
            )
          }
        </StyleLabel>
        <Text bold fontSize="14px" color="textSubtle">{personalLink || '請連接錢包'}</Text>
      </StyleBox>

       <StyleBox>
        <StyleLabel>
          认购额度 : <span className='invite'><span className='invite-text'>{contributionAmount}</span></span>
          <span className='right-text' onClick={handleClaim}>
          提币
          </span>
        </StyleLabel>
      </StyleBox>

       <StyleBox>
        <StyleLabel>
          邀请奖励(自动到账) : <span className='invite'><span className='invite-text'>{referralAmount} usdt</span></span>
        </StyleLabel>
      </StyleBox>

       <StyleBox>
        <StyleLabel>
          认购 : <span className='invite'><span className='invite-text'>用 usdt 认购</span></span>
        </StyleLabel>
        <div className="buy-box">
          {
            ['50U', '100U', '200U'].map((item, index) => {
              return <span key={item} className="buy-item" onClick={() => makeApprove(index)}>
                <Text bold fontSize="20px" color="primary">{item}</Text>
              </span>
            })
          }
        </div>
      </StyleBox>
    </>
  )
}

export default IfoTopInviteInfo
