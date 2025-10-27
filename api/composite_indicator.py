"""
Kompozit Kanal İndikatörü - Vercel Serverless Function
"""

import pandas as pd
import numpy as np
import yfinance as yf
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

class CompositeChannelIndicator:
    """Tüm indikatörleri birleştiren kompozit kanal sistemi"""
    
    def __init__(self, data, use_adaptive=False):
        self.data = data.copy()
        self.use_adaptive = use_adaptive
        
        # Sabit Ağırlıklar
        self.weights = {
            'donchian': 0.20,
            'bollinger': 0.20,
            'ema': 0.15,
            'rsi': 0.15,
            'macd': 0.15,
            'volume': 0.10,
            'fibonacci': 0.05
        }
        
        self.adaptive_weights = self.weights.copy()
        self.performance_history = {key: [] for key in self.weights.keys()}
        
    def calculate_all_indicators(self):
        """Tüm indikatörleri hesapla"""
        self._calculate_donchian(period=20)
        self._calculate_bollinger(period=20, std=2)
        self._calculate_ema()
        self._calculate_rsi(period=14)
        self._calculate_macd()
        self._calculate_volume_indicators()
        self._calculate_fibonacci()
        
    def _calculate_donchian(self, period=20):
        """Donchian Kanalları"""
        self.data['don_upper'] = self.data['High'].rolling(window=period).max()
        self.data['don_lower'] = self.data['Low'].rolling(window=period).min()
        self.data['don_mid'] = (self.data['don_upper'] + self.data['don_lower']) / 2
        
    def _calculate_bollinger(self, period=20, std=2):
        """Bollinger Bantları"""
        self.data['bb_mid'] = self.data['Close'].rolling(window=period).mean()
        bb_std = self.data['Close'].rolling(window=period).std()
        self.data['bb_upper'] = self.data['bb_mid'] + (bb_std * std)
        self.data['bb_lower'] = self.data['bb_mid'] - (bb_std * std)
        
    def _calculate_ema(self):
        """Exponential Moving Average"""
        self.data['ema_12'] = self.data['Close'].ewm(span=12, adjust=False).mean()
        self.data['ema_26'] = self.data['Close'].ewm(span=26, adjust=False).mean()
        self.data['ema_50'] = self.data['Close'].ewm(span=50, adjust=False).mean()
        
    def _calculate_rsi(self, period=14):
        """Relative Strength Index"""
        delta = self.data['Close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        rs = gain / loss
        self.data['rsi'] = 100 - (100 / (1 + rs))
        
    def _calculate_macd(self):
        """MACD"""
        exp1 = self.data['Close'].ewm(span=12, adjust=False).mean()
        exp2 = self.data['Close'].ewm(span=26, adjust=False).mean()
        self.data['macd'] = exp1 - exp2
        self.data['macd_signal'] = self.data['macd'].ewm(span=9, adjust=False).mean()
        self.data['macd_histogram'] = self.data['macd'] - self.data['macd_signal']
        
    def _calculate_volume_indicators(self):
        """Volume bazlı indikatörler"""
        self.data['volume_ma'] = self.data['Volume'].rolling(window=20).mean()
        self.data['vpt'] = (self.data['Volume'] * 
                           ((self.data['Close'] - self.data['Close'].shift(1)) / 
                            self.data['Close'].shift(1))).cumsum()
        self.data['obv'] = (np.sign(self.data['Close'].diff()) * self.data['Volume']).fillna(0).cumsum()
        
    def _calculate_fibonacci(self):
        """Fibonacci Retracement Seviyeleri"""
        period = 50
        rolling_high = self.data['High'].rolling(window=period).max()
        rolling_low = self.data['Low'].rolling(window=period).min()
        diff = rolling_high - rolling_low
        
        self.data['fib_0'] = rolling_high
        self.data['fib_236'] = rolling_high - (diff * 0.236)
        self.data['fib_382'] = rolling_high - (diff * 0.382)
        self.data['fib_50'] = rolling_high - (diff * 0.50)
        self.data['fib_618'] = rolling_high - (diff * 0.618)
        self.data['fib_100'] = rolling_low
        
    def calculate_composite_channels(self):
        """Kompozit üst ve alt kanalları hesapla"""
        upper_levels = []
        lower_levels = []
        mid_levels = []
        
        # Donchian
        upper_levels.append(self.data['don_upper'] * self.get_weight('donchian'))
        lower_levels.append(self.data['don_lower'] * self.get_weight('donchian'))
        mid_levels.append(self.data['don_mid'] * self.get_weight('donchian'))
        
        # Bollinger
        upper_levels.append(self.data['bb_upper'] * self.get_weight('bollinger'))
        lower_levels.append(self.data['bb_lower'] * self.get_weight('bollinger'))
        mid_levels.append(self.data['bb_mid'] * self.get_weight('bollinger'))
        
        # EMA
        upper_levels.append(self.data['ema_12'] * self.get_weight('ema'))
        lower_levels.append(self.data['ema_50'] * self.get_weight('ema'))
        mid_levels.append(self.data['ema_26'] * self.get_weight('ema'))
        
        # RSI
        rsi_weight = self.get_weight('rsi')
        rsi_factor = (self.data['rsi'] - 50) / 50
        price_std = self.data['Close'].rolling(20).std()
        upper_levels.append((self.data['Close'] + price_std * (1 + rsi_factor)) * rsi_weight)
        lower_levels.append((self.data['Close'] - price_std * (1 - rsi_factor)) * rsi_weight)
        mid_levels.append(self.data['Close'] * rsi_weight)
        
        # MACD
        macd_weight = self.get_weight('macd')
        macd_factor = self.data['macd_histogram'] / self.data['Close'] * 100
        upper_levels.append((self.data['Close'] * (1 + abs(macd_factor)/100)) * macd_weight)
        lower_levels.append((self.data['Close'] * (1 - abs(macd_factor)/100)) * macd_weight)
        mid_levels.append(self.data['Close'] * macd_weight)
        
        # Volume
        vol_weight = self.get_weight('volume')
        vol_ratio = self.data['Volume'] / self.data['volume_ma']
        vol_factor = np.clip(vol_ratio, 0.5, 1.5)
        upper_levels.append(self.data['Close'] * vol_factor * vol_weight)
        lower_levels.append(self.data['Close'] / vol_factor * vol_weight)
        mid_levels.append(self.data['Close'] * vol_weight)
        
        # Fibonacci
        fib_weight = self.get_weight('fibonacci')
        upper_levels.append(self.data['fib_236'] * fib_weight)
        lower_levels.append(self.data['fib_618'] * fib_weight)
        mid_levels.append(self.data['fib_50'] * fib_weight)
        
        # Toplam ağırlık normalize et
        total_weight = sum(self.get_weight(k) for k in self.weights.keys())
        
        self.data['composite_upper'] = sum(upper_levels) / total_weight
        self.data['composite_lower'] = sum(lower_levels) / total_weight
        self.data['composite_mid'] = sum(mid_levels) / total_weight
        
        self.data['channel_width'] = self.data['composite_upper'] - self.data['composite_lower']
        self.data['channel_width_pct'] = (self.data['channel_width'] / self.data['Close']) * 100
        
    def get_weight(self, indicator):
        """Adaptif veya sabit ağırlık döndür"""
        if self.use_adaptive:
            return self.adaptive_weights[indicator]
        return self.weights[indicator]
        
    def generate_signals(self):
        """Trading sinyalleri üret"""
        self.data['breakout_up'] = (self.data['Close'] > self.data['composite_upper']).astype(int)
        self.data['breakout_down'] = (self.data['Close'] < self.data['composite_lower']).astype(int)
        
        self.data['mid_cross_up'] = ((self.data['Close'] > self.data['composite_mid']) & 
                                      (self.data['Close'].shift(1) <= self.data['composite_mid'])).astype(int)
        self.data['mid_cross_down'] = ((self.data['Close'] < self.data['composite_mid']) & 
                                        (self.data['Close'].shift(1) >= self.data['composite_mid'])).astype(int)
        
        # Kompozit Skor
        score = 0
        
        score += np.where(self.data['Close'] > self.data['don_upper'], 1, 
                         np.where(self.data['Close'] < self.data['don_lower'], -1, 0))
        
        score += np.where(self.data['Close'] > self.data['bb_upper'], 1,
                         np.where(self.data['Close'] < self.data['bb_lower'], -1, 0))
        
        score += np.where((self.data['ema_12'] > self.data['ema_26']) & 
                         (self.data['ema_26'] > self.data['ema_50']), 1,
                         np.where((self.data['ema_12'] < self.data['ema_26']) & 
                                 (self.data['ema_26'] < self.data['ema_50']), -1, 0))
        
        score += np.where(self.data['rsi'] > 70, 1, np.where(self.data['rsi'] < 30, -1, 0))
        
        score += np.where(self.data['macd'] > self.data['macd_signal'], 1,
                         np.where(self.data['macd'] < self.data['macd_signal'], -1, 0))
        
        score += np.where(self.data['Volume'] > self.data['volume_ma'] * 1.5, 1,
                         np.where(self.data['Volume'] < self.data['volume_ma'] * 0.5, -1, 0))
        
        score += np.where(self.data['Close'] > self.data['fib_236'], 1,
                         np.where(self.data['Close'] < self.data['fib_618'], -1, 0))
        
        self.data['composite_score'] = score
        
        self.data['signal'] = np.where(self.data['composite_score'] >= 4, 2,
                                       np.where(self.data['composite_score'] >= 2, 1,
                                               np.where(self.data['composite_score'] <= -4, -2,
                                                       np.where(self.data['composite_score'] <= -2, -1, 0))))
        
        self.data['signal_change'] = self.data['signal'].diff()
        
    def get_current_status(self):
        """Güncel durum"""
        last_row = self.data.iloc[-1]
        
        signal_names = {2: "Güçlü Alım", 1: "Alım", 0: "Nötr", -1: "Satım", -2: "Güçlü Satım"}
        
        return {
            'date': str(last_row.name),
            'price': float(last_row['Close']),
            'composite_upper': float(last_row['composite_upper']),
            'composite_mid': float(last_row['composite_mid']),
            'composite_lower': float(last_row['composite_lower']),
            'channel_width_pct': float(last_row['channel_width_pct']),
            'rsi': float(last_row['rsi']),
            'macd': float(last_row['macd']),
            'macd_histogram': float(last_row['macd_histogram']),
            'volume_ratio': float(last_row['Volume'] / last_row['volume_ma']),
            'composite_score': int(last_row['composite_score']),
            'signal': int(last_row['signal']),
            'signal_name': signal_names.get(int(last_row['signal']), 'Bilinmiyor')
        }
        
    def backtest_strategy(self, initial_capital=10000, commission=0.001):
        """Stratejiyi backtest et"""
        capital = initial_capital
        position = 0
        entry_price = 0
        trades = []
        equity_curve = []
        
        for i in range(len(self.data)):
            row = self.data.iloc[i]
            current_price = row['Close']
            
            if position != 0:
                if position == 1:
                    unrealized_pnl = (current_price - entry_price) * (capital / entry_price)
                else:
                    unrealized_pnl = (entry_price - current_price) * (capital / entry_price)
                current_equity = capital + unrealized_pnl
            else:
                current_equity = capital
                
            equity_curve.append({
                'date': str(row.name),
                'equity': float(current_equity),
                'position': position
            })
            
            signal = row['signal']
            
            if position == 1 and signal <= 0:
                pnl = ((current_price - entry_price) / entry_price) * capital
                commission_cost = capital * commission + (capital + pnl) * commission
                capital += pnl - commission_cost
                
                trades.append({
                    'entry_date': entry_date,
                    'exit_date': str(row.name),
                    'type': 'LONG',
                    'entry_price': float(entry_price),
                    'exit_price': float(current_price),
                    'pnl': float(pnl - commission_cost),
                    'return_pct': float(((current_price - entry_price) / entry_price) * 100)
                })
                
                position = 0
                
            elif position == -1 and signal >= 0:
                pnl = ((entry_price - current_price) / entry_price) * capital
                commission_cost = capital * commission + (capital + pnl) * commission
                capital += pnl - commission_cost
                
                trades.append({
                    'entry_date': entry_date,
                    'exit_date': str(row.name),
                    'type': 'SHORT',
                    'entry_price': float(entry_price),
                    'exit_price': float(current_price),
                    'pnl': float(pnl - commission_cost),
                    'return_pct': float(((entry_price - current_price) / entry_price) * 100)
                })
                
                position = 0
            
            if position == 0:
                if signal >= 1:
                    position = 1
                    entry_price = current_price
                    entry_date = str(row.name)
                    
                elif signal <= -1:
                    position = -1
                    entry_price = current_price
                    entry_date = str(row.name)
        
        if position != 0:
            last_price = self.data['Close'].iloc[-1]
            if position == 1:
                pnl = ((last_price - entry_price) / entry_price) * capital
            else:
                pnl = ((entry_price - last_price) / entry_price) * capital
            commission_cost = capital * commission * 2
            capital += pnl - commission_cost
        
        if len(trades) > 0:
            trades_df = pd.DataFrame(trades)
            
            total_return = ((capital - initial_capital) / initial_capital) * 100
            total_trades = len(trades)
            winning_trades = len([t for t in trades if t['pnl'] > 0])
            losing_trades = total_trades - winning_trades
            win_rate = (winning_trades / total_trades) * 100 if total_trades > 0 else 0
            
            avg_win = np.mean([t['pnl'] for t in trades if t['pnl'] > 0]) if winning_trades > 0 else 0
            avg_loss = np.mean([t['pnl'] for t in trades if t['pnl'] <= 0]) if losing_trades > 0 else 0
            profit_factor = abs(avg_win / avg_loss) if avg_loss != 0 else 0
            
            equity_df = pd.DataFrame(equity_curve)
            max_equity = equity_df['equity'].max()
            max_drawdown = ((equity_df['equity'] - max_equity) / max_equity * 100).min()
            
            buy_hold_return = ((self.data['Close'].iloc[-1] - self.data['Close'].iloc[0]) / 
                              self.data['Close'].iloc[0]) * 100
            
            return {
                'trades': trades,
                'equity_curve': equity_curve,
                'metrics': {
                    'initial_capital': float(initial_capital),
                    'final_capital': float(capital),
                    'total_return': float(total_return),
                    'total_trades': int(total_trades),
                    'winning_trades': int(winning_trades),
                    'losing_trades': int(losing_trades),
                    'win_rate': float(win_rate),
                    'profit_factor': float(profit_factor),
                    'max_drawdown': float(max_drawdown),
                    'avg_win': float(avg_win),
                    'avg_loss': float(avg_loss),
                    'buy_hold_return': float(buy_hold_return),
                    'excess_return': float(total_return - buy_hold_return)
                }
            }
        else:
            return None


def download_data(symbol, period='1y', interval='1d'):
    """Veri indir"""
    try:
        data = yf.download(symbol, period=period, interval=interval, progress=False)
        if data.empty:
            return None
        return data
    except Exception as e:
        print(f"Veri indirme hatası: {e}")
        return None

