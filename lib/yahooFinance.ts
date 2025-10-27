/**
 * Yahoo Finance API Helper
 * Direkt fetch ile veri çekimi - dependency yok
 */

export interface YahooFinanceData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export async function fetchYahooFinanceData(
  symbol: string,
  period1: Date,
  interval: string = "1d"
): Promise<YahooFinanceData[]> {
  try {
    // Yahoo Finance v8 API endpoint
    const period1Unix = Math.floor(period1.getTime() / 1000);
    const period2Unix = Math.floor(Date.now() / 1000);

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${period1Unix}&period2=${period2Unix}&interval=${interval}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      throw new Error("No data received from Yahoo Finance");
    }

    const result = data.chart.result[0];
    const timestamps = result.timestamp;
    const quote = result.indicators.quote[0];

    // OHLCV verisini oluştur
    const historicalData: YahooFinanceData[] = [];

    for (let i = 0; i < timestamps.length; i++) {
      // Null verileri atla
      if (
        quote.open[i] === null ||
        quote.high[i] === null ||
        quote.low[i] === null ||
        quote.close[i] === null
      ) {
        continue;
      }

      historicalData.push({
        date: new Date(timestamps[i] * 1000),
        open: quote.open[i],
        high: quote.high[i],
        low: quote.low[i],
        close: quote.close[i],
        volume: quote.volume[i] || 0,
      });
    }

    return historicalData;
  } catch (error: any) {
    console.error("Yahoo Finance fetch error:", error);
    throw new Error(`Failed to fetch data for ${symbol}: ${error.message}`);
  }
}

export function getPeriodStartDate(period: string): Date {
  const now = new Date();
  const periodMap: Record<string, number> = {
    "1mo": 30,
    "3mo": 90,
    "6mo": 180,
    "1y": 365,
    "2y": 730,
  };

  const days = periodMap[period] || 365;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

