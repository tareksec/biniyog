# Investment Calculator Architecture

## 1. OVERVIEW
The Investment Calculator is a React component designed to estimate potential profits from an SME investment. It supports calculating returns based on both annual (বছর) and monthly (মাস) duration units, applying compounding formulas appropriately depending on the selected mode.

## 2. INPUTS
The calculator uses several state variables (via `useState`) to manage user inputs from range sliders and toggle buttons:

- **বিনিয়োগের পরিমাণ (Investment Amount)**
  - State variable: `amount`
  - Range: `100,000` to `1,000,000`
  - Step: `10,000`
  - Default: `100,000` (৳১ লক্ষ)

- **প্রত্যাশিত বার্ষিক লাভ % (Expected Annual ROI)**
  - State variable: `roi`
  - Range: `10%` to `35%`
  - Step: `1%`
  - Default: `20%`

- **বিনিয়োগের মেয়াদ (Investment Duration Unit)**
  - State variable: `durationUnit`
  - Options: `"year"` (বছর) or `"month"` (মাস)
  - Default: `"year"`

- **Duration Values**
  - **বছর (Years):** State variable `years`, Range: `1` to `40`, Default: `1`
  - **মাস (Months):** State variable `months`, Range: `1` to `480`, Default: `12`

## 3. FORMULAS
The calculator implements two distinct compounding formulas based on the `durationUnit`. They are kept distinct because they make different assumptions about compounding frequency (yearly vs. monthly).

### বছর Mode (Annual Compounding)
- **Variables Read:** `amount`, `roi`, `years`
- **Formulas:**
  ```javascript
  yearlyReturn = amount * (roi / 100)
  monthlyReturn = yearlyReturn / 12
  totalReturn = amount * Math.pow(1 + roi / 100, years) - amount
  ```
- **Explanation:** Compounding is assumed to occur once per year. The base annual return is a simple percentage of the principal, and the total return compounds annually over the specified `years`.

### মাস Mode (Monthly Compounding)
- **Variables Read:** `amount`, `roi`, `months`
- **Formulas:**
  ```javascript
  const monthlyRate = (roi / 100) / 12;
  const effectiveAnnualProfit = amount * (Math.pow(1 + monthlyRate, 12) - 1);
  yearlyReturn = effectiveAnnualProfit;
  monthlyReturn = effectiveAnnualProfit / 12;
  totalReturn = amount * Math.pow(1 + monthlyRate, months) - amount;
  ```
- **Explanation:** Compounding occurs every month. Therefore, the effective annual profit is derived from the monthly compounding formula over 12 periods, ensuring consistency with the total return calculation for any given number of `months`.

## 4. DISPLAY LOGIC
The calculations feed into three primary result panel figures:

- **প্রত্যাশিত বার্ষিক লাভ (Expected Annual Profit):** Displays `yearlyReturn`. In `বছর` mode, this is simple interest for year 1. In `মাস` mode, this is the derived `effectiveAnnualProfit` reflecting 12 months of compounding.
- **প্রত্যাশিত মাসিক লাভ (Expected Monthly Profit):** Displays `monthlyReturn`. It is strictly `yearlyReturn / 12` in both modes, representing the average monthly slice of the annual expectation.
- **প্রত্যাশিত মোট লাভ (Expected Total Profit):** Displays `totalReturn`. Represents the final compounded profit after the full selected duration (`years` or `months`).

*Note: Due to a recent fix, `মাস` mode now derives its annual/monthly display figures from the compound formula rather than a flat calculation, ensuring `totalReturn` exactly matches `yearlyReturn` when `months` is set to 12.*

## 5. KNOWN EDGE CASES
- **State Separation on Toggle:** When switching between `বছর` and `মাস` modes, the duration value does not automatically convert (e.g., 1 year does not become 12 months). The component maintains independent `years` and `months` states.
- **Constraints:** The sliders enforce strict `min` and `max` constraints, ensuring all calculations remain within practical and expected bounds (e.g., duration cannot be 0).

## 6. FILE REFERENCE
- **File Path:** `src/components/InvestmentCalculator.tsx`
- **Key Functions/Variables:** 
  - `InvestmentCalculator()` (Main functional component)
  - `amount`, `roi`, `durationUnit`, `years`, `months` (State hooks)
  - `yearlyReturn`, `monthlyReturn`, `totalReturn` (Calculation variables)

## 7. CHANGE LOG
- **[Initial Build]** Creation of the calculator with sliders for amount, ROI, and basic projections.
- **[Feature]** Added compound interest formula for long-term calculations.
- **[Feature]** Introduced `বছর`/`মাস` (Year/Month) toggle for more granular duration control.
- **[July 2026]** Fixed calculation consistency in `মাস` mode: display figures (annual/monthly profit) are now derived accurately from the monthly compounding formula instead of simple interest.
