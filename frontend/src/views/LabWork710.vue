<template>
  <v-container fluid class="lab-work">
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h4 primary white--text">
            Лабораторная работа 7-10
            <v-spacer></v-spacer>
            <v-chip color="success" dark>Алгоритм Финна</v-chip>
          </v-card-title>
          <v-card-subtitle class="pt-3">
            Централизованный алгоритм балансировки с волновым алгоритмом Финна
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
            <v-btn 
              @click="startFinnAlgorithm" 
              color="success" 
              block 
              class="mb-3"
              :disabled="isRunning"
            >
              <v-icon left>mdi-play</v-icon>
              Запустить алгоритм Финна
            </v-btn>
            
            <v-btn 
              @click="performBalancing" 
              color="warning" 
              block 
              class="mb-3"
              :disabled="isRunning || !algorithmCompleted"
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
                  <v-list-item-title>Отправлено сообщений:</v-list-item-title>
                  <v-list-item-subtitle class="text-h6">{{ messagesSent }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Завершенных узлов:</v-list-item-title>
                  <v-list-item-subtitle class="text-h6">{{ completedNodes }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Перемещений задач:</v-list-item-title>
                  <v-list-item-subtitle class="text-h6">{{ taskMigrations }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>

            <v-alert v-if="algorithmCompleted" type="success" dense class="mt-3">
              Алгоритм Финна завершен!
            </v-alert>
          </v-card-text>
        </v-card>

        <!-- Информация о выбранном узле -->
        <v-card class="mt-4" v-if="selectedNode">
          <v-card-title class="text-h6">{{ selectedNode.name }}</v-card-title>
          <v-card-text>
            <div class="mb-2">
              <strong>Загрузка:</strong> {{ selectedNode.load }}/{{ selectedNode.capacity }}
              ({{ Math.round(selectedNode.load/selectedNode.capacity*100) }}%)
            </div>
            <div class="mb-2">
              <strong>Статус:</strong> {{ selectedNode.status }}
            </div>
            <div class="mb-2">
              <strong>Inc({{ selectedNode.id }}):</strong> 
              <v-chip-group>
                <v-chip v-for="id in selectedNode.inc" :key="id" small color="primary">
                  {{ id }}
                </v-chip>
              </v-chip-group>
            </div>
            <div>
              <strong>NInc({{ selectedNode.id }}):</strong>
              <v-chip-group>
                <v-chip v-for="id in selectedNode.ninc" :key="id" small color="secondary">
                  {{ id }}
                </v-chip>
              </v-chip-group>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Визуализация графа -->
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>Ориентированный граф сети</v-card-title>
          <v-card-text>
            <div class="graph-container">
              <svg :width="svgWidth" :height="svgHeight">
                <!-- Определения маркеров -->
                <defs>
                  <marker
                    id="arrow"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3, 0 6" fill="#90CAF9" />
                  </marker>
                  <marker
                    id="arrow-active"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3, 0 6" fill="#4CAF50" />
                  </marker>
                </defs>

                <!-- Связи -->
                <g v-for="(link, index) in links" :key="'link-' + index">
                  <line
                    :x1="link.source.x"
                    :y1="link.source.y"
                    :x2="link.target.x - 35"
                    :y2="link.target.y - 35"
                    :stroke="link.active ? '#4CAF50' : '#90CAF9'"
                    stroke-width="2"
                    :marker-end="link.active ? 'url(#arrow-active)' : 'url(#arrow)'"
                  />
                </g>

                <!-- Узлы -->
                <g v-for="node in nodes" :key="node.id">
                  <circle
                    :cx="node.x"
                    :cy="node.y"
                    :r="35"
                    :fill="getNodeColor(node)"
                    :stroke="node.id === selectedNode?.id ? '#FF5722' : '#1976D2'"
                    :stroke-width="node.id === selectedNode?.id ? 4 : 2"
                    class="node-circle"
                    @click="selectNode(node)"
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
                    :y="node.y - 10"
                    text-anchor="middle"
                    font-size="12"
                    fill="white"
                    font-weight="bold"
                  >
                    ID: {{ node.id }}
                  </text>
                  <text
                    :x="node.x"
                    :y="node.y + 8"
                    text-anchor="middle"
                    font-size="14"
                    fill="white"
                    font-weight="bold"
                  >
                    {{ node.load }}
                  </text>
                  <text
                    :x="node.x"
                    :y="node.y + 55"
                    text-anchor="middle"
                    font-size="9"
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
          <v-card-title>Лог событий алгоритма Финна</v-card-title>
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
  name: 'LabWork710',
  data() {
    return {
      svgWidth: 800,
      svgHeight: 600,
      isRunning: false,
      algorithmCompleted: false,
      messagesSent: 0,
      completedNodes: 0,
      taskMigrations: 0,
      selectedNode: null,
      logs: [],
      nodes: [
        { id: 1, name: 'Узел A', x: 400, y: 100, load: 8, capacity: 10, status: 'Ожидание', inc: [1], ninc: [], receivedFrom: [] },
        { id: 2, name: 'Узел B', x: 200, y: 200, load: 3, capacity: 10, status: 'Ожидание', inc: [2], ninc: [], receivedFrom: [] },
        { id: 3, name: 'Узел C', x: 600, y: 200, load: 9, capacity: 10, status: 'Ожидание', inc: [3], ninc: [], receivedFrom: [] },
        { id: 4, name: 'Узел D', x: 100, y: 350, load: 2, capacity: 10, status: 'Ожидание', inc: [4], ninc: [], receivedFrom: [] },
        { id: 5, name: 'Узел E', x: 300, y: 350, load: 7, capacity: 10, status: 'Ожидание', inc: [5], ninc: [], receivedFrom: [] },
        { id: 6, name: 'Узел F', x: 500, y: 350, load: 1, capacity: 10, status: 'Ожидание', inc: [6], ninc: [], receivedFrom: [] },
        { id: 7, name: 'Узел G', x: 700, y: 350, load: 6, capacity: 10, status: 'Ожидание', inc: [7], ninc: [], receivedFrom: [] },
        { id: 8, name: 'Узел H', x: 400, y: 500, load: 4, capacity: 10, status: 'Ожидание', inc: [8], ninc: [], receivedFrom: [] },
      ],
      links: []
    };
  },
  mounted() {
    this.initializeGraph();
    this.addLog('Система инициализирована. Алгоритм Финна готов к запуску', 'info', 'mdi-information');
  },
  methods: {
    initializeGraph() {
      this.links = [
        { source: this.nodes[0], target: this.nodes[1], active: false },
        { source: this.nodes[0], target: this.nodes[2], active: false },
        { source: this.nodes[1], target: this.nodes[3], active: false },
        { source: this.nodes[1], target: this.nodes[4], active: false },
        { source: this.nodes[2], target: this.nodes[5], active: false },
        { source: this.nodes[2], target: this.nodes[6], active: false },
        { source: this.nodes[3], target: this.nodes[7], active: false },
        { source: this.nodes[4], target: this.nodes[7], active: false },
        { source: this.nodes[5], target: this.nodes[7], active: false },
        { source: this.nodes[6], target: this.nodes[7], active: false },
        { source: this.nodes[7], target: this.nodes[1], active: false },
        { source: this.nodes[4], target: this.nodes[0], active: false },
      ];
    },
    async startFinnAlgorithm() {
      this.isRunning = true;
      this.algorithmCompleted = false;
      this.messagesSent = 0;
      this.completedNodes = 0;
      
      // Сброс состояния
      this.nodes.forEach(n => {
        n.inc = [n.id];
        n.ninc = [];
        n.receivedFrom = [];
        n.status = 'Активен';
      });
      this.links.forEach(l => l.active = false);
      
      this.addLog('Запуск алгоритма Финна', 'success', 'mdi-play-circle');
      await this.sleep(500);
      
      // Все узлы начинают отправлять сообщения
      await this.runFinnAlgorithm();
      
      this.algorithmCompleted = true;
      this.isRunning = false;
      this.addLog('Алгоритм Финна завершен! Все узлы достигли консенсуса', 'success', 'mdi-check-circle');
    },
    async runFinnAlgorithm() {
      let iteration = 0;
      const maxIterations = 20;
      
      while (this.completedNodes < this.nodes.length && iteration < maxIterations) {
        iteration++;
        this.addLog(`--- Итерация ${iteration} ---`, 'info', 'mdi-numeric');
        await this.sleep(500);
        
        // Каждый узел отправляет сообщения соседям
        for (const node of this.nodes) {
          if (node.status !== 'Завершен') {
            await this.processNode(node);
          }
        }
        
        await this.sleep(800);
      }
    },
    async processNode(node) {
      const outNeighbors = this.getOutNeighbors(node);
      const inNeighbors = this.getInNeighbors(node);
      
      // Отправляем сообщения всем соседям по выходу
      for (const neighbor of outNeighbors) {
        await this.sendMessage(node, neighbor);
      }
      
      // Проверяем, получили ли мы сообщения от всех входящих соседей
      const receivedFromAll = inNeighbors.every(n => 
        node.receivedFrom.includes(n.id)
      );
      
      if (receivedFromAll && inNeighbors.length > 0) {
        // Добавляем себя в NInc
        if (!node.ninc.includes(node.id)) {
          node.ninc.push(node.id);
          this.addLog(`${node.name}: добавлен в NInc(${node.id})`, 'info', 'mdi-plus-circle');
        }
      }
      
      // Проверяем условие завершения: Inc == NInc
      if (this.setsEqual(node.inc, node.ninc) && node.ninc.length > 0) {
        if (node.status !== 'Завершен') {
          node.status = 'Завершен';
          this.completedNodes++;
          this.addLog(`${node.name}: Inc == NInc, узел завершен!`, 'success', 'mdi-check-bold');
          await this.sleep(400);
        }
      }
    },
    async sendMessage(from, to) {
      const link = this.links.find(l => 
        l.source.id === from.id && l.target.id === to.id
      );
      
      if (link) {
        link.active = true;
      }
      
      this.messagesSent++;
      this.addLog(
        `${from.name} → ${to.name}: Inc={${from.inc.join(',')}}, NInc={${from.ninc.join(',')}}`,
        'primary',
        'mdi-email-send'
      );
      
      await this.sleep(400);
      
      // Получатель обрабатывает сообщение
      this.receiveMessage(to, from);
      
      if (link) {
        link.active = false;
      }
    },
    receiveMessage(to, from) {
      // Добавляем отправителя в список полученных
      if (!to.receivedFrom.includes(from.id)) {
        to.receivedFrom.push(from.id);
      }
      
      // Объединяем Inc множества
      from.inc.forEach(id => {
        if (!to.inc.includes(id)) {
          to.inc.push(id);
        }
      });
      
      // Объединяем NInc множества
      from.ninc.forEach(id => {
        if (!to.ninc.includes(id)) {
          to.ninc.push(id);
        }
      });
      
      to.inc.sort((a, b) => a - b);
      to.ninc.sort((a, b) => a - b);
    },
    getOutNeighbors(node) {
      return this.links
        .filter(l => l.source.id === node.id)
        .map(l => l.target);
    },
    getInNeighbors(node) {
      return this.links
        .filter(l => l.target.id === node.id)
        .map(l => l.source);
    },
    setsEqual(arr1, arr2) {
      if (arr1.length !== arr2.length) return false;
      const sorted1 = [...arr1].sort();
      const sorted2 = [...arr2].sort();
      return sorted1.every((val, idx) => val === sorted2[idx]);
    },
    async performBalancing() {
      this.isRunning = true;
      this.addLog('Начало централизованной балансировки...', 'warning', 'mdi-scale-balance');
      await this.sleep(500);
      
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
    selectNode(node) {
      this.selectedNode = node;
    },
    reset() {
      this.nodes.forEach(n => {
        n.inc = [n.id];
        n.ninc = [];
        n.receivedFrom = [];
        n.status = 'Ожидание';
      });
      this.links.forEach(l => l.active = false);
      this.logs = [];
      this.messagesSent = 0;
      this.completedNodes = 0;
      this.taskMigrations = 0;
      this.algorithmCompleted = false;
      this.selectedNode = null;
      this.addLog('Система сброшена', 'info', 'mdi-refresh');
    },
    getNodeColor(node) {
      if (node.status === 'Завершен') return '#4CAF50';
      if (node.status === 'Активен') return '#FF9800';
      
      const loadPercent = node.load / node.capacity;
      if (loadPercent < 0.3) return '#81C784';
      if (loadPercent < 0.7) return '#FFB74D';
      return '#E57373';
    },
    addLog(message, color, icon) {
      const now = new Date();
      this.logs.unshift({
        message,
        color,
        icon,
        time: now.toLocaleTimeString()
      });
      
      if (this.logs.length > 50) {
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
