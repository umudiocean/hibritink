"""
Backtest endpoint'i - Vercel Serverless Function
"""

from http.server import BaseHTTPRequestHandler
import json
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from composite_indicator import CompositeChannelIndicator, download_data

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            request_data = json.loads(post_data.decode('utf-8'))
            
            symbol = request_data.get('symbol', 'BTC-USD')
            period = request_data.get('period', '1y')
            interval = request_data.get('interval', '1d')
            initial_capital = request_data.get('initial_capital', 10000)
            commission = request_data.get('commission', 0.001)
            weights = request_data.get('weights', None)
            
            # Veriyi indir
            data = download_data(symbol, period, interval)
            
            if data is None or data.empty:
                self.send_response(404)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'error': 'Veri indirilemedi'
                }).encode())
                return
            
            # İndikatörü oluştur
            indicator = CompositeChannelIndicator(data)
            
            if weights:
                indicator.weights = weights
            
            # Hesaplamalar
            indicator.calculate_all_indicators()
            indicator.calculate_composite_channels()
            indicator.generate_signals()
            
            # Backtest
            results = indicator.backtest_strategy(
                initial_capital=initial_capital,
                commission=commission
            )
            
            if results:
                response = {
                    'success': True,
                    'symbol': symbol,
                    'results': results
                }
            else:
                response = {
                    'success': False,
                    'error': 'Hiç işlem yapılmadı'
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
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

