# Wheel Configurator Frontend

Frontend del configuratore di ruote da ciclismo, realizzato con React, TypeScript e Vite. L'app comunica con il backend Laravel tramite API REST per autenticazione, catalogo, configurazioni e preventivi.

## Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Componenti UI stile shadcn
- TanStack Query
- Zustand per stato configuratore/auth persistita
- Axios per le chiamate API

## Funzionalita

- Dashboard con linee ruote e ultime configurazioni
- Configuratore multi-step: profilo, mozzo, raggi e riepilogo
- Prezzo dinamico aggiornato in tempo reale
- Salvataggio e modifica configurazioni
- Storico preventivi
- Confronto tra configurazioni
- Area personale utente
- Esportazione preventivo in PDF

## Avvio locale

```bash
npm install
npm run dev
```

Configura l'URL API nel file `.env`:

```env
VITE_API_URL=http://localhost:8000/api
```

## Build

```bash
npm run build
```
