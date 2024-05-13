const round = (fl, places) => Number(fl.toFixed(places ? places : 0));

const generateID = () => Math.random().toString(36).substring(2, 9);

export { round, generateID };
