export const mapObj = (obj, mapper) => Object.keys(obj).reduce(
  (res, key) => {
    res[key] = mapper(obj[key], key, obj);
    return res;
  },
  {}
);

export const shallowCompare = (a, b) => {
  if (a === b) return true;
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;

  for (let i = 0; i < aKeys.length; i++) {
    if (a[aKeys[i]] !== b[aKeys[i]] || a[bKeys[i]] !== b[bKeys[i]]) {
      return false;
    }
  }
  return true;
};
