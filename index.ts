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

function iterate_diodes_conducting(components: placed[], A: number[][], b: number[]): solution | null {
    // start by assuming all diodes are conducting
    const diodes: number[] = [];
    for (let i = 0; i < components.length; i++) {
        diodes.push(1);
    }

    const max_iterations = 10;
    for (let iter = 0; iter < max_iterations; iter++) {
        const B = structuredClone(A); // preserve A for next iteration
        const permutations = factor_plu(B);
        const x = lup_solve(B, permutations, b);

        // current from solver or 0 if diode is not conducting
        const currents: number[] = [];
        let c = 0;
        for (let d = 0; d < diodes.length; d++) {
            if (diodes[d]) {
                currents.push(x[c]);
                c++;
            } else {
                currents.push(0);
            }
        }
        const voltages = [0, ...x.slice(c)];

        let opened = 0; // how many open diodes were found in this iteration
        for (let c = 0; c < components.length; c++) {
            const cp = components[c];
            const cc = cp.c;
            // TODO do we need to handle diodes that we thought were open circuits in last iteration?
            if (cc.type === "diode" && diodes[c] && voltages[cp.p] - voltages[cp.q] < cc.Vd) {
                // row / column in A, accounting for already-deleted columns
                const to_delete = diodes.slice(0, c + 1).reduce((sum, d) => sum + d, 0);
                A.splice(to_delete, 1)
                for (let i = 0; i < A.length; i++) {
                    A[i].splice(to_delete, 1);
                }
                diodes[c] = 0;
                opened++;
            }
        }

        if (opened === 0) {
            return { currents, voltages };
        }
    }
    return null;
}

// Node 0 should be ground; the solution voltages are expressed relative to this node
// The solution currents are in the same order as the specified components
export function solve(components: placed[]): solution | null {
    const C = components.length;
    // find highest-numbered node
    let N = 0;
    for (const c of components) {
        N = Math.max(N, c.p, c.q);
    }

    // square matrix, all zeros, one row (equation) per component, 1 per node except node 0
    const A: number[][] = [];
    const b: number[] = [];
    for (let i = 0; i < N + C - 1; i++) {
        const row: number[] = [];
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

    return iterate_diodes_conducting(components, A, b);
}
