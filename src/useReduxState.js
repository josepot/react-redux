import { useContext, useEffect, useMemo } from 'react'
import { context } from './Provider'

const emptyObj = {}

export default (selector_, props = emptyObj) => {
  const [selector, unsubscribe] = useMemo(
    () => (selector_.use ? selector_.use() : [selector_, Function.prototype]),
    [selector_]
  )
  const finalProps = useMemo(() => (selector.length === 1 ? emptyObj : props), [
    props,
    selector
  ])
  useEffect(() => unsubscribe, [unsubscribe])
  const { state } = useContext(context)
  return useMemo(() => selector(state, finalProps), [
    selector,
    state,
    finalProps
  ])
}
