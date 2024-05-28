type voltage = {
    type: "voltage";
    V: number;
}

type resistor = {
    type: "resistor";
    R: number;
}

type diode = {
    type: "diode";
    Vd: number;
}

type component = voltage | resistor | diode;
type node = number;

type placed = {
    c: component;
    p: node;
    q: node;
}
