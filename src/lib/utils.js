export const groupValue = (areas, mapper) => {
  const uniques = areas.map(mapper).filter((v, i, s) => s.indexOf(v) === i);
  if (uniques.length === 1) {
    return uniques[0];
  } else {
    return undefined;
  }
};
