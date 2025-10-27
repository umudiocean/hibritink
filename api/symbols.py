"""
Sembol listesi endpoint'i - Vercel Serverless Function
"""

from http.server import BaseHTTPRequestHandler
import json

# Tüm semboller
SYMBOLS = {
    'crypto': [
        {'symbol': 'BTC-USD', 'name': 'Bitcoin', 'category': 'Kripto'},
        {'symbol': 'ETH-USD', 'name': 'Ethereum', 'category': 'Kripto'},
        {'symbol': 'BNB-USD', 'name': 'Binance Coin', 'category': 'Kripto'},
        {'symbol': 'XRP-USD', 'name': 'Ripple', 'category': 'Kripto'},
        {'symbol': 'ADA-USD', 'name': 'Cardano', 'category': 'Kripto'},
        {'symbol': 'SOL-USD', 'name': 'Solana', 'category': 'Kripto'},
        {'symbol': 'DOT-USD', 'name': 'Polkadot', 'category': 'Kripto'},
        {'symbol': 'DOGE-USD', 'name': 'Dogecoin', 'category': 'Kripto'},
        {'symbol': 'AVAX-USD', 'name': 'Avalanche', 'category': 'Kripto'},
        {'symbol': 'MATIC-USD', 'name': 'Polygon', 'category': 'Kripto'},
    ],
    'stocks': [
        {'symbol': 'AAPL', 'name': 'Apple Inc.', 'category': 'Hisse'},
        {'symbol': 'MSFT', 'name': 'Microsoft', 'category': 'Hisse'},
        {'symbol': 'GOOGL', 'name': 'Alphabet (Google)', 'category': 'Hisse'},
        {'symbol': 'AMZN', 'name': 'Amazon', 'category': 'Hisse'},
        {'symbol': 'TSLA', 'name': 'Tesla', 'category': 'Hisse'},
        {'symbol': 'META', 'name': 'Meta (Facebook)', 'category': 'Hisse'},
        {'symbol': 'NVDA', 'name': 'NVIDIA', 'category': 'Hisse'},
        {'symbol': 'JPM', 'name': 'JPMorgan Chase', 'category': 'Hisse'},
        {'symbol': 'V', 'name': 'Visa', 'category': 'Hisse'},
        {'symbol': 'WMT', 'name': 'Walmart', 'category': 'Hisse'},
    ],
    'bist': [
        {'symbol': 'THYAO.IS', 'name': 'THY', 'category': 'BIST'},
        {'symbol': 'GARAN.IS', 'name': 'Garanti Bankası', 'category': 'BIST'},
        {'symbol': 'ISCTR.IS', 'name': 'İş Bankası', 'category': 'BIST'},
        {'symbol': 'AKBNK.IS', 'name': 'Akbank', 'category': 'BIST'},
        {'symbol': 'YKBNK.IS', 'name': 'Yapı Kredi', 'category': 'BIST'},
        {'symbol': 'TUPRS.IS', 'name': 'Tüpraş', 'category': 'BIST'},
        {'symbol': 'EREGL.IS', 'name': 'Ereğli Demir Çelik', 'category': 'BIST'},
        {'symbol': 'ASELS.IS', 'name': 'Aselsan', 'category': 'BIST'},
        {'symbol': 'SAHOL.IS', 'name': 'Sabancı Holding', 'category': 'BIST'},
        {'symbol': 'KCHOL.IS', 'name': 'Koç Holding', 'category': 'BIST'},
    ],
    'forex': [
        {'symbol': 'EURUSD=X', 'name': 'EUR/USD', 'category': 'Forex'},
        {'symbol': 'GBPUSD=X', 'name': 'GBP/USD', 'category': 'Forex'},
        {'symbol': 'USDJPY=X', 'name': 'USD/JPY', 'category': 'Forex'},
        {'symbol': 'AUDUSD=X', 'name': 'AUD/USD', 'category': 'Forex'},
        {'symbol': 'USDCAD=X', 'name': 'USD/CAD', 'category': 'Forex'},
        {'symbol': 'USDCHF=X', 'name': 'USD/CHF', 'category': 'Forex'},
        {'symbol': 'NZDUSD=X', 'name': 'NZD/USD', 'category': 'Forex'},
        {'symbol': 'EURGBP=X', 'name': 'EUR/GBP', 'category': 'Forex'},
    ]
}

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Tüm sembolleri flatten et
            all_symbols = []
            for category in SYMBOLS.values():
                all_symbols.extend(category)
            
            response = {
                'success': True,
                'symbols': all_symbols,
                'categories': SYMBOLS,
                'total': len(all_symbols)
            }
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({
                'error': str(e)
            }).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

