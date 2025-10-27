/**
 * Kompozit Kanal İndikatörü - TypeScript Implementation
 * Tüm teknik indikatör hesaplamaları
 */

export interface OHLCVData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IndicatorWeights {
  donchian: number;
  bollinger: number;
  ema: number;
  rsi: number;
  macd: number;
  volume: number;
  fibonacci: number;
}

export class CompositeChannelIndicator {
  private data: any[];
  private weights: IndicatorWeights;

  constructor(data: OHLCVData[], weights?: IndicatorWeights) {
    this.data = data.map((d) => ({ ...d }));
    this.weights = weights || {
      donchian: 0.2,
      bollinger: 0.2,
      ema: 0.15,
      rsi: 0.15,
      macd: 0.15,
      volume: 0.1,
      fibonacci: 0.05,
    };
  }

  // Donchian Channels
  private calculateDonchian(period: number = 20) {
    for (let i = 0; i < this.data.length; i++) {
      if (i < period - 1) {
        this.data[i].don_upper = this.data[i].high;
        this.data[i].don_lower = this.data[i].low;
        this.data[i].don_mid = (this.data[i].high + this.data[i].low) / 2;
        continue;
      }

      let high = -Infinity;
      let low = Infinity;
      for (let j = i - period + 1; j <= i; j++) {
        high = Math.max(high, this.data[j].high);
        low = Math.min(low, this.data[j].low);
      }
      this.data[i].don_upper = high;
      this.data[i].don_lower = low;
      this.data[i].don_mid = (high + low) / 2;
    }
  }

  // Bollinger Bands
  private calculateBollinger(period: number = 20, std: number = 2) {
    for (let i = 0; i < this.data.length; i++) {
      if (i < period - 1) {
        this.data[i].bb_mid = this.data[i].close;
        this.data[i].bb_upper = this.data[i].close;
        this.data[i].bb_lower = this.data[i].close;
        continue;
      }

      // SMA
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) {
        sum += this.data[j].close;
      }
      const sma = sum / period;

      // Standard Deviation
      let variance = 0;
      for (let j = i - period + 1; j <= i; j++) {
        variance += Math.pow(this.data[j].close - sma, 2);
      }
      const stdDev = Math.sqrt(variance / period);

      this.data[i].bb_mid = sma;
      this.data[i].bb_upper = sma + stdDev * std;
      this.data[i].bb_lower = sma - stdDev * std;
    }
  }

  // EMA
  private calculateEMA() {
    const calculateEMASingle = (period: number, key: string) => {
      const multiplier = 2 / (period + 1);
      this.data[0][key] = this.data[0].close;

      for (let i = 1; i < this.data.length; i++) {
        this.data[i][key] =
          (this.data[i].close - this.data[i - 1][key]) * multiplier +
          this.data[i - 1][key];
      }
    };

    calculateEMASingle(12, "ema_12");
    calculateEMASingle(26, "ema_26");
    calculateEMASingle(50, "ema_50");
  }

  // RSI
  private calculateRSI(period: number = 14) {
    let gains = 0;
    let losses = 0;

    // İlk period için
    for (let i = 1; i <= period; i++) {
      const change = this.data[i].close - this.data[i - 1].close;
      if (change > 0) gains += change;
      else losses -= change;
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;
    this.data[period].rsi = 100 - 100 / (1 + avgGain / avgLoss);

    // Geri kalan
    for (let i = period + 1; i < this.data.length; i++) {
      const change = this.data[i].close - this.data[i - 1].close;
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? -change : 0;

      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;

      this.data[i].rsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
    }

    // İlk period için default değer
    for (let i = 0; i < period; i++) {
      this.data[i].rsi = 50;
    }
  }

  // MACD
  private calculateMACD() {
    // MACD = EMA12 - EMA26
    for (let i = 0; i < this.data.length; i++) {
      this.data[i].macd = this.data[i].ema_12 - this.data[i].ema_26;
    }

    // Signal Line = EMA9 of MACD
    const multiplier = 2 / (9 + 1);
    this.data[0].macd_signal = this.data[0].macd;

    for (let i = 1; i < this.data.length; i++) {
      this.data[i].macd_signal =
        (this.data[i].macd - this.data[i - 1].macd_signal) * multiplier +
        this.data[i - 1].macd_signal;
    }

    // Histogram
    for (let i = 0; i < this.data.length; i++) {
      this.data[i].macd_histogram = this.data[i].macd - this.data[i].macd_signal;
    }
  }

  // Volume Indicators
  private calculateVolumeIndicators() {
    // Volume MA
    for (let i = 0; i < this.data.length; i++) {
      if (i < 19) {
        this.data[i].volume_ma = this.data[i].volume;
        continue;
      }

      let sum = 0;
      for (let j = i - 19; j <= i; j++) {
        sum += this.data[j].volume;
      }
      this.data[i].volume_ma = sum / 20;
    }
  }

  // Fibonacci Levels
  private calculateFibonacci(period: number = 50) {
    for (let i = 0; i < this.data.length; i++) {
      if (i < period - 1) {
        this.data[i].fib_0 = this.data[i].high;
        this.data[i].fib_236 = this.data[i].high * 0.764;
        this.data[i].fib_382 = this.data[i].high * 0.618;
        this.data[i].fib_50 = (this.data[i].high + this.data[i].low) / 2;
        this.data[i].fib_618 = this.data[i].high * 0.382;
        this.data[i].fib_100 = this.data[i].low;
        continue;
      }

      let high = -Infinity;
      let low = Infinity;
      for (let j = i - period + 1; j <= i; j++) {
        high = Math.max(high, this.data[j].high);
        low = Math.min(low, this.data[j].low);
      }
      const diff = high - low;

      this.data[i].fib_0 = high;
      this.data[i].fib_236 = high - diff * 0.236;
      this.data[i].fib_382 = high - diff * 0.382;
      this.data[i].fib_50 = high - diff * 0.5;
      this.data[i].fib_618 = high - diff * 0.618;
      this.data[i].fib_100 = low;
    }
  }

  // Calculate All
  public calculateAllIndicators() {
    this.calculateDonchian();
    this.calculateBollinger();
    this.calculateEMA();
    this.calculateRSI();
    this.calculateMACD();
    this.calculateVolumeIndicators();
    this.calculateFibonacci();
  }

  // Composite Channels
  public calculateCompositeChannels() {
    const totalWeight =
      this.weights.donchian +
      this.weights.bollinger +
      this.weights.ema +
      this.weights.rsi +
      this.weights.macd +
      this.weights.volume +
      this.weights.fibonacci;

    for (let i = 0; i < this.data.length; i++) {
      const d = this.data[i];

      // Upper, Lower, Mid levels for each indicator
      const upperLevels = [
        d.don_upper * this.weights.donchian,
        d.bb_upper * this.weights.bollinger,
        d.ema_12 * this.weights.ema,
        (d.close + (d.close * 0.1 * (d.rsi - 50)) / 50) * this.weights.rsi,
        d.close * (1 + Math.abs(d.macd_histogram) / d.close) * this.weights.macd,
        d.close * Math.min(d.volume / d.volume_ma, 1.5) * this.weights.volume,
        d.fib_236 * this.weights.fibonacci,
      ];

      const lowerLevels = [
        d.don_lower * this.weights.donchian,
        d.bb_lower * this.weights.bollinger,
        d.ema_50 * this.weights.ema,
        (d.close - (d.close * 0.1 * (50 - d.rsi)) / 50) * this.weights.rsi,
        d.close * (1 - Math.abs(d.macd_histogram) / d.close) * this.weights.macd,
        d.close / Math.max(d.volume / d.volume_ma, 0.5) * this.weights.volume,
        d.fib_618 * this.weights.fibonacci,
      ];

      const midLevels = [
        d.don_mid * this.weights.donchian,
        d.bb_mid * this.weights.bollinger,
        d.ema_26 * this.weights.ema,
        d.close * this.weights.rsi,
        d.close * this.weights.macd,
        d.close * this.weights.volume,
        d.fib_50 * this.weights.fibonacci,
      ];

      d.composite_upper = upperLevels.reduce((a, b) => a + b, 0) / totalWeight;
      d.composite_lower = lowerLevels.reduce((a, b) => a + b, 0) / totalWeight;
      d.composite_mid = midLevels.reduce((a, b) => a + b, 0) / totalWeight;
      d.channel_width = d.composite_upper - d.composite_lower;
      d.channel_width_pct = (d.channel_width / d.close) * 100;
    }
  }

  // Generate Signals
  public generateSignals() {
    for (let i = 0; i < this.data.length; i++) {
      const d = this.data[i];
      let score = 0;

      // Donchian
      if (d.close > d.don_upper) score += 1;
      else if (d.close < d.don_lower) score -= 1;

      // Bollinger
      if (d.close > d.bb_upper) score += 1;
      else if (d.close < d.bb_lower) score -= 1;

      // EMA Trend
      if (d.ema_12 > d.ema_26 && d.ema_26 > d.ema_50) score += 1;
      else if (d.ema_12 < d.ema_26 && d.ema_26 < d.ema_50) score -= 1;

      // RSI
      if (d.rsi > 70) score += 1;
      else if (d.rsi < 30) score -= 1;

      // MACD
      if (d.macd > d.macd_signal) score += 1;
      else if (d.macd < d.macd_signal) score -= 1;

      // Volume
      if (d.volume > d.volume_ma * 1.5) score += 1;
      else if (d.volume < d.volume_ma * 0.5) score -= 1;

      // Fibonacci
      if (d.close > d.fib_236) score += 1;
      else if (d.close < d.fib_618) score -= 1;

      d.composite_score = score;

      // Signal
      if (score >= 4) d.signal = 2; // Güçlü Alım
      else if (score >= 2) d.signal = 1; // Alım
      else if (score <= -4) d.signal = -2; // Güçlü Satım
      else if (score <= -2) d.signal = -1; // Satım
      else d.signal = 0; // Nötr
    }
  }

  // Get Data
  public getData() {
    return this.data;
  }

  // Get Current Status
  public getCurrentStatus() {
    const last = this.data[this.data.length - 1];
    const signalNames: Record<number, string> = {
      2: "Güçlü Alım",
      1: "Alım",
      0: "Nötr",
      "-1": "Satım",
      "-2": "Güçlü Satım",
    };

    return {
      date: last.time,
      price: last.close,
      composite_upper: last.composite_upper,
      composite_mid: last.composite_mid,
      composite_lower: last.composite_lower,
      channel_width_pct: last.channel_width_pct,
      rsi: last.rsi,
      macd: last.macd,
      macd_histogram: last.macd_histogram,
      volume_ratio: last.volume / last.volume_ma,
      composite_score: last.composite_score,
      signal: last.signal,
      signal_name: signalNames[last.signal] || "Bilinmiyor",
    };
  }
}

