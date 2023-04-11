import styled from 'styled-components'
import { Box, Card, CardBody, CardFooter, Heading, IconButton, PageSection, Slider, Row, AddIcon, MinusIcon,Button } from '@pancakeswap/uikit'
import { useAccount } from 'wagmi'
import useTheme from 'hooks/useTheme'
import Container from 'components/Layout/Container'
import { useTranslation } from '@pancakeswap/localization'
import { useActiveChainId } from 'hooks/useActiveChainId'
// import BnbTigerDataRow from './components/BnbTigerDataRow'
// import { WedgeTopLeft, InnerWedgeWrapper, OuterWedgeWrapper, WedgeTopRight } from './components/WedgeSvgs'
// import UserBanner from './components/UserBanner'
// import MultipleBanner from './components/Banners/MultipleBanner'
// import NftBanner from './components/Banners/NftBanner'
import {useState, useEffect} from 'react';
import { ethers } from 'ethers'
import nftABI from 'config/abi/nft-nftABI.json';
import ErrorMessage from './ErrorMessage'

const headerHeight = "60px";
const customHeadingColor = "#7645D9";
const gradientStopPoint = `calc(${headerHeight} + 1px)`;

const nftMintAddress = "0x9c657E4A638df5E5e5d2b08cDCD7B3A2cE25052D";

const NftMarketPage: React.FC<React.PropsWithChildren> = () => {
  const { theme } = useTheme()
  const { address: account } = useAccount()
  const { chainId } = useActiveChainId()

  const { t } = useTranslation()

  const [signer, setSigner] = useState(null);
  const [nftContract, setNFTContract] = useState(null);
  const [mintAmount, setMintAmount] = useState(1);
  const [maxMint, setMaxMint] = useState(10);
  const [totalSupply, setTotalSupply] = useState(999);
  const [alreadyMint, setAlreadyMint] = useState(0);
  const [errorText, setErrorText] = useState('');

  const borderBackground = `linear-gradient(${customHeadingColor} ${gradientStopPoint}, ${theme.colors.cardBorder} ${gradientStopPoint})`;

  // Gradient overlap is also possible, just put the "dividing" gradient first and after that the header gradient
  const gradientBorderColor = `linear-gradient(transparent ${gradientStopPoint}, ${theme.colors.cardBorder} ${gradientStopPoint}), ${theme.colors.gradientCardHeader}`;

  const handleAmount = (number: number) => {
    setMintAmount(mintAmount + number)
  }


  const initContract = async () => {
    try {
        const tempProvider = new ethers.providers.Web3Provider(window.ethereum as any);

        const tempSigner = tempProvider.getSigner();
        setSigner(tempSigner);

        const tempNFTContract = new ethers.Contract(nftMintAddress, nftABI, tempSigner)
        setNFTContract(tempNFTContract);

        const tempMaxMint = await tempNFTContract.maxMint()
        const _maxMint = ethers.utils.formatUnits(`${tempMaxMint}`, "wei")
        setMaxMint(+_maxMint);

        //  剩下NFT還沒被mint的數量
        const remainderMint = await tempNFTContract.availableTokens()
        const _remainderMint = remainderMint?.[1].length

        //  目前已被mint出來的數量
        const tempAlreadyMint = await tempNFTContract.totalSupply()
        const _alreadyMint = ethers.utils.formatUnits(`${tempAlreadyMint}`, "wei")
        setAlreadyMint(+_alreadyMint)

        // 實際上的Supply
        const _totalSupply = _remainderMint + _alreadyMint;
        setTotalSupply(+_totalSupply);
    } catch(err) {
        // console.log(err);
        // // alert(err)
        // setErrorText(err.toString())
    }
  }

  const handleMint = async () => {
    if (!account) {
      setErrorText("Wallet Not Conneted")
      return;
    }
    try {
        const nftPrice = await nftContract.mintPrice();
        const pay = mintAmount * nftPrice;
        // console.log(pay)
        await nftContract.mint(mintAmount, {
            value: pay
        })
        setAlreadyMint(alreadyMint + mintAmount);
    } catch (err) {
        setErrorText(err.toString())
        // @ts-ignore
        setErrorText(err.reason)
    }
}

  useEffect(() => {
    if (account) {
      initContract();
    }
  }, [account]);
  return (
    <>
      <style jsx global>
        {`
          #home-2 .page-bg {
            background: linear-gradient(180deg, #ffffff 22%, #efe0b1 100%);
          }
          #home-2 {
            position: relative
          }
          [data-theme='dark'] #home-2 .page-bg {
            background: linear-gradient(180deg, #09070c 22%, #201335 100%);
          }
          .amount {
            font-weight: bold;
            font-size: 18px;
          }
        `}
      </style>
      <>
        {
          !!errorText &&
            <ErrorMessage
                errorMessage={errorText}
                setErrorText={setErrorText}
            />
        }
      </>

      <PageSection
        innerProps={{ style: { margin: '0', width: '100%', padding: 0, textAlign: 'center' } }}
        background={theme.colors.background}
        index={2}
        containerProps={{
          id: 'home-2',
        }}
        hasCurvedDivider={false}
      >
        <Row justifyContent='center'>
          <Card borderBackground={gradientBorderColor} style={{minWidth: '400px',}}>
            <Box background={theme.colors.gradientCardHeader} p="16px" height={headerHeight} style={{maxWidth: 500}}>
              <Heading size="xl">Nft Mint</Heading>
            </Box>
            <CardBody>
              <Row justifyContent='center'>
                <IconButton mr="24px" variant="secondary" disabled={mintAmount === 1} onClick={()=>{handleAmount(-1)}}>
                  <MinusIcon color="primary" width="14px" />
                </IconButton>
                <span className='amount'>{mintAmount}</span>
                <IconButton  ml="24px" variant="secondary" disabled={mintAmount === maxMint} onClick={()=>{handleAmount(1)}}>
                  <AddIcon color="primary" width="14px" />
                </IconButton>
              </Row>
              <Row>
                <Button width="100%" mt="24px" variant="bubblegum" style={{border: '1px solid grey',}} onClick={handleMint}>Mint</Button>
              </Row>
            </CardBody>
            <CardFooter>
              0
              <Slider
                name="slider"
                min={0}
                max={totalSupply}
                value={alreadyMint}
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                onValueChanged={()=>{}}
                disabled
                valueLabel={totalSupply === alreadyMint ? "MAX" : `${(alreadyMint / totalSupply) * 100}%`}
              />
              {totalSupply}
            </CardFooter>
          </Card>
        </Row>
      </PageSection>
    </>
  )
}

export default NftMarketPage
