import { useContext, useEffect, useMemo } from 'react'
import invariant from 'invariant'
import { context } from './Provider'

const emptyObj = {}

export default (selector, props = emptyObj) => {
  const { keySelector, use } = selector
  const key = useMemo(
    () => (keySelector ? keySelector(emptyObj, props) : undefined),
    [keySelector, props]
  )

  useEffect(() => key && use(key), [key, use])

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
