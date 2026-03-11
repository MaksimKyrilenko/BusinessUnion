<template>
  <v-container fluid class="lab-work">
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h4 primary white--text">
            Лабораторная работа 4-6
            <v-spacer></v-spacer>
            <v-chip color="success" dark>Алгоритм "Эхо"</v-chip>
          </v-card-title>
          <v-card-subtitle class="pt-3">
            Централизованный алгоритм балансировки для ВС с произвольной топологией
          </v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>

    <!-- Панель управления -->
    <v-row class="mt-4">
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Управление симуляцией</v-card-title>
          <v-card-text>
            <v-select
              v-model="initiatorId"
              :items="nodeOptions"
              label="Выберите инициатора"
              item-title="text"
              item-value="value"
              :disabled="isRunning"
              class="mb-3"
            ></v-select>

            <v-btn 
              @click="startEchoAlgorithm" 
              color="success" 
              block 
              class="mb-3"
              :disabled="isRunning || !initiatorId"
            >
              <v-icon left>mdi-play</v-icon>
              Запустить алгоритм "Эхо"
            </v-btn>
            
            <v-btn 
              @click="collectLoadInfo" 
              color="primary" 
              block 
              class="mb-3"
              :disabled="isRunning || !echoCompleted"
            >
              <v-icon left>mdi-information</v-icon>
              Собрать информацию о загрузке
            </v-btn>

            <v-btn 
              @click="performBalancing" 
              color="warning" 
              block 
              class="mb-3"
              :disabled="isRunning || !loadInfoCollected"
            >
              <v-icon left>mdi-scale-balance</v-icon>
              Выполнить балансировку
            </v-btn>
            
            <v-btn 
              @click="reset" 
              color="error" 
              block
              :disabled="isRunning"
            >
              <v-icon left>mdi-refresh</v-icon>
              Сбросить
            </v-btn>

            <v-divider class="my-4"></v-divider>

            <div class="text-subtitle-2 mb-2">Статистика:</div>
            <v-list dense>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Узлов в сети:</v-list-item-title>
                  <v-list-item-subtitle class="text-h6">{{ nodes.length }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Отправлено токенов:</v-list-item-title>
                  <v-list-item-subtitle class="text-h6">{{ tokensSent }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Получено эхо:</v-list-item-title>
                  <v-list-item-subtitle class="text-h6">{{ echoReceived }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Перемещений задач:</v-list-item-title>
                  <v-list-item-subtitle class="text-h6">{{ taskMigrations }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>

            <v-alert v-if="echoCompleted" type="success" dense class="mt-3">
              Алгоритм "Эхо" завершен!
            </v-alert>
            <v-alert v-if="loadInfoCollected" type="info" dense class="mt-3">
              Информация о загрузке собрана
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Визуализация графа -->
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>Произвольная топология сети (ориентированный граф)</v-card-title>
          <v-card-text>
            <div class="graph-container" ref="graphContainer">
              <svg :width="svgWidth" :height="svgHeight">
                <!-- Связи между узлами (стрелки) -->
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3, 0 6" fill="#90CAF9" />
                  </marker>
                  <marker
                    id="arrowhead-active"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3, 0 6" fill="#4CAF50" />
                  </marker>
                  <marker
                    id="arrowhead-echo"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3, 0 6" fill="#FF9800" />
                  </marker>
                </defs>

                <g v-for="(link, index) in links" :key="'link-' + index">
                  <line
                    :x1="link.source.x"
                    :y1="link.source.y"
                    :x2="link.target.x - 35"
                    :y2="link.target.y - 35"
                    :stroke="getLinkColor(link)"
                    stroke-width="2"
                    :marker-end="getLinkMarker(link)"
                  />
                </g>

                <!-- Узлы -->
                <g v-for="node in nodes" :key="node.id">
                  <circle
                    :cx="node.x"
                    :cy="node.y"
                    :r="35"
                    :fill="getNodeColor(node)"
                    :stroke="getNodeStroke(node)"
                    stroke-width="3"
                    class="node-circle"
                  />
                  <text
                    :x="node.x"
                    :y="node.y - 45"
                    text-anchor="middle"
                    font-size="13"
                    font-weight="bold"
                  >
                    {{ node.name }}
                  </text>
                  <text
                    :x="node.x"
                    :y="node.y + 5"
                    text-anchor="middle"
                    font-size="16"
                    fill="white"
                    font-weight="bold"
                  >
                    {{ node.load }}
                  </text>
                  <text
                    :x="node.x"
                    :y="node.y + 55"
                    text-anchor="middle"
                    font-size="10"
                  >
                    {{ node.status }}
                  </text>
                </g>
              </svg>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Лог событий -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title>Лог событий алгоритма "Эхо"</v-card-title>
          <v-card-text>
            <v-timeline density="compact" align="start">
              <v-timeline-item
                v-for="(log, index) in logs"
                :key="index"
                :dot-color="log.color"
                size="small"
              >
                <template v-slot:icon>
                  <v-icon size="small">{{ log.icon }}</v-icon>
                </template>
                <div class="log-entry">
                  <div class="text-caption text-grey">{{ log.time }}</div>
                  <div class="text-body-2">{{ log.message }}</div>
                </div>
              </v-timeline-item>
            </v-timeline>
            <div v-if="logs.length === 0" class="text-center text-grey pa-4">
              Логи событий появятся здесь
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'LabWork46',
  data() {
    return {
      svgWidth: 800,
      svgHeight: 600,
      isRunning: false,
      echoCompleted: false,
      loadInfoCollected: false,
      tokensSent: 0,
      echoReceived: 0,
      taskMigrations: 0,
      initiatorId: null,
      logs: [],
      nodes: [
        { id: 1, name: 'Узел A', x: 400, y: 100, load: 8, capacity: 10, status: 'Ожидание', counter: 0, pre: null, visited: false },
        { id: 2, name: 'Узел B', x: 200, y: 200, load: 3, capacity: 10, status: 'Ожидание', counter: 0, pre: null, visited: false },
        { id: 3, name: 'Узел C', x: 600, y: 200, load: 9, capacity: 10, status: 'Ожидание', counter: 0, pre: null, visited: false },
        { id: 4, name: 'Узел D', x: 100, y: 350, load: 2, capacity: 10, status: 'Ожидание', counter: 0, pre: null, visited: false },
        { id: 5, name: 'Узел E', x: 300, y: 350, load: 7, capacity: 10, status: 'Ожидание', counter: 0, pre: null, visited: false },
        { id: 6, name: 'Узел F', x: 500, y: 350, load: 1, capacity: 10, status: 'Ожидание', counter: 0, pre: null, visited: false },
        { id: 7, name: 'Узел G', x: 700, y: 350, load: 6, capacity: 10, status: 'Ожидание', counter: 0, pre: null, visited: false },
        { id: 8, name: 'Узел H', x: 400, y: 500, load: 4, capacity: 10, status: 'Ожидание', counter: 0, pre: null, visited: false },
      ],
      links: [],
      activeLinks: []
    };
  },
  computed: {
    nodeOptions() {
      return this.nodes.map(n => ({ text: n.name, value: n.id }));
    }
  },
  mounted() {
    this.initializeGraph();
    this.addLog('Система инициализирована', 'info', 'mdi-information');
  },
  methods: {
    initializeGraph() {
      // Создаем ориентированный граф с произвольной топологией
      this.links = [
        { source: this.nodes[0], target: this.nodes[1], active: false, echo: false }, // A -> B
        { source: this.nodes[0], target: this.nodes[2], active: false, echo: false }, // A -> C
        { source: this.nodes[1], target: this.nodes[3], active: false, echo: false }, // B -> D
        { source: this.nodes[1], target: this.nodes[4], active: false, echo: false }, // B -> E
        { source: this.nodes[2], target: this.nodes[5], active: false, echo: false }, // C -> F
        { source: this.nodes[2], target: this.nodes[6], active: false, echo: false }, // C -> G
        { source: this.nodes[3], target: this.nodes[7], active: false, echo: false }, // D -> H
        { source: this.nodes[4], target: this.nodes[7], active: false, echo: false }, // E -> H
        { source: this.nodes[5], target: this.nodes[7], active: false, echo: false }, // F -> H
        { source: this.nodes[6], target: this.nodes[7], active: false, echo: false }, // G -> H
        // Обратные связи для создания циклов
        { source: this.nodes[7], target: this.nodes[1], active: false, echo: false }, // H -> B
        { source: this.nodes[4], target: this.nodes[0], active: false, echo: false }, // E -> A
      ];
    },
    async startEchoAlgorithm() {
      this.isRunning = true;
      this.echoCompleted = false;
      this.tokensSent = 0;
      this.echoReceived = 0;
      
      // Сбрасываем состояние узлов
      this.nodes.forEach(n => {
        n.counter = 0;
        n.pre = null;
        n.visited = false;
        n.status = 'Ожидание';
      });
      this.links.forEach(l => {
        l.active = false;
        l.echo = false;
      });
      
      const initiator = this.nodes.find(n => n.id === this.initiatorId);
      initiator.status = 'Инициатор';
      
      this.addLog(`${initiator.name} начинает алгоритм "Эхо"`, 'success', 'mdi-play-circle');
      await this.sleep(500);
      
      // Инициатор рассылает токены всем соседям
      await this.initiatorProcess(initiator);
      
      this.echoCompleted = true;
      this.isRunning = false;
      this.addLog('Алгоритм "Эхо" завершен успешно!', 'success', 'mdi-check-circle');
    },
    async initiatorProcess(initiator) {
      const outNodes = this.getOutNodes(initiator);
      
      // Отправляем токены всем соседям
      for (const neighbor of outNodes) {
        await this.sendToken(initiator, neighbor);
        this.tokensSent++;
      }
      
      // Ждем эхо от всех соседей
      while (initiator.counter < outNodes.length) {
        await this.sleep(800);
        // Симулируем получение эхо
        initiator.counter++;
        this.echoReceived++;
        
        if (initiator.counter < outNodes.length) {
          this.addLog(`${initiator.name} получил эхо (${initiator.counter}/${outNodes.length})`, 'info', 'mdi-arrow-left');
        }
      }
      
      initiator.status = 'Завершен';
      this.addLog(`${initiator.name} получил эхо от всех соседей!`, 'success', 'mdi-check-all');
    },
    async sendToken(from, to) {
      const link = this.links.find(l => l.source.id === from.id && l.target.id === to.id);
      if (link) {
        link.active = true;
      }
      
      this.addLog(`${from.name} → ${to.name}: отправка токена`, 'primary', 'mdi-arrow-right');
      await this.sleep(600);
      
      if (!to.visited) {
        to.visited = true;
        to.pre = from;
        to.status = 'Обработка';
        await this.nonInitiatorProcess(to);
      }
      
      // Отправляем эхо обратно
      if (link) {
        link.echo = true;
        link.active = false;
      }
      this.addLog(`${to.name} → ${from.name}: эхо`, 'warning', 'mdi-arrow-left');
      await this.sleep(600);
      
      if (link) {
        link.echo = false;
      }
    },
    async nonInitiatorProcess(node) {
      const outNodes = this.getOutNodes(node).filter(n => n.id !== node.pre?.id);
      
      // Рассылаем токены всем соседям кроме pre
      for (const neighbor of outNodes) {
        if (!neighbor.visited) {
          await this.sendToken(node, neighbor);
          this.tokensSent++;
        }
        node.counter++;
      }
      
      node.status = 'Завершен';
    },
    getOutNodes(node) {
      return this.links
        .filter(l => l.source.id === node.id)
        .map(l => l.target);
    },
    async collectLoadInfo() {
      this.isRunning = true;
      this.addLog('Сбор информации о загрузке узлов...', 'info', 'mdi-database-search');
      await this.sleep(500);
      
      for (const node of this.nodes) {
        this.addLog(`${node.name}: загрузка ${node.load}/${node.capacity} (${Math.round(node.load/node.capacity*100)}%)`, 'info', 'mdi-information');
        await this.sleep(300);
      }
      
      this.loadInfoCollected = true;
      this.isRunning = false;
      this.addLog('Информация о загрузке собрана', 'success', 'mdi-check');
    },
    async performBalancing() {
      this.isRunning = true;
      this.addLog('Начало балансировки нагрузки...', 'warning', 'mdi-scale-balance');
      await this.sleep(500);
      
      // Находим перегруженные (>80%) и недогруженные (<30%) узлы
      const overloaded = this.nodes.filter(n => n.load / n.capacity > 0.8);
      const underloaded = this.nodes.filter(n => n.load / n.capacity < 0.3);
      
      if (overloaded.length > 0 && underloaded.length > 0) {
        for (const over of overloaded) {
          const under = underloaded[0];
          if (over.load > 0 && under) {
            over.load--;
            under.load++;
            this.taskMigrations++;
            
            this.addLog(
              `Задача перемещена: ${over.name} (${Math.round(over.load/over.capacity*100)}%) → ${under.name} (${Math.round(under.load/under.capacity*100)}%)`,
              'warning',
              'mdi-swap-horizontal'
            );
            await this.sleep(800);
          }
        }
        this.addLog('Балансировка завершена', 'success', 'mdi-check-circle');
      } else {
        this.addLog('Система сбалансирована', 'success', 'mdi-check-circle');
      }
      
      this.isRunning = false;
    },
    reset() {
      this.nodes.forEach(n => {
        n.counter = 0;
        n.pre = null;
        n.visited = false;
        n.status = 'Ожидание';
      });
      this.links.forEach(l => {
        l.active = false;
        l.echo = false;
      });
      this.logs = [];
      this.tokensSent = 0;
      this.echoReceived = 0;
      this.taskMigrations = 0;
      this.echoCompleted = false;
      this.loadInfoCollected = false;
      this.addLog('Система сброшена', 'info', 'mdi-refresh');
    },
    getNodeColor(node) {
      if (node.status === 'Инициатор') return '#4CAF50';
      if (node.status === 'Обработка') return '#FF9800';
      if (node.status === 'Завершен') return '#2196F3';
      
      const loadPercent = node.load / node.capacity;
      if (loadPercent < 0.3) return '#81C784';
      if (loadPercent < 0.7) return '#FFB74D';
      return '#E57373';
    },
    getNodeStroke(node) {
      if (node.id === this.initiatorId) return '#2E7D32';
      return '#1976D2';
    },
    getLinkColor(link) {
      if (link.echo) return '#FF9800';
      if (link.active) return '#4CAF50';
      return '#90CAF9';
    },
    getLinkMarker(link) {
      if (link.echo) return 'url(#arrowhead-echo)';
      if (link.active) return 'url(#arrowhead-active)';
      return 'url(#arrowhead)';
    },
    addLog(message, color, icon) {
      const now = new Date();
      this.logs.unshift({
        message,
        color,
        icon,
        time: now.toLocaleTimeString()
      });
      
      if (this.logs.length > 30) {
        this.logs.pop();
      }
    },
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }
};
</script>

<style scoped>
.lab-work {
  padding: 20px;
}

.graph-container {
  width: 100%;
  overflow-x: auto;
}

.node-circle {
  cursor: pointer;
  transition: all 0.3s ease;
}

.node-circle:hover {
  filter: brightness(1.2);
}

svg {
  display: block;
  margin: 0 auto;
}

:deep(.v-timeline) {
  padding-left: 0 !important;
  padding-right: 0 !important;
}

:deep(.v-timeline-item) {
  padding-inline-end: 16px !important;
  padding-inline-start: 16px !important;
}

:deep(.v-timeline-divider__dot) {
  margin-inline-start: 0 !important;
  margin-inline-end: 0 !important;
}

.log-entry {
  padding: 8px 0;
}
</style>
