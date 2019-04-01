import { useContext, useEffect, useMemo } from 'react'
import invariant from 'invariant'
import { stateContext } from './Provider'

const emptyObj = {}

export default (selector, props = emptyObj) => {
  const { keySelector = Function.prototype, use } = selector
  const key = keySelector(null, props)

  useEffect(() => use && use(key), [key, use])

  const finalProps = selector.length === 1 ? emptyObj : props
  const state = useContext(stateContext)
  if (process.env.NODE_ENV !== 'production') {
    invariant(state !== undefined, 'Could not find "store"')
  }

  return useMemo(() => selector(state, finalProps), [
    selector,
    state,
    finalProps
  ])
}
