let nComputations = 0
let prevState
const rootSelector = state => {
  if (state === prevState) return prevState
  nComputations++
  return (prevState = state)
}
rootSelector.recomputations = nComputations

const selectorsIds = new WeakMap([[rootSelector, 0]])
const selectors = new Map([
  [
    0,
    {
      selector: rootSelector,
      dependants: new Set(),
      dependencies: [],
      level: 0
    }
  ]
])
const instanceSelectors = new Map()
let nextId = 1

const defaultDependencies = [0]

const registerIdIntoDependencyId = id => dependencyId =>
  selectors.get(dependencyId).dependants.add(id)

const registerSelector = selector => {
  let id = selectorsIds.get(selector)
  if (id !== undefined) return id

  id = nextId++
  selectorsIds.add(selector, id)
  const entry = {
    selector,
    dependants: new Set()
  }

  selectors.add(id, entry)

  entry.dependencies = selector.dependencies
    ? selector.dependencies.map(registerSelector)
    : defaultDependencies

  entry.dependencies.forEach(registerIdIntoDependencyId(id))
  entry.level = Math.max(...entry.dependencies.map(x => selectors[x].level)) + 1
  return id
}

const registerKey = (key, selectorId) => {
  let entries = instanceSelectors.get(selectorId);
  if (!entries) {
    entries = new Map([key, {dependants: new Map()}])
  }
  const {
    keys,
    selector: { dependencies, keySelector },
    dependencies: dependenciesIds
  } = instanceSelectors.get(selectorId)
  if (!keys || keys.has(key)) return

  keys.add(key)
  if (!dependencies) return

  if (!keySelector.fns) {
    dependenciesIds.forEach(selectorId => registerKey(key, selectorId))
  } else {
    const keys = key.split('/').map(decodeURIComponent)
    dependencies.forEach(({ keySelector }, idx) => {
      keySelector &&
        registerKey(
          keys[keySelector.fns.indexOf(keySelector)],
          dependenciesIds[idx]
        )
    })
  }
}
