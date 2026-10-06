export const colors = {
  red: "#D62828",
  redDark: "#A61C1C",
  yellow: "#FFC93C",
  yellowSoft: "#FFF1C2",
  bg: "#FFFBF0",
  card: "#FFFFFF",
  text: "#2B2B2B",
  muted: "#8C8577",
  border: "#F1E6C4",
};

export const CURRENCY = "₱"; // change to "$" or anything you like
export const money = (n: number) => `${CURRENCY}${n.toLocaleString()}`;