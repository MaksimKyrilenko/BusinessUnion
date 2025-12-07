import { Controller, Get, Query, Param } from '@nestjs/common';
import { CryptoTrackerService } from './crypto-tracker.service';

@Controller('crypto')
export class CryptoTrackerController {
  constructor(private readonly cryptoTrackerService: CryptoTrackerService) {
    console.log('[Controller] CryptoTrackerController initialized');
  }

  /**
   * GET /api/crypto/top-coins
   * Получить топ монет
   */
  @Get('top-coins')
  async getTopCoins(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.cryptoTrackerService.getTopCoins(limitNum);
  }

  /**
   * GET /api/crypto/social-metrics
   * Получить социальные метрики
   */
  @Get('social-metrics')
  async getSocialMetrics(@Query('symbols') symbols?: string) {
    const symbolsArray = symbols ? symbols.split(',').map((s) => s.trim()) : undefined;
    return this.cryptoTrackerService.getSocialMetrics(symbolsArray);
  }

  /**
   * GET /api/crypto/heatmap
   * Получить тепловую карту рынка
   */
  @Get('heatmap')
  async getMarketHeatmap(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 100;
    return this.cryptoTrackerService.getMarketHeatmap(limitNum);
  }

  /**
   * GET /api/crypto/trust-index/:symbol
   * Получить индекс доверия для монеты
   */
  @Get('trust-index/:symbol')
  async getTrustIndex(@Param('symbol') symbol: string) {
    return this.cryptoTrackerService.getTrustIndex(symbol);
  }

  /**
   * GET /api/crypto/chart/:coinId
   * Получить данные для графика
   */
  @Get('chart/:coinId')
  async getChartData(
    @Param('coinId') coinId: string,
    @Query('days') days?: string,
    @Query('vs_currency') vsCurrency?: string,
  ) {
    const daysNum = days ? parseInt(days, 10) : 7;
    return this.cryptoTrackerService.getChartData(coinId, daysNum, vsCurrency || 'usd');
  }

  /**
   * GET /api/crypto/btc-dominance
   * Получить доминирование BTC с изменением за 24ч
   */
  @Get('btc-dominance')
  async getBTCDominance() {
    return this.cryptoTrackerService.getBTCDominance();
  }

  /**
   * GET /api/crypto/fear-greed
   * Получить индекс страха и жадности
   */
  @Get('fear-greed')
  async getFearGreedIndex() {
    return this.cryptoTrackerService.getFearGreedIndex();
  }

  /**
   * GET /api/crypto/tokenomics/:coinId
   * Получить токеномику монеты
   */
  @Get('tokenomics/:coinId')
  async getTokenomics(@Param('coinId') coinId: string) {
    return this.cryptoTrackerService.getTokenomics(coinId);
  }

  /**
   * GET /api/crypto/overview
   * Получить общий обзор рынка
   */
  @Get('overview')
  async getMarketOverview() {
    const [topCoins, btcDominance, fearGreed, heatmap] = await Promise.all([
      this.cryptoTrackerService.getTopCoins(10),
      this.cryptoTrackerService.getBTCDominance(),
      this.cryptoTrackerService.getFearGreedIndex(),
      this.cryptoTrackerService.getMarketHeatmap(50),
    ]);

    return {
      topCoins,
      btcDominance,
      fearGreedIndex: fearGreed,
      heatmap,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * GET /api/crypto/anomalies
   * Получить аномалии рынка
   */
  @Get('anomalies')
  async getAnomalies(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.cryptoTrackerService.getAnomalies(limitNum);
  }

  /**
   * GET /api/crypto/whales
   * Получить крупные транзакции (киты)
   */
  @Get('whales')
  async getWhaleTransactions(
    @Query('symbol') symbol?: string,
    @Query('minAmount') minAmount?: string,
  ) {
    const minAmountNum = minAmount ? parseFloat(minAmount) : 10000000;
    return this.cryptoTrackerService.getWhaleTransactions(symbol, minAmountNum);
  }

  /**
   * GET /api/crypto/forecast/:symbol
   * Получить прогноз цены
   */
  @Get('forecast/:symbol')
  async getPriceForecast(@Param('symbol') symbol: string) {
    return this.cryptoTrackerService.getPriceForecast(symbol);
  }

  /**
   * GET /api/crypto/scam-check/:symbol
   * Проверить монету на риск скама
   */
  @Get('scam-check/:symbol')
  async getScamCheck(@Param('symbol') symbol: string) {
    return this.cryptoTrackerService.getScamCheck(symbol);
  }

  /**
   * GET /api/crypto/news/:symbol
   * Получить новости по монете
   */
  @Get('news/:symbol')
  async getNews(
    @Param('symbol') symbol: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.cryptoTrackerService.getNews(symbol, limitNum);
  }

  /**
   * GET /api/crypto/investor-cases/:symbol
   * Получить инвесторские кейсы
   */
  @Get('investor-cases/:symbol')
  async getInvestorCases(@Param('symbol') symbol: string) {
    return this.cryptoTrackerService.getInvestorCases(symbol);
  }

  /**
   * GET /api/crypto/on-chain/:symbol
   * Получить on-chain метрики для монеты
   */
  @Get('on-chain/:symbol')
  async getOnChainMetrics(@Param('symbol') symbol: string) {
    return this.cryptoTrackerService.getOnChainMetrics(symbol);
  }

  /**
   * GET /api/crypto/liquidations
   * Получить данные о ликвидациях
   */
  @Get('liquidations')
  async getLiquidations(@Query('symbol') symbol?: string) {
    console.log(`[Controller] Received liquidations request for symbol: ${symbol || 'BTC'}`);
    try {
      const result = await this.cryptoTrackerService.getLiquidations(symbol);
      console.log(`[Controller] Returning liquidations data:`, {
        total: result.total,
        long: result.long,
        short: result.short,
        chartDataLength: result.chartData?.length || 0
      });
      return result;
    } catch (error) {
      console.error(`[Controller] Error in getLiquidations:`, error);
      throw error;
    }
  }

  /**
   * GET /api/crypto/trading-signals
   * Получить торговые сигналы
   */
  @Get('trading-signals')
  async getTradingSignals(@Query('symbol') symbol?: string) {
    console.log(`[Controller] Received trading signals request for symbol: ${symbol || 'BTC'}`);
    try {
      const result = await this.cryptoTrackerService.getTradingSignals(symbol);
      console.log(`[Controller] Returning ${result.length} trading signals`);
      return result;
    } catch (error) {
      console.error(`[Controller] Error in getTradingSignals:`, error);
      throw error;
    }
  }

  /**
   * GET /api/crypto/funding-rates
   * Получить funding rates с различных бирж
   */
  @Get('funding-rates')
  async getFundingRates(@Query('symbol') symbol?: string) {
    console.log(`[Controller] Received funding rates request for symbol: ${symbol || 'BTC'}`);
    try {
      const result = await this.cryptoTrackerService.getFundingRates(symbol);
      console.log(`[Controller] Returning ${result.length} funding rates`);
      return result;
    } catch (error) {
      console.error(`[Controller] Error in getFundingRates:`, error);
      throw error;
    }
  }

  /**
   * GET /api/crypto/open-interest
   * Получить открытый интерес
   */
  @Get('open-interest')
  async getOpenInterest(@Query('symbol') symbol?: string) {
    console.log(`[Controller] Received open interest request for symbol: ${symbol || 'BTC'}`);
    try {
      const result = await this.cryptoTrackerService.getOpenInterest(symbol);
      console.log(`[Controller] Returning open interest: ${result}`);
      return { openInterest: result, symbol: symbol || 'BTC' };
    } catch (error) {
      console.error(`[Controller] Error in getOpenInterest:`, error);
      throw error;
    }
  }
}

