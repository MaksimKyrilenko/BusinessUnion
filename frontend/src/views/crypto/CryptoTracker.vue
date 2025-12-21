<template>
  <div class="crypto-tracker">
    <!-- Blue Header -->
    <div class="page-header-blue">
      <div class="header-left">
        <div class="header-badge">
          <i class="fas fa-coins"></i>
          <span>Крипто</span>
        </div>
        <h1 class="header-title">Крипто трекер</h1>
        <p class="header-subtitle">Аналитика криптовалютного рынка в реальном времени</p>
      </div>
      <div class="header-stats">
        <div class="stat-card">
          <div class="stat-icon"><i class="fab fa-bitcoin"></i></div>
          <div class="stat-content">
            <span class="stat-number">{{ topCoins.length }}</span>
            <span class="stat-label">Монет</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-chart-line"></i></div>
          <div class="stat-content">
            <span class="stat-number">24ч</span>
            <span class="stat-label">Данные</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-sync-alt"></i></div>
          <div class="stat-content">
            <span class="stat-number">Live</span>
            <span class="stat-label">Обновление</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Row 1: Market Overview -->
    <div class="row row-full">
      <div class="analytics-card">
        <h2>Обзор рынка</h2>
        <div class="market-grid">
        <div v-for="coin in topCoins" :key="coin.symbol" class="coin-card">
          <div class="coin-header">
            <img :src="coin.icon" :alt="coin.name" class="coin-icon">
            <div class="coin-info">
              <h3>{{ coin.name }}</h3>
              <span class="symbol">{{ coin.symbol }}</span>
            </div>
            <div class="coin-price">
              <div class="current-price">{{ formatMoney(coin.price) }}</div>
              <div :class="['price-change', coin.change >= 0 ? 'positive' : 'negative']">
                {{ coin.change > 0 ? '+' : '' }}{{ coin.change.toFixed(5) }}%
              </div>
            </div>
          </div>
          <div class="coin-stats">
            <div class="stat">
              <span class="label">Объем (24ч)</span>
              <span class="value">{{ formatMoney(coin.volume24h) }}</span>
            </div>
            <div class="stat">
              <span class="label">Капитализация</span>
              <span class="value">{{ formatMoney(coin.marketCap) }}</span>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>

    <!-- Row 2: BTC Dominance -->
    <div class="row row-full">
      <div class="analytics-card">
        <h2>Доминирование BTC</h2>
        <div class="dominance-content">
          <div class="dominance-main">
            <div class="dominance-value">{{ btcDominance.toFixed(2) }}%</div>
            <div v-if="btcDominanceChange !== null" :class="['dominance-change', btcDominanceChange >= 0 ? 'positive' : 'negative']">
              {{ btcDominanceChange > 0 ? '+' : '' }}{{ btcDominanceChange.toFixed(2) }}%
              <span class="change-label">за 24ч</span>
            </div>
          </div>
          <div class="dominance-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: btcDominance + '%' }"></div>
            </div>
            <div class="progress-labels">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
          <div class="dominance-info">
            <div class="info-item">
              <span class="info-label">Рыночная доля</span>
              <span class="info-value">{{ btcDominance.toFixed(2) }}%</span>
            </div>
            <div class="info-item">
              <span class="info-label">Остальные монеты</span>
              <span class="info-value">{{ (100 - btcDominance).toFixed(2) }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Row 3: On-Chain + Liquidations -->
    <div class="row row-2-equal">
      <div class="analytics-card">
        <h2>On-Chain Аналитика</h2>
        <div class="onchain-metrics" v-if="onChainMetrics.length > 0">
          <div v-for="metric in onChainMetrics" :key="metric.name" class="onchain-metric-card">
            <div class="metric-icon-wrapper">
              <div class="metric-icon">{{ getOnChainIcon(metric.name) }}</div>
            </div>
            <div class="metric-content">
              <div class="metric-header">
                <div class="metric-name">{{ metric.name }}</div>
                <div :class="['metric-change-badge', metric.trend]">
                  <span class="change-icon">{{ metric.trend === 'positive' ? '↑' : '↓' }}</span>
                  <span class="change-value">{{ Math.abs(metric.change) }}%</span>
                </div>
              </div>
              <div class="metric-value-main">{{ metric.value }}</div>
              <div class="metric-description">{{ getOnChainDescription(metric.name, metric.change) }}</div>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <p>Данные on-chain аналитики загружаются...</p>
        </div>
      </div>

      <div class="analytics-card">
        <h2>Ликвидации</h2>
        <LiquidationsChart :data="liquidationData" />
      </div>
    </div>

    <!-- Row 4: Signals + Futures -->
    <div class="row row-2-equal">
      <div class="analytics-card">
        <h2>Сигналы</h2>
        <div class="signals-list" v-if="tradingSignals && tradingSignals.length > 0">
          <div v-for="signal in tradingSignals" :key="signal.id" class="signal-item">
            <div :class="['signal-type', signal.type]">{{ signal.type }}</div>
            <div class="signal-info">
              <div class="signal-pair">{{ signal.pair }}</div>
              <div class="signal-price">{{ formatMoney(signal.price) }}</div>
            </div>
            <div class="signal-meta">
              <div class="signal-time">{{ formatDate(signal.time) }}</div>
              <div :class="['signal-strength', signal.strength]">
                {{ signal.strength }}
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <p>Торговые сигналы загружаются...</p>
        </div>
      </div>

      <div class="analytics-card">
        <h2>Фьючерсы</h2>
        <div class="futures-data">
          <div class="funding-rates">
            <h4>Funding Rate</h4>
            <div class="rates-list">
              <div v-for="rate in fundingRates" :key="rate.exchange" class="rate-item">
                <span class="exchange">{{ rate.exchange }}</span>
                <span :class="['rate-value', rate.value > 0 ? 'positive' : 'negative']">
                  {{ rate.value }}%
                </span>
              </div>
            </div>
          </div>
          <div class="open-interest">
            <h4>Открытый интерес</h4>
            <div class="interest-value">
              {{ formatMoney(openInterest) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Row 5: Trust Index (full width) -->
    <div class="row row-full">
      <div class="analytics-card">
        <h2>Персональный индекс доверия: {{ selectedCoinSymbol }}</h2>
          <div v-if="trustIndex" class="trust-index">
            <div class="trust-header">
              <div class="trust-score-circle">
                <svg class="score-ring" width="140" height="140">
                  <circle
                    class="score-ring-bg"
                    cx="70"
                    cy="70"
                    r="60"
                    fill="none"
                    stroke="#e9ecef"
                    stroke-width="12"
                  />
                  <circle
                    class="score-ring-fill"
                    :class="getTrustScoreClass(trustIndex.score)"
                    cx="70"
                    cy="70"
                    r="60"
                    fill="none"
                    :stroke="getTrustScoreColor(trustIndex.score)"
                    stroke-width="12"
                    stroke-linecap="round"
                    :stroke-dasharray="377"
                    :stroke-dashoffset="377 - (377 * trustIndex.score / 100)"
                    transform="rotate(-90 70 70)"
                  />
                </svg>
                <div class="score-content">
                  <div class="score-value">{{ trustIndex.score }}</div>
                  <div class="score-label">из 100</div>
                  <div class="score-status" :class="getTrustScoreClass(trustIndex.score)">
                    {{ getTrustScoreStatus(trustIndex.score) }}
                  </div>
                </div>
              </div>
            </div>
            <div class="trust-factors">
              <div class="factor-card" v-for="(value, key) in trustIndex.factors" :key="key">
                <div class="factor-header">
                  <div class="factor-icon">{{ getFactorIcon(key) }}</div>
                  <div class="factor-info">
                    <div class="factor-label">{{ getFactorLabel(key) }}</div>
                    <div class="factor-value">{{ value }}%</div>
                  </div>
                </div>
                <div class="factor-bar-container">
                  <div class="factor-bar">
                    <div 
                      class="factor-fill" 
                      :class="getFactorColorClass(key, value)"
                      :style="{ width: value + '%' }"
                    ></div>
                  </div>
                  <div class="factor-description">{{ getFactorDescription(key, value) }}</div>
                </div>
              </div>
            </div>
          </div>
        <div v-else class="loading-state">
          <p>Загрузка данных...</p>
        </div>
      </div>
    </div>

    <!-- Row 6: Anomalies + Whales -->
    <div class="row row-2-equal">
      <div class="analytics-card">
          <div class="anomaly-card-header">
            <div>
              <p class="anomaly-label">Сканер аномалий рынка</p>
              <h3>Необычные события за последний час</h3>
              <span class="anomaly-meta">Цена, объем и социальные всплески</span>
            </div>
            <div class="anomaly-summary-chip">
              Найдено: {{ anomalies.length }}
            </div>
          </div>
          <div class="anomaly-stream" v-if="anomalies.length > 0">
            <div
              v-for="anomaly in anomalies.slice(0, 5)"
              :key="anomaly.id"
              class="anomaly-row"
              :class="getAnomalySeverityClass(anomaly.change_percentage)"
            >
              <div class="anomaly-pill" :class="anomaly.type">
                <span class="pill-icon">{{ getAnomalyTypeIcon(anomaly.type) }}</span>
                {{ getAnomalyTypeLabel(anomaly.type) }}
              </div>
              <div class="anomaly-symbol-block">
                <span class="anomaly-symbol">{{ anomaly.symbol?.toUpperCase() }}</span>
                <span class="anomaly-change" :class="anomaly.change_percentage >= 0 ? 'positive' : 'negative'">
                  {{ formatAnomalyChange(anomaly.change_percentage) }}
                </span>
              </div>
              <div class="anomaly-time">{{ formatDate(anomaly.timestamp) }}</div>
            </div>
          </div>
          <div v-else class="empty-state">
            <p>Аномалий не обнаружено</p>
          </div>
        </div>

        <div class="analysis-card">
          <div class="whales-card-header">
            <div>
              <p class="whales-label">Мониторинг крупных перемещений</p>
              <h3>Киты в сети: последние операции</h3>
              <span class="whales-meta">Отслеживаем сделки свыше $10 млн</span>
            </div>
            <div class="whales-summary-chip">
              Зафиксировано: {{ getWhaleSummary(whaleTransactions) }}
            </div>
          </div>
          <div class="whales-stream" v-if="whaleTransactions.length > 0">
            <div
              v-for="whale in whaleTransactions.slice(0, 5)"
              :key="whale.id"
              class="whale-flow-item"
            >
              <div class="whale-flow-symbol">
                <div class="symbol-circle">{{ whale.symbol }}</div>
                <div class="whale-flow-amount">
                  {{ formatMoney(whale.amount_usd) }}
                </div>
              </div>
              <div class="whale-flow-meta">
                <span class="whale-type-chip" :class="getWhaleTypeClass(whale.type)">
                  <span class="chip-icon">{{ getWhaleTypeIcon(whale.type) }}</span>
                  {{ getWhaleTypeLabel(whale.type) }}
                </span>
                <span class="whale-time">
                  {{ formatDate(whale.timestamp) }}
                </span>
              </div>
            </div>
          </div>
        <div v-else class="empty-state">
          <p>Крупных транзакций не обнаружено</p>
        </div>
      </div>
    </div>

    <!-- Row 7: Heatmap (full width) -->
    <div class="row row-full">
      <div class="analytics-card">
        <h2>Тепловая карта рынка</h2>
        <div class="heatmap-container">
          <div class="heatmap-grid">
            <div 
              v-for="coin in sortedHeatmap" 
              :key="coin.id" 
              class="heatmap-item"
              :class="getHeatmapClass(coin.price_change_percentage_24h)"
              :style="getHeatmapStyle(coin.price_change_percentage_24h)"
            >
              <div class="heatmap-symbol">{{ coin.symbol.toUpperCase() }}</div>
              <div class="heatmap-change" :class="coin.price_change_percentage_24h > 0 ? 'positive' : 'negative'">
                {{ coin.price_change_percentage_24h > 0 ? '+' : '' }}{{ coin.price_change_percentage_24h.toFixed(2) }}%
              </div>
            </div>
          </div>
          <div class="heatmap-legend">
            <div class="legend-item">
              <div class="legend-color positive-strong"></div>
              <span>Сильный рост (>5%)</span>
            </div>
            <div class="legend-item">
              <div class="legend-color positive-medium"></div>
              <span>Рост (1-5%)</span>
            </div>
            <div class="legend-item">
              <div class="legend-color neutral"></div>
              <span>Нейтрально (-1% до +1%)</span>
            </div>
            <div class="legend-item">
              <div class="legend-color negative-medium"></div>
              <span>Падение (-1% до -5%)</span>
            </div>
            <div class="legend-item">
              <div class="legend-color negative-strong"></div>
              <span>Сильное падение (<-5%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Row 8: Tokenomics + Forecast + Scam Check -->
    <div class="row row-3">
      <div class="analytics-card" v-if="tokenomics">
        <h2>Токеномика: {{ selectedCoinSymbol }}</h2>
        <div class="tokenomics-data">
            <!-- Визуализация распределения -->
            <div class="tokenomics-visualization" v-if="tokenomics.max_supply || tokenomics.total_supply">
              <div class="visualization-title">Распределение токенов</div>
              <div class="supply-progress">
                <div class="progress-item">
                  <div class="progress-label">
                    <span>В обращении</span>
                    <span class="progress-percent">{{ getCirculatingPercent() }}%</span>
                  </div>
                  <div class="progress-bar-container">
                    <div 
                      class="progress-bar-fill circulating" 
                      :style="{ width: getCirculatingPercent() + '%' }"
                    ></div>
                  </div>
                  <div class="progress-value">{{ formatTokenAmount(tokenomics.circulating_supply) }}</div>
                </div>
                <div class="progress-item" v-if="tokenomics.total_supply && tokenomics.total_supply > tokenomics.circulating_supply">
                  <div class="progress-label">
                    <span>Заблокировано / Не выпущено</span>
                    <span class="progress-percent">{{ getLockedPercent() }}%</span>
                  </div>
                  <div class="progress-bar-container">
                    <div 
                      class="progress-bar-fill locked" 
                      :style="{ width: getLockedPercent() + '%' }"
                    ></div>
                  </div>
                  <div class="progress-value">{{ formatTokenAmount(tokenomics.total_supply - tokenomics.circulating_supply) }}</div>
                </div>
              </div>
            </div>

            <!-- Детальная информация -->
            <div class="tokenomics-details">
              <div class="tokenomics-row">
                <div class="tokenomics-label">
                  <span class="label-icon">📊</span>
                  <span>Общее предложение</span>
                </div>
                <div class="tokenomics-value">
                  <span class="value-main">{{ formatTokenAmount(tokenomics.total_supply) }}</span>
                  <span class="value-sub" v-if="tokenomics.max_supply">
                    из {{ formatTokenAmount(tokenomics.max_supply) }} макс.
                  </span>
                </div>
              </div>

              <div class="tokenomics-row">
                <div class="tokenomics-label">
                  <span class="label-icon">🔄</span>
                  <span>В обращении</span>
                </div>
                <div class="tokenomics-value">
                  <span class="value-main">{{ formatTokenAmount(tokenomics.circulating_supply) }}</span>
                  <span class="value-sub">
                    {{ getCirculatingPercent() }}% от {{ tokenomics.max_supply ? 'максимума' : 'общего' }}
                  </span>
                </div>
              </div>

              <div class="tokenomics-row" v-if="tokenomics.max_supply">
                <div class="tokenomics-label">
                  <span class="label-icon">🎯</span>
                  <span>Максимальное предложение</span>
                </div>
                <div class="tokenomics-value">
                  <span class="value-main">{{ formatTokenAmount(tokenomics.max_supply) }}</span>
                  <span class="value-sub">
                    Осталось: {{ formatTokenAmount(tokenomics.max_supply - tokenomics.circulating_supply) }}
                  </span>
                </div>
              </div>

              <div class="tokenomics-row">
                <div class="tokenomics-label">
                  <span class="label-icon">💰</span>
                  <span>Рыночная капитализация</span>
                </div>
                <div class="tokenomics-value">
                  <span class="value-main">{{ formatMoney(tokenomics.market_cap) }}</span>
                  <span class="value-sub" v-if="tokenomics.fully_diluted_valuation">
                    Полная: {{ formatMoney(tokenomics.fully_diluted_valuation) }}
                  </span>
                </div>
              </div>

              <div class="tokenomics-row" v-if="tokenomics.inflation_rate !== null && tokenomics.inflation_rate !== undefined">
                <div class="tokenomics-label">
                  <span class="label-icon">📈</span>
                  <span>Инфляция (24ч)</span>
                </div>
                <div class="tokenomics-value">
                  <span 
                    class="value-main" 
                    :class="tokenomics.inflation_rate > 0 ? 'negative' : 'positive'"
                  >
                    {{ tokenomics.inflation_rate > 0 ? '+' : '' }}{{ tokenomics.inflation_rate.toFixed(4) }}%
                  </span>
                  <span class="value-sub">
                    {{ tokenomics.inflation_rate > 0 ? 'Увеличение' : 'Снижение' }} предложения
                  </span>
                </div>
            </div>
          </div>
        </div>
      </div>

      <div class="analytics-card" v-if="priceForecast">
        <div class="forecast-card" :class="priceForecast.direction">
          <div class="forecast-header">
            <div>
              <p class="forecast-label">Прогноз для {{ selectedCoinSymbol }}/USDT</p>
              <h3>Прогноз движения цены (мини-ИИ)</h3>
              <span class="forecast-timeframe">{{ priceForecast.timeframe }}</span>
            </div>
            <div class="forecast-direction-chip" :class="priceForecast.direction">
              <span class="chip-icon">{{ getForecastDirectionIcon(priceForecast.direction) }}</span>
              {{ getForecastDirectionLabel(priceForecast.direction) }}
            </div>
          </div>
          <div class="forecast-grid">
            <div class="forecast-panel trend">
              <div class="trend-icon">
                {{ getForecastDirectionIcon(priceForecast.direction) }}
              </div>
              <div class="trend-info">
                <span class="trend-label">{{ getForecastDirectionLabel(priceForecast.direction) }}</span>
                <p class="trend-description">
                  {{ getForecastDirectionDescription(priceForecast.direction) }}
                </p>
              </div>
            </div>
            <div class="forecast-panel confidence">
              <div class="confidence-ring" :style="getConfidenceStyle(priceForecast.confidence)">
                <span>{{ priceForecast.confidence }}%</span>
              </div>
              <div class="confidence-meta">
                <span class="confidence-title">Уверенность</span>
                <span class="confidence-status" :class="getConfidenceClass(priceForecast.confidence)">
                  {{ getConfidenceLabel(priceForecast.confidence) }}
                </span>
              </div>
            </div>
            <div class="forecast-panel target" v-if="priceForecast.target_price">
              <div class="target-label">Целевая цена</div>
              <div class="target-value">{{ formatMoney(priceForecast.target_price) }}</div>
              <div class="target-hint">Расчёт для горизонта {{ priceForecast.timeframe.toLowerCase() }}</div>
            </div>
          </div>
          <div class="forecast-factors" v-if="priceForecast.factors && priceForecast.factors.length">
            <div class="factors-label">Основные факторы</div>
            <div class="factor-chips">
              <span
                v-for="(factor, index) in priceForecast.factors"
                :key="index"
                class="factor-chip"
              >
                {{ factor }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="analytics-card" v-if="scamCheck">
        <div class="scam-card" :class="getRiskLevelClass(scamCheck.risk_score)">
          <div class="scam-card-header">
            <div>
              <p class="scam-label">Проверка на риск "скама"</p>
              <h3>Оценка безопасности {{ selectedCoinSymbol }}</h3>
              <span class="scam-meta">Автоматический чек-лист смарт-контракта</span>
            </div>
            <div class="risk-chip" :class="getRiskLevelClass(scamCheck.risk_score)">
              {{ getRiskLevelLabel(scamCheck.risk_score) }}
            </div>
          </div>
          <div class="scam-layout">
            <div class="risk-panel">
              <div class="risk-gauge" :style="getRiskRingStyle(scamCheck.risk_score)">
                <span>
                  {{ scamCheck.risk_score }}
                  <small>из 100</small>
                </span>
              </div>
              <div class="risk-description">
                {{ getRiskLevelDescription(scamCheck.risk_score) }}
              </div>
            </div>
            <div class="checks-panel">
              <div class="check-grid">
                <div class="check-tile" v-for="(value, key) in scamCheck.checks" :key="key">
                  <div class="check-icon" :class="value ? 'ok' : 'fail'">
                    {{ value ? '✓' : '!' }}
                  </div>
                  <div class="check-info">
                    <div class="check-title">{{ getCheckLabel(key) }}</div>
                    <div class="check-status-text" :class="value ? 'ok' : 'fail'">
                      {{ value ? 'Пройдено' : 'Не подтверждено' }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="scam-warnings" v-if="scamCheck.warnings && scamCheck.warnings.length > 0">
                <div class="warnings-label">Обнаружены сигналы риска:</div>
                <ul class="warnings-list">
                  <li v-for="(warning, index) in scamCheck.warnings" :key="index">{{ warning }}</li>
                </ul>
              </div>
              <div v-else class="warnings-empty">
                Риск-факторы не обнаружены. Монета выглядит безопасно по текущим метрикам.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Row 9: Investor Cases + News -->
    <div class="row row-2-equal">
      <div class="analytics-card">
        <div class="case-card-header">
          <div>
            <p class="case-label">Инвесторские кейсы</p>
            <h3>{{ selectedCoinSymbol }}: готовые сценарии</h3>
            <span class="case-meta">Стратегии с указанием тайминга, целей и риск/прибыль</span>
          </div>
        </div>
        <div class="investor-cases-grid">
          <div
            v-for="(investorCase, index) in investorCases"
            :key="index"
            class="investor-case-card"
            :class="investorCase.strategy"
          >
            <div class="case-top">
              <div class="case-strategy-chip" :class="investorCase.strategy">
                <span class="chip-icon">{{ getStrategyIcon(investorCase.strategy) }}</span>
                {{ getStrategyLabel(investorCase.strategy) }}
              </div>
              <div class="case-timeframe">{{ investorCase.timeframe }}</div>
            </div>
            <div class="case-core">
              <div class="case-price-block entry">
                <span class="case-price-label">Вход</span>
                <span class="case-price-value">{{ formatMoney(investorCase.entry_price) }}</span>
              </div>
              <div class="case-price-block target" v-if="investorCase.target_price">
                <span class="case-price-label">Цель</span>
                <span class="case-price-value">{{ formatMoney(investorCase.target_price) }}</span>
              </div>
              <div class="case-price-block stop" v-if="investorCase.stop_loss">
                <span class="case-price-label">Стоп</span>
                <span class="case-price-value">{{ formatMoney(investorCase.stop_loss) }}</span>
              </div>
            </div>
            <div class="case-metrics">
              <div class="case-metric-item">
                <span class="case-metric-label">Риск/прибыль</span>
                <span class="case-metric-value">{{ investorCase.risk_reward_ratio?.toFixed(2) || '—' }}</span>
              </div>
              <div class="case-metric-item">
                <span class="case-metric-label">Стратегия</span>
                <span class="case-metric-value">{{ getStrategyTone(investorCase.strategy) }}</span>
              </div>
            </div>
            <div class="case-reason">
              <span class="reason-title">Обоснование</span>
              <p>{{ investorCase.reasoning }}</p>
            </div>
          </div>
        </div>
        <div v-if="investorCases.length === 0" class="empty-state">
          <p>Кейсы не найдены</p>
        </div>
      </div>

      <div class="analytics-card">
        <div class="news-card-header">
          <div>
            <p class="news-label">История новостей</p>
            <h3>{{ selectedCoinSymbol }}: ключевые события</h3>
            <span class="news-meta">Сводка последних заголовков с оценкой настроения</span>
          </div>
          <div class="news-summary-chip" :class="getSentimentSummaryClass(news)">
            {{ getSentimentSummaryLabel(news) }}
          </div>
        </div>
        <div class="news-timeline" v-if="news.length > 0">
          <div v-for="item in news" :key="item.id" class="news-timeline-item">
            <div class="timeline-dot" :class="getSentimentClass(item.sentiment)"></div>
            <div class="timeline-card">
              <div class="timeline-card-header">
                <div class="timeline-title">{{ item.title }}</div>
                <div class="timeline-sentiment" :class="getSentimentClass(item.sentiment)">
                  <span class="sentiment-icon">{{ getSentimentIcon(item.sentiment) }}</span>
                  {{ getSentimentLabel(item.sentiment) }}
                </div>
              </div>
              <p class="timeline-description">{{ item.description }}</p>
              <div class="timeline-meta">
                <span class="meta-source">{{ item.source }}</span>
                <span class="meta-dot">•</span>
                <span class="meta-date">{{ formatDate(item.published_at) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <p>Новостей не найдено</p>
        </div>
      </div>
    </div>

    <!-- Row 10: Social Hype (full width) -->
    <div class="row row-full">
      <div class="analytics-card">
        <div class="card-header-with-badge">
          <h2>Социальный индекс хайпа: {{ selectedCoinSymbol }}</h2>
          <div class="data-source-badge" :class="isSocialDataReal ? 'real' : 'mock'" v-if="socialHype">
            <span class="badge-icon">{{ isSocialDataReal ? '✅' : '⚠️' }}</span>
            <span class="badge-text">{{ isSocialDataReal ? 'Реальные данные' : 'Тестовые данные' }}</span>
          </div>
        </div>
        <div v-if="isLoadingSocial" class="loading-state">
          <Loader />
          <p>Загрузка социальных метрик...</p>
        </div>
        <div v-else-if="socialHype" class="social-hype">
          <div class="hype-header">
            <div class="galaxy-score-circle">
              <svg class="galaxy-ring" width="160" height="160">
                <circle
                  class="galaxy-ring-bg"
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="#e9ecef"
                  stroke-width="14"
                />
                <circle
                  class="galaxy-ring-fill"
                  :class="getGalaxyScoreClass(socialHype.galaxy_score || 0)"
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  :stroke="getGalaxyScoreColor(socialHype.galaxy_score || 0)"
                  stroke-width="14"
                  stroke-linecap="round"
                  :stroke-dasharray="440"
                  :stroke-dashoffset="440 - (440 * (socialHype.galaxy_score || 0) / 100)"
                  transform="rotate(-90 80 80)"
                />
              </svg>
              <div class="galaxy-content">
                <div class="galaxy-score-main">{{ socialHype.galaxy_score || 0 }}</div>
                <div class="galaxy-score-label">Galaxy Score</div>
                <div class="galaxy-score-status" :class="getGalaxyScoreClass(socialHype.galaxy_score || 0)">
                  {{ getGalaxyScoreStatus(socialHype.galaxy_score || 0) }}
                </div>
              </div>
            </div>
          </div>
          <div class="hype-metrics-grid">
            <div class="hype-metric-card">
              <div class="metric-icon">📊</div>
              <div class="metric-content">
                <div class="metric-label">Социальный объем</div>
                <div class="metric-value">{{ formatSocialNumber(socialHype.social_volume || 0) }}</div>
                <div class="metric-description">Упоминаний в соцсетях</div>
              </div>
            </div>
            <div class="hype-metric-card">
              <div class="metric-icon">⭐</div>
              <div class="metric-content">
                <div class="metric-label">Социальный счет</div>
                <div class="metric-value">{{ socialHype.social_score || 0 }}</div>
                <div class="metric-description">из 100</div>
              </div>
            </div>
            <div class="hype-metric-card">
              <div class="metric-icon">👥</div>
              <div class="metric-content">
                <div class="metric-label">Участники</div>
                <div class="metric-value">{{ formatSocialNumber(socialHype.social_contributors || 0) }}</div>
                <div class="metric-description">Активных пользователей</div>
              </div>
            </div>
            <div class="hype-metric-card">
              <div class="metric-icon">🔥</div>
              <div class="metric-content">
                <div class="metric-label">Влияние</div>
                <div class="metric-value">{{ socialHype.social_influence || 0 }}</div>
                <div class="metric-description">из 100</div>
              </div>
            </div>
          </div>
          <div class="hype-additional" v-if="socialHype.alt_rank">
            <div class="additional-item">
              <span class="additional-label">Alt Rank:</span>
              <span class="additional-value">#{{ socialHype.alt_rank }}</span>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <p>Социальные метрики недоступны для {{ selectedCoinSymbol }}</p>
          <p class="empty-hint">Проверьте настройки API ключа LunarCrush</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import LiquidationsChart from '@/components/charts/LiquidationsChart.vue'
import Loader from '@/components/ui/Loader.vue'
import api from '@/axios'

export default {
  name: 'CryptoTracker',
  components: {
    BaseSelect,
    LiquidationsChart,
    Loader
  },
  setup() {
    // Состояние компонента
    const selectedPair = ref('BTC/USDT')
    const btcDominance = ref(42.5)
    const btcDominanceChange = ref(null)

    // Данные монет (загружаются с API)
    const topCoins = ref([])

    // Торговые пары на основе реальных данных монет
    const tradingPairs = computed(() => {
      const pairs = topCoins.value.slice(0, 10).map(coin => ({
        value: `${coin.symbol}/USDT`,
        label: `${coin.symbol}/USDT`
      }));
      // Если монеты ещё не загружены, возвращаем дефолтные
      return pairs.length > 0 ? pairs : [
      { value: 'BTC/USDT', label: 'BTC/USDT' },
      { value: 'ETH/USDT', label: 'ETH/USDT' },
      { value: 'BNB/USDT', label: 'BNB/USDT' }
      ];
    })


    // Данные загружаются из API
    const onChainMetrics = ref([])
    const liquidationData = ref([])
    const tradingSignals = ref([])
    const fundingRates = ref([])
    const openInterest = ref(0)

    // Загрузка данных о ликвидациях
    const fetchLiquidations = async () => {
      const symbol = selectedCoinSymbol.value
      if (!symbol) {
        console.warn('⚠️ Символ не выбран для загрузки ликвидаций')
        liquidationData.value = []
        return
      }

      try {
        console.log(`📊 Загрузка данных о ликвидациях для ${symbol}`)
        const response = await api.get(`/crypto/liquidations?symbol=${symbol}`)
        console.log('📥 Полный ответ API ликвидаций:', JSON.stringify(response.data, null, 2))
        
        // Проверяем структуру ответа
        if (!response || !response.data) {
          console.warn('⚠️ Пустой ответ от API ликвидаций')
          liquidationData.value = []
          return
        }

        const data = response.data
        
        // Проверяем наличие chartData
        if (!data.chartData) {
          console.warn('⚠️ chartData отсутствует в ответе:', data)
          liquidationData.value = []
          return
        }

        if (!Array.isArray(data.chartData)) {
          console.warn('⚠️ chartData не является массивом:', typeof data.chartData, data.chartData)
          liquidationData.value = []
          return
        }

        if (data.chartData.length === 0) {
          console.warn('⚠️ chartData пустой массив')
          liquidationData.value = []
          return
        }

        console.log(`📈 Обработка ${data.chartData.length} точек данных о ликвидациях`)
        
        // Преобразуем timestamp в Date объекты с улучшенной обработкой
        const processedData = data.chartData.map((item, index) => {
          let timestamp
          
          // Обрабатываем разные форматы timestamp
          if (item.timestamp instanceof Date) {
            timestamp = item.timestamp
          } else if (typeof item.timestamp === 'string') {
            // Пробуем распарсить строку
            timestamp = new Date(item.timestamp)
            // Проверяем валидность даты
            if (isNaN(timestamp.getTime())) {
              // Если невалидная дата, создаем на основе текущего времени и индекса
              timestamp = new Date(Date.now() - (data.chartData.length - index) * 3600000)
              console.warn(`⚠️ Невалидный timestamp в элементе ${index}, создан новый:`, timestamp)
            }
          } else if (typeof item.timestamp === 'number') {
            // Если это число (миллисекунды или секунды)
            timestamp = item.timestamp > 1000000000000 
              ? new Date(item.timestamp) 
              : new Date(item.timestamp * 1000)
          } else {
            // Fallback: создаем timestamp на основе текущего времени
            timestamp = new Date(Date.now() - (data.chartData.length - index) * 3600000)
            console.warn(`⚠️ Неизвестный формат timestamp в элементе ${index}, создан новый:`, timestamp)
          }
          
          const longAmount = Number(item.longAmount) || 0
          const shortAmount = Number(item.shortAmount) || 0
          
          return {
            timestamp,
            longAmount,
            shortAmount
          }
        })
        
        // Сортируем данные по timestamp (от старых к новым)
        processedData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
        
        // Устанавливаем данные
        liquidationData.value = processedData
        
        console.log(`✅ Успешно загружено ${processedData.length} точек данных о ликвидациях для ${symbol}`)
        console.log(`   Первая точка:`, processedData[0])
        console.log(`   Последняя точка:`, processedData[processedData.length - 1])
        console.log(`   Total: ${data.total ? formatMoney(data.total) : 'N/A'}`)
        console.log(`   Long: ${data.long ? formatMoney(data.long) : 'N/A'}`)
        console.log(`   Short: ${data.short ? formatMoney(data.short) : 'N/A'}`)
        console.log(`   liquidationData.value установлен, длина:`, liquidationData.value.length)
      } catch (error) {
        console.error('❌ Ошибка при загрузке данных о ликвидациях:', error)
        console.error('Детали ошибки:', error.response?.data || error.message)
        console.error('Stack trace:', error.stack)
        liquidationData.value = []
      }
    }

    // Методы
    const formatMoney = (value) => {
      if (value === null || value === undefined || isNaN(value)) {
        return '0 $';
      }
      
      // Для очень маленьких значений (меньше 0.01) показываем больше знаков
      if (value > 0 && value < 0.01) {
        return `${value.toFixed(6)} $`;
      }
      
      // Для значений меньше 1 показываем 2 знака после запятой
      if (value < 1) {
        return `${value.toFixed(2)} $`;
      }
      
      // Для больших значений форматируем с пробелами для тысяч
      const formatted = new Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
        useGrouping: true
      }).format(value);
      
      return `${formatted} $`;
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // Загрузка топ монет с API
    const fetchTopCoins = async () => {
      try {
        const response = await api.get('/crypto/top-coins?limit=20');
        console.log('API Response:', response.data); // Для отладки
        
        if (!response.data || !Array.isArray(response.data)) {
          console.error('Некорректный формат данных от API');
          return;
        }

        topCoins.value = response.data.map(coin => {
          // Обрабатываем возможные null/undefined значения
          const price = coin.current_price ?? 0;
          const change = coin.price_change_percentage_24h ?? 0;
          const volume = coin.total_volume ?? 0;
          const marketCap = coin.market_cap ?? 0;
          
          return {
            name: coin.name || 'Unknown',
            symbol: (coin.symbol || '').toUpperCase(),
            icon: coin.image || `https://assets.coingecko.com/coins/images/${coin.id}/large/${coin.symbol}.png`,
            price: Number(price),
            change: Number(change),
            volume24h: Number(volume),
            marketCap: Number(marketCap)
          };
        }).filter(coin => coin.price > 0); // Фильтруем монеты с нулевой ценой
      } catch (error) {
        console.error('Ошибка при загрузке топ монет:', error);
        console.error('Error details:', error.response?.data || error.message);
        topCoins.value = [];
      }
    };

    // Загрузка BTC доминирования
    const fetchBTCDominance = async () => {
      try {
        const response = await api.get('/crypto/btc-dominance');
        const newDominance = response.data.dominance || 42.5;
        
        // Используем изменение из API, если доступно
        if (response.data.change24h !== undefined && response.data.change24h !== null) {
          btcDominanceChange.value = response.data.change24h;
        } else {
          // Вычисляем изменение, если было предыдущее значение
          if (btcDominance.value !== null && btcDominance.value !== 42.5) {
            btcDominanceChange.value = newDominance - btcDominance.value;
          }
        }
        
        btcDominance.value = newDominance;
      } catch (error) {
        console.error('Ошибка при загрузке BTC доминирования:', error);
        btcDominance.value = 0;
        btcDominanceChange.value = null;
      }
    };


    // Новые данные для дополнительных функций
    const selectedCoinSymbol = computed(() => selectedPair.value.split('/')[0])
    const trustIndex = ref(null)
    const anomalies = ref([])
    const whaleTransactions = ref([])
    const marketHeatmap = ref([])
    const tokenomics = ref(null)
    const priceForecast = ref(null)
    const scamCheck = ref(null)
    const news = ref([])
    const investorCases = ref([])
    const socialHype = ref(null)
    const isLoadingSocial = ref(false)
    const isSocialDataReal = ref(false) // Флаг, показывающий, реальные ли данные

    // Загрузка on-chain метрик
    const fetchOnChainMetrics = async () => {
      const symbol = selectedCoinSymbol.value
      if (!symbol) return

      try {
        const response = await api.get(`/crypto/on-chain/${symbol}`)
        if (Array.isArray(response.data) && response.data.length > 0) {
          onChainMetrics.value = response.data
        } else {
          onChainMetrics.value = []
        }
      } catch (error) {
        console.error('Ошибка при загрузке on-chain метрик:', error)
        onChainMetrics.value = []
      }
    }

    // Загрузка данных для выбранной монеты
    const fetchCoinData = async () => {
      const symbol = selectedCoinSymbol.value
      if (!symbol) return

      isLoadingSocial.value = true
      
      try {
        console.log(`[${new Date().toLocaleTimeString()}] Загрузка данных для монеты: ${symbol}`)
        
        const [
          trustData,
          forecastData,
          scamData,
          newsData,
          casesData,
          tokenomicsData,
          socialData
        ] = await Promise.all([
          api.get(`/crypto/trust-index/${symbol}`).catch((err) => {
            console.warn(`Ошибка загрузки trust-index для ${symbol}:`, err)
            return { data: null }
          }),
          api.get(`/crypto/forecast/${symbol}`).catch((err) => {
            console.warn(`Ошибка загрузки forecast для ${symbol}:`, err)
            return { data: null }
          }),
          api.get(`/crypto/scam-check/${symbol}`).catch((err) => {
            console.warn(`Ошибка загрузки scam-check для ${symbol}:`, err)
            return { data: null }
          }),
          api.get(`/crypto/news/${symbol}?limit=5`).catch((err) => {
            console.warn(`Ошибка загрузки news для ${symbol}:`, err)
            return { data: [] }
          }),
          api.get(`/crypto/investor-cases/${symbol}`).catch((err) => {
            console.warn(`Ошибка загрузки investor-cases для ${symbol}:`, err)
            return { data: [] }
          }),
          api.get(`/crypto/tokenomics/${symbol.toLowerCase() === 'btc' ? 'bitcoin' : symbol.toLowerCase() === 'eth' ? 'ethereum' : symbol.toLowerCase()}`).catch((err) => {
            console.warn(`Ошибка загрузки tokenomics для ${symbol}:`, err)
            return { data: null }
          }),
          api.get(`/crypto/social-metrics?symbols=${symbol.toUpperCase()}`).catch((err) => {
            console.warn(`Ошибка загрузки social-metrics для ${symbol}:`, err)
            return { data: [] }
          })
        ])

        trustIndex.value = trustData.data
        priceForecast.value = forecastData.data
        scamCheck.value = scamData.data
        news.value = Array.isArray(newsData.data) ? newsData.data : []
        investorCases.value = Array.isArray(casesData.data) ? casesData.data : []
        tokenomics.value = tokenomicsData.data
        
        // Обработка социальных метрик
        if (Array.isArray(socialData.data) && socialData.data.length > 0) {
          const socialMetric = socialData.data.find(s => 
            s.symbol && s.symbol.toUpperCase() === symbol.toUpperCase()
          ) || socialData.data[0]
          
          // Проверяем, реальные ли это данные (не моковые)
          // Моковые данные имеют фиксированные значения, реальные - разные
          const isReal = !(
            socialMetric.galaxy_score === 75 && 
            socialMetric.social_volume === 150000 && 
            socialMetric.social_score === 80 && 
            socialMetric.social_contributors === 5000 && 
            socialMetric.social_influence === 85
          )
          
          isSocialDataReal.value = isReal
          
          if (isReal) {
            console.log(`✅ Загружены РЕАЛЬНЫЕ социальные метрики для ${symbol} из LunarCrush API:`, {
              galaxy_score: socialMetric.galaxy_score,
              social_volume: socialMetric.social_volume,
              social_score: socialMetric.social_score,
              social_contributors: socialMetric.social_contributors,
              social_influence: socialMetric.social_influence
            })
          } else {
            console.warn(`⚠️ Используются МОКОВЫЕ данные для ${symbol}. Проверьте настройку LUNARCRUSH_API_KEY в backend/.env`)
          }
          
          socialHype.value = socialMetric
        } else {
          console.warn(`⚠️ Социальные метрики не найдены для ${symbol}`)
          isSocialDataReal.value = false
          socialHype.value = null
        }
      } catch (error) {
        console.error('❌ Критическая ошибка при загрузке данных монеты:', error)
        socialHype.value = null
      } finally {
        isLoadingSocial.value = false
      }
    }

    // Загрузка аномалий и китов
    const fetchAnomalies = async () => {
      try {
        const response = await api.get('/crypto/anomalies?limit=10')
        anomalies.value = Array.isArray(response.data) ? response.data : []
      } catch (error) {
        console.error('Ошибка при загрузке аномалий:', error)
        anomalies.value = []
      }
    }

    const fetchWhaleTransactions = async () => {
      try {
        const response = await api.get('/crypto/whales?minAmount=10000000')
        whaleTransactions.value = Array.isArray(response.data) ? response.data : []
      } catch (error) {
        console.error('Ошибка при загрузке транзакций китов:', error)
        whaleTransactions.value = []
      }
    }

    const fetchMarketHeatmap = async () => {
      try {
        const response = await api.get('/crypto/heatmap?limit=100')
        marketHeatmap.value = Array.isArray(response.data) ? response.data : []
      } catch (error) {
        console.error('Ошибка при загрузке тепловой карты:', error)
        marketHeatmap.value = []
      }
    }

    // Сортированная тепловая карта (по изменению цены)
    const sortedHeatmap = computed(() => {
      return [...marketHeatmap.value].sort((a, b) => {
        return b.price_change_percentage_24h - a.price_change_percentage_24h
      })
    })

    // Получить класс для элемента тепловой карты
    const getHeatmapClass = (change) => {
      if (change > 5) return 'positive-strong'
      if (change > 1) return 'positive-medium'
      if (change < -5) return 'negative-strong'
      if (change < -1) return 'negative-medium'
      return 'neutral'
    }

    // Получить стиль для элемента тепловой карты
    const getHeatmapStyle = (change) => {
      const absChange = Math.abs(change)
      let opacity = 0.3
      let backgroundColor = ''

      if (change > 5) {
        opacity = Math.min(1, 0.3 + (absChange - 5) / 20)
        backgroundColor = 'rgba(40, 167, 69, 0.8)'
      } else if (change > 1) {
        opacity = 0.3 + (absChange - 1) / 10
        backgroundColor = 'rgba(40, 167, 69, 0.6)'
      } else if (change < -5) {
        opacity = Math.min(1, 0.3 + (absChange - 5) / 20)
        backgroundColor = 'rgba(220, 53, 69, 0.8)'
      } else if (change < -1) {
        opacity = 0.3 + (absChange - 1) / 10
        backgroundColor = 'rgba(220, 53, 69, 0.6)'
      } else {
        opacity = 0.2
        backgroundColor = 'rgba(108, 117, 125, 0.3)'
      }

      return {
        backgroundColor,
        opacity
      }
    }

    // Загрузка торговых сигналов
    const fetchTradingSignals = async () => {
      const symbol = selectedCoinSymbol.value
      if (!symbol) {
        tradingSignals.value = []
        return
      }

      try {
        console.log(`📊 Загрузка торговых сигналов для ${symbol}`)
        const response = await api.get(`/crypto/trading-signals?symbol=${symbol}`)
        console.log('📥 Полный ответ API торговых сигналов:', response.data)
        
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          tradingSignals.value = response.data.map((signal) => ({
            id: signal.id,
            type: signal.type || 'HOLD',
            pair: signal.pair || `${symbol}/USDT`,
            price: parseFloat(signal.price) || 0,
            time: signal.time || new Date().toISOString(),
            strength: signal.strength || 'Medium'
          }))
          console.log(`✅ Загружено ${tradingSignals.value.length} торговых сигналов для ${symbol}`)
          console.log('📊 Сигналы:', tradingSignals.value)
        } else {
          console.warn('⚠️ Пустой массив сигналов или некорректный формат данных')
          tradingSignals.value = []
        }
      } catch (error) {
        console.error('❌ Ошибка при загрузке торговых сигналов:', error)
        console.error('Детали ошибки:', error.response?.data || error.message)
        tradingSignals.value = []
      }
    }

    // Загрузка funding rates
    const fetchFundingRates = async () => {
      const symbol = selectedCoinSymbol.value
      if (!symbol) {
        fundingRates.value = []
        return
      }

      try {
        console.log(`📊 Загрузка funding rates для ${symbol}`)
        const response = await api.get(`/crypto/funding-rates?symbol=${symbol}`)
        
        if (response.data && Array.isArray(response.data)) {
          fundingRates.value = response.data.map(rate => ({
            exchange: rate.exchange,
            value: parseFloat(rate.value) || 0
          }))
          console.log(`✅ Загружено ${response.data.length} funding rates для ${symbol}`)
        } else {
          fundingRates.value = []
        }
      } catch (error) {
        console.error('❌ Ошибка при загрузке funding rates:', error)
        fundingRates.value = []
      }
    }

    // Загрузка открытого интереса
    const fetchOpenInterest = async () => {
      const symbol = selectedCoinSymbol.value
      if (!symbol) {
        openInterest.value = 0
        return
      }

      try {
        console.log(`📊 Загрузка открытого интереса для ${symbol}`)
        const response = await api.get(`/crypto/open-interest?symbol=${symbol}`)
        
        if (response.data && response.data.openInterest !== undefined) {
          openInterest.value = parseFloat(response.data.openInterest) || 0
          console.log(`✅ Загружен открытый интерес для ${symbol}: ${openInterest.value}`)
        } else {
          openInterest.value = 0
        }
      } catch (error) {
        console.error('❌ Ошибка при загрузке открытого интереса:', error)
        openInterest.value = 0
      }
    }

    // Обновляем аналитические блоки при смене торговой пары
    watch(selectedPair, () => {
      fetchCoinData();
      fetchOnChainMetrics();
      fetchLiquidations();
      fetchTradingSignals();
      fetchFundingRates();
      fetchOpenInterest();
    });

    onMounted(async () => {
      // Загружаем начальные данные
      await Promise.all([
        fetchTopCoins(),
        fetchBTCDominance(),
        fetchAnomalies(),
        fetchWhaleTransactions(),
        fetchMarketHeatmap(),
        fetchCoinData(),
        fetchOnChainMetrics(),
        fetchLiquidations(),
        fetchTradingSignals(),
        fetchFundingRates(),
        fetchOpenInterest()
      ]);
      
      // Обновляем данные каждую минуту
      setInterval(async () => {
        await Promise.all([
          fetchTopCoins(),
          fetchBTCDominance(),
          fetchAnomalies(),
          fetchWhaleTransactions(),
          fetchMarketHeatmap()
        ]);
        await fetchCoinData();
        await fetchOnChainMetrics();
        await fetchLiquidations();
        await fetchTradingSignals();
        await fetchFundingRates();
        await fetchOpenInterest();
      }, 60000);
    })

    const getForecastDirectionLabel = (direction) => {
      if (direction === 'up') return 'Рост';
      if (direction === 'down') return 'Падение';
      return 'Боковое движение';
    };

    const getForecastDirectionDescription = (direction) => {
      if (direction === 'up') return 'Модель ожидает восходящее движение с повышенной активностью покупателей.';
      if (direction === 'down') return 'Прогноз указывает на снижение цены и доминирование продавцов.';
      return 'Вероятно консолидация в текущем диапазоне, без выраженного тренда.';
    };

    const getForecastDirectionIcon = (direction) => {
      if (direction === 'up') return '↑';
      if (direction === 'down') return '↓';
      return '→';
    };

    const getConfidenceClass = (confidence) => {
      if (confidence >= 75) return 'high';
      if (confidence >= 50) return 'medium';
      return 'low';
    };

    const getConfidenceLabel = (confidence) => {
      if (confidence >= 75) return 'Высокая уверенность';
      if (confidence >= 50) return 'Умеренная уверенность';
      return 'Низкая уверенность';
    };

    const getConfidenceColor = (confidence) => {
      if (confidence >= 75) return '#28a745';
      if (confidence >= 50) return '#ffc107';
      return '#dc3545';
    };

    const getConfidenceStyle = (confidence) => {
      const normalized = Math.max(0, Math.min(100, Number(confidence) || 0));
      const degrees = (normalized / 100) * 360;
      const color = getConfidenceColor(normalized);
      return {
        background: `conic-gradient(${color} ${degrees}deg, #eef1ff ${degrees}deg)`
      };
    };

    const getRiskLevelClass = (score) => {
      if (score < 30) return 'low';
      if (score < 70) return 'medium';
      return 'high';
    };

    const getRiskLevelLabel = (score) => {
      if (score < 30) return 'Низкий риск';
      if (score < 70) return 'Умеренный риск';
      return 'Высокий риск';
    };

    const getRiskLevelDescription = (score) => {
      if (score < 30) return 'Проверки не выявили критичных угроз. Продолжайте мониторинг при изменении условий.';
      if (score < 70) return 'Обнаружены потенциальные риски. Рекомендуется ручная проверка и осторожность.';
      return 'Высокий уровень риска. Необходимо избегать транзакций до устранения уязвимостей.';
    };

    const getRiskRingStyle = (score) => {
      const normalized = Math.max(0, Math.min(100, Number(score) || 0));
      const degrees = (normalized / 100) * 360;
      const color = normalized < 30 ? '#28a745' : normalized < 70 ? '#ffc107' : '#dc3545';
      return {
        background: `conic-gradient(${color} ${degrees}deg, rgba(0,0,0,0.05) ${degrees}deg)`
      };
    };

    const formatCompactUSD = (value) => {
      const num = Number(value) || 0;
      if (num >= 1e9) return `${(num / 1e9).toFixed(2)} млрд $`;
      if (num >= 1e6) return `${(num / 1e6).toFixed(2)} млн $`;
      if (num >= 1e3) return `${(num / 1e3).toFixed(2)} тыс. $`;
      return `${num.toFixed(2)} $`;
    };

    const getWhaleSummary = (items) => {
      if (!items || items.length === 0) return '0 $';
      const total = items.slice(0, 5).reduce((sum, item) => sum + (item.amount_usd || 0), 0);
      return formatCompactUSD(total);
    };

    const getWhaleTypeLabel = (type) => {
      if (type === 'transfer') return 'Перевод';
      if (type === 'exchange') return 'Обмен';
      return 'Сделка';
    };

    const getWhaleTypeIcon = (type) => {
      if (type === 'transfer') return '⇄';
      if (type === 'exchange') return '⟳';
      return '⚡';
    };

    const getWhaleTypeClass = (type) => {
      if (type === 'transfer') return 'transfer';
      if (type === 'exchange') return 'exchange';
      return 'other';
    };

    const getSentimentClass = (sentiment) => {
      if (sentiment === 'positive') return 'positive';
      if (sentiment === 'negative') return 'negative';
      return 'neutral';
    };

    const getSentimentIcon = (sentiment) => {
      if (sentiment === 'positive') return '✓';
      if (sentiment === 'negative') return '✗';
      return '○';
    };

    const getSentimentLabel = (sentiment) => {
      if (sentiment === 'positive') return 'Позитив';
      if (sentiment === 'negative') return 'Негатив';
      return 'Нейтрально';
    };

    const getSentimentSummaryClass = (items) => {
      if (!items || items.length === 0) return 'neutral';
      const positives = items.filter(i => i.sentiment === 'positive').length;
      const negatives = items.filter(i => i.sentiment === 'negative').length;
      if (positives > negatives) return 'positive';
      if (negatives > positives) return 'negative';
      return 'neutral';
    };

    const getSentimentSummaryLabel = (items) => {
      if (!items || items.length === 0) return 'Нет данных';
      const positives = items.filter(i => i.sentiment === 'positive').length;
      const negatives = items.filter(i => i.sentiment === 'negative').length;
      if (positives > negatives) return 'Преобладает позитив';
      if (negatives > positives) return 'Преобладает негатив';
      return 'Смешанный фон';
    };

    const formatAnomalyChange = (value) => {
      if (value === null || value === undefined) return '0%';
      const sign = value >= 0 ? '+' : '';
      return `${sign}${Number(value).toFixed(2)}%`;
    };

    const getAnomalyTypeLabel = (type) => {
      const labels = {
        price_spike: 'Скачок цены',
        volume_surge: 'Всплеск объема',
        social_spike: 'Социальный всплеск',
      };
      return labels[type] || 'Аномалия';
    };

    const getAnomalyTypeIcon = (type) => {
      const icons = {
        price_spike: '📈',
        volume_surge: '📊',
        social_spike: '💬',
      };
      return icons[type] || '⚠️';
    };

    const getAnomalySeverityClass = (change) => {
      const absChange = Math.abs(change || 0);
      if (absChange >= 15) return 'severity-high';
      if (absChange >= 8) return 'severity-medium';
      return 'severity-low';
    };

    return {
      selectedPair,
      btcDominance,
      btcDominanceChange,
      topCoins,
      tradingPairs,
      onChainMetrics,
      liquidationData,
      tradingSignals,
      fundingRates,
      openInterest,
      formatMoney,
      formatDate,
      // Новые данные
      trustIndex,
      anomalies,
      whaleTransactions,
      marketHeatmap,
      tokenomics,
      priceForecast,
      scamCheck,
      news,
      investorCases,
      socialHype,
      isLoadingSocial,
      isSocialDataReal,
      selectedCoinSymbol,
      getCheckLabel,
      getStrategyLabel,
      sortedHeatmap,
      getHeatmapClass,
      getHeatmapStyle,
      getForecastDirectionLabel,
      getForecastDirectionDescription,
      getForecastDirectionIcon,
      getConfidenceClass,
      getConfidenceLabel,
      getConfidenceStyle,
      getRiskLevelClass,
      getRiskLevelLabel,
      getRiskLevelDescription,
      getRiskRingStyle,
      getWhaleSummary,
      getWhaleTypeLabel,
      getWhaleTypeIcon,
      getWhaleTypeClass,
      getSentimentClass,
      getSentimentIcon,
      getSentimentLabel,
      getSentimentSummaryClass,
      getSentimentSummaryLabel,
      formatAnomalyChange,
      getAnomalyTypeLabel,
      getAnomalyTypeIcon,
      getAnomalySeverityClass,
      formatTokenAmount: (amount) => {
        if (!amount || amount === 0) return '0'
        if (amount >= 1e12) return (amount / 1e12).toFixed(2) + 'T'
        if (amount >= 1e9) return (amount / 1e9).toFixed(2) + 'B'
        if (amount >= 1e6) return (amount / 1e6).toFixed(2) + 'M'
        if (amount >= 1e3) return (amount / 1e3).toFixed(2) + 'K'
        return amount.toLocaleString('ru-RU', { maximumFractionDigits: 2, minimumFractionDigits: 0 })
      },
      getTrustScoreClass: (score) => {
        if (score >= 80) return 'excellent'
        if (score >= 60) return 'good'
        if (score >= 40) return 'moderate'
        return 'low'
      },
      getTrustScoreColor: (score) => {
        if (score >= 80) return '#28a745'
        if (score >= 60) return '#20c997'
        if (score >= 40) return '#ffc107'
        return '#dc3545'
      },
      getTrustScoreStatus: (score) => {
        if (score >= 80) return 'Отличный'
        if (score >= 60) return 'Хороший'
        if (score >= 40) return 'Умеренный'
        return 'Низкий'
      },
      getFactorIcon: (key) => {
        const icons = {
          volatility: '📊',
          volume: '💹',
          social: '👥',
          news: '📰'
        }
        return icons[key] || '📈'
      },
      getFactorLabel: (key) => {
        const labels = {
          volatility: 'Волатильность',
          volume: 'Объем торгов',
          social: 'Социальная активность',
          news: 'Новости'
        }
        return labels[key] || key
      },
      getFactorColorClass: (key, value) => {
        if (key === 'volatility') {
          // Для волатильности: чем выше, тем лучше (меньше волатильность = больше доверия)
          return value >= 80 ? 'excellent' : value >= 60 ? 'good' : value >= 40 ? 'moderate' : 'low'
        }
        // Для остальных: чем выше, тем лучше
        return value >= 80 ? 'excellent' : value >= 60 ? 'good' : value >= 40 ? 'moderate' : 'low'
      },
      getFactorDescription: (key, value) => {
        if (key === 'volatility') {
          if (value >= 80) return 'Низкая волатильность'
          if (value >= 60) return 'Умеренная волатильность'
          if (value >= 40) return 'Повышенная волатильность'
          return 'Высокая волатильность'
        }
        if (key === 'volume') {
          if (value >= 80) return 'Очень высокий объем'
          if (value >= 60) return 'Высокий объем'
          if (value >= 40) return 'Средний объем'
          return 'Низкий объем'
        }
        if (key === 'social') {
          if (value >= 80) return 'Очень активное обсуждение'
          if (value >= 60) return 'Активное обсуждение'
          if (value >= 40) return 'Умеренное обсуждение'
          return 'Слабое обсуждение'
        }
        if (key === 'news') {
          if (value >= 80) return 'Много позитивных новостей'
          if (value >= 60) return 'Позитивные новости'
          if (value >= 40) return 'Нейтральные новости'
          return 'Мало новостей'
        }
        return ''
      },
      formatSocialNumber: (num) => {
        if (!num || num === 0) return '0'
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B'
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
        if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K'
        return num.toLocaleString('ru-RU')
      },
      getGalaxyScoreClass: (score) => {
        if (score >= 80) return 'excellent'
        if (score >= 60) return 'good'
        if (score >= 40) return 'moderate'
        return 'low'
      },
      getGalaxyScoreColor: (score) => {
        if (score >= 80) return '#667eea'
        if (score >= 60) return '#764ba2'
        if (score >= 40) return '#f093fb'
        return '#f5576c'
      },
      getGalaxyScoreStatus: (score) => {
        if (score >= 80) return 'Очень высокий'
        if (score >= 60) return 'Высокий'
        if (score >= 40) return 'Умеренный'
        return 'Низкий'
      },
      getStrategyIcon: (strategy) => {
        const icons = {
          long_term: '🏛',
          swing: '📊',
          high_risk: '⚡'
        }
        return icons[strategy] || '📈'
      },
      getStrategyTone: (strategy) => {
        const tones = {
          long_term: 'Консервативная',
          swing: 'Сбалансированная',
          high_risk: 'Агрессивная'
        }
        return tones[strategy] || 'Смешанная'
      },
      getCirculatingPercent: () => {
        if (!tokenomics.value) return 0
        const max = tokenomics.value.max_supply || tokenomics.value.total_supply
        if (!max || max === 0) return 100
        return Number(((tokenomics.value.circulating_supply / max) * 100).toFixed(2))
      },
      getLockedPercent: () => {
        if (!tokenomics.value || !tokenomics.value.max_supply) return 0
        const max = tokenomics.value.max_supply
        const circulating = tokenomics.value.circulating_supply
        const total = tokenomics.value.total_supply || circulating
        if (max === 0) return 0
        return Number((((max - total) / max) * 100).toFixed(2))
      },
      getOnChainIcon: (name) => {
        const icons = {
          'Приток на биржи': '🏦',
          'Активные адреса': '👤',
          'Газ (Gwei)': '⛽'
        }
        return icons[name] || '📊'
      },
      getOnChainDescription: (name, change) => {
        if (name === 'Приток на биржи') {
          return change > 0 
            ? 'Увеличение притока на биржи может указывать на продажи'
            : 'Снижение притока - хороший знак для цены'
        }
        if (name === 'Активные адреса') {
          return change > 0
            ? 'Рост активности сети - положительный сигнал'
            : 'Снижение активности может указывать на слабый интерес'
        }
        if (name === 'Газ (Gwei)') {
          return change > 0
            ? 'Высокая загрузка сети - много транзакций'
            : 'Низкая загрузка - сеть менее загружена'
        }
        return ''
      }
    }
  }
}

// Вспомогательные функции
function getCheckLabel(key) {
  const labels = {
    contract_verified: 'Контракт верифицирован',
    liquidity_locked: 'Ликвидность заблокирована',
    renounced_ownership: 'Владелец отказался',
    honeypot: 'Honeypot проверка',
    team_verified: 'Команда верифицирована'
  }
  return labels[key] || key
}

function getStrategyLabel(strategy) {
  const labels = {
    long_term: 'Долгосрок',
    swing: 'Свинг-трейдинг',
    high_risk: 'Высокий риск'
  }
  return labels[strategy] || strategy
}
</script>

<style scoped>
/* Base */
.crypto-tracker {
  padding: 1rem;
  min-height: 100vh;
  background: #f1f5f9;
}

/* Blue Header */
.page-header-blue {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  border-radius: 16px;
  margin-bottom: 1rem;
  color: #fff;
  box-shadow: 0 8px 30px rgba(37,99,235,0.2);
}
.page-header-blue .header-left { flex: 1; display: flex; flex-direction: column; align-items: flex-start; gap: 0.5rem; }
.page-header-blue .header-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.8rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
}
.page-header-blue .header-title { font-size: 1.75rem; font-weight: 700; margin: 0 0 0.5rem; }
.page-header-blue .header-subtitle { font-size: 0.95rem; opacity: 0.85; margin: 0; color: #fff !important; }
.page-header-blue .header-stats { display: flex; gap: 0.875rem; flex-shrink: 0; }
.page-header-blue .stat-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}
.page-header-blue .stat-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.page-header-blue .stat-content { display: flex; flex-direction: column; }
.page-header-blue .stat-number { font-size: 1.25rem; font-weight: 700; line-height: 1; color: #fff !important; }
.page-header-blue .stat-label { font-size: 0.75rem; opacity: 0.85; margin-top: 0.15rem; color: #fff !important; text-transform: none !important; letter-spacing: normal !important; }

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #f7931a, #ffa726);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  box-shadow: 0 8px 32px rgba(247, 147, 26, 0.3);
}

.page-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.header-subtitle {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0.25rem 0 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.pair-selector {
  min-width: 160px;
}

/* Row Layout */
.row {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.row-2-equal {
  grid-template-columns: 1fr 1fr;
}

.row-3 {
  grid-template-columns: repeat(3, 1fr);
}

.row-full {
  grid-template-columns: 1fr;
}

/* Cards */
.analytics-card {
  background: #FFFFFF;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.analytics-card:hover {
  box-shadow: 0 4px 12px rgba(247, 147, 26, 0.08);
  border-color: #f7931a;
}

.analytics-card h2 {
  margin: 0 0 0.75rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.analytics-card h2::before {
  content: '';
  width: 3px;
  height: 14px;
  background: #f7931a;
  border-radius: 2px;
}

/* Market Grid */
.market-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 0.75rem;
}

.coin-card {
  background: #f8fafc;
  border-radius: 10px;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.coin-card:hover {
  border-color: #f7931a;
}

.coin-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
}

.coin-icon {
  width: 28px;
  height: 28px;
  margin-right: 0.75rem;
}

.coin-info {
  flex: 1;
}

.coin-info h3 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
}

.symbol {
  color: #64748b;
  font-size: 0.75rem;
}

.coin-price {
  text-align: right;
}

.current-price {
  font-weight: 700;
  font-size: 1rem;
}

.price-change {
  font-size: 0.75rem;
}

.positive { color: #10b981; }
.negative { color: #ef4444; }

.coin-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e2e8f0;
}

.stat {
  display: flex;
  flex-direction: column;
}

.label {
  color: #64748b;
  font-size: 0.65rem;
  margin-bottom: 0.15rem;
}

/* Dominance */
.dominance-content {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 1.5rem;
  align-items: center;
}

.dominance-main {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dominance-value {
  font-size: 2rem;
  font-weight: 700;
  color: #f7931a;
  line-height: 1;
}

.dominance-change {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 0.9rem;
  font-weight: 600;
  margin-top: 0.25rem;
}

.dominance-change.positive { color: #10b981; }
.dominance-change.negative { color: #ef4444; }

.change-label {
  font-size: 0.65rem;
  font-weight: 400;
  opacity: 0.7;
}

.dominance-progress {
  flex: 1;
}

.progress-bar {
  width: 100%;
  height: 16px;
  background: #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 0.35rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f7931a, #ffa726);
  border-radius: 8px;
  transition: width 0.5s ease;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.65rem;
  color: #64748b;
}

.dominance-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  text-align: right;
}

.info-label {
  font-size: 0.7rem;
  color: #64748b;
}

.info-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
}

.forecast-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: linear-gradient(135deg, rgba(248,249,252,1) 0%, #fff 80%);
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid rgba(0,0,0,0.05);
  position: relative;
  overflow: hidden;
}

.forecast-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 16px;
  pointer-events: none;
  opacity: 0.15;
}

.forecast-card.up::after { background: radial-gradient(circle at top right, #28a745, transparent 55%); }
.forecast-card.down::after { background: radial-gradient(circle at top right, #dc3545, transparent 55%); }
.forecast-card.neutral::after { background: radial-gradient(circle at top right, #8892f6, transparent 55%); }

.forecast-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.forecast-label {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.forecast-timeframe {
  display: inline-block;
  margin-top: 0.4rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.forecast-direction-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.95rem;
  background: rgba(0,0,0,0.05);
}

.forecast-direction-chip.up { color: #1f7a31; background: rgba(40,167,69,0.15); }
.forecast-direction-chip.down { color: #a71d2a; background: rgba(220,53,69,0.15); }
.forecast-direction-chip.neutral { color: #3f51b5; background: rgba(63,81,181,0.15); }

.chip-icon {
  font-size: 1.1rem;
}

.forecast-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 1rem;
}

.forecast-panel {
  background: rgba(255,255,255,0.6);
  border-radius: 14px;
  padding: 1.2rem;
  border: 1px solid rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.forecast-panel.trend {
  background: rgba(255,255,255,0.85);
}

.trend-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  background: rgba(0,0,0,0.05);
}

.trend-info {
  flex: 1;
}

.trend-label {
  font-weight: 700;
  font-size: 1rem;
}

.trend-description {
  margin: 0.3rem 0 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.forecast-panel.confidence {
  flex-direction: column;
  text-align: center;
}

.confidence-ring {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: conic-gradient(#28a745 0deg, #eef1ff 0deg);
  position: relative;
}

.confidence-ring span {
  position: absolute;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.4rem;
}

.confidence-meta {
  margin-top: 0.75rem;
}

.confidence-title {
  display: block;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.confidence-status {
  font-weight: 600;
  font-size: 0.95rem;
}

.confidence-status.high { color: #28a745; }
.confidence-status.medium { color: #ffc107; }
.confidence-status.low { color: #dc3545; }

.forecast-panel.target {
  flex-direction: column;
  align-items: flex-start;
}

.target-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.target-value {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0.25rem 0;
}

.target-hint {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.forecast-factors {
  background: rgba(255,255,255,0.75);
  border-radius: 14px;
  padding: 1rem 1.25rem;
  border: 1px dashed rgba(0,0,0,0.08);
}

.factors-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.factor-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.factor-chip {
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  background: #eef1ff;
  font-size: 0.85rem;
  color: #3f51b5;
  font-weight: 500;
}

.scam-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid rgba(0,0,0,0.05);
  background: #fff;
  position: relative;
  overflow: hidden;
}

.scam-card.low::before,
.scam-card.medium::before,
.scam-card.high::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.12;
  pointer-events: none;
}

.scam-card.low::before { background: radial-gradient(circle at top right, #28a745, transparent 60%); }
.scam-card.medium::before { background: radial-gradient(circle at top right, #ffc107, transparent 60%); }
.scam-card.high::before { background: radial-gradient(circle at top right, #dc3545, transparent 60%); }

.scam-card-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

.scam-label {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.scam-meta {
  display: inline-block;
  margin-top: 0.35rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.risk-chip {
  align-self: flex-start;
  padding: 0.45rem 1rem;
  border-radius: 999px;
  font-weight: 600;
}

.risk-chip.low { color: #1f7a31; background: rgba(40,167,69,0.15); }
.risk-chip.medium { color: #a07903; background: rgba(255,193,7,0.2); }
.risk-chip.high { color: #a71d2a; background: rgba(220,53,69,0.2); }

.scam-layout {
  display: grid;
  grid-template-columns: minmax(200px, 260px) 1fr;
  gap: 1.5rem;
  position: relative;
  z-index: 1;
}

.risk-panel {
  background: rgba(255,255,255,0.8);
  border-radius: 16px;
  border: 1px solid rgba(0,0,0,0.05);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.risk-gauge {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: conic-gradient(#28a745 0deg, rgba(0,0,0,0.05) 0deg);
  position: relative;
}

.risk-gauge span {
  position: absolute;
  width: 105px;
  height: 105px;
  background: white;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 2rem;
}

.risk-gauge span small {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.risk-description {
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.checks-panel {
  background: rgba(255,255,255,0.85);
  border-radius: 16px;
  border: 1px solid rgba(0,0,0,0.05);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.check-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.check-tile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 12px;
  background: rgba(0,0,0,0.03);
}

.check-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
}

.check-icon.ok {
  background: rgba(40,167,69,0.15);
  color: #1f7a31;
}

.check-icon.fail {
  background: rgba(220,53,69,0.15);
  color: #a71d2a;
}

.check-info {
  display: flex;
  flex-direction: column;
}

.check-title {
  font-weight: 600;
  font-size: 0.95rem;
}

.check-status-text {
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.check-status-text.ok { color: #28a745; }
.check-status-text.fail { color: #dc3545; }

.warnings-label {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
}

.warnings-list {
  margin: 0.5rem 0 0;
  padding-left: 1.1rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.warnings-empty {
  font-size: 0.9rem;
  color: #1f7a31;
  background: rgba(40,167,69,0.08);
  border-radius: 10px;
  padding: 0.75rem 1rem;
}

.metrics-list {
  display: grid;
  gap: 1rem;
}

.case-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  gap: 1rem;
}

.case-label {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.case-meta {
  display: inline-block;
  margin-top: 0.35rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.investor-cases-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.25rem;
}

.investor-case-card {
  border-radius: 18px;
  padding: 1.25rem;
  border: 1px solid rgba(0,0,0,0.05);
  background: linear-gradient(135deg, #ffffff 0%, #f9fbff 100%);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.case-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.case-strategy-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.9rem;
}

.case-strategy-chip .chip-icon {
  font-size: 1rem;
}

.case-strategy-chip.long_term {
  background: rgba(40,167,69,0.12);
  color: #1f7a31;
}

.case-strategy-chip.swing {
  background: rgba(0,123,255,0.12);
  color: #0c63ce;
}

.case-strategy-chip.high_risk {
  background: rgba(220,53,69,0.12);
  color: #a71d2a;
}

.case-timeframe {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 600;
}

.case-core {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 0.75rem;
}

.case-price-block {
  border-radius: 12px;
  padding: 0.75rem;
  background: rgba(0,0,0,0.03);
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.case-price-block.entry {
  background: rgba(13,110,253,0.08);
}

.case-price-block.target {
  background: rgba(40,167,69,0.12);
}

.case-price-block.stop {
  background: rgba(220,53,69,0.12);
}

.case-price-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
}

.case-price-value {
  font-weight: 700;
  font-size: 1.1rem;
}

.case-metrics {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.case-metric-item {
  flex: 1;
  min-width: 140px;
  background: rgba(255,255,255,0.6);
  border-radius: 12px;
  padding: 0.75rem 0.9rem;
  border: 1px solid rgba(0,0,0,0.04);
}

.case-metric-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
}

.case-metric-value {
  display: block;
  margin-top: 0.35rem;
  font-size: 1.1rem;
  font-weight: 700;
}

.case-reason {
  background: rgba(0,0,0,0.03);
  border-radius: 12px;
  padding: 0.9rem 1rem;
}

.reason-title {
  font-size: 0.8rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.case-reason p {
  margin: 0.35rem 0 0;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.anomaly-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.anomaly-label {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.anomaly-meta {
  display: inline-block;
  margin-top: 0.35rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.anomaly-summary-chip {
  align-self: flex-start;
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  background: rgba(63,81,181,0.12);
  color: #3f51b5;
  font-weight: 600;
}

.anomaly-stream {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.anomaly-row {
  display: grid;
  grid-template-columns: 1.2fr 1fr auto;
  gap: 1rem;
  align-items: center;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.05);
  background: rgba(248,249,252,0.85);
}

.anomaly-row.severity-high {
  border-left: 4px solid #dc3545;
}

.anomaly-row.severity-medium {
  border-left: 4px solid #ffc107;
}

.anomaly-row.severity-low {
  border-left: 4px solid #28a745;
}

.anomaly-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.85rem;
}

.anomaly-pill.price_spike {
  background: rgba(40,167,69,0.15);
  color: #1f7a31;
}

.anomaly-pill.volume_surge {
  background: rgba(0,123,255,0.15);
  color: #0c63ce;
}

.anomaly-pill.social_spike {
  background: rgba(255,51,102,0.18);
  color: #b71c3b;
}

.anomaly-symbol-block {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.anomaly-symbol {
  font-weight: 700;
  font-size: 1rem;
  text-transform: uppercase;
}

.anomaly-change {
  font-weight: 700;
}

.anomaly-change.positive {
  color: #28a745;
}

.anomaly-change.negative {
  color: #dc3545;
}

.anomaly-time {
  font-size: 0.85rem;
  color: var(--text-secondary);
  justify-self: end;
}

.whales-card-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.whales-label {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.whales-meta {
  display: inline-block;
  margin-top: 0.35rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.whales-summary-chip {
  align-self: flex-start;
  padding: 0.45rem 1rem;
  border-radius: 999px;
  background: rgba(13,110,253,0.12);
  color: #0c63ce;
  font-weight: 600;
}

.whales-stream {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.whale-flow-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-radius: 14px;
  background: rgba(248,249,252,0.9);
  border: 1px solid rgba(0,0,0,0.04);
}

.whale-flow-symbol {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.symbol-circle {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
}

.whale-flow-amount {
  font-size: 1.2rem;
  font-weight: 700;
}

.whale-flow-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.whale-type-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
}

.whale-type-chip.transfer {
  background: rgba(40,167,69,0.15);
  color: #1f7a31;
}

.whale-type-chip.exchange {
  background: rgba(255,193,7,0.15);
  color: #a07903;
}

.whale-type-chip.other {
  background: rgba(108,117,125,0.15);
  color: #495057;
}

.whale-time {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 600;
}

.news-card-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.news-label {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.news-meta {
  display: inline-block;
  margin-top: 0.35rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.news-summary-chip {
  align-self: flex-start;
  padding: 0.4rem 1rem;
  border-radius: 999px;
  font-weight: 600;
}

.news-summary-chip.positive {
  background: rgba(40,167,69,0.15);
  color: #1f7a31;
}

.news-summary-chip.negative {
  background: rgba(220,53,69,0.15);
  color: #a71d2a;
}

.news-summary-chip.neutral {
  background: rgba(63,81,181,0.12);
  color: #3f51b5;
}

.news-timeline {
  position: relative;
  padding-left: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.news-timeline::before {
  content: '';
  position: absolute;
  left: 10px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: rgba(0,0,0,0.08);
}

.news-timeline-item {
  display: flex;
  gap: 1rem;
  position: relative;
}

.timeline-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 3px solid white;
  position: absolute;
  left: -18px;
  top: 10px;
  box-shadow: 0 0 0 2px rgba(0,0,0,0.05);
}

.timeline-dot.positive { background: #28a745; }
.timeline-dot.negative { background: #dc3545; }
.timeline-dot.neutral { background: #6c63ff; }

.timeline-card {
  flex: 1;
  border-radius: 14px;
  padding: 1rem 1.25rem;
  background: rgba(248,249,252,0.9);
  border: 1px solid rgba(0,0,0,0.04);
}

.timeline-card-header {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: center;
}

.timeline-title {
  font-weight: 600;
  font-size: 1rem;
}

.timeline-sentiment {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
}

.timeline-sentiment .sentiment-icon {
  font-size: 1rem;
}

.timeline-sentiment.positive {
  background: rgba(40,167,69,0.15);
  color: #1f7a31;
}

.timeline-sentiment.negative {
  background: rgba(220,53,69,0.15);
  color: #a71d2a;
}

.timeline-sentiment.neutral {
  background: rgba(63,81,181,0.12);
  color: #3f51b5;
}

.timeline-description {
  margin: 0.6rem 0;
  color: var(--text-primary);
  font-size: 0.92rem;
}

.timeline-meta {
  font-size: 0.85rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.meta-source {
  font-weight: 600;
}

.meta-dot {
  font-size: 0.75rem;
}

.metric-item {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.metric-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.metric-value {
  font-size: 1.2rem;
  font-weight: 500;
}

.signals-list {
  display: grid;
  gap: 1rem;
}

.signal-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.signal-type {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-weight: 500;
  margin-right: 1rem;
}

.signal-type.BUY {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.signal-type.SELL {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.signal-info {
  flex: 1;
}

.signal-pair {
  font-weight: 500;
}

.signal-meta {
  text-align: right;
}

.signal-time {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.signal-strength {
  font-size: 0.85rem;
  font-weight: 500;
}

.signal-strength.HIGH { color: #28a745; }
.signal-strength.MEDIUM { color: #ffc107; }
.signal-strength.LOW { color: #dc3545; }

.futures-data {
  margin-top: 1rem;
}

.funding-rates {
  margin-bottom: 1.5rem;
}

.rates-list {
  display: grid;
  gap: 0.5rem;
}

.rate-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.open-interest {
  text-align: center;
}

.interest-value {
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--primary-color);
}

.loading-state {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Тепловая карта */
.heatmap-container {
  padding: 1rem 0;
}

.heatmap-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.heatmap-item {
  padding: 1rem 0.75rem;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  min-height: 70px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.heatmap-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: rgba(0, 0, 0, 0.1);
}

.heatmap-item.positive-strong {
  border-color: rgba(40, 167, 69, 0.5);
}

.heatmap-item.positive-medium {
  border-color: rgba(40, 167, 69, 0.3);
}

.heatmap-item.negative-strong {
  border-color: rgba(220, 53, 69, 0.5);
}

.heatmap-item.negative-medium {
  border-color: rgba(220, 53, 69, 0.3);
}

.heatmap-item.neutral {
  border-color: rgba(108, 117, 125, 0.2);
}

.heatmap-symbol {
  font-weight: 700;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: #333;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.heatmap-change {
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
}

.heatmap-change.positive {
  color: #155724;
  background: rgba(40, 167, 69, 0.1);
}

.heatmap-change.negative {
  color: #721c24;
  background: rgba(220, 53, 69, 0.1);
}

.heatmap-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.legend-color.positive-strong {
  background: rgba(40, 167, 69, 0.8);
}

.legend-color.positive-medium {
  background: rgba(40, 167, 69, 0.6);
}

.legend-color.neutral {
  background: rgba(108, 117, 125, 0.3);
}

.legend-color.negative-medium {
  background: rgba(220, 53, 69, 0.6);
}

.legend-color.negative-strong {
  background: rgba(220, 53, 69, 0.8);
}

/* Индекс доверия */
.trust-index {
  padding: 2rem 0;
}

.trust-header {
  display: flex;
  justify-content: center;
  margin-bottom: 3rem;
}

.trust-score-circle {
  position: relative;
  width: 140px;
  height: 140px;
}

.score-ring {
  transform: rotate(-90deg);
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.score-ring-fill {
  transition: stroke-dashoffset 1s ease;
}

.score-ring-fill.excellent {
  stroke: #28a745;
}

.score-ring-fill.good {
  stroke: #20c997;
}

.score-ring-fill.moderate {
  stroke: #ffc107;
}

.score-ring-fill.low {
  stroke: #dc3545;
}

.score-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.score-value {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.score-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.score-status {
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  display: inline-block;
}

.score-status.excellent {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.score-status.good {
  background: rgba(32, 201, 151, 0.1);
  color: #20c997;
}

.score-status.moderate {
  background: rgba(255, 193, 7, 0.1);
  color: #ffc107;
}

.score-status.low {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.trust-factors {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.factor-card {
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 12px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.factor-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  border-color: #dee2e6;
}

.factor-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.factor-icon {
  font-size: 2rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 123, 255, 0.1);
  border-radius: 12px;
}

.factor-info {
  flex: 1;
}

.factor-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.factor-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
}

.factor-bar-container {
  margin-top: 1rem;
}

.factor-bar {
  width: 100%;
  height: 10px;
  background: #e9ecef;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.factor-fill {
  height: 100%;
  border-radius: 5px;
  transition: width 0.8s ease;
  position: relative;
}

.factor-fill.excellent {
  background: linear-gradient(90deg, #28a745, #20c997);
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
}

.factor-fill.good {
  background: linear-gradient(90deg, #20c997, #17a2b8);
  box-shadow: 0 2px 8px rgba(32, 201, 151, 0.3);
}

.factor-fill.moderate {
  background: linear-gradient(90deg, #ffc107, #ff9800);
  box-shadow: 0 2px 8px rgba(255, 193, 7, 0.3);
}

.factor-fill.low {
  background: linear-gradient(90deg, #dc3545, #c82333);
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
}

.factor-description {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-style: italic;
}

/* Токеномика */
.tokenomics-data {
  padding: 1rem 0;
}

.tokenomics-visualization {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
}

.visualization-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #333;
}

.supply-progress {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.progress-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.progress-percent {
  font-weight: 600;
  color: #333;
  font-size: 1rem;
}

.progress-bar-container {
  width: 100%;
  height: 24px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 12px;
  transition: width 0.5s ease;
  position: relative;
}

.progress-bar-fill.circulating {
  background: linear-gradient(90deg, #28a745, #20c997);
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
}

.progress-bar-fill.locked {
  background: linear-gradient(90deg, #6c757d, #495057);
  box-shadow: 0 2px 8px rgba(108, 117, 125, 0.3);
}

.progress-value {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.tokenomics-details {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.tokenomics-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.tokenomics-row:hover {
  background: #e9ecef;
  transform: translateX(4px);
}

.tokenomics-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  font-size: 0.95rem;
  color: #333;
}

.label-icon {
  font-size: 1.2rem;
}

.tokenomics-value {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
  flex: 1;
  text-align: right;
}

.value-main {
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
}

.value-sub {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

/* Responsive */
@media (max-width: 1200px) {
  .row-2-equal {
    grid-template-columns: 1fr;
  }
  
  .row-3 {
    grid-template-columns: 1fr;
  }
  
  .dominance-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .dominance-info {
    flex-direction: row;
    justify-content: center;
    gap: 2rem;
  }
  
  .info-item {
    text-align: center;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-right {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .crypto-tracker {
    padding: 0.75rem;
    padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
  }
  
  .page-header-blue {
    flex-direction: column;
    gap: 1.25rem;
    padding: 1.25rem;
  }
  .page-header-blue .header-title { font-size: 1.35rem; }
  .page-header-blue .header-stats { width: 100%; }
  .page-header-blue .stat-card { flex: 1; min-width: 90px; }

  .trust-factors {
    grid-template-columns: 1fr;
  }

  .forecast-grid {
    grid-template-columns: 1fr;
  }

  .hype-metrics-grid {
    grid-template-columns: 1fr;
  }

  .scam-layout {
    grid-template-columns: 1fr;
  }

  .investor-cases-grid {
    grid-template-columns: 1fr;
  }

  .whale-flow-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .whale-flow-meta {
    width: 100%;
    justify-content: space-between;
  }

  .anomaly-row {
    grid-template-columns: 1fr;
    align-items: flex-start;
  }

  .anomaly-time {
    justify-self: flex-start;
  }
  
  .market-grid {
    grid-template-columns: 1fr;
  }
}

/* Социальный индекс хайпа */
.social-hype {
  padding: 2rem 0;
}

.hype-header {
  display: flex;
  justify-content: center;
  margin-bottom: 3rem;
}

.galaxy-score-circle {
  position: relative;
  width: 160px;
  height: 160px;
}

.galaxy-ring {
  transform: rotate(-90deg);
  filter: drop-shadow(0 4px 12px rgba(102, 126, 234, 0.3));
}

.galaxy-ring-bg {
  stroke: #e9ecef;
}

.galaxy-ring-fill {
  transition: stroke-dashoffset 1.2s ease;
}

.galaxy-ring-fill.excellent {
  stroke: #667eea;
}

.galaxy-ring-fill.good {
  stroke: #764ba2;
}

.galaxy-ring-fill.moderate {
  stroke: #f093fb;
}

.galaxy-ring-fill.low {
  stroke: #f5576c;
}

.galaxy-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.galaxy-score-main {
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 0.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.galaxy-score-label {
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.galaxy-score-status {
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  display: inline-block;
}

.galaxy-score-status.excellent {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.galaxy-score-status.good {
  background: rgba(118, 75, 162, 0.1);
  color: #764ba2;
}

.galaxy-score-status.moderate {
  background: rgba(240, 147, 251, 0.1);
  color: #f093fb;
}

.galaxy-score-status.low {
  background: rgba(245, 87, 108, 0.1);
  color: #f5576c;
}

.hype-metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.hype-metric-card {
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 12px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.hype-metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  border-color: #dee2e6;
}

.metric-icon {
  font-size: 2.5rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  flex-shrink: 0;
}

.metric-content {
  flex: 1;
}

.metric-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.metric-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.25rem;
  line-height: 1;
}

.metric-description {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-style: italic;
}

.hype-additional {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
}

.additional-item {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.additional-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.additional-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #667eea;
}

/* Индикатор источника данных */
.card-header-with-badge {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.card-header-with-badge h3 {
  margin: 0;
}

.data-source-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.data-source-badge.real {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
  border: 1px solid rgba(40, 167, 69, 0.3);
}

.data-source-badge.mock {
  background: rgba(255, 193, 7, 0.1);
  color: #ffc107;
  border: 1px solid rgba(255, 193, 7, 0.3);
}

.badge-icon {
  font-size: 1rem;
}

.badge-text {
  white-space: nowrap;
}

.empty-hint {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
  font-style: italic;
}

/* On-Chain Аналитика */
.onchain-metrics {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.onchain-metric-card {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 12px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.onchain-metric-card:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #dee2e6;
}

.metric-icon-wrapper {
  flex-shrink: 0;
}

.metric-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
}

.metric-content {
  flex: 1;
  min-width: 0;
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.metric-name {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.metric-change-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
}

.metric-change-badge.positive {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.metric-change-badge.negative {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.change-icon {
  font-size: 1rem;
  font-weight: 700;
}

.change-value {
  font-weight: 700;
}

.metric-value-main {
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.metric-description {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-style: italic;
  line-height: 1.4;
}
</style> 