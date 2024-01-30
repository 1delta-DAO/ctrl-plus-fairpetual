import { FC } from 'react'

import { EuiRange, EuiRangeProps, useGeneratedHtmlId } from '@elastic/eui'

interface LeverageSliderProps {
  leverage: number
  setLeverage: (value: number) => void
}

const LeverageSlider: FC<LeverageSliderProps> = ({ leverage, setLeverage }) => {
  const onChange: EuiRangeProps['onChange'] = (e) => {
    setLeverage(parseInt(e.currentTarget.value))
  }

  const rangeNoLinearId = useGeneratedHtmlId({ prefix: 'rangeNoLinear' })

  const levels = [
    {
      min: 1,
      max: 100,
      color: '#5b21b6',
    },
    {
      min: 1,
      max: leverage,
      color: '#7c3aed',
    },
  ]

  // e.g., [{ label: '1x', value: 1 }, { label: '2x', value: 2 }, ...]
  let ticks = Array.from({ length: 10 }, (_, i) => ({
    label: `${(i + 1) * 10}x`,
    value: (i + 1) * 10,
  }))

  ticks = [{ label: '1x', value: 1 }, ...ticks]

  return (
    <>
      <EuiRange
        id={rangeNoLinearId}
        value={leverage}
        onChange={onChange}
        showTicks
        min={1}
        max={100}
        ticks={ticks}
        levels={Number(leverage) > 1 ? levels : [levels[0]]}
        aria-label="Leverage Slider"
        className="leverageSlider" // defined in globals.css
        style={{ marginBottom: '0.5em' }}
      />
    </>
  )
}

export default LeverageSlider
