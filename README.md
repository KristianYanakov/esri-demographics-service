# 📊Demographic Data Service

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

## 🔧 Error Handling

Приложението имплементира comprehensive error handling.

## 📈 Скалируемост

### Текуща имплементация (MVP)
- ✅ Подходящо за: < 1,000 requests/hour
- ✅ Single server instance
- ✅ File-based storage
- ✅ In-process cron scheduling

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
