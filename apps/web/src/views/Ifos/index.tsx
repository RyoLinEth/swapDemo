import { SubMenuItems } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { useRouter } from 'next/router'
import { useFetchIfo } from 'state/pools/hooks'
import Hero from './components/Hero'
import IfoProvider from './contexts/IfoContext'

export const IfoPageLayout = ({ children }) => {
  const { t } = useTranslation()
  const router = useRouter()
  const isExact = router.route === '/ido'
  // const isExact = router.route === '/ifo'
  // useFetchIfo()

  return (
    <IfoProvider>
      <SubMenuItems
        items={[
          {
            label: t('Latest'),
            href: '/ido',
            // href: '/ifo',
          },
          {
            label: t('Finished'),
            href: '/ido/history',
            // href: '/ifo/history',
          },
        ]}
        activeItem={isExact ? '/ido' : '/ido/history'}
        // activeItem={isExact ? '/ifo' : '/ifo/history'}
      />
      {/* <Hero /> */}
      {children}
    </IfoProvider>
  )
}
