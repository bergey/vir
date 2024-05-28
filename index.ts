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

// A should be a matrix with N rows (first index) and N columns (second index)
// A is modified in place to contain both L & U
// the permutation array is returend
function factor_plu(A: number[][]): number[] {
    const N = A.length;

    const permutations: number[] = [];
    for (let i = 1; i <= N; i++) {
        permutations.push(i);
    }

    for (let k = 1; k <= N; k++) {
        // pick pivot for row k
        let p = 0;
        let k_swap = k;
        for (let i = k; k <= N; i++) {
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
        for (let i = 1; i <= N; i++) {
            // multiplier for each row
            A[i][k] = A[i][k] / A[k][k];
            for (let j = k + 1; j <= N; j++) {
                A[i][j] = A[i][j] - A[i][k] * A[k][j]
            }
        }
    }

    return permutations;
}
