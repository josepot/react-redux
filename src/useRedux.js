import { useEffect, useRef, useMemo } from 'react'
import useReduxState from './useReduxState'
import useReduxActions from './useReduxActions'
import { ensurePlainObject, shallowCompare } from './utils'

export default (
  selector,
  actionCreators,
  mapper,
  props,
  displayName = 'Component'
) => {
  const prevPropsRef = useRef(null)
  const stateProps = useReduxState(selector, props)
  const actionProps = useReduxActions(actionCreators, props)
  if (process.env.NODE_ENV !== 'production') {
    ensurePlainObject(stateProps, displayName, 'mapStateToProps')
    ensurePlainObject(actionProps, displayName, 'mapDispatchToProps')
  }

  const result = useMemo(() => {
    const allProps = mapper(stateProps, actionProps, props)
    if (process.env.NODE_ENV !== 'production') {
      ensurePlainObject(allProps, displayName, 'mergeProps')
    }
    const isTheSame =
      prevPropsRef.current && shallowCompare(allProps, prevPropsRef.current)
    return isTheSame ? prevPropsRef.current : allProps
  }, [stateProps, actionProps, props, mapper])

  useEffect(() => {
    prevPropsRef.current = result
  }, [result])

  return result
}
