import React, { useContext, useMemo } from "react";
import styled, { keyframes } from "styled-components";
import Flex from "../../../components/Box/Flex";
// import { LogoIcon, LogoWithTextIcon } from "../../../components/Svg";
import { MenuContext } from "../context";
import logoIcon from "../../../components/Svg/logo.svg";

interface Props {
  href: string;
}

const blink = keyframes`
  0%,  100% { transform: scaleY(1); }
  50% { transform:  scaleY(0.1); }
`;

const StyledLink = styled("a")`
  display: flex;
  .mobile-icon {
    width: 32px;
    ${({ theme }) => theme.mediaQueries.lg} {
      display: none;
    }
  }
  .desktop-icon {
    width: 160px;
    display: none;
    ${({ theme }) => theme.mediaQueries.lg} {
      display: block;
    }
  }
  .eye {
    animation-delay: 20ms;
  }
  &:hover {
    .eye {
      transform-origin: center 60%;
      animation-name: ${blink};
      animation-duration: 350ms;
      animation-iteration-count: 1;
    }
  }
`;

// 左上角回首页的logo
const Logo: React.FC<React.PropsWithChildren<Props>> = ({ href }) => {
  const { linkComponent } = useContext(MenuContext);
  const isAbsoluteUrl = href.startsWith("http");

  const [innerLogo] = useMemo(() => {
    const logo = (
      <>
      {/* <span className="mobile-icon"><LogoIcon /></span> */}
        <img className="mobile-icon" src={logoIcon?.src ?? ''} alt="logo" />
        <img className="desktop-icon" src={logoIcon?.src ?? ''} alt="logo" />
        {/* <LogoWithTextIcon className="desktop-icon" /> */}
      </>
    );
    return [logo]
  }, []);
  // const innerLogo = (
  //   <>
  //     <LogoIcon className="mobile-icon" />
  //     <LogoWithTextIcon className="desktop-icon" />
  //   </>
  // );

  return (
    <Flex alignItems="center">
      {isAbsoluteUrl ? (
        <StyledLink as="a" href={href} aria-label="Pancake home page">
          {/* {innerLogo} */}
          666
        </StyledLink>
      ) : (
        <StyledLink href={href} as={linkComponent} aria-label="Pancake home page">
          {innerLogo}
        </StyledLink>
      )}
    </Flex>
  );
};

export default React.memo(Logo);
