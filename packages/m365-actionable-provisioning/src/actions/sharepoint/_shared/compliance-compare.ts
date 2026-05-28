/**
 * Compliance comparison helpers.
 *
 * @remarks
 * Shared utilities for action `checkCompliance()` implementations.
 * Designed to be reusable across site/list/field actions without depending on PnPjs types.
 *
 * @packageDocumentation
 */

export type ComplianceMismatch = Readonly<{
    key: string;
    expected: unknown;
    actual: unknown;
}>;

export type CompareOptions = Readonly<{
    /**
     * If true, treats `undefined` and `null` as equivalent values during comparison.
     *
     * @defaultValue true
     */
    nullishEqual?: boolean;
}>;

function normalizeForCompare(value: unknown, nullishEqual: boolean): unknown {
    return nullishEqual ? (value ?? null) : value;
}

/**
 * Compares a set of expected properties against actual values.
 *
 * @remarks
 * Returns an array of mismatches of the form `{ key, expected, actual }`.
 * Callers can decide how to surface mismatches in action compliance results.
 */
export function compareProperties(
    expected: Readonly<Record<string, unknown>>,
    actual: Readonly<Record<string, unknown>>,
    options: CompareOptions = {}
): ComplianceMismatch[] {
    const nullishEqual = options.nullishEqual ?? true;

    const mismatches: ComplianceMismatch[] = [];
    for (const key of Object.keys(expected)) {
        const exp = expected[key];
        const act = actual[key];

        const nExp = normalizeForCompare(exp, nullishEqual);
        const nAct = normalizeForCompare(act, nullishEqual);

        if (nAct !== nExp) mismatches.push({ key, expected: exp, actual: act });
    }

    return mismatches;
}
