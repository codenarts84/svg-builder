function letterCounter(number, start) {
  // A, B, … Z, AA, AB, … ZZ, AAA …
  let baseChar = start.charCodeAt(0);
  let letters = "";

  do {
    number -= 1;
    letters = String.fromCharCode(baseChar + (number % 26)) + letters;
    number = (number / 26) >> 0; // quick `floor`
  } while (number > 0);

  return letters;
}

function skipLetterCounter(number, start, skip_letter, count) {
  const res = [];
  let num = number;
  const skips = skip_letter.split(/\s*,\s*/);
  while (res.length < count) {
    let baseChar = start.charCodeAt(0);
    let letters = "";
    do {
      number -= 1;
      letters = String.fromCharCode(baseChar + (number % 26)) + letters;
      number = (number / 26) >> 0; // quick `floor`
    } while (number > 0);
    if (!skips.includes(letters.toString())) res.push(letters);
    number = num + 1;
    num++;
  }
  return res;
}

function reverseLetterCounter(letters) {
  let n = 0;
  for (let p = 0; p < letters.length; p++) {
    n = letters[p].charCodeAt() - 64 + n * 26;
  }
  return n;
}

const SEAT_NUMBERINGS = [
  {
    id: "natural",
    label: "1, 2, 3, …",
    compute: (seats, startAt) => {
      let counter = startAt;
      return seats.map((s) => (counter++).toString());
    },
    skip: (seats, startAt, skip_letter) => {
      let counter = startAt;
      const res = [];
      const len = seats.length;
      const skips = skip_letter.split(/\s*,\s*/);
      while (res.length < len) {
        if (!skips.includes(counter.toString())) res.push(counter.toString());
        counter++;
      }
      return res;
      // return rows.map((r) => skipLetterCounter(counter++, 'a', skip_letter));
    },
    findStartAt: (firstValue) => {
      return parseInt(firstValue);
    },
    start: (val) => {
      return val;
    },
  },
  {
    id: "odd",
    label: "1, 3, 5, …",
    compute: (seats, startAt) => {
      let counter = startAt;
      if (startAt % 2)
        return seats.map((s) => {
          const n = counter;
          counter += 2;
          return n.toString();
        });
      return null;
    },
    skip: (seats, startAt, skip_letter) => {
      let counter = startAt;
      const res = [];
      const len = seats.length;
      const skips = skip_letter.split(/\s*,\s*/);
      while (res.length < len) {
        if (!skips.includes(counter.toString())) res.push(counter.toString());
        counter += 2;
      }
      return res;
    },
    findStartAt: (firstValue) => {
      return parseInt(firstValue);
    },
    start: (value) => {
      return value;
    },
  },
  {
    id: "even",
    label: "2, 4, 6, …",
    compute: (seats, startAt) => {
      let counter = startAt;
      if (startAt % 2) return null;
      return seats.map((s) => {
        const n = counter;
        counter += 2;
        return n.toString();
      });
    },
    skip: (seats, startAt, skip_letter) => {
      let counter = startAt;
      const res = [];
      const len = seats.length;
      const skips = skip_letter.split(/\s*,\s*/);
      while (res.length < len) {
        if (!skips.includes(counter.toString())) res.push(counter.toString());
        counter += 2;
      }
      return res;
    },
    findStartAt: (firstValue) => {
      return parseInt(firstValue);
    },
    start: (value) => {
      return value;
    },
  },
  // {
  //   id: "odd",
  //   label: "1, 3, 5, … / 2, 4, 6, …",
  //   compute: (seats, startAt) => {
  //     let counter = startAt;
  //     return seats.map((s) => {
  //       const n = counter;
  //       counter += 2;
  //       return n.toString();
  //     });
  //   },
  //   skip: (seats, startAt, skip_letter) => {
  //     let counter = startAt;
  //     const res = [];
  //     const len = seats.length;
  //     const skips = skip_letter.split(/\s*,\s*/);
  //     while (res.length < len) {
  //       if (!skips.includes(counter.toString())) res.push(counter.toString());
  //       counter += 2;
  //     }
  //     return res;
  //   },
  //   findStartAt: (firstValue) => {
  //     return parseInt(firstValue);
  //   },
  // },
  {
    id: "alpha",
    label: "A, B, C, …",
    compute: (seats, startAt) => {
      let counter = startAt;
      return seats.map((s) => letterCounter(counter++, "A"));
    },
    skip: (seats, startAt, skip_letter) => {
      let counter = startAt;
      return skipLetterCounter(counter, "A", skip_letter, seats.length);
    },
    findStartAt: (firstValue) => {
      return reverseLetterCounter(firstValue.toUpperCase());
    },
    start: (value) => {
      return letterCounter(value, "A");
    },
  },
  {
    id: "alphalower",
    label: "a, b, c, …",
    compute: (seats, startAt) => {
      let counter = startAt;
      return seats.map((s) => letterCounter(counter++, "a"));
    },
    skip: (seats, startAt, skip_letter) => {
      return skipLetterCounter(startAt, "a", skip_letter, seats.length);
    },
    findStartAt: (firstValue) => {
      return reverseLetterCounter(firstValue.toUpperCase());
    },
    start: (value) => {
      return letterCounter(value, "a");
    },
  },
];

const ROW_NUMBERINGS = [
  {
    id: "natural",
    label: "1, 2, 3, …",
    compute: (rows, startAt) => {
      let counter = startAt;
      return rows.map((r) => (counter++).toString());
    },
    skip: (rows, startAt, skip_letter) => {
      let counter = startAt;
      const res = [];
      const len = rows.length;
      const skips = skip_letter.split(/\s*,\s*/);
      while (res.length < len) {
        if (!skips.includes(counter.toString())) res.push(counter.toString());
        counter++;
      }
      return res;
    },
    start: (val) => {
      return val;
    },
    findStartAt: (firstValue) => {
      return parseInt(firstValue);
    },
  },
  {
    id: "odd",
    label: "1, 3, 5, …",
    compute: (rows, startAt) => {
      let counter = startAt;
      if (startAt % 2)
        return rows.map((s) => {
          const n = counter;
          counter += 2;
          return n.toString();
        });
      return null;
    },
    skip: (rows, startAt, skip_letter) => {
      let counter = startAt;
      const res = [];
      const len = rows.length;
      const skips = skip_letter.split(/\s*,\s*/);
      while (res.length < len) {
        if (!skips.includes(counter.toString())) res.push(counter.toString());
        counter += 2;
      }
      return res;
    },
    start: (value) => {
      return value;
    },
    findStartAt: (firstValue) => {
      return parseInt(firstValue);
    },
  },
  {
    id: "even",
    label: "2, 4, 6, …",
    compute: (rows, startAt) => {
      let counter = startAt;
      if (startAt % 2) return null;
      return rows.map((s) => {
        const n = counter;
        counter += 2;
        return n.toString();
      });
    },
    start: (value) => {
      return value;
    },
    skip: (rows, startAt, skip_letter) => {
      let counter = startAt;
      const res = [];
      const len = rows.length;
      const skips = skip_letter.split(/\s*,\s*/);
      while (res.length < len) {
        if (!skips.includes(counter.toString())) res.push(counter.toString());
        counter += 2;
      }
      return res;
    },
    findStartAt: (firstValue) => {
      return parseInt(firstValue);
    },
  },
  {
    id: "alpha",
    label: "A, B, C, …",
    compute: (rows, startAt) => {
      let counter = startAt;
      return rows.map((r) => letterCounter(counter++, "A"));
    },
    skip: (rows, startAt, skip_letter) => {
      let counter = startAt;
      return skipLetterCounter(counter, "A", skip_letter, rows.length);
    },
    findStartAt: (firstValue) => {
      return reverseLetterCounter(firstValue.toUpperCase());
    },
    start: (value) => {
      return letterCounter(value, "A");
    },
  },
  {
    id: "alphalower",
    label: "a, b, c, …",
    compute: (rows, startAt) => {
      let counter = startAt;
      return rows.map((r) => letterCounter(counter++, "a"));
    },
    skip: (rows, startAt, skip_letter) => {
      return skipLetterCounter(startAt, "a", skip_letter, rows.length);
    },
    findStartAt: (firstValue) => {
      return reverseLetterCounter(firstValue.toUpperCase());
    },
    start: (value) => {
      return letterCounter(value, "a");
    },
  },
  // roman numbers?
];

const reverse = (array) =>
  array.map((item, idx) => array[array.length - 1 - idx]);

export {
  letterCounter,
  skipLetterCounter,
  reverse,
  SEAT_NUMBERINGS,
  ROW_NUMBERINGS,
};
