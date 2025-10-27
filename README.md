# 🚀 HİBRİT İNK - Kompozit Kanal İndikatörü

**7 İndikatörü Birleştiren Profesyonel Teknik Analiz Platformu**

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Python](https://img.shields.io/badge/Python-3.9-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Özellikler

### 🎯 Multi-İndikatör Analizi
- **Donchian Kanalları** - Trend kırılmaları
- **Bollinger Bantları** - Volatilite analizi
- **EMA (12/26/50)** - Trend yönü
- **RSI (14)** - Momentum göstergesi
- **MACD** - Trend momentum
- **Volume Analizi** - Hacim konfirmasyonu
- **Fibonacci Seviyeleri** - Destek/direnç

### 📊 Kompozit Kanal Sistemi
- 7 indikatörün ağırlıklı ortalaması
- Üst, orta ve alt kanallar
- Dinamik sinyal üretimi (-7 ile +7 kompozit skor)
- Güçlü Alım/Alım/Nötr/Satım/Güçlü Satım sinyalleri

### 🤖 Otomatik Strateji Modu
- **Dengeli**: Tüm indikatörlere eşit ağırlık
- **Trend Takip**: Donchian, EMA, MACD odaklı
- **Mean Reversion**: Bollinger, RSI, Fibonacci odaklı
- **Momentum**: MACD, RSI, Volume odaklı

### 📈 Profesyonel Backtest
- Gerçekçi komisyon ve slippage
- Equity curve görselleştirme
- Win rate, profit factor, max drawdown
- Buy & Hold karşılaştırması
- Detaylı işlem geçmişi

### 🎨 Modern UI/UX
- Ultra dark tema (#000000)
- #62CBC1 (turkuaz) ve #DBC658 (altın) vurgu renkleri
- 50+ Framer Motion animasyonu
- JetBrains Mono monospace font
- Responsive tasarım (mobil + desktop)

### ⚡ Gerçek Zamanlı Veri
- yfinance API entegrasyonu
- 40+ sembol (kripto, hisse, BIST100, forex)
- 5 zaman dilimi (15m, 1h, 4h, 1d, 1w)
- 5 periyot seçeneği (1-6 ay, 1-2 yıl)
- Otomatik 15 dakika güncelleme
- Manuel refresh butonu

## 🛠️ Teknoloji Stack

### Frontend
- **Next.js 14** - App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animasyonlar
- **Recharts** - Grafik görselleştirme
- **Axios** - API istekleri

### Backend
- **Python 3.9** - Core logic
- **Vercel Serverless Functions** - API endpoints
- **pandas & numpy** - Data processing
- **yfinance** - Market data
- **matplotlib** - Chart generation (optional)

## 🚀 Kurulum

### 1. Bağımlılıkları Yükle

```bash
# Node.js bağımlılıkları
npm install

# Python bağımlılıkları (Vercel otomatik yükler)
# requirements.txt dosyasında tanımlı
```

### 2. Development Sunucusu

```bash
npm run dev
```

Tarayıcıda açın: [http://localhost:3000](http://localhost:3000)

### 3. Production Build

```bash
npm run build
npm start
```

## 📦 Vercel Deployment

### Otomatik Deployment (Önerilen)

1. GitHub'a push edin:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Vercel'de projeyi import edin
3. Otomatik deploy başlar

### Manuel Deployment

```bash
# Vercel CLI ile
vercel --prod
```

## 📚 Kullanım

### 1. Sembol Seçimi
- Arama kutusundan sembol arayın
- Kategoriler: Kripto, Hisse, BIST100, Forex
- 40+ popüler sembol hazır

### 2. Zaman Dilimi & Periyot
- **Zaman Dilimi**: 15m, 1h, 4h, 1d, 1w
- **Periyot**: 1mo, 3mo, 6mo, 1y, 2y

### 3. Strateji Seçimi
- **Dengeli** (Varsayılan)
- **Trend Takip** (Yükseliş/düşüş trendleri için)
- **Mean Reversion** (Yatay piyasalar için)
- **Momentum** (Volatil piyasalar için)

### 4. Özel Ağırlıklar
- "Ağırlıkları Göster" butonuna tıklayın
- Her indikatör için 0.00 - 1.00 arası değer girin
- Toplam ağırlık 1.00 olmalı

### 5. Analiz & Backtest
- **Analiz Et**: Güncel sinyal ve grafikleri gösterir
- **Backtest Yap**: Geçmiş performans analizi yapar

## 🎯 Sinyal Yorumlama

### Kompozit Skor Sistemi
- **+7 ila +4**: 🟢🟢 Güçlü Alım
- **+3 ila +2**: 🟢 Alım
- **+1 ila -1**: ⚪ Nötr (Pozisyon açma)
- **-2 ila -3**: 🔴 Satım
- **-4 ila -7**: 🔴🔴 Güçlü Satım

### İndikatör Anlamları
- **RSI > 70**: Aşırı alım (satış fırsatı)
- **RSI < 30**: Aşırı satım (alış fırsatı)
- **MACD > Signal**: Yükseliş trendi
- **Fiyat > Üst Kanal**: Güçlü momentum
- **Volume > 1.5x**: Yüksek aktivite

## 🔧 API Endpoints

### POST /api/analyze
Sembol analizi ve sinyal üretimi

**Request:**
```json
{
  "symbol": "BTC-USD",
  "period": "1y",
  "interval": "1d",
  "weights": {...},
  "use_adaptive": false
}
```

**Response:**
```json
{
  "success": true,
  "symbol": "BTC-USD",
  "current_status": {...},
  "chart_data": [...],
  "weights": {...}
}
```

### POST /api/backtest
Strateji backtest

**Request:**
```json
{
  "symbol": "BTC-USD",
  "period": "1y",
  "interval": "1d",
  "initial_capital": 10000,
  "commission": 0.001,
  "weights": {...}
}
```

**Response:**
```json
{
  "success": true,
  "results": {
    "trades": [...],
    "equity_curve": [...],
    "metrics": {...}
  }
}
```

### GET /api/symbols
Tüm sembol listesi

**Response:**
```json
{
  "success": true,
  "symbols": [...],
  "categories": {...}
}
```

## 📊 Backtest Metrikleri

### Win Rate
- **50%+**: İyi
- **40-50%**: Orta
- **<40%**: Zayıf

### Profit Factor
- **>2.0**: Mükemmel
- **1.5-2.0**: Çok İyi
- **1.0-1.5**: İyi
- **<1.0**: Kayıpda

### Max Drawdown
- **<10%**: Çok İyi
- **10-20%**: İyi
- **20-30%**: Kabul Edilebilir
- **>30%**: Riskli

## ⚠️ Önemli Notlar

### Risk Uyarısı
Bu platform **eğitim ve araştırma amaçlıdır**. Gerçek para ile işlem yapmadan önce:
- Stratejinizi farklı zaman dilimlerinde test edin
- Risk yönetimi kuralları belirleyin (stop-loss, position sizing)
- Geçmiş performans gelecek performansı garanti etmez
- Yatırım tavsiyesi değildir

### Veri Kaynağı
- **yfinance** API kullanılmaktadır
- Veriler 15-20 dakika gecikmeli olabilir
- Gerçek zamanlı trading için profesyonel API kullanın

### Limitler
- yfinance API rate limit: ~2000 istek/saat
- Vercel Serverless timeout: 60 saniye
- Maksimum veri noktası: 2 yıl

## 🎓 Gelişmiş Kullanım

### Walk-Forward Optimizasyon
1. 1 yıllık veri ile ağırlıkları optimize edin
2. Son 3 ay ile test edin
3. Farklı piyasa koşullarında doğrulayın

### Multi-Timeframe Analiz
1. Uzun vadeli trend: 1d veya 1w
2. Giriş noktası: 1h veya 4h
3. Fine-tuning: 15m

### Risk Yönetimi
```
Position Size = (Account * Risk%) / Stop Loss Distance
Risk% = 1-2% (önerilen)
Stop Loss = %2-3 altında
Take Profit = %6-9 üstünde (1:3 risk/reward)
```

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen şu adımları izleyin:

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing`)
5. Pull Request açın

## 📝 Lisans

MIT License - Detaylar için [LICENSE](LICENSE) dosyasına bakın

## 📧 İletişim

- **GitHub**: [umudiocean/hibritink](https://github.com/umudiocean/hibritink)
- **Website**: [hibritink.vercel.app](https://hibritink.vercel.app)

## 🙏 Teşekkürler

Bu proje şu harika araçlar sayesinde mümkün oldu:
- [Next.js](https://nextjs.org/)
- [yfinance](https://github.com/ranaroussi/yfinance)
- [Vercel](https://vercel.com)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)

---

**⚡ Made with passion by HİBRİT İNK**

🚀 **[Demo'yu Deneyin](https://hibritink.vercel.app)**

