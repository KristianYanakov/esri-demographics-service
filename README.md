# 📊 Esri Demographic Data Service

REST API сървър за обработка и предоставяне на демографски данни от Esri ArcGIS REST services. Проектът извлича данни за населението на САЩ по щати от USA Counties dataset и ги предоставя чрез REST API с възможност за филтриране.

## 🎯 Функционалности

### Background Processing
- ⏰ **Периодично обновяване** - Автоматично извличане на данни на всеки час
- 📊 **Агрегиране на данни** - Сумиране на населението по щати от county-level данни
- 💾 **Персистентност** - Записване на обработените данни в JSON файл
- 🛡️ **Error handling** - Грациозно управление на грешки без срив на приложението

### REST API
- 📍 **GET /statePopulation** - Получаване на всички данни за щати
- 🔍 **GET /statePopulation?state=California** - Филтриране по име на щат (case-insensitive)
- 🌐 **GET /** - Web интерфейс за визуализация на данните
- 🚦 **Rate Limiting** - Защита от abuse (100 requests/15 min)

## 🚀 Бърз старт

### Изисквания
- Node.js >= 18.x
- npm >= 9.x

### Инсталация

```bash
# Клониране на проекта
git clone <repository-url>
cd esri-demographic-service

# Инсталация на dependencies
npm install

# Стартиране на сървъра
npm start

# За development с auto-reload
npm run dev
```

### Достъп до приложението

```
🌐 Web интерфейс: http://localhost:8000/
🔌 REST API: http://localhost:8000/statePopulation
```

## 📡 API Документация

### Endpoints

#### **GET /statePopulation**

Връща демографски данни за всички щати или конкретен щат.

**Query Parameters:**
- `state` (optional) - Име на щат за филтриране (case-insensitive)

**Response 200 - Всички щати:**
```json
{
  "California": 39512223,
  "Texas": 28995881,
  "Florida": 21477737,
  ...
}
```

**Response 200 - Конкретен щат:**
```json
{
  "state": "California",
  "population": 39512223
}
```

**Response 404 - Щат не е намерен:**
```json
{
  "error": "State Not Found",
  "message": "State 'InvalidState' does not exist in the data."
}
```

**Response 429 - Rate limit exceeded:**
```json
{
  "error": "Too Many Requests",
  "message": "You have exceeded the 100 requests in 15 minutes limit!"
}
```

**Response 500 - Server error:**
```json
{
  "error": "Internal Server Error",
  "message": "An error occurred while processing your request."
}
```

### Примери за употреба

**cURL:**
```bash
# Всички щати
curl http://localhost:8000/statePopulation

# Конкретен щат
curl http://localhost:8000/statePopulation?state=California
```

**JavaScript (fetch):**
```javascript
// Всички щати
const response = await fetch('http://localhost:8000/statePopulation');
const data = await response.json();

// Конкретен щат
const response = await fetch('http://localhost:8000/statePopulation?state=Texas');
const data = await response.json();
```

**Python:**
```python
import requests

# Всички щати
response = requests.get('http://localhost:8000/statePopulation')
data = response.json()

# Конкретен щат
response = requests.get('http://localhost:8000/statePopulation', 
                       params={'state': 'New York'})
data = response.json()
```

## 🏗️ Архитектура

```
esri-demographic-service/
├── src/
│   ├── index.js              # Express сървър и маршрути
│   └── externalApiService.js # Извличане и обработка на данни
├── views/
│   └── index.ejs             # HTML шаблон
├── public/
│   ├── images/               # Статични изображения
│   └── styles/               # CSS файлове
├── stateData.json            # Кеширани демографски данни
├── package.json              # Project dependencies
├── nodemon.json              # Nodemon конфигурация
└── README.md                 # Документация
```

## 🛠️ Технологичен стек и обосновка

### Backend Framework

#### **Express.js 5.2.1**
**Избор:** Node.js/Express framework

**Аргументи:**
- ✅ **Асинхронен I/O** - Excellent за I/O-intensive операции (API calls, файлова работа)
- ✅ **Минималистичен** - Лек и гъвкав, без излишни dependencies
- ✅ **Зряла екосистема** - Богата библиотека от middleware и plugins
- ✅ **Лесна интеграция** - Прост REST API development
- ✅ **Performance** - Event-driven архитектура подходяща за реал-time операции
- ✅ **Мултиплатформеност** - Работи на Windows, Linux, macOS

**Алтернативи разгледани:**
- ❌ Java/Spring Boot - По-тежък за този use case, overhead за прости операции
- ❌ Python/Flask - По-бавен при concurrent requests
- ❌ C#/.NET - Windows-centric, по-сложна конфигурация

### Data Processing

#### **Axios 1.13.2**
**Избор:** HTTP клиент за извличане на данни

**Аргументи:**
- ✅ **Promise-based** - Отлична интеграция с async/await
- ✅ **Error handling** - Автоматично обработва HTTP errors
- ✅ **Interceptors** - Лесно добавяне на retry logic в бъдеще
- ✅ **Browser и Node.js** - Един код работи на client и server
- ✅ **Battle-tested** - 100M+ downloads седмично

### Scheduling

#### **node-cron 4.2.1**
**Избор:** Cron-based периодично изпълнение

**Аргументи:**
- ✅ **Леко решение** - Без external dependencies (Redis, RabbitMQ)
- ✅ **Unix cron syntax** - Standard и разбираем формат
- ✅ **In-process** - Няма нужда от external scheduler
- ✅ **Sufficiently robust** - Подходящо за MVP и medium-scale

**Алтернативи разгледани:**
- ❌ Bull/BullMQ - Изисква Redis, overkill за този use case
- ❌ node-schedule - По-малко функционалности от node-cron
- ❌ External cron - Допълнителна конфигурация на OS ниво

### Data Storage

#### **File System (JSON)**
**Избор:** JSON файл за persistence

**Аргументи:**
- ✅ **Zero setup** - Няма нужда от database installation
- ✅ **Достатъчен за MVP** - 50 щата = ~2KB данни
- ✅ **Лесно debugging** - Human-readable формат
- ✅ **Fast reads** - In-memory след първоначално четене
- ✅ **Migration path** - Лесна миграция към DB в бъдеще

**Ограничения и migration path:**
```javascript
// Текуща имплементация: File-based
await fs.writeFile('stateData.json', JSON.stringify(data));

// Future migration към PostgreSQL:
await db.query('INSERT INTO states (name, population) VALUES ($1, $2)', 
               [stateName, population]);

// Future migration към Redis cache:
await redis.setex('state:california', 3600, JSON.stringify(data));
```

**Кога да мигрираме:**
- 📈 > 10,000 requests/hour
- 📊 Нужда от historical data/analytics
- 🔄 Multiple concurrent writers
- 🌍 Distributed deployment

### Security

#### **express-rate-limit 8.2.1**
**Избор:** Rate limiting middleware

**Аргументи:**
- ✅ **DDoS protection** - Ограничава abuse от един IP
- ✅ **Fair usage** - Гарантира достъп за всички users
- ✅ **Configurable** - Лесна настройка на limits
- ✅ **Standard headers** - RateLimit-* HTTP headers
- ✅ **Production-ready** - Използван от хиляди компании

**Конфигурация:**
- 100 requests per 15 minutes per IP
- Стандартни RateLimit headers
- Custom error messages

### Templating

#### **EJS 4.0.1**
**Избор:** Embedded JavaScript templating

**Аргументи:**
- ✅ **Минимален learning curve** - Plain JavaScript syntax
- ✅ **Lightweight** - Само 7.5KB minified
- ✅ **Fast rendering** - Pre-compiled templates
- ✅ **Good enough** - Достатъчен за прост web interface

**Алтернативи разгледани:**
- ❌ React/Vue - Overkill за един прост view
- ❌ Handlebars - По-verbose syntax
- ❌ Pug - Нестандартен syntax

### Development Tools

#### **Nodemon 3.1.11**
**Избор:** Development auto-reload

**Аргументи:**
- ✅ **DX improvement** - Auto-restart при промени
- ✅ **Zero config** - Works out of the box
- ✅ **Industry standard** - De facto tool за Node.js dev

## ⚙️ Конфигурация

### Environment Variables

Създайте `.env` файл за custom конфигурация:

```env
PORT=8000                    # Server port (default: 8000)
CRON_SCHEDULE=0 * * * *     # Cron schedule (default: hourly)
DATA_FILE=stateData.json    # Output file name
```

### Rate Limiting

Промяна на rate limit settings в [index.js](src/index.js):

```javascript
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // Time window
    max: 100                    // Max requests per window
});
```

### Cron Schedule

Промяна на cron schedule в [index.js](src/index.js):

```javascript
// Текуща: на всеки час
cron.schedule('0 * * * *', () => {...});

// Примери:
cron.schedule('*/30 * * * *', () => {...});  // Всеки 30 мин
cron.schedule('0 */6 * * *', () => {...});   // Всеки 6 часа
cron.schedule('0 0 * * *', () => {...});     // Дневно в полунощ
```

## 📊 Data Source

**Esri ArcGIS REST API:**
- **Service:** USA Census Counties
- **Endpoint:** `https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/USA_Census_Counties/FeatureServer/0/query`
- **Fields:** `STATE_NAME`, `POPULATION`
- **Format:** GeoJSON

**Data Processing Pipeline:**
1. Fetch all counties from Esri API
2. Group by STATE_NAME
3. Sum POPULATION for each state
4. Store aggregated data in JSON file
5. Serve via REST API

## 🧪 Тестване

### Manual Testing

**Test Rate Limiter:**
```bash
# PowerShell
for ($i=1; $i -le 105; $i++) {
    Invoke-WebRequest -Uri "http://localhost:8000/statePopulation" -UseBasicParsing
}
```

**Test State Filter:**
```bash
curl http://localhost:8000/statePopulation?state=California
curl http://localhost:8000/statePopulation?state=texas
curl http://localhost:8000/statePopulation?state=FLORIDA
```

**Test Error Handling:**
```bash
# Invalid state
curl http://localhost:8000/statePopulation?state=InvalidState

# Missing data file (delete stateData.json first)
curl http://localhost:8000/statePopulation
```

## 🔧 Error Handling

Приложението имплементира comprehensive error handling:

### API Errors
- **404** - State not found или липсващ файл
- **429** - Rate limit exceeded
- **500** - Internal server error (file read/parse errors)
- **503** - Service unavailable (data still loading)

### Background Processing
- Graceful error handling в cron job
- Не crash-ва приложението при API failure
- Detailed error logging с timestamps
- Retry mechanism чрез периодично изпълнение

### Data Validation
- Проверка за валиден API response
- Валидация на STATE_NAME и POPULATION
- Skip на corrupted entries
- JSON parse error handling

## 📈 Скалируемост

### Текуща имплементация (MVP)
- ✅ Подходящо за: < 1,000 requests/hour
- ✅ Single server instance
- ✅ File-based storage
- ✅ In-process cron scheduling

### Future Scalability Options

#### Database Migration
```javascript
// PostgreSQL за persistence
CREATE TABLE states (
    name VARCHAR(100) PRIMARY KEY,
    population BIGINT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Caching Layer
```javascript
// Redis за performance
await redis.setex('states:all', 3600, JSON.stringify(stateData));
```

#### Load Balancing
```
Client → Nginx Load Balancer
           ├─> Node.js Instance 1
           ├─> Node.js Instance 2
           └─> Node.js Instance 3
```

#### Message Queue
```javascript
// Bull/RabbitMQ за distributed scheduling
queue.add('update-demographics', {}, {
    repeat: { cron: '0 * * * *' }
});
```

## 🔐 Security

### Implemented
- ✅ Rate limiting (100 requests/15 min)
- ✅ Input sanitization (case-insensitive search)
- ✅ Error message sanitization (не leak-ва internals)
- ✅ CORS configuration via Express

### Production Recommendations
```javascript
// Helmet.js за security headers
import helmet from 'helmet';
app.use(helmet());

// CORS configuration
import cors from 'cors';
app.use(cors({
    origin: ['https://yourdomain.com'],
    methods: ['GET']
}));

// Request logging
import morgan from 'morgan';
app.use(morgan('combined'));
```

## 🚀 Deployment

### Docker (Recommended)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8000
CMD ["node", "src/index.js"]
```

```bash
docker build -t esri-demographic-service .
docker run -p 8000:8000 esri-demographic-service
```

### Traditional Hosting

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm
git clone <repo-url>
cd esri-demographic-service
npm install --production
npm start

# Use PM2 for process management
npm install -g pm2
pm2 start src/index.js --name demographic-service
pm2 save
pm2 startup
```

## 📝 API Versioning

**Current:** v1 (implicit)

**Future versioning strategy:**
```javascript
// v1 routes (current)
app.use('/api/v1/statePopulation', v1Router);

// v2 routes (future)
app.use('/api/v2/states', v2Router);
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

ISC License

## 👤 Author

**Kristian Yanakov**

---

## 📚 Допълнителни ресурси

- [Express.js Documentation](https://expressjs.com/)
- [Node-cron Documentation](https://www.npmjs.com/package/node-cron)
- [Esri ArcGIS REST API](https://developers.arcgis.com/rest/)
- [REST API Best Practices](https://restfulapi.net/)

---

**Version:** 1.0.0  
**Last Updated:** January 2026
