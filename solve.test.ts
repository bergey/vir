import {factor_plu, solve, placed} from './solve';


const V = ({v = 3, p, q}): placed => {
  return {
    c: {
      type: "voltage",
      V: v
    },
    p,
    q,
  }
}

const R = ({r = 220, p, q}): placed => {
  return {
    c: {
      type: "resistor",
      R: r, // Ohms?
    },
    p,
    q,
  }
}

const D = ({vd = 1.2, p, q}): placed => {
  return {
    c: {
      type: "diode",
      Vd: vd,
    },
    p,
    q,
  }
}

const singleResistor: placed[] = [
  V({v: 3, p: 0, q: 1}),
  R({p: 1, q: 0})
]
test('checks singleResistor', () => {
  expect(solve(singleResistor)).toEqual([])
})

const seriesResistor: placed[] = [
  V({v: 3, p: 0, q: 1}),
  R({p: 1, q: 2}),
  R({p: 2, q: 0})
]
test('checks seriesResistor', () => {
  expect(solve(seriesResistor)).toEqual([])
})

const voltageDivider: placed[] = [
  V({v: 3, p: 0, q: 1}),
  R({r: 100, p: 1, q: 2}),
  R({r: 200, p: 2, q: 0})
]
test('checks voltageDivider', () => {
  expect(solve(voltageDivider)).toEqual([])
})

const seriesDiode: placed[] = [
  V({v: 3, p: 0, q: 1}),
  R({p: 1, q: 2}),
  D({p: 2, q: 0})
]
test('checks seriesDiode', () => {
  expect(solve(seriesDiode)).toEqual([])
})