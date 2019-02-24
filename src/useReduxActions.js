import { useContext, useMemo } from 'react'
import { context } from './Provider'

const emptyObj = {}

export default (actionCreators = emptyObj) => {
  const { dispatch } = useContext(context)
  return useMemo(() => {
    if (actionCreators === null) return { dispatch }
    if (typeof actionCreators === 'function') return actionCreators(dispatch)

    const res = {}
    Object.entries(actionCreators).forEach(([name, aCreator]) => {
      res[name] = (...args) => dispatch(aCreator(...args))
    })
    return res
  }, [actionCreators, dispatch])
}
