const round = (fl, places) => Number(fl.toFixed(places ? places : 0));

const generateID = () =>
  Math.random().toString(10).substring(2, 6) +
  Date.now().toString(10).substring(3, 7);

export { round, generateID };
