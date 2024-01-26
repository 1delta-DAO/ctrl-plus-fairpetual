import { Children, cloneElement } from 'react'

const SwitcherButton: React.FC<{
  active: boolean
  onClick: () => void
  children: React.ReactNode
}> = ({ active, onClick, children }) => {
  const cssCommon = 'rounded-[0.35em] py-2 w-full text-center transition-all'
  const cssActive = 'bg-violet-600 font-bold'
  const cssInactive = 'text-gray-400 cursor-pointer hover:bg-violet-700'

  const css = (active: boolean) => {
    if (active) {
      return cssCommon + ' ' + cssActive
    } else {
      return cssCommon + ' ' + cssInactive
    }
  }

  return (
    <div className={css(active)} onClick={onClick}>
      {children}
    </div>
  )
}

const Switcher: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <div className="flex w-full rounded-[0.35em] bg-violet-800 p-2">
      {Children.map(children, (child, index) => {
        return cloneElement(child as any, {
          key: index,
        })
      })}
    </div>
  )
}

export { Switcher, SwitcherButton }
