# OpenEOS Landing Page

> Marketing-Website für OpenEOS - Das moderne Kassensystem für Vereine & Events.

## Entwicklung & Lizenz

**Entwickelt von:** LUXCODE by Lukas Lukic-Spitznagel

**Lizenz:** [AGPLv3](./LICENSE) (GNU Affero General Public License v3.0)

## Beschreibung

Die OpenEOS Landing Page ist die offizielle Marketing- und Informationswebsite für das OpenEOS Kassensystem. Sie bietet:

- Produktübersicht und Feature-Beschreibungen
- Preismodelle (Self-Hosted & SaaS)
- Open Source Informationen
- Zugang zu Login und Registrierung
- Rechtliche Seiten (Impressum, Datenschutz, AGB)

## Tech Stack

- **Framework:** Next.js (App Router)
- **Styling:** TailwindCSS + Untitled UI
- **Animationen:** Framer Motion
- **i18n:** next-intl (Deutsch & Englisch)
- **Themes:** next-themes (Dark/Light Mode)

## Entwicklung

```bash
pnpm install
pnpm dev
```

---

## Deployment

### Voraussetzungen

- Docker & Docker Compose auf dem Server
- GitHub Repository unter `OpenEOS-Project/openeos-landing`
- DNS-Einträge für `openeos.de` und `www.openeos.de` (A-Record auf Server-IP)

### Docker Netzwerk erstellen

Das externe Netzwerk muss einmalig erstellt werden:

```bash
docker network create frontend
```

### Manuelles Deployment

```bash
# 1. Docker Image bauen
docker build -t ghcr.io/openeos-project/openeos-landing:latest .

# 2. Image pushen (GitHub Login erforderlich)
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
docker push ghcr.io/openeos-project/openeos-landing:latest

# 3. Auf Server deployen
docker compose up -d
```

### Airgapped / Self-Hosted Deployment

For a closed network (no Traefik, no ACME, no public DNS) use `docker-compose.airgap.yml`:

```bash
docker pull ghcr.io/openeos-project/openeos-landing:latest
docker save -o openeos-landing.tar ghcr.io/openeos-project/openeos-landing:latest
# copy openeos-landing.tar to the offline host, then:
docker load -i openeos-landing.tar
NEXT_PUBLIC_API_URL=http://<api-host>:3000 \
NEXT_PUBLIC_APP_URL=http://<web-host>:3001 \
NEXT_PUBLIC_DOCS_URL=http://<docs-host>:3002 \
docker compose -f docker-compose.airgap.yml up -d
```

`NEXT_PUBLIC_API_URL`/`APP_URL`/`DOCS_URL` are normally inlined into the client bundle at build time, but the published image bakes sentinel tokens instead of real domains — `docker-entrypoint.sh` rewrites them to the runtime values above on every container start, so the same pulled image works against any deployment without a rebuild.

### Automatisches Deployment (CI/CD)

Bei jedem Push auf `main` wird automatisch:

1. **Lint & Build** geprüft
2. **Docker Image** gebaut und zu `ghcr.io` gepusht

Das Image kann dann auf dem Server mit `docker compose pull && docker compose up -d` aktualisiert werden.

### Docker Compose Konfiguration

Die `docker-compose.yml` enthält:

- **openeos-landing**: Die Next.js Landing Page (Port 3000 intern)
- **traefik**: Reverse Proxy mit automatischem Let's Encrypt

#### Traefik Features

- Automatische HTTPS-Zertifikate via Let's Encrypt
- HTTP → HTTPS Redirect
- www.openeos.de → openeos.de Redirect
- Dashboard unter `traefik.openeos.de` (optional aktivierbar)

### Server Setup

```bash
# 1. Repository klonen oder docker-compose.yml kopieren
git clone https://github.com/OpenEOS-Project/openeos-landing.git
cd openeos-landing

# 2. Netzwerk erstellen (falls noch nicht vorhanden)
docker network create frontend

# 3. Bei GHCR anmelden
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# 4. Services starten
docker compose up -d

# 5. Logs prüfen
docker compose logs -f
```

### Update auf neue Version

```bash
docker compose pull
docker compose up -d
```

### Troubleshooting

```bash
# Container-Status
docker compose ps

# Logs anzeigen
docker compose logs openeos-landing
docker compose logs traefik

# Zertifikat-Status prüfen
docker compose exec traefik cat /letsencrypt/acme.json | jq '.letsencrypt.Certificates'

# Container neu starten
docker compose restart openeos-landing
```

### Traefik Dashboard absichern

Um das Dashboard zu aktivieren, generiere einen Passwort-Hash und füge ihn in `docker-compose.yml` ein:

```bash
# Passwort-Hash generieren
htpasswd -nb admin dein-passwort

# Ausgabe in docker-compose.yml einfügen und Labels auskommentieren
```

---

## Automatisches Deployment

Nach jedem erfolgreichen Image-Build auf `main` (Workflow `.github/workflows/build-deploy.yaml`, Job `deploy`) kann automatisch auf den Produktionsserver deployed werden. Der Deploy-Job ist standardmäßig deaktiviert und muss explizit aktiviert werden.

**Aktivieren:** Repository-Variable `DEPLOY_ENABLED` auf `true` setzen (Settings → Secrets and variables → Actions → Variables).

**Benötigte Variables:**

| Variable | Beschreibung |
|----------|--------------|
| `DEPLOY_ENABLED` | `true` aktiviert den Deploy-Job, sonst wird er übersprungen |
| `DEPLOY_PATH` | Optional — Compose-Verzeichnis auf dem Server (Default: `/srv/docker/<repo-name>`) |
| `DEPLOY_SERVICE` | Name des zu aktualisierenden Compose-Service |

**Benötigte Secrets:**

| Secret | Beschreibung |
|--------|--------------|
| `DEPLOY_HOST` | Hostname/IP des Produktionsservers |
| `DEPLOY_USER` | SSH-Benutzer |
| `DEPLOY_SSH_KEY` | Privater SSH-Key für den Zugriff |
| `DEPLOY_PORT` | (optional) SSH-Port, Standard: `22` |

Der Deploy-Job verbindet sich per SSH auf den Server und führt dort `docker compose pull` + `docker compose up -d` für den konfigurierten Service aus, gefolgt von `docker image prune -f`.

## Links

- **Hauptprojekt:** [OpenEOS](https://github.com/OpenEOS-Project)
