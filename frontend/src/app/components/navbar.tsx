import Image from 'next/image'
import Link from 'next/link'
import { FC } from 'react'

import Banner from 'public/images/fairpetuals-banner.png'
import Logo from 'public/images/fairpetuals-logo.png'

import { ConnectButton } from '../../components/web3/connect-button'

export const Navbar: FC = () => (
  <div className="flex items-center justify-between px-8 py-4">
    <div className="flex items-center gap-14">
      <div className="flex items-center gap-2 text-xl font-bold">
        <Image src={Logo} width={45} height={45} className="rounded-full" alt="Asset Icon" />
        <Image src={Banner} width={200} height={100} alt="Banner" />
      </div>
      <div className="flex items-center gap-6">
        <Link href="/">Trade</Link>
        <Link href="/earn">Earn</Link>
      </div>
    </div>
    <ConnectButton />
  </div>
)
