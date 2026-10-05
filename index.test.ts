import {solve, factor_plu, placed} from './index';

let A1 = [
  [1, 2, 3],
  [2, 3, 1],
  [-2, 3, -2]
]

test("square factor_plu", () => {
  const factor = factor_plu(A1);
  expect(factor).toEqual([]);
  expect(A1).toEqual([]);
})

const V = ({v = 3, p, q}): placed => {
  return {
    c: {
      type: "voltage",
      V: v // Volts
    },
    p,
    q,
  }
}

const R = ({r = 200, p, q}): placed => {
  return {
    c: {
      type: "resistor",
      R: r, // Ohms
    },
    p,
    q,
  }
}

const D = ({vd = 1.2, p, q}): placed => {
  return {
    c: {
      type: "diode",
      Vd: vd, // Volts
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
  expect(solve(singleResistor)).toEqual({"currents": [undefined, 0.015], "voltages": [0, 3]})
})

const seriesResistor: placed[] = [
  V({p: 0, q: 1}),
  R({p: 1, q: 2}),
  R({p: 2, q: 0})
]
test('checks seriesResistor', () => {
  expect(solve(seriesResistor)).toEqual({
    "currents": [undefined, 0.0075, 0.0075],
    "voltages": [0, 3, 1.5]
  })
})

const voltageDivider: placed[] = [
  V({p: 0, q: 1}),
  R({r: 100, p: 1, q: 2}),
  R({p: 2, q: 0})
]
test('checks voltageDivider', () => {
  expect(solve(voltageDivider)).toEqual({
    "currents": [undefined, 0.01, 0.01],
    "voltages": [0, 3, 2]
  })
})

const parallelResistor: placed[] = [
  V({p: 0, q: 1}),
  R({p: 1, q: 0}),
  R({p: 1, q: 0})
]
test('checks parallelResistor', () => {
  expect(solve(parallelResistor)).toEqual({
    "currents": [undefined, 0.015, 0.015],
    "voltages": [0, 3]
  })
})

const seriesDiode: placed[] = [
  V({p: 0, q: 1}),
  R({p: 1, q: 2}),
  D({p: 2, q: 0})
]
test('checks seriesDiode', () => {
  expect(solve(seriesDiode)).toEqual({
    "currents": [undefined, 0.009, 0.009],
    "voltages": [0, 3, 1.2]
  })
})