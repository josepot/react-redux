import { useState, useRef, useEffect, useMemo, useLayoutEffect } from 'react'
import invariant from 'invariant'
import { useReduxContext } from './useReduxContext'
import shallowEqual from '../utils/shallowEqual'
import Subscription from '../utils/Subscription'

// React currently throws a warning when using useLayoutEffect on the server.
// To get around it, we can conditionally useEffect on the server (no-op) and
// useLayoutEffect in the browser. We need useLayoutEffect to ensure the store
// subscription callback always has the selector from the latest render commit
// available, otherwise a store update may happen between render and the effect,
// which may cause missed updates; we also must ensure the store subscription
// is created synchronously, otherwise a store update may occur before the
// subscription is created and an inconsistent state may be observed
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

/**
 * A hook to access the redux store's state. This hook takes a selector function
 * as an argument. The selector is called with the store state.
 *
 * This hook takes a dependencies array as an optional second argument,
 * which when passed ensures referential stability of the selector (this is primarily
 * useful if you provide a selector that memoizes values).
 *
 * @param {Function} selector the selector function
 *
 * @returns {any} the selected state
 *
 * @example
 *
 * import React from 'react'
 * import { useSelector } from 'react-redux'
 * import { RootState } from './store'
 *
 * export const CounterComponent = () => {
 *   const counter = useSelector(state => state.counter)
 *   return <div>{counter}</div>
 * }
 */
export function useSelector(selector) {
  invariant(selector, `You must pass a selector to useSelectors`)

  const { store, subscription: contextSub } = useReduxContext()

  const subscription = useMemo(() => new Subscription(store, contextSub), [
    store,
    contextSub
  ])

  let state, setState
  try {
    ;[state, setState] = useState(selector(store.getState()))
  } catch (err) {
    const errorMessage = `An error occured while selecting the store state: ${
      err.message
    }.`
    throw new Error(errorMessage)
  }
  const [error, setError] = useState(null)

  const latestSelector = useRef(selector)

  useIsomorphicLayoutEffect(() => {
    latestSelector.current = selector
    setState(selector(store.getState()))
  }, [selector])

  useIsomorphicLayoutEffect(() => {
    function checkForUpdates() {
      try {
        const newSelectedState = latestSelector.current(store.getState())

        if (shallowEqual(newSelectedState, state)) {
          return
        }
        setState(newSelectedState)
      } catch (err) {
        // we ignore all errors here, since when the component
        // is re-rendered, the selectors are called again, and
        // will throw again, if neither props nor store state
        // changed
        setError(err)
      }
    }

    subscription.onStateChange = checkForUpdates
    subscription.trySubscribe()

    checkForUpdates()

    return () => subscription.tryUnsubscribe()
  }, [store, subscription])

  if (error) {
    const errorMessage = `An error occured while selecting the store state: ${
      error.message
    }.\n\nOriginal stack trace:\n${error.stack}`

    throw new Error(errorMessage)
  }

  return state
}
