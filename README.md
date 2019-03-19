React Redux Lean
=========================

Unofficial React bindings for [Redux](https://github.com/reduxjs/redux).  

It is like `react-redux`, but removing a few features that most developers don't use. It also exposes 3 hooks, in case that you don't want to use the `connect` HOC.

It is a fork of react-redux and it uses all the tests that are still relevant.

The main differences between the `connect` functions of react-redux and react-redux-lean are that the later:

- Does not accept factory selectors.
- Knows how to handle "usable" selectors. So, if you decide to use redux-views with react-redux-lean then the cache of your shared-selectors will be automatically invalidated when there are no mounted components left using that cache entry.
- Does not support the "impure" option.
- It exposes the following hooks: `useReduxState`, `useReduxActions` and `useRedux`
