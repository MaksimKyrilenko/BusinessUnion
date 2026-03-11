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
      await this.sleep(500);
      
      // Вычисляем среднюю загрузку
      const totalLoad = this.nodes.reduce((sum, n) => sum + n.load, 0);
      const totalCapacity = this.nodes.reduce((sum, n) => sum + n.capacity, 0);
      const avgLoadPercent = totalLoad / totalCapacity;
      
      this.addLog(`Средняя загрузка системы: ${Math.round(avgLoadPercent * 100)}%`, 'info', 'mdi-information');
      await this.sleep(500);
      
      // Находим перегруженные узлы (загрузка > 80%)
      const overloadedNodes = this.nodes.filter(n => (n.load / n.capacity) > 0.8 && n.load > 0);
      
      // Находим недогруженные узлы (загрузка < 50%)
      const underloadedNodes = this.nodes.filter(n => (n.load / n.capacity) < 0.5);
      
      if (overloadedNodes.length > 0 && underloadedNodes.length > 0) {
        this.addLog(`Обнаружено перегруженных узлов: ${overloadedNodes.length}`, 'warning', 'mdi-alert');
        await this.sleep(500);
        
        // Балансируем нагрузку
        for (const overloadedNode of overloadedNodes) {
          // Сортируем недогруженные узлы по загрузке
          const sortedUnderloaded = [...underloadedNodes].sort((a, b) => 
            (a.load / a.capacity) - (b.load / b.capacity)
          );
          
          const targetNode = sortedUnderloaded[0];
          
          if (targetNode && overloadedNode.load > 0) {
            // Перемещаем одну задачу
            overloadedNode.load--;
            targetNode.load++;
            this.taskMigrations++;
            
            this.addLog(
              `Задача перемещена: ${overloadedNode.name} (${Math.round(overloadedNode.load / overloadedNode.capacity * 100)}%) → ${targetNode.name} (${Math.round(targetNode.load / targetNode.capacity * 100)}%)`,
              'warning',
              'mdi-swap-horizontal'
            );
            
            await this.sleep(1000);
          }
        }
        
        this.addLog('Балансировка завершена успешно', 'success', 'mdi-check-circle');
      } else {
        this.addLog('Система сбалансирована, перемещение не требуется', 'success', 'mdi-check-circle');
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

/* Убираем большие отступы в timeline */
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

/* Стили для логов */
.log-container {
  max-height: 500px;
  overflow-y: auto;
}

.log-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-left: 3px solid #e0e0e0;
  margin-bottom: 8px;
  background: #f5f5f5;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.log-item:hover {
  background: #eeeeee;
  transform: translateX(2px);
}

.log-item.log-primary {
  border-left-color: #2196F3;
  background: #E3F2FD;
}

.log-item.log-success {
  border-left-color: #4CAF50;
  background: #E8F5E9;
}

.log-item.log-warning {
  border-left-color: #FF9800;
  background: #FFF3E0;
}

.log-item.log-error {
  border-left-color: #F44336;
  background: #FFEBEE;
}

.log-item.log-info {
  border-left-color: #00BCD4;
  background: #E0F7FA;
}

.log-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.log-content {
  flex: 1;
}

.log-time {
  font-size: 11px;
  color: #666;
  margin-bottom: 4px;
  font-weight: 500;
}

.log-message {
  font-size: 14px;
  color: #333;
  line-height: 1.4;
}

.log-container::-webkit-scrollbar {
  width: 6px;
}

.log-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.log-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.log-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
