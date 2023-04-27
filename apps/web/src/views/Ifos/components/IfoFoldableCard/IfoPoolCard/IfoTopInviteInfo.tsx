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
const contractAddress = "0xAfeBff6fbbF2BCE4c12746592aa19D976E9f1077";
// const contractAddress = "0x8A426d810A80D33C943fcBe6219476Ff85f1b376";
const defaultInviter = "0x16c21c28FED3e3B545493e111dB87842D11281AD";

const IfoTopInviteInfo = () => {
  const { address: account } = useAccount()
  const { t } = useTranslation()
  const [contributionAmount, setContributionAmount] = useState<string>('0');
  const [allowedIDOAmount, setAllowedIDOAmount] = useState<string>('0');
  // 分享的奖励 usdt
  const [referralAmount, setReferralAmount] = useState<string>('0');
  const [isJoined, setIsJoined] = useState(false);
  const [isClaimActive, setIsClaimActive] = useState(false);
  const [isIDOActive, setIsIDOActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);

  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [usdtContract, setUsdtContract] = useState(null);

  const [claimContract, setClaimContract] = useState(null);

  //  交易上鍊後 更新資訊用
  const [isOnChain, setIsOnChain] = useState(false);

  // 当前用户的邀请url
  const [personalLink, setPersonalLink] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [parentAddress, setParentAddress] = useState("0x...")
  // 设置了邀请人
  const [isInviterSet, setIsInviterSet] = useState(false)
  // 邀请的地址address.即 上级的address，和上面的parentAddress好像冲突了
  const [inviterAddress, setInviterAddress] = useState(defaultInviter)
  const [inviteInfo, setInviteInfo] = useState([])

  const [BNBAmount, setBNBAmount] = useState(null);

  const copyLink = () => {
    if (account === null) {
      swal("Error", "Connect wallet first to get your invitation link", "error");
      return;
    }
    try {
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
        const start = inputString.indexOf("0x");
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
      setProvider(tempProvider);

      const tempSigner = tempProvider.getSigner();
      setSigner(tempSigner);

      const tempContract = new ethers.Contract(contractAddress, contractABI, tempSigner)
      setContract(tempContract);
      setUsdtContract(new ethers.Contract(usdtAddress, usdtABI, tempSigner));

      let allowedIDOAmount = await tempContract.allowedIDOAmount(account);
      let realAllowedIDOAmount = ethers.utils.formatEther(`${allowedIDOAmount}`);
      setAllowedIDOAmount(realAllowedIDOAmount);

      let personalInfo = await tempContract.personalInfo(account);
      let tempContributionHex = personalInfo.joinedAmount;
      let tempContribution = ethers.utils.formatEther(`${tempContributionHex}`);
      setContributionAmount(tempContribution);

      // const tempContributionHex = await tempClaimContract.claimAmount(account);
      // const tempContribution = ethers.utils.formatEther(`${tempContributionHex}`);
      // if (tempContribution !== '0.0')
      //     setContributionAmount(`${tempContribution.slice(0, tempContribution.length - 2)}000000000`);

      // const tempReferralHex = await tempContract.AddressToRewardAmount(account);
      // const tempReferral = ethers.utils.formatEther(`${tempReferralHex}`);
      // setReferralAmount(tempReferral);

      // let tempJoin = await tempContract.isAddressJoined(defaultAccount);
      // setIsJoined(tempJoin);
      // const tempParent = await tempContract.upperNode(account);
      // if (tempParent === "0x0000000000000000000000000000000000000000")
      //   setParentAddress("0x...");
      // if (tempParent !== "0x0000000000000000000000000000000000000000")
      //   setParentAddress(`${tempParent.slice(0, 4)}...${tempParent.slice(-4)}`);

      let tempClaimActive = await tempContract.isClaimActive();
      setIsClaimActive(tempClaimActive);

      // 关闭时候，需要注释
      const tempIDOActive = await tempContract.isIDOActive();
      setIsIDOActive(tempIDOActive);

      const tempInviteInfo = await tempContract.getInviteInfo(account);
      console.log(tempInviteInfo)
      setInviteInfo(tempInviteInfo)

      // const tempIsClaimed = await tempClaimContract.canAddressClaim(account);
      // setIsClaimed(!tempIsClaimed);
    } catch (error) {
      console.log('666');
      console.log(error)

    }
  }

  // 查看钱包地址，剩余得 usdt数量
  const checkBalance = async () => {
    const tempBalanceHex = await usdtContract.balanceOf(account);
    const tempBalance = ethers.utils.formatEther(`${tempBalanceHex}`);
    return tempBalance;
  }

  // 查看钱包授权得usdt数量
  const checkAllowance = async () => {
    const allowance = await usdtContract.allowance(account, contractAddress);
    const allowanceAmount = ethers.utils.formatEther(`${allowance}`);
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

        if (value === 0)
          swal("Success", "Successfully Contribute With 50 USDT", "success");
        if (value === 1)
          swal("Success", "Successfully Contribute With 100 USDT", "success");
        if (value === 2)
          swal("Success", "Successfully Contribute With 200 USDT", "success");
      } else {
        swal("Error", "Failed to Contribute", "error");
      }

    } catch (err) {
      console.log(err);
    }
  }

  // 购买ido
  const makeApprove = async (value) => {
    if (!account) {
      swal("Error", "Please Connect Your Wallet", "error");
      return;
    }
    if (!isIDOActive) {
      swal("Error", "IDO is not active", "error");
      return;
    }

    let amount = 0;
    if (value === 0) amount = 50;
    if (value === 1) amount = 100;
    if (value === 2) amount = 200;

    if (isJoined) {
      swal("Error", "You have already joined before!!", "error");
      return;
    }

    const balance = await checkBalance();
    if (+balance < +amount) {
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
        swal("Error", "Failed to approve", "error");
      }
  }

  // 领币
  const handleClaim = async () => {
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
    try {
      const result = await contract.claimToken()
    } catch (err: any) {
      console.log(err)
      if (err.reason !== undefined)
        swal("Error", `${err.reason}`, "error");
      else
        swal("Error", `${err.message}`, "error");
    }
  }

  useEffect(() => {
    initInviterAddress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (account) {

      // eslint-disable-next-line prefer-destructuring
      const href = location.href;
      let tempLink = '';
      const regStr = `INVITER=${inviterAddress}`;
      if (href?.includes(`INVITER=${inviterAddress}`)) {
        const reg = new RegExp(regStr, 'g');
        tempLink = href.replace(reg, `INVITER=${account}`);
      } else if (href?.includes('?')) {
        tempLink = `${href}&INVITER=${account}`
      } else {
        tempLink = `${href}?INVITER=${account}`
      }
      setPersonalLink(tempLink);
      initContract();
    }

    if (isOnChain) {
      initContract()
      setIsOnChain(prev => !prev)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, isOnChain]);

  const idoWithBNB = async () => {
    const bnbAmount = ethers.utils.parseUnits(`${BNBAmount}`, "ether");
    console.log(bnbAmount)
    try {
      let result = await contract.makeIDO(inviterAddress,
        {
          value: bnbAmount
        })
      console.log(result)

      provider.getTransaction(result.hash)
        .then((tx) => {
          // 監聽交易上鍊事件
          tx.wait().then((receipt) => {
            console.log(`交易已上鍊，區塊高度為 ${receipt.blockNumber}`);
            setIsOnChain(true)
          });
        })
        .catch((err) => {
          console.error(err);
        });

      swal("Success", "已成功认购", "success")
    } catch (err: any) {
      console.log(err)
      if (err.reason !== undefined)
        swal("Error", `${err.reason}`, "error");
      else
        swal("Error", `${err.message}`, "error");
    }
  }


  const Table = styled.table`
    border-collapse: collapse;
    width: 100%;
    font-family: Arial, sans-serif;
  `;

  const Th = styled.th`
    text-align: left;
    padding: 8px;
    border-bottom: 1px solid #ddd;
    background-color: #4CAF50;
    color: white;
  `;

  const Td = styled.td`
    text-align: left;
    padding: 8px;
    border-bottom: 1px solid #ddd;
  `;

  const OddRow = styled.tr`
    background-color: #f5f5f5;
  `;

  const EvenRow = styled.tr`
    background-color: #fff;
  `;

  const PaginationButton = styled.button`
    margin: 0 8px;
  `;

  const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 16px;
  margin-left: 16px;
`;

  const PaginationText = styled.div`
  margin-right: 16px;
`;



  const TableComponent = () => {

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(inviteInfo.length / itemsPerPage);

    const handlePageChange = (page) => {
      setCurrentPage(page);
    };

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const pagedInviteInfo = inviteInfo.slice(startIndex, endIndex);

    return (
      <Table>
        <thead>
          <tr>
            <Th>Address</Th>
            <Th>Amount</Th>
          </tr>
        </thead>
        <tbody>
          {
            inviteInfo !== null &&
            pagedInviteInfo.map((data, index) => {
              let oddOrEven = index % 2;
              if (oddOrEven === 0)
                return (
                  <OddRow>
                    <Td>{data.invitedAddress.slice(0, 4)}...{data.invitedAddress.slice(-4)}</Td>
                    <Td>{ethers.utils.formatEther(data.invitedAmount)}</Td>
                  </OddRow>
                )
              else
                return (
                  <EvenRow>
                    <Td>{data.invitedAddress.slice(0, 4)}...{data.invitedAddress.slice(-4)}</Td>
                    <Td>{ethers.utils.formatEther(data.invitedAmount)}</Td>
                  </EvenRow>
                )
            })
          }
        </tbody>
        <tfoot>
          <PaginationContainer>
            <PaginationText>Current Page: {currentPage}</PaginationText>
            <PaginationButton disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>Prev</PaginationButton>
            {/* {Array.from({ length: totalPages }, (_, i) => (
              <PaginationButton key={i} onClick={() => handlePageChange(i + 1)}>{i + 1}</PaginationButton>
            ))} */}
            <PaginationButton disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>Next</PaginationButton>
          </PaginationContainer>
        </tfoot>
      </Table>
    );
  };

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
          我的邀请链接 : <span className='invite'><span className='invite-text'>邀请好友</span>获得<span className='invite-text'>BNB</span></span>
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
          可认购额度 : <span className='invite'>
            <span className='invite-text'>{allowedIDOAmount}</span></span>
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        </StyleLabel>
      </StyleBox>

      <StyleBox>
        <StyleLabel>
          已认购额度 : <span className='invite'><span className='invite-text'>{contributionAmount}</span></span>
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
          <span className='right-text' onClick={handleClaim}>提币</span>
        </StyleLabel>
      </StyleBox>

      <StyleBox>
        <StyleLabel>
          邀请奖励(自动到账) : <span className='invite'><span className='invite-text'>{referralAmount} BNB</span></span>
        </StyleLabel>
      </StyleBox>

      <StyleBox>
        <StyleLabel>
          认购 :
          <input
            placeholder='用 BNB 认购'
            style={{ marginLeft: '20px', maxWidth: '200px', width: '30vw' }}
            onChange={(e) => setBNBAmount(e.target.value)}
            type="number"
          />
          <span className='invite'
            style={{
              display: 'flex',
              alignItems: 'center'
            }}>
            <span
              className='invite-text'
              style={{
                paddingLeft: '10px',
                display: 'flex',
                alignItems: 'center'
              }}> BNB </span>
          </span>

          <span className='right-text' onClick={idoWithBNB}>认购</span>

        </StyleLabel>
        <div className="buy-box">
          {/* {
            ['50U', '100U', '200U'].map((item, index) => {
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
              return <span key={item} className="buy-item" onClick={() => makeApprove(index)}>
                <Text bold fontSize="20px" color="primary">{item}</Text>
              </span>
            })
          } */}
        </div>
      </StyleBox>
      <StyleBox>
        <StyleLabel>
          邀请资讯：
        </StyleLabel>

        <TableComponent />
      </StyleBox>
    </>
  )
}

export default IfoTopInviteInfo
