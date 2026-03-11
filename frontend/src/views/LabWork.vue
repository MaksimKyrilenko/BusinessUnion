<template>
  <v-container fluid class="lab-work">
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h4 primary white--text">
            Лабораторная работа 1-3
            <v-spacer></v-spacer>
            <v-chip color="success" dark>Централизованная балансировка</v-chip>
          </v-card-title>
          <v-card-subtitle class="pt-3">
            Разработка централизованного алгоритма балансировки распределенного приложения
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
              @click="addClient" 
              color="primary" 
              block 
              class="mb-3"
              :disabled="isRunning"
            >
              <v-icon left>mdi-account-plus</v-icon>
              Добавить клиента
            </v-btn>
            
            <v-btn 
              @click="startBalancing" 
              color="success" 
              block 
              class="mb-3"
              :disabled="isRunning || clients.length === 0"
            >
              <v-icon left>mdi-play</v-icon>
              Запустить балансировку
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
                  <v-list-item-title>Клиентов в очереди:</v-list-item-title>
                  <v-list-item-subtitle class="text-h6">{{ clients.length }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Обработано запросов:</v-list-item-title>
                  <v-list-item-subtitle class="text-h6">{{ processedRequests }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Перемещений задач:</v-list-item-title>
                  <v-list-item-subtitle class="text-h6">{{ taskMigrations }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Визуализация дерева -->
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>Древовидная топология отелей</v-card-title>
          <v-card-text>
            <div class="tree-container" ref="treeContainer">
              <svg :width="svgWidth" :height="svgHeight">
                <!-- Связи между узлами -->
                <g v-for="(link, index) in links" :key="'link-' + index">
                  <line
                    :x1="link.source.x"
                    :y1="link.source.y"
                    :x2="link.target.x"
                    :y2="link.target.y"
                    stroke="#90CAF9"
                    stroke-width="2"
                  />
                </g>

                <!-- Узлы (отели) -->
                <g v-for="node in nodes" :key="node.id">
                  <circle
                    :cx="node.x"
                    :cy="node.y"
                    :r="30"
                    :fill="getNodeColor(node)"
                    stroke="#1976D2"
                    stroke-width="2"
                    class="node-circle"
                  />
                  <text
                    :x="node.x"
                    :y="node.y - 40"
                    text-anchor="middle"
                    font-size="12"
                    font-weight="bold"
                  >
                    {{ node.name }}
                  </text>
                  <text
                    :x="node.x"
                    :y="node.y + 5"
                    text-anchor="middle"
                    font-size="14"
                    fill="white"
                    font-weight="bold"
                  >
                    {{ node.load }}
                  </text>
                  <text
                    :x="node.x"
                    :y="node.y + 50"
                    text-anchor="middle"
                    font-size="10"
                  >
                    Загрузка: {{ Math.round(node.load / node.capacity * 100) }}%
                  </text>
                </g>

                <!-- Центральный балансировщик -->
                <g>
                  <rect
                    :x="svgWidth / 2 - 60"
                    y="10"
                    width="120"
                    height="40"
                    fill="#4CAF50"
                    stroke="#2E7D32"
                    stroke-width="2"
                    rx="5"
                  />
                  <text
                    :x="svgWidth / 2"
                    y="35"
                    text-anchor="middle"
                    font-size="14"
                    fill="white"
                    font-weight="bold"
                  >
                    Балансировщик
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
          <v-card-title>Лог событий балансировки</v-card-title>
          <v-card-text>
            <v-timeline dense>
              <v-timeline-item
                v-for="(log, index) in logs"
                :key="index"
                :color="log.color"
                small
              >
                <template v-slot:icon>
                  <v-icon small>{{ log.icon }}</v-icon>
                </template>
                <div>
                  <div class="text-caption">{{ log.time }}</div>
                  <div>{{ log.message }}</div>
                </div>
              </v-timeline-item>
            </v-timeline>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'LabWork',
  data() {
    return {
      svgWidth: 800,
      svgHeight: 500,
      isRunning: false,
      processedRequests: 0,
      taskMigrations: 0,
      clients: [],
      logs: [],
      nodes: [
        // Центральный узел (корень дерева)
        { id: 1, name: 'Отель A', x: 400, y: 150, load: 0, capacity: 10, level: 0 },
        // Второй уровень
        { id: 2, name: 'Отель B', x: 200, y: 250, load: 0, capacity: 8, level: 1 },
        { id: 3, name: 'Отель C', x: 600, y: 250, load: 0, capacity: 8, level: 1 },
        // Третий уровень
        { id: 4, name: 'Отель D', x: 100, y: 350, load: 0, capacity: 6, level: 2 },
        { id: 5, name: 'Отель E', x: 300, y: 350, load: 0, capacity: 6, level: 2 },
        { id: 6, name: 'Отель F', x: 500, y: 350, load: 0, capacity: 6, level: 2 },
        { id: 7, name: 'Отель G', x: 700, y: 350, load: 0, capacity: 6, level: 2 },
      ],
      links: []
    };
  },
  mounted() {
    this.initializeTree();
    this.addLog('Система инициализирована', 'info', 'mdi-information');
  },
  methods: {
    initializeTree() {
      // Создаем связи дерева
      this.links = [
        { source: this.nodes[0], target: this.nodes[1] }, // A -> B
        { source: this.nodes[0], target: this.nodes[2] }, // A -> C
        { source: this.nodes[1], target: this.nodes[3] }, // B -> D
        { source: this.nodes[1], target: this.nodes[4] }, // B -> E
        { source: this.nodes[2], target: this.nodes[5] }, // C -> F
        { source: this.nodes[2], target: this.nodes[6] }, // C -> G
      ];
    },
    addClient() {
      const clientId = this.clients.length + 1;
      const client = {
        id: clientId,
        budget: Math.floor(Math.random() * 5000) + 1000,
        duration: Math.floor(Math.random() * 7) + 1
      };
      this.clients.push(client);
      this.addLog(`Клиент #${clientId} добавлен (бюджет: ${client.budget}₽, дней: ${client.duration})`, 'primary', 'mdi-account-plus');
    },
    async startBalancing() {
      if (this.clients.length === 0) return;
      
      this.isRunning = true;
      this.addLog('Начало балансировки нагрузки', 'success', 'mdi-play');
      
      // Обрабатываем каждого клиента
      for (const client of this.clients) {
        await this.processClient(client);
        await this.sleep(1000);
      }
      
      // Проверяем баланс и перемещаем задачи если нужно
      await this.checkAndBalance();
      
      this.clients = [];
      this.isRunning = false;
      this.addLog('Балансировка завершена', 'success', 'mdi-check');
    },
    async processClient(client) {
      // Находим наименее загруженный узел
      const sortedNodes = [...this.nodes].sort((a, b) => 
        (a.load / a.capacity) - (b.load / b.capacity)
      );
      
      const targetNode = sortedNodes[0];
      targetNode.load++;
      this.processedRequests++;
      
      this.addLog(
        `Клиент #${client.id} назначен на ${targetNode.name} (загрузка: ${Math.round(targetNode.load / targetNode.capacity * 100)}%)`,
        'info',
        'mdi-account-arrow-right'
      );
    },
    async checkAndBalance() {
      this.addLog('Проверка баланса загрузки...', 'warning', 'mdi-scale-balance');
      
      // Находим перегруженные и недогруженные узлы
      const avgLoad = this.nodes.reduce((sum, n) => sum + (n.load / n.capacity), 0) / this.nodes.length;
      
      for (const node of this.nodes) {
        const loadPercent = node.load / node.capacity;
        
        if (loadPercent > avgLoad * 1.5 && node.load > 0) {
          // Узел перегружен, ищем куда переместить
          const targetNode = this.nodes.find(n => 
            n.id !== node.id && (n.load / n.capacity) < avgLoad * 0.7
          );
          
          if (targetNode) {
            node.load--;
            targetNode.load++;
            this.taskMigrations++;
            
            this.addLog(
              `Задача перемещена: ${node.name} → ${targetNode.name}`,
              'warning',
              'mdi-swap-horizontal'
            );
            
            await this.sleep(800);
          }
        }
      }
    },
    reset() {
      this.nodes.forEach(node => node.load = 0);
      this.clients = [];
      this.logs = [];
      this.processedRequests = 0;
      this.taskMigrations = 0;
      this.addLog('Система сброшена', 'info', 'mdi-refresh');
    },
    getNodeColor(node) {
      const loadPercent = node.load / node.capacity;
      if (loadPercent === 0) return '#E3F2FD';
      if (loadPercent < 0.5) return '#81C784';
      if (loadPercent < 0.8) return '#FFB74D';
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
      
      // Ограничиваем количество логов
      if (this.logs.length > 20) {
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

.tree-container {
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
</style>
