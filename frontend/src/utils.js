export const formatCurrency = (amount, currency = "INR") => {
  if (typeof amount !== "number") return "N/A";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatLocation = (location) => {
  if (!location) return "N/A";
  const values = [location.area, location.city, location.state].filter(Boolean);
  return values.join(", ");
};

export const splitByComma = (value) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export const isNewListing = (createdAt) => {
  if (!createdAt) return false;
  const diff = Date.now() - new Date(createdAt).getTime();
  return diff < 7 * 24 * 60 * 60 * 1000; // 7 days
};

export const calcPricePerSqft = (price, plotSize, plotSizeUnit) => {
  if (!price || !plotSize) return null;
  let sizeInSqft = plotSize;
  if (plotSizeUnit === "sqyd") sizeInSqft = plotSize * 9;
  else if (plotSizeUnit === "acre") sizeInSqft = plotSize * 43560;
  else if (plotSizeUnit === "hectare") sizeInSqft = plotSize * 107639;
  if (sizeInSqft === 0) return null;
  return Math.round(price / sizeInSqft);
};
