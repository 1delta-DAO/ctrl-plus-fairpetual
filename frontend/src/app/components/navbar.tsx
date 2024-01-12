import Link from "next/link"
import { FC } from "react"
import { ConnectButton } from "../../components/web3/connect-button"

export const Navbar: FC = () => (
  <div className="flex justify-between px-8 py-4 items-center">
    <div className="flex gap-14 items-center">
      <div className="font-bold text-xl">
        Fairpetuals
      </div>
      <div className="flex gap-6 items-center">
        <Link href="/">Trade</Link>
        <Link href="/earn">Earn</Link>
      </div>
    </div>
    <ConnectButton />
  </div>
)
