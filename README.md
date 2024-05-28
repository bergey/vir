# VIR

solve circuit equations with resistors & diodes

## examples

``` typescript
solve([
    {
        c: {
            type: "voltage",
            V: 3
        },
        p: 0,
        q: 1,
    },
    {
        c: {
            type: "resistor",
            R: 220, // Ohms?
        },
        p: 1,
        q: 2,
    },
    {
        c: {
            type: "diode",
            Vd: 1.2,
        },
        p: 2,
        q: 0,
    },
])
````
