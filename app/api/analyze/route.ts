import { NextRequest, NextResponse } from "next/server";
import yahooFinance from "yahooFinance2";
import { CompositeChannelIndicator, type OHLCVData } from "@/lib/indicators";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbol, period, interval, weights, use_adaptive } = body;

    // Veriyi indir
    const queryOptions = {
      period1: getPeriodStartDate(period || "1y"),
      interval: (interval || "1d") as any,
    };

    const result = await yahooFinance.historical(symbol, queryOptions);

    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: "Veri indirilemedi", symbol },
        { status: 404 }
      );
    }

    // OHLCV formatına çevir
    const data: OHLCVData[] = result.map((item: any) => ({
      time: item.date.toISOString(),
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume || 0,
    }));

    // İndikatörü oluştur
    const indicator = new CompositeChannelIndicator(data, weights);

    // Hesaplamalar
    indicator.calculateAllIndicators();
    indicator.calculateCompositeChannels();
    indicator.generateSignals();

    const allData = indicator.getData();
    const currentStatus = indicator.getCurrentStatus();

    // Son 200 veri noktası
    const chartData = allData.slice(-200);

    return NextResponse.json({
      success: true,
      symbol,
      interval,
      current_status: currentStatus,
      chart_data: chartData,
      weights: weights || {
        donchian: 0.2,
        bollinger: 0.2,
        ema: 0.15,
        rsi: 0.15,
        macd: 0.15,
        volume: 0.1,
        fibonacci: 0.05,
      },
      data_points: data.length,
    });
  } catch (error: any) {
    console.error("Analyze error:", error);
    return NextResponse.json(
      { error: error.message || "Analiz sırasında hata oluştu" },
      { status: 500 }
    );
  }
}

function getPeriodStartDate(period: string): Date {
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

