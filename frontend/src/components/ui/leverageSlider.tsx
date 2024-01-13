import { FC } from 'react';

import {
  EuiRange,
  EuiRangeProps,
  useGeneratedHtmlId
} from '@elastic/eui';

interface LeverageSliderProps {
  leverage: EuiRangeProps['value']
  setLeverage: (value: EuiRangeProps['value']) => void
}

const LeverageSlider: FC<LeverageSliderProps> = ({ leverage, setLeverage }) => {

  const onChange: EuiRangeProps['onChange'] = (e) => {
    setLeverage(e.currentTarget.value)
  };

  const rangeNoLinearId = useGeneratedHtmlId({ prefix: 'rangeNoLinear' });

  const levels = [
    {
      min: 1,
      max: 10,
      color: '#5b21b6',
    },
    {
      min: 1,
      max: Number(leverage),
      color: '#7c3aed',
    },
  ]

  const ticks = [
    { label: '1x', value: 1 },
    { label: '2x', value: 2 },
    { label: '3x', value: 3 },
    { label: '4x', value: 4 },
    { label: '5x', value: 5 },
    { label: '6x', value: 6 },
    { label: '7x', value: 7 },
    { label: '8x', value: 8 },
    { label: '9x', value: 9 },
    { label: '10x', value: 10 },
  ]

  return (
    <>
      <EuiRange
        id={rangeNoLinearId}
        value={leverage}
        onChange={onChange}
        showTicks
        min={1}
        max={10}
        ticks={ticks}
        levels={Number(leverage) > 1 ? levels : [levels[0]]}
        aria-label="Leverage Slider"
        className='leverageSlider' // defined in globals.css
      />
    </>
  );
};

export default LeverageSlider;
