"""
Ana analiz endpoint'i - Vercel Serverless Function
"""

from http.server import BaseHTTPRequestHandler
import json
import sys
import os

# API dizinini Python path'e ekle
sys.path.insert(0, os.path.dirname(__file__))

from composite_indicator import CompositeChannelIndicator, download_data

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Request body'yi oku
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            request_data = json.loads(post_data.decode('utf-8'))
            
            # Parametreleri al
            symbol = request_data.get('symbol', 'BTC-USD')
            period = request_data.get('period', '1y')
            interval = request_data.get('interval', '1d')
            weights = request_data.get('weights', None)
            use_adaptive = request_data.get('use_adaptive', False)
            
            # Veriyi indir
            data = download_data(symbol, period, interval)
            
            if data is None or data.empty:
                self.send_response(404)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'error': 'Veri indirilemedi',
                    'symbol': symbol
                }).encode())
                return
            
            # İndikatörü oluştur
            indicator = CompositeChannelIndicator(data, use_adaptive=use_adaptive)
            
            # Özel ağırlıklar varsa uygula
            if weights:
                indicator.weights = weights
            
            # Hesaplamalar
            indicator.calculate_all_indicators()
            indicator.calculate_composite_channels()
            indicator.generate_signals()
            
            # Güncel durum
            current_status = indicator.get_current_status()
            
            # Grafik verisi (son 200 veri noktası)
            chart_data = []
            df = indicator.data.tail(200)
            
            for idx, row in df.iterrows():
                chart_data.append({
                    'time': str(idx),
                    'open': float(row['Open']),
                    'high': float(row['High']),
                    'low': float(row['Low']),
                    'close': float(row['Close']),
                    'volume': float(row['Volume']),
                    'composite_upper': float(row['composite_upper']),
                    'composite_mid': float(row['composite_mid']),
                    'composite_lower': float(row['composite_lower']),
                    'rsi': float(row['rsi']),
                    'macd': float(row['macd']),
                    'macd_signal': float(row['macd_signal']),
                    'macd_histogram': float(row['macd_histogram']),
                    'composite_score': int(row['composite_score']),
                    'signal': int(row['signal']),
                    'ema_12': float(row['ema_12']),
                    'ema_26': float(row['ema_26']),
                    'ema_50': float(row['ema_50']),
                    'bb_upper': float(row['bb_upper']),
                    'bb_lower': float(row['bb_lower']),
                    'don_upper': float(row['don_upper']),
                    'don_lower': float(row['don_lower']),
                })
            
            # Response
            response = {
                'success': True,
                'symbol': symbol,
                'interval': interval,
                'current_status': current_status,
                'chart_data': chart_data,
                'weights': indicator.weights,
                'data_points': len(data)
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
                'error': str(e),
                'type': 'internal_error'
            }).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

