/**
 * valuationEngine.js
 * Pure, reusable financial functions for Airbnb investment valuation.
 */

/**
 * Computes total initial investment — the capital deployed at purchase.
 * This value is used ONLY in NPV and payback calculations; it must never
 * be included in monthly operating expenses or cash flow.
 *
 * @param {number} downPayment   - Down payment amount ($).
 * @param {number} closingCosts  - Closing costs (title, origination, fees, etc.) ($).
 * @returns {number} Total initial investment ($).
 */
export function buildInitialInvestment(downPayment, closingCosts) {
  return downPayment + closingCosts;
}

/**
 * Annualizes a monthly cash flow figure.
 *
 * @param {number} monthlyCashFlow - Net cash flow for a single month ($).
 * @returns {number} Annual cash flow ($).
 */
export function calculateAnnualCashFlow(monthlyCashFlow) {
  return monthlyCashFlow * 12;
}

/**
 * Calculates NPV on an equity basis using a perpetuity model.
 *
 * Formula: NPV = C / (r - g) - initialInvestment
 *
 * C is the CURRENT annual cash flow — no (1+g) projection applied.
 * This ensures C exactly matches the displayed annual cash flow with no discrepancy.
 *
 * Equity model:
 *   Financed purchase:  C = post-mortgage cash flow; initialInvestment = down + closing costs
 *   All-cash purchase:  C = unlevered cash flow;    initialInvestment = purchase price + closing costs
 * Cash flows and initialInvestment MUST be on the same basis (both levered or both unlevered).
 *
 * @param {number} C1               - Next-period cash flow (year 1), already grown by g ($).
 * @param {number} r                - Discount rate as a decimal (e.g. 0.08 for 8%).
 * @param {number} g                - Perpetual growth rate as a decimal (e.g. 0.02 for 2%).
 * @param {number} initialInvestment - Total capital deployed at purchase. Use
 *   {@link buildInitialInvestment}(downPayment, closingCosts) to construct this value.
 *   Must NOT include monthly operating expenses.
 * @returns {number} Net present value ($).
 * @throws {Error} If r <= g (perpetuity formula is undefined or negative).
 */
export function calculateNPVPerpetuity(C1, r, g, initialInvestment) {
  if (r <= g) {
    throw new Error(
      `Discount rate (r = ${r}) must be greater than growth rate (g = ${g}).`
    );
  }
  return C1 / (r - g) - initialInvestment;
}

/**
 * Generates a cash flow timeline for an investment.
 *
 * Year 0 represents the initial capital outlay (negative).
 * Years 1–N represent recurring annual operating cash flows.
 * This timeline is intentionally separate from the monthly operating
 * cash flow display — it models investment-level cash positions only.
 *
 * @param {number} initialInvestment - Capital deployed at purchase ($). Must be > 0.
 *   Construct with {@link buildInitialInvestment}(downPayment, closingCosts).
 * @param {number} annualCashFlow    - Recurring annual net cash flow ($). May be negative.
 * @param {number} [years=10]        - Number of operating years to project (Year 1 … Year N).
 * @returns {{ year: number, cashFlow: number }[]} Array of year/cashFlow pairs,
 *   length = years + 1 (Year 0 included).
 * @throws {Error} If initialInvestment <= 0 or years < 1.
 *
 * @example
 * generateCashFlowTimeline(100_000, 12_000, 5)
 * // [
 * //   { year: 0, cashFlow: -100000 },
 * //   { year: 1, cashFlow:   12000 },
 * //   { year: 2, cashFlow:   12000 },
 * //   { year: 3, cashFlow:   12000 },
 * //   { year: 4, cashFlow:   12000 },
 * //   { year: 5, cashFlow:   12000 },
 * // ]
 */
export function generateCashFlowTimeline(initialInvestment, annualCashFlow, years = 10) {
  if (initialInvestment <= 0) {
    throw new Error(
      `initialInvestment must be greater than zero (got ${initialInvestment}).`
    );
  }
  if (!Number.isInteger(years) || years < 1) {
    throw new Error(`years must be a positive integer (got ${years}).`);
  }

  const timeline = [{ year: 0, cashFlow: -initialInvestment }];

  for (let y = 1; y <= years; y++) {
    timeline.push({ year: y, cashFlow: annualCashFlow });
  }

  return timeline;
}

/**
 * Calculates the simple payback period for an investment.
 *
 * Formula: years = initialInvestment / annualCashFlow
 *
 * @param {number} initialInvestment - Capital deployed at purchase ($). Use
 *   {@link buildInitialInvestment}(downPayment, closingCosts) to construct this value.
 * @param {number} annualCashFlow    - Annual net cash flow ($).
 * @returns {number|string} Years to recover the investment (rounded to 1 decimal),
 *   or the string "Not recovered" if annualCashFlow is zero or negative.
 * @throws {Error} If initialInvestment <= 0.
 *
 * @example
 * calculatePaybackPeriod(100_000,  12_000)  // → 8.3
 * calculatePaybackPeriod(100_000,       0)  // → "Not recovered"
 * calculatePaybackPeriod(100_000, -5_000)  // → "Not recovered"
 */
export function calculatePaybackPeriod(initialInvestment, annualCashFlow) {
  if (initialInvestment <= 0) {
    throw new Error(
      `initialInvestment must be greater than zero (got ${initialInvestment}).`
    );
  }
  if (annualCashFlow <= 0) {
    return 'Not recovered';
  }
  return Math.round((initialInvestment / annualCashFlow) * 10) / 10;
}

/**
 * Calculates Cash-on-Cash (CoC) return.
 *
 * Formula: CoC = annualCashFlow / initialInvestment
 *
 * @param {number} annualCashFlow     - Annual net cash flow ($).
 * @param {number} initialInvestment  - Total capital deployed at purchase. Use
 *   {@link buildInitialInvestment}(downPayment, closingCosts) to construct this value.
 * @returns {number} CoC return as a decimal (e.g. 0.08 for 8%).
 * @throws {Error} If initialInvestment is zero or negative.
 */
export function calculateCoC(annualCashFlow, initialInvestment) {
  if (initialInvestment <= 0) {
    throw new Error(
      `initialInvestment must be greater than zero (got ${initialInvestment}).`
    );
  }
  return annualCashFlow / initialInvestment;
}
