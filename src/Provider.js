import PropTypes from 'prop-types'
import React, { useCallback, createContext, useState, useEffect } from 'react'

export const context = createContext({})

const { Provider } = context

const ReduxProvider = ({ store, children }) => {
  const [stateStore, setStateStore] = useState({})

  const setState = useCallback(
    () => setStateStore({ dispatch: store.dispatch, state: store.getState() }),
    [setStateStore, store]
  )

  useEffect(() => {
    setState()
    return store.subscribe(setState)
  }, [setState, store])

  return stateStore.dispatch === undefined ? null : (
    <Provider value={stateStore}>{children}</Provider>
  )
}

ReduxProvider.propTypes = {
  children: PropTypes.any,
  store: PropTypes.shape({
    subscribe: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    getState: PropTypes.func.isRequired
  })
}

export const ServerProvider = ({ store, children }) => (
  <Provider value={{ dispatch: store.dispatch, state: store.getState() }}>
    {children}
  </Provider>
)

ServerProvider.propTypes = ReduxProvider.propTypes

export default ReduxProvider
