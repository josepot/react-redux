import PropTypes from 'prop-types'
import React, { useCallback, createContext, useState, useEffect } from 'react'

export const context = createContext({})

const { Provider } = context

const ReduxProvider = ({ store, children, isSSR }) => {
  const [stateStore, setStateStore] = useState(
    isSSR ? { dispatch: store.dispatch, state: store.getState() } : {}
  )
  const setState = useCallback(
    () => setStateStore({ dispatch: store.dispatch, state: store.getState() }),
    [setStateStore, store]
  )

  useEffect(() => {
    if (isSSR) return undefined
    setState()
    return store.subscribe(setState)
  }, [isSSR, setState, store])

  return stateStore.dispatch === undefined ? null : (
    <Provider value={stateStore}>{children}</Provider>
  )
}

ReduxProvider.propTypes = {
  children: PropTypes.any,
  isSSR: PropTypes.bool,
  store: PropTypes.shape({
    subscribe: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    getState: PropTypes.func.isRequired
  })
}

ReduxProvider.defaultProps = {
  isSSR: false
}

export default ReduxProvider
