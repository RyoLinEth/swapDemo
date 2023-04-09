import { ReactElement } from 'react'
import styled from 'styled-components'
import { useTranslation } from '@pancakeswap/localization'
import { Box, Container, LinkExternal } from '@pancakeswap/uikit'
import IfoLayout, { IfoLayoutWrapper } from './IfoLayout'
import IfoPoolVaultCard from './IfoPoolVaultCard'
import IfoQuestions from './IfoQuestions'

const IfoStepBackground = styled(Box)`
  background: ${({ theme }) => theme.colors.gradientBubblegum};
`

interface TypeProps {
  ifoSection: ReactElement
  ifoSteps: ReactElement
}

// ifo的整体布局页面
const IfoContainer: React.FC<React.PropsWithChildren<TypeProps>> = ({ ifoSection, ifoSteps }) => {
  const { t } = useTranslation()

  return (
    <IfoLayout id="current-ifo" py={['24px', '24px', '40px']}>
      {/* ifo顶部的cake和右边的销售框 */}
      <Container>
        <IfoLayoutWrapper>
          {/* ifo顶部的质押cake和下面的领取代币 */}
          {/* <IfoPoolVaultCard /> */}
          {/* ifo顶部右侧的公开销售和私人销售 */}
          {ifoSection}
        </IfoLayoutWrapper>
      </Container>
      {/* ifo下面的步骤 条 */}
      {/* <IfoStepBackground>
        <Container>{ifoSteps}</Container>
      </IfoStepBackground> */}
      <Container>
        {/* ifo底部的详细资料 */}
        <IfoQuestions />
        {/* ifo底部的链接 */}
        {/* <LinkExternal
          href="https://docs.pancakeswap.finance/contact-us/business-partnerships#ifos-token-sales"
          mx="auto"
          mt="16px"
        >
          {t('Apply to run an IFO!')}
        </LinkExternal> */}
      </Container>
    </IfoLayout>
  )
}

export default IfoContainer
