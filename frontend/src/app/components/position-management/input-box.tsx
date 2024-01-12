import { FC } from "react"

const Assets = {
  "AZERO": {
    name: "AZERO",
    image: "https://avatars.githubusercontent.com/u/54438045?s=200&v=4"
  },
  "BTC": {
    name: "BTC",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/1200px-Bitcoin.svg.png"
  },
}

interface InputBoxProps {
  topLeftLabel: string
  asset: keyof typeof Assets
}

const InputBox: FC<InputBoxProps> = ({ topLeftLabel, asset }) => {

  return (
    <div className='flex flex-col gap-2 p-4 rounded-[0.35em] w-full bg-purple-800'>
      <div className="flex w-full justify-between text-sm text-gray-300">
        <span>{topLeftLabel}</span>
        <span>Balance: 0</span>
      </div>
      <div className="flex w-full justify-between">
        <input
          className="rounded-[0.35em] w-full bg-transparent focus:outline-none text-2xl"
          placeholder="0.00"
          type="number"
        />
        <div className='flex items-center gap-2 w-2/6 justify-end'>
          <span className="text-2xl">{Assets[asset].name}</span>
          <img src={Assets[asset].image} width="23px" className="rounded-full"/>
        </div>
      </div>
    </div>
  )
}

export default InputBox
