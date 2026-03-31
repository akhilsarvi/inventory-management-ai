export interface SalesDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export const generateMockSalesData = (): { daily: SalesDataPoint[], monthly: SalesDataPoint[] } => {
  const daily: SalesDataPoint[] = [];
  const now = new Date();
  
  // Generate last 30 days
  for (let i = 30; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    
    // Add some random variance but trending slightly up
    const baseRevenue = 1200 + (30 - i) * 15;
    const randomFactor = 0.7 + Math.random() * 0.6; // 0.7 to 1.3 multiplexer
    const revenue = Math.round(baseRevenue * randomFactor);
    const orders = Math.round(revenue / 45); // average order value ~$45
    
    daily.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue,
      orders
    });
  }

  // Generate last 12 months
  const monthly: SalesDataPoint[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    
    const baseRevenue = 35000 + (11 - i) * 1500;
    const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
    const revenue = Math.round(baseRevenue * randomFactor);
    const orders = Math.round(revenue / 50);
    
    monthly.push({
      date: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      revenue,
      orders
    });
  }

  return { daily, monthly };
};
