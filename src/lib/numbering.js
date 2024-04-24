function letterCounter(number, start) { // A, B, … Z, AA, AB, … ZZ, AAA …
  let baseChar = start.charCodeAt(0)
  let letters = ""

  do {
    number -= 1;
    letters = String.fromCharCode(baseChar + (number % 26)) + letters;
    number = (number / 26) >> 0; // quick `floor`
  } while (number > 0);

  return letters;
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
    id: 'natural',
    label: '1, 2, 3, …',
    compute: (seats, startAt) => {
      let counter = startAt
      return seats.map(s => (counter++).toString())
    },
    findStartAt: (firstValue) => {
      return parseInt(firstValue)
    },
  },
  {
    id: 'odd',
    label: '1, 3, 5, … / 2, 4, 6, …',
    compute: (seats, startAt) => {
      let counter = startAt
      return seats.map(s => {
        const n = counter
        counter += 2
        return n.toString()
      })
    },
    findStartAt: (firstValue) => {
      return parseInt(firstValue)
    },
  },
  {
    id: 'alpha',
    label: 'A, B, C, …',
    compute: (seats, startAt) => {
      let counter = startAt
      return seats.map(s => letterCounter(counter++, 'A'))
    },
    findStartAt: (firstValue) => {
      return reverseLetterCounter(firstValue.toUpperCase())
    },
  },
  {
    id: 'alphalower',
    label: 'a, b, c, …',
    compute: (seats, startAt) => {
      let counter = startAt
      return seats.map(s => letterCounter(counter++, 'a'))
    },
    findStartAt: (firstValue) => {
      return reverseLetterCounter(firstValue.toUpperCase())
    },
  },
]

const ROW_NUMBERINGS = [
  {
    id: 'natural',
    label: '1, 2, 3, …',
    compute: (rows, startAt) => {
      let counter = startAt
      return rows.map(r => (counter++).toString())
    },
    findStartAt: (firstValue) => {
      return parseInt(firstValue)
    },
  },
  {
    id: 'alpha',
    label: 'A, B, C, …',
    compute: (rows, startAt) => {
      let counter = startAt
      return rows.map(r => letterCounter(counter++, 'A'))
    },
    findStartAt: (firstValue) => {
      return reverseLetterCounter(firstValue.toUpperCase())
    },
  },
  {
    id: 'alphalower',
    label: 'a, b, c, …',
    compute: (rows, startAt) => {
      let counter = startAt
      return rows.map(r => letterCounter(counter++, 'a'))
    },
    findStartAt: (firstValue) => {
      return reverseLetterCounter(firstValue.toUpperCase())
    },
  },
  // roman numbers?
]

const reverse = (array) => array.map((item, idx) => array[array.length - 1 - idx])

export {
  letterCounter,
  reverse,
  SEAT_NUMBERINGS,
  ROW_NUMBERINGS
}
