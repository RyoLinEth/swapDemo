import Trans from 'components/Trans'
import styled from 'styled-components'
import { Link } from '@pancakeswap/uikit'

const InlineLink = styled(Link)`
  display: inline;
`

const config = [
  {
    title: <Trans>How can I get an achievement for participating in the IDO?</Trans>,
    description: [
      <Trans>You need to contribute a minimum of about 50/100/200 USD worth of USDT to either sale. Only your overall contribution is counted for the achievement.</Trans>,
    ]
  },
]
export default config
