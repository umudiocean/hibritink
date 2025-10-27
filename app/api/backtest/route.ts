import { NextRequest, NextResponse } from "next/server";
import { CompositeChannelIndicator, type OHLCVData } from "@/lib/indicators";
import {
  fetchYahooFinanceData,
  getPeriodStartDate,
} from "@/lib/yahooFinance";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      symbol,
      period,
      interval,
      initial_capital = 10000,
      commission = 0.001,
      weights,
    } = body;

    // Veriyi indir
    const period1 = getPeriodStartDate(period || "1y");
    const result = await fetchYahooFinanceData(
      symbol,
      period1,
      interval || "1d"
    );

    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: "Veri indirilemedi" },
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

    indicator.calculateAllIndicators();
    indicator.calculateCompositeChannels();
    indicator.generateSignals();

    const allData = indicator.getData();

    // Backtest
    let capital = initial_capital;
    let position = 0; // 0: yok, 1: long, -1: short
    let entryPrice = 0;
    let entryDate = "";
    const trades: any[] = [];
    const equityCurve: any[] = [];

    for (let i = 0; i < allData.length; i++) {
      const row = allData[i];
      const currentPrice = row.close;

      // Equity hesapla
      let currentEquity = capital;
      if (position !== 0) {
        if (position === 1) {
          const unrealizedPnl =
            ((currentPrice - entryPrice) / entryPrice) * capital;
          currentEquity = capital + unrealizedPnl;
        } else {
          const unrealizedPnl =
            ((entryPrice - currentPrice) / entryPrice) * capital;
          currentEquity = capital + unrealizedPnl;
        }
      }

      equityCurve.push({
        date: row.time,
        equity: currentEquity,
        position,
      });

      const signal = row.signal;

      // Pozisyon kapat
      if (position === 1 && signal <= 0) {
        // Long kapat
        const pnl = ((currentPrice - entryPrice) / entryPrice) * capital;
        const commissionCost =
          capital * commission + (capital + pnl) * commission;
        capital += pnl - commissionCost;

        trades.push({
          entry_date: entryDate,
          exit_date: row.time,
          type: "LONG",
          entry_price: entryPrice,
          exit_price: currentPrice,
          pnl: pnl - commissionCost,
          return_pct: ((currentPrice - entryPrice) / entryPrice) * 100,
        });

        position = 0;
      } else if (position === -1 && signal >= 0) {
        // Short kapat
        const pnl = ((entryPrice - currentPrice) / entryPrice) * capital;
        const commissionCost =
          capital * commission + (capital + pnl) * commission;
        capital += pnl - commissionCost;

        trades.push({
          entry_date: entryDate,
          exit_date: row.time,
          type: "SHORT",
          entry_price: entryPrice,
          exit_price: currentPrice,
          pnl: pnl - commissionCost,
          return_pct: ((entryPrice - currentPrice) / entryPrice) * 100,
        });

        position = 0;
      }

      // Yeni pozisyon aç
      if (position === 0) {
        if (signal >= 1) {
          position = 1;
          entryPrice = currentPrice;
          entryDate = row.time;
        } else if (signal <= -1) {
          position = -1;
          entryPrice = currentPrice;
          entryDate = row.time;
        }
      }
    }

    // Açık pozisyon varsa kapat
    if (position !== 0) {
      const lastPrice = allData[allData.length - 1].close;
      let pnl = 0;
      if (position === 1) {
        pnl = ((lastPrice - entryPrice) / entryPrice) * capital;
      } else {
        pnl = ((entryPrice - lastPrice) / entryPrice) * capital;
      }
      const commissionCost = capital * commission * 2;
      capital += pnl - commissionCost;
    }

    if (trades.length === 0) {
      return NextResponse.json({
        success: false,
        error: "Hiç işlem yapılmadı",
      });
    }

    // Metrikler
    const totalReturn = ((capital - initial_capital) / initial_capital) * 100;
    const winningTrades = trades.filter((t) => t.pnl > 0);
    const losingTrades = trades.filter((t) => t.pnl <= 0);
    const winRate = (winningTrades.length / trades.length) * 100;

    const avgWin =
      winningTrades.length > 0
        ? winningTrades.reduce((a, b) => a + b.pnl, 0) / winningTrades.length
        : 0;
    const avgLoss =
      losingTrades.length > 0
        ? losingTrades.reduce((a, b) => a + b.pnl, 0) / losingTrades.length
        : 0;
    const profitFactor = avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : 0;

    const maxEquity = Math.max(...equityCurve.map((e) => e.equity));
    const maxDrawdown = Math.min(
      ...equityCurve.map((e) => ((e.equity - maxEquity) / maxEquity) * 100)
    );

    const buyHoldReturn =
      ((allData[allData.length - 1].close - allData[0].close) /
        allData[0].close) *
      100;

    return NextResponse.json({
      success: true,
      symbol,
      results: {
        trades,
        equity_curve: equityCurve,
        metrics: {
          initial_capital,
          final_capital: capital,
          total_return: totalReturn,
          total_trades: trades.length,
          winning_trades: winningTrades.length,
          losing_trades: losingTrades.length,
          win_rate: winRate,
          profit_factor: profitFactor,
          max_drawdown: maxDrawdown,
          avg_win: avgWin,
          avg_loss: avgLoss,
          buy_hold_return: buyHoldReturn,
          excess_return: totalReturn - buyHoldReturn,
        },
      },
    });
  } catch (error: any) {
    console.error("Backtest error:", error);
    return NextResponse.json(
      { error: error.message || "Backtest sırasında hata oluştu" },
      { status: 500 }
    );
  }
}

