# 🧭 SmartLola PWA — Dashboard

SmartLola 2.0 mobile dashboard — Progressive Web App pentru gestionarea finanțelor, șantierului și agenților AI.

## Instalare pe Android

### Metoda 1 — Direct (cea mai simplă)
1. Deschide `index.html` pe telefon (hostat sau transferat)
2. Browser-ul Chrome → meniu (⋮) → **Add to Home Screen**
3. App apare pe ecran cu icon 🧭
4. Se deschide fullscreen ca app nativă

### Metoda 2 — Local server
```bash
# Pe PC (același WiFi cu telefonul)
cd smartlola-pwa
python -m http.server 8080

# Pe telefon: http://<IP_PC>:8080
# Apoi: Chrome → Add to Home Screen
```

### Metoda 3 — GitHub Pages
```bash
# Push pe GitHub
git init && git add . && git commit -m "SmartLola PWA"
git remote add origin https://github.com/<user>/smartlola-pwa.git
git push -u origin main

# Activează GitHub Pages: Settings → Pages → Source: main branch
# URL: https://<user>.github.io/smartlola-pwa/
```

## Funcționalități

### 📊 Dashboard
- Status sistem (gateway, model, WiFi, DNS)
- Status Andrei
- Statistici rapide (cheltuieli, ore, pending)
- Evenimente recente
- Acțiuni rapide

### 💰 Guda (Finanțe)
- Total cheltuieli (shared + andrei-only)
- Grafic pe categorii
- Ultimele 10 cheltuieli
- Înregistrare rapidă cheltuială

### 🏗 Atlas (Șantier)
- Total ore lucrate
- Grafic pe luni
- Ultimele 10 zile pe șantier
- Adăugare rapidă ore

### 🤖 Agenți
- Lista tuturor agenților SmartLola
- Status activ/inactiv
- Model folosit
- Info sistem (gateway, WiFi, DNS, backup)

## Arhitectură

```
smartlola-pwa/
├── index.html          # Interfața principală
├── manifest.json       # PWA manifest (installable)
├── sw.js               # Service Worker (offline cache)
├── css/style.css       # Dark theme, mobile-first
└── js/app.js           # Logic + API calls
```

## Conectare la OpenClaw

PWA se conectează la gateway-ul OpenClaw local pentru date live:
- **API endpoints:** `/api/expenses`, `/api/ore`, `/api/status`
- **WebSocket:** `ws://<gateway>:18789` pentru real-time
- **Fallback:** `memory/status.json` pentru date statice

## Tehnologii
- Vanilla HTML/CSS/JS (fără framework)
- PWA (manifest + service worker)
- Dark theme mobile-first
- Offline cache

## Licență
Personal — Andrei Ivanov / SmartLola