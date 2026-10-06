export type Entry =
  | {
      id: string;
      date: string;
      type: "item";
      name: string;
      qty: number;       // how many you bought
      cost: number;      // cost price per piece
      sellPrice: number; // selling price per piece
      sold: number;      // how many sold so far
    }
  | { id: string; date: string; type: "income"; amount: number; note: string };
export const todayStr = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD, local time

export function getSummary(entries: Entry[], date: string) {
  let spent = 0;     // total spent buying stock
  let revenue = 0;   // money from sales + other income
  let soldCost = 0;  // cost of only the pieces you sold

  for (const e of entries.filter((x) => x.date === date)) {
    if (e.type === "item") {
      spent += e.qty * e.cost;
      revenue += e.sold * e.sellPrice;
      soldCost += e.sold * e.cost;
    } else {
      revenue += e.amount;
    }
  }
  return { spent, revenue, profit: revenue - soldCost, stockLeft: spent - soldCost };
}