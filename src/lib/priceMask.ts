export function maskPrice(price: string | number, isPreLaunchMode: boolean): string {
  if (!isPreLaunchMode) return `₹${price}`;

  const numericPrice = typeof price === "string" ? parseFloat(price) : price;
  
  if (isNaN(numericPrice)) return "₹XXX";

  if (numericPrice < 1000) {
    return "₹XXX";
  } else {
    return "₹XXXX";
  }
}
