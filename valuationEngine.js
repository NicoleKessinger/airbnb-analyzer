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
 * Calculates NPV using the Gordon Growth Model (growing perpetuity).
 *
 * Formula: NPV = C1 / (r - g) - initialInvestment
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
