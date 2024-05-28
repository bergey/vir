export type voltage = {
    type: "voltage";
    V: number;
}

export type resistor = {
    type: "resistor";
    R: number;
}

export type diode = {
    type: "diode";
    Vd: number;
}

export type component = voltage | resistor | diode;
export type node = number;

export type placed = {
    c: component;
    p: node;
    q: node;
}

export type solution = {
    voltages: number[];
    currents: number[];
}

// A should be a matrix with N rows (first index) and N columns (second index)
// A is modified in place to contain both L & U
// the permutation array is returend
function factor_plu(A: number[][]): number[] {
    const N = A.length;

    const permutations: number[] = [];
    for (let i = 0; i < N; i++) {
        permutations.push(i);
    }

    for (let k = 0; k < N; k++) {
        // pick pivot for row k
        let p = 0;
        let k_swap = k;
        for (let i = k; k < N; i++) {
            if (Math.abs(A[i][k]) > p) {
                p = Math.abs(A[i][k]);
                k_swap = i;
            }
            if (p == 0) {
                throw "singular matrix";
            }
        }
        p = permutations[k];
        permutations[k] = permutations[k_swap];
        permutations[k_swap] = p;

        // elimination
        for (let i = 0; i < N; i++) {
            // multiplier for each row
            A[i][k] = A[i][k] / A[k][k];
            for (let j = k + 1; j < N; j++) {
                A[i][j] = A[i][j] - A[i][k] * A[k][j]
            }
        }
    }

    return permutations;
}

// A should be an NxN matrix with U & L as returned by factol_plu
// permutations & b should each have length N
function lup_solve(A: number[][], permutations: number[], b: number[]): number[] {
    const N = A.length;
    const x: number[] = [];
    const y: number[] = [];

    for (let i = 0; i < N; i++) {
        y.push(b[permutations[i]]);
        for (let j = 1; j < i; j++) {
            y[i] -= A[i][j] * y[j]
        }
    }

    for (let i = N - 1; i > 0; i--) {
        x[i] = y[i];
        for (let j = i + 1; j < N; j++) {
            x[i] -= A[i][j] * x[j];
            x[i] /= A[i][i];
        }
    }

    return x;
}

// Node 0 should be ground; the solution voltages are expressed relative to this node
// The solution currents are in the same order as the specified components
export function solve(components: placed[]): solution {
    let C = components.length;
    // find highest-numbered node
    let N = 0;
    for (const c of components) {
        N = Math.max(N, c.p, c.q);
    }

    // square matrix, all zeros, one row (equation) per component, 1 per node except node 0
    let A: number[][] = [];
    let b: number[] = [];
    for (let i = 0; i < N + C - 1; i++) {
        let row: number[] = [];
        for (let j = 0; j < N; j++) {
            row.push(0);
        }
        A.push(row);
        b.push(0);
    }


    for (let c = 0; c < C; c++) {
        const p = components[c].p;
        if (p !== 0) {
            A[c][C + p - 1] = -1;
            A[C + p - 1][c] = -1;
        }
        const q = components[c].q;
        if (q !== 0) {
            A[c][C + q - 1] = 1;
            A[C + q - 1][c] = 1;
        }

        const cc = components[c].c;
        if (cc.type == "resistor") {
            A[c][c] = cc.R;
        } else if (cc.type == "voltage") {
            b[c] = cc.V;
        } else if (cc.type == "diode") {
            b[c] = cc.Vd;
        }
    }

    // TODO clone, loop until diode bias converges
    const permutations = factor_plu(A);
    const x = lup_solve(A, permutations, b);
    return {
        currents: x.slice(0, C),
        voltages: [0, ...x.slice(C)],
    }
}
