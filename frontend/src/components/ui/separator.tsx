import { FC } from 'react'

import { EuiHorizontalRule } from '@elastic/eui'

const Separator: FC = () => {
  return (
    <div className="w-full">
      <EuiHorizontalRule
        style={{
          margin: '0',
          backgroundColor: 'rgb(91 33 182)',
        }}
      />
    </div>
  )
}

export default Separator
