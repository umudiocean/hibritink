import { NextRequest, NextResponse } from "next/server";
import { CompositeChannelIndicator, type OHLCVData } from "@/lib/indicators";
import {
  fetchYahooFinanceData,
  getPeriodStartDate,
} from "@/lib/yahooFinance";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbol, period, interval, weights, use_adaptive } = body;

    // Veriyi indir
    const period1 = getPeriodStartDate(period || "1y");
    const result = await fetchYahooFinanceData(
      symbol,
      period1,
      interval || "1d"
    );

    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: "Veri indirilemedi", symbol },
        { status: 404 }
      );
    }

    // OHLCV formatına çevir
    const data: OHLCVData[] = result.map((item) => ({
      time: item.date.toISOString(),
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume,
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

