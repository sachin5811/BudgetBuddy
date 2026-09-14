export const CATEGORY_COLORS = {
  Food: "#F59E0B",
  Travel: "#06B6D4",
  Shopping: "#EC4899",
  Education: "#6366F1",
  Entertainment: "#8B5CF6",
  Miscellaneous: "#64748B",
};

export const CURRENCY_SYMBOLS = {
  INR: "\u20B9",
  USD: "$",
  EUR: "\u20AC",
  GBP: "\u00A3",
};

export function formatMoney(amount, currency = "INR") {
  const symbol = CURRENCY_SYMBOLS[currency] || "";
  const value = Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `${symbol}${value}`;
}

export function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function monthLabel(monthStr) {
  if (!monthStr) return "";
  const [y, m] = monthStr.split("-");
  const date = new Date(Number(y), Number(m) - 1, 1);
  return date.toLocaleString("en-US", { month: "short", year: "numeric" });
}

export function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}
