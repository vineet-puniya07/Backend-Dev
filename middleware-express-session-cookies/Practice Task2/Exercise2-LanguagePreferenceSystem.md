# Exercise 2: Language Preference System

This middleware stores the selected language in a cookie so it survives browser restarts and future visits.

```js
const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cookieParser());

const supportedLanguages = new Set(['en', 'hi', 'es', 'fr']);

function setLanguagePreference(req, res) {
  const language = req.params.lang;

  if (!supportedLanguages.has(language)) {
    return res.status(400).json({ message: 'Unsupported language' });
  }

  res.cookie('language', language, {
    maxAge: 1000 * 60 * 60 * 24 * 365,
    httpOnly: true,
    sameSite: 'lax',
  });

  res.json({ message: 'Language preference saved', language });
}

function readLanguagePreference(req, res, next) {
  req.language = req.cookies.language || 'en';
  next();
}

app.use(readLanguagePreference);

app.get('/lang/:lang', setLanguagePreference);

app.get('/', (req, res) => {
  const messages = {
    en: 'Welcome',
    hi: 'स्वागत है',
    es: 'Bienvenido',
    fr: 'Bienvenue',
  };

  res.send(messages[req.language] || messages.en);
});

app.listen(3000);
```

## Notes

- Cookies persist across sessions unless they expire or are cleared.
- `httpOnly` keeps the preference harder to tamper with from client-side scripts.
