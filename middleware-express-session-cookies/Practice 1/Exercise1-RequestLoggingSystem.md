# Exercise 1: Create a Request Logging System

This middleware logs each request after the response finishes. It records the timestamp, HTTP method, URL, status code, and response time in a file.

```js
const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, 'logs', 'requests.log');

function ensureLogFile() {
  const logDir = path.dirname(logFilePath);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  if (!fs.existsSync(logFilePath)) {
    fs.writeFileSync(logFilePath, '');
  }
}

function requestLogger(req, res, next) {
  ensureLogFile();

  const startTime = Date.now();

  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} | ${req.method} ${req.originalUrl} | ${res.statusCode} | ${responseTime}ms\n`;

    fs.appendFile(logFilePath, logEntry, (error) => {
      if (error) {
        console.error('Failed to write request log:', error);
      }
    });
  });

  next();
}

module.exports = requestLogger;
```

Usage:

```js
const express = require('express');
const requestLogger = require('./requestLogger');

const app = express();

app.use(requestLogger);
app.get('/', (req, res) => res.send('OK'));

app.listen(3000);
```

## Notes

- `res.on('finish')` ensures the status code is final before logging.
- The log file is created automatically if it does not exist.
