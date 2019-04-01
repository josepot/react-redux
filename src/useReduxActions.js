import { useContext, useMemo } from 'react'
import invariant from 'invariant'
import { dispatchContext } from './Provider'

const emptyObj = {}

export default (actionCreators = emptyObj, props = emptyObj) => {
  const dispatch = useContext(dispatchContext)
  if (process.env.NODE_ENV !== 'production') {
    invariant(dispatch, 'Could not find "store"')
  }
  const relevantProps =
    typeof actionCreators === 'function' && actionCreators.length !== 1
      ? props
      : emptyObj

  return useMemo(() => {
    if (actionCreators === null) return { dispatch }
    if (typeof actionCreators === 'function')
      return actionCreators(dispatch, relevantProps)

    const res = {}
    Object.entries(actionCreators).forEach(([name, aCreator]) => {
      res[name] = (...args) => dispatch(aCreator(...args))
    })
    return res
  }, [actionCreators, dispatch, relevantProps])
}
