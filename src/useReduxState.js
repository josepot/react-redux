import { useContext, useEffect, useMemo } from 'react'
import invariant from 'invariant'
import { context } from './Provider'

const emptyObj = {}

export default (selector_, props = emptyObj) => {
  const [selector, unsubscribe] = useMemo(
    () => (selector_.use ? selector_.use() : [selector_, Function.prototype]),
    [selector_]
  )
  useEffect(() => unsubscribe, [unsubscribe])

  const finalProps = useMemo(() => (selector.length === 1 ? emptyObj : props), [
    props,
    selector
  ])
  const { state } = useContext(context)
  if (process.env.NODE_ENV !== 'production') {
    invariant(state !== undefined, 'Could not find "store"')
  }
  return useMemo(() => selector(state, finalProps), [
    selector,
    state,
    finalProps
  ])
}
