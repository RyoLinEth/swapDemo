import { useMemo } from 'react'
import useGetPublicIfoV3Data from 'views/Ifos/hooks/v3/useGetPublicIfoData'
import useGetWalletIfoV3Data from 'views/Ifos/hooks/v3/useGetWalletIfoData'

import { Ifo } from 'config/constants/types'

import { IfoCurrentCard } from './components/IfoFoldableCard'
import IfoContainer from './components/IfoContainer'
import IfoSteps from './components/IfoSteps'

interface TypeProps {
  activeIfo?: Ifo
}

const CurrentIfo: React.FC<React.PropsWithChildren<TypeProps>> = ({ activeIfo }) => {
  // const publicIfoData = useGetPublicIfoV3Data(activeIfo)
  // const walletIfoData = useGetWalletIfoV3Data(activeIfo)

  // const { poolBasic, poolUnlimited } = walletIfoData

  // console.log('data', publicIfoData, walletIfoData);

  // const isCommitted = useMemo(
  //   () =>
  //     poolBasic.amountTokenCommittedInLP.isGreaterThan(0) || poolUnlimited.amountTokenCommittedInLP.isGreaterThan(0),
  //   [poolBasic.amountTokenCommittedInLP, poolUnlimited.amountTokenCommittedInLP],
  // )

  return (
    <IfoContainer
      // ifo顶部右侧的ifo公开销售和私有销售
      ifoSection={<IfoCurrentCard />}
      // ifo下面的步骤条
      // ifoSteps={
      //   <IfoSteps />
      // }
    />
  )
}

export default CurrentIfo
