import React from "react";
import styled from "styled-components";
import LogoRound from "../Svg/Icons/LogoRound";
import Text from "../Text/Text";
import Skeleton from "../Skeleton/Skeleton";
import { Colors } from "../../theme";

export interface Props {
  color?: keyof Colors;
  cakePriceUsd?: number;
  showSkeleton?: boolean;
}

const PriceLink = styled.a`
  display: flex;
  align-items: center;
  svg {
    transition: transform 0.3s;
  }
  :hover {
    svg {
      transform: scale(1.2);
    }
  }
`;

const CakePrice: React.FC<React.PropsWithChildren<Props>> = ({
  cakePriceUsd,
  color = "textSubtle",
  showSkeleton = true,
}) => {

  const renderPrice = () => {
    if (cakePriceUsd) {
      const str = cakePriceUsd.toFixed(20) + '';
      let num = 0;
      str.split('').find(item => {
        if(item === '0' || item === '.') {
          num++;
          return false
        }
        return true;
      });
      return `0.(${num - 2})` + str.slice(-(str.length - num))
    }
  }
  
  const bnbTigerCA = "0xac68931b666e086e9de380cfdb0fb5704a35dc2d";
  const swapLink = window.location.origin+`/swap?outputCurrency=${bnbTigerCA}&chainId=56`

  return cakePriceUsd ? (
    <PriceLink
      href={swapLink}
      target="_blank"
    >
      <LogoRound width="24px" mr="8px" />
      <Text color={color} bold style={{marginLeft: '8px'}}>{`$${renderPrice()}`}</Text>
      {/* <Text color={color} bold>{`$${cakePriceUsd.toFixed(20)}`}</Text> */}
    </PriceLink>
  ) : showSkeleton ? (
    <Skeleton width={80} height={24} />
  ) : null;
};

export default React.memo(CakePrice);
