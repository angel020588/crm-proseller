# CRM ProSeller en Ultra Base

## 0) Clonar el CRM

```bash
sudo -i
mkdir -p /opt
cd /opt
git clone https://github.com/angel020588/crm-proseller crm
```

## 1) Verificar Dockerfile

Asegúrate que `/opt/crm/Dockerfile` existe y contiene el build del paquete CRM.  
Si el archivo no existe, revisa el repositorio o consulta al equipo de desarrollo.

## 2) Crear archivo de variables de entorno

Crea el archivo `/root/ultrabase/.env.crm` (ajusta los valores):

```env
POSTGRES_PASSWORD=TU_PASSWORD
ULTRABASE_API_KEY=TU_API_KEY
ULTRABASE_JWT_SECRET=TU_JWT_SECRET
```

## 3) Agregar servicio CRM al docker-compose

Edita `/root/ultrabase/docker-compose.yml` y agrega el bloque correspondiente al servicio `crm:` (puedes copiar el bloque desde este repositorio).

Luego ejecuta:

```bash
cd /root/ultrabase
docker compose build crm
docker compose up -d crm
docker compose logs -f crm
```

## 4) Extensiones de Postgres y migraciones (Sequelize)

Si usas Sequelize, ejecuta:

```bash
docker compose exec ultrabase_db psql -U postgres -d ultrabase -c 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; CREATE EXTENSION IF NOT EXISTS pgcrypto;'
docker compose exec crm npx sequelize-cli db:migrate || true
docker compose exec crm npx sequelize-cli db:seed:all || true
```
> Si usas Render temporalmente, omite esto y usa la variable `DATABASE_URL` de Render con `sslmode=require`.

## 5) Nginx

1. Crea el archivo de configuración:  
   `/etc/nginx/sites-available/crm.ultrabase.space.conf`
2. Habilita con symlink:  
   `ln -s /etc/nginx/sites-available/crm.ultrabase.space.conf /etc/nginx/sites-enabled/crm.ultrabase.space.conf`
3. Recarga nginx:  
   `nginx -t && systemctl reload nginx`
4. Prueba desde el servidor:
   ```bash
   curl -I https://crm.ultrabase.space --resolve crm.ultrabase.space:443:127.0.0.1 -k
   ```
   Debe responder 200/301/302.

## 6) Salud y verificación

- Logs:  
  `docker compose logs -f crm`
- Health:  
  `curl -s http://ultrabase_crm:4000/health`
- App local (si mapeas el puerto):  
  `curl -s http://127.0.0.1:4000`

---

## Multi-tenancy y autenticación

- Ultra Base emite JWT con `tenant_id`.
- El CRM debe validar `ULTRABASE_JWT_SECRET` y reenviar el header `x-tenant-id` a la API de Ultra Base.
- Si accedes directo a Postgres con RLS:
  ```sql
  ALTER TABLE <tabla> ENABLE ROW LEVEL SECURITY;
  -- Fija tenant por sesión
  SELECT set_config('app.tenant_id', '<TENANT>', true);
  ```
  Define policy por `tenant_id`.

---

## Comandos de referencia (copy-paste)

```bash
# 1) Clonar y preparar
sudo -i
mkdir -p /opt
cd /opt
git clone https://github.com/angel020588/crm-proseller crm

# 2) Crear .env.crm
nano /root/ultrabase/.env.crm

# 3) Agregar servicio al compose
nano /root/ultrabase/docker-compose.yml

# 4) Build y arranque
cd /root/ultrabase
docker compose build crm
docker compose up -d crm
docker compose logs -f crm

# 5) Extensiones DB y migraciones
docker compose exec ultrabase_db psql -U postgres -d ultrabase -c 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; CREATE EXTENSION IF NOT EXISTS pgcrypto;'
docker compose exec crm npx sequelize-cli db:migrate || true
docker compose exec crm npx sequelize-cli db:seed:all || true

# 6) Nginx
nano /etc/nginx/sites-available/crm.ultrabase.space.conf
ln -s /etc/nginx/sites-available/crm.ultrabase.space.conf /etc/nginx/sites-enabled/crm.ultrabase.space.conf
nginx -t && systemctl reload nginx

# 7) Verificación por host header
curl -I https://crm.ultrabase.space --resolve crm.ultrabase.space:443:127.0.0.1 -k
```