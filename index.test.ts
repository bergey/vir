import {solve, placed} from './index';


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
  V({p: 0, q: 1}),
  R({p: 1, q: 0})
]
test('checks singleResistor', () => {
  expect(solve(singleResistor)).toEqual({"currents": [undefined, 0.013636363636363636], "voltages": [0, 3]})
})

const seriesResistor: placed[] = [
  V({p: 0, q: 1}),
  R({p: 1, q: 2}),
  R({p: 2, q: 0})
]
test('checks seriesResistor', () => {
  expect(solve(seriesResistor)).toEqual({
    "currents": [undefined, 0.006818181818181818, 0.006818181818181818],
    "voltages": [0, 3, 1.5]
  })
})

const voltageDivider: placed[] = [
  V({p: 0, q: 1}),
  R({r: 100, p: 1, q: 2}),
  R({r: 200, p: 2, q: 0})
]
test('checks voltageDivider', () => {
  expect(solve(voltageDivider)).toEqual({
    "currents": [undefined, 0.01, 0.01],
    "voltages": [0, 3, 2]
  })
})

const seriesDiode: placed[] = [
  V({p: 0, q: 1}),
  R({p: 1, q: 2}),
  D({p: 2, q: 0})
]
test('checks seriesDiode', () => {
  expect(solve(seriesDiode)).toEqual({
    "currents": [undefined, 0.00818181818181818, 0.00818181818181818],
    "voltages": [0, 3, 1.2]
  })
})