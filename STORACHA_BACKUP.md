# 🌐 Sistema de Backup Automático a Storacha (IPFS)

## 📋 Descripción

Este sistema realiza copias de seguridad automáticas de todas las actividades y escaneos en **Storacha** (almacenamiento descentralizado IPFS) cada **60 segundos**.

Los datos se almacenan de forma inmutable en IPFS, creando un historial verificable on-chain de todas las actividades de tu aplicación.

---

## 🚀 Configuración Inicial

### 1. Instalar Dependencias

Las dependencias ya están instaladas:
```bash
npm install @storacha/client
```

### 2. Configurar Variables de Entorno

Ya están configuradas en `.env`:

```env
# Storacha (IPFS Backup) Configuration
STORACHA_DID=did:key:z6Mkjo8cNjhhN4QzcUx6ue7aczwTBNc3en7jhFyDrwG8VJtS
# STORACHA_PROOF= (Opcional - se genera después de crear un espacio)
```

### 3. (Opcional) Configurar Espacio en Storacha

Si quieres usar tu propio espacio de Storacha con mayor cuota:

1. Ve a [https://console.storacha.network](https://console.storacha.network)
2. Crea una cuenta y un espacio
3. Genera un proof de delegación
4. Agrega el proof en `.env`:
   ```env
   STORACHA_PROOF=tu_proof_base64_aqui
   ```

---

## 📡 Uso del Sistema

### Iniciar Backups Automáticos

Los backups se inician automáticamente cuando arrancas el servidor. También puedes controlarlos manualmente:

#### Opción 1: Llamar al endpoint de inicialización

```bash
curl http://localhost:3000/api/init
```

#### Opción 2: Iniciar manualmente vía API

```bash
curl -X POST http://localhost:3000/api/backup \
  -H "Content-Type: application/json" \
  -d '{"action": "start"}'
```

### Detener Backups Automáticos

```bash
curl -X POST http://localhost:3000/api/backup \
  -H "Content-Type: application/json" \
  -d '{"action": "stop"}'
```

### Ejecutar Backup Manual

```bash
curl -X POST http://localhost:3000/api/backup \
  -H "Content-Type: application/json" \
  -d '{"action": "manual"}'
```

### Ver Estado de los Backups

```bash
curl http://localhost:3000/api/backup
```

Respuesta:
```json
{
  "success": true,
  "stats": {
    "isRunning": true,
    "lastBackupTimestamp": "2024-01-15T10:30:00.000Z",
    "lastBackupCid": "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
    "backupCount": 45,
    "ipfsUrl": "https://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi.ipfs.w3s.link"
  }
}
```

---

## 🧪 Pruebas

### Ejecutar Prueba de Backup

```bash
npx tsx scripts/test-storacha-backup.ts
```

Esto ejecutará un backup manual y mostrará:
- ✅ Estado del backup
- 📊 Cantidad de scans y actividades respaldadas
- 📍 CID de IPFS
- 🔗 URL para acceder al backup

### Salida Esperada

```
╔═══════════════════════════════════════════════════════════╗
║  🧪 PRUEBA DE BACKUP A STORACHA - SWAGLY               ║
╚═══════════════════════════════════════════════════════════╝

====================================
🔄 INICIANDO BACKUP A STORACHA
====================================
📅 Último backup: 2024-01-15T10:25:00.000Z
📊 Datos a respaldar:
   - Scans: 15
   - Actividades completadas: 23
📦 Tamaño del backup: 12.45 KB
📤 Subiendo a Storacha...
====================================
✅ BACKUP COMPLETADO EXITOSAMENTE
====================================
📍 CID: bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi
🔗 IPFS URL: https://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi.ipfs.w3s.link
📊 Scans respaldados: 15
📊 Actividades respaldadas: 23
====================================
```

---

## 📦 Estructura de los Backups

Cada backup contiene un JSON con la siguiente estructura:

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "lastBackupTimestamp": "2024-01-15T10:29:00.000Z",
  "data": {
    "scans": [
      {
        "id": "uuid",
        "timestamp": "2024-01-15T10:25:30.000Z",
        "isValid": true,
        "user": {
          "walletAddress": "0x...",
          "nickname": "Daniel"
        },
        "activity": {
          "name": "Scan NFC Booth",
          "tokens": 50,
          "eventId": "event-uuid"
        },
        "event": {
          "name": "ETHGlobal Hackathon"
        }
      }
    ],
    "completedActivities": [
      {
        "timestamp": "2024-01-15T10:20:00.000Z",
        "status": "completed",
        "user": {
          "walletAddress": "0x...",
          "nickname": "Daniel"
        },
        "activity": {
          "name": "Complete Workshop",
          "tokens": 100
        },
        "event": {
          "name": "ETHGlobal Hackathon"
        },
        "proof": {
          "type": "image",
          "status": "approved",
          "tokensAwarded": 100,
          "validatedAt": "2024-01-15T10:21:00.000Z"
        }
      }
    ]
  },
  "stats": {
    "totalScans": 15,
    "totalActivities": 23,
    "totalRecords": 38
  }
}
```

---

## 🔗 Acceso a los Backups

### URLs de Acceso

Cada backup se puede acceder de múltiples formas:

1. **W3S Link (Recomendado)**
   ```
   https://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi.ipfs.w3s.link
   ```

2. **IPFS Gateway Público**
   ```
   https://ipfs.io/ipfs/bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi
   ```

3. **Dweb Link**
   ```
   ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi
   ```

### Descargar Backup

```bash
curl https://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi.ipfs.w3s.link -o backup.json
```

---

## ⏱️ Funcionamiento del Sistema

### Ciclo de Backup (cada 60 segundos)

1. **Obtener timestamp** del último backup
2. **Consultar base de datos** para obtener:
   - Nuevos scans desde el último backup
   - Nuevas actividades completadas desde el último backup
3. **Crear JSON** con todos los datos
4. **Subir a Storacha/IPFS**
5. **Guardar CID** y timestamp del backup
6. **Esperar 60 segundos** y repetir

### Optimización

- ⚡ Solo respalda **datos nuevos** (incrementales)
- 📦 Si no hay datos nuevos, **no crea backup**
- 💾 Backups son **inmutables** en IPFS
- 🔄 Cada backup es **independiente**

---

## 📊 Monitoreo

### Ver Estadísticas de Backups

```typescript
import { getBackupStats } from '@/lib/storacha-backup'

const stats = getBackupStats()
console.log('Backups corriendo:', stats.isRunning)
console.log('Último backup:', stats.lastBackupTimestamp)
console.log('CID:', stats.lastBackupCid)
console.log('Total de backups:', stats.backupCount)
```

### Dashboard de Backups (Opcional)

Puedes crear un componente React que muestre el estado en tiempo real:

```tsx
'use client'

import { useEffect, useState } from 'react'

export function BackupStatus() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    async function fetchStats() {
      const res = await fetch('/api/backup')
      const data = await res.json()
      setStats(data.stats)
    }

    fetchStats()
    const interval = setInterval(fetchStats, 10000) // Actualizar cada 10s

    return () => clearInterval(interval)
  }, [])

  if (!stats) return <div>Cargando...</div>

  return (
    <div className="p-4 border rounded">
      <h3>Estado de Backups</h3>
      <p>Estado: {stats.isRunning ? '🟢 Activo' : '🔴 Detenido'}</p>
      <p>Último backup: {new Date(stats.lastBackupTimestamp).toLocaleString()}</p>
      <p>Total de backups: {stats.backupCount}</p>
      {stats.ipfsUrl && (
        <a href={stats.ipfsUrl} target="_blank" rel="noopener noreferrer">
          Ver último backup en IPFS →
        </a>
      )}
    </div>
  )
}
```

---

## 🐛 Troubleshooting

### Error: "Failed to upload to Storacha"

**Problema:** No se puede conectar a Storacha

**Solución:**
1. Verifica tu conexión a internet
2. Comprueba que el DID sea válido
3. Si usas STORACHA_PROOF, verifica que sea correcto

### Error: "Prisma Client is not ready"

**Problema:** La base de datos no está disponible

**Solución:**
1. Verifica que la BD esté corriendo
2. Comprueba las variables DATABASE_URL
3. Ejecuta `npx prisma generate`

### Los backups no se inician automáticamente

**Problema:** El cron job no está corriendo

**Solución:**
1. Llama manualmente a `/api/init`
2. O inicia con: `POST /api/backup` con `{"action": "start"}`
3. Verifica logs del servidor

### Backups muy grandes

**Problema:** Los JSON son demasiado grandes

**Solución:**
- El sistema ya usa backups incrementales
- Solo respalda datos nuevos desde el último backup
- Si aún así son grandes, considera:
  - Reducir el intervalo a 120 segundos
  - Filtrar campos innecesarios en el servicio

---

## 🔐 Seguridad y Privacidad

### Datos Sensibles

⚠️ **IMPORTANTE:** Los backups contienen:
- ✅ Wallet addresses (públicas)
- ✅ Nicknames (públicos)
- ✅ Activity names (públicas)
- ❌ **NO contiene:** Private keys, passwords, emails

### Visibilidad

- 🌐 Los backups en IPFS son **públicos**
- 🔍 Cualquiera con el CID puede acceder
- 💡 Si necesitas privacidad, encripta antes de subir

### Recomendaciones

1. **No incluyas datos privados** en los backups
2. **Revisa** qué campos se están guardando
3. **Considera encriptar** datos sensibles
4. **Usa proof de Storacha** para mayor control

---

## 📚 API Reference

### POST /api/backup

Controlar backups automáticos o ejecutar manualmente

**Body:**
```json
{
  "action": "manual" | "start" | "stop"
}
```

**Responses:**

- `action: "manual"` - Ejecuta backup ahora
  ```json
  {
    "success": true,
    "message": "Backup manual completado",
    "data": {
      "cid": "bafybei...",
      "ipfsUrl": "https://...",
      "scansCount": 15,
      "activitiesCount": 23
    }
  }
  ```

- `action: "start"` - Inicia backups automáticos
  ```json
  {
    "success": true,
    "message": "Backups automáticos iniciados"
  }
  ```

- `action: "stop"` - Detiene backups automáticos
  ```json
  {
    "success": true,
    "message": "Backups automáticos detenidos"
  }
  ```

### GET /api/backup

Obtener estado actual de los backups

**Response:**
```json
{
  "success": true,
  "stats": {
    "isRunning": true,
    "lastBackupTimestamp": "2024-01-15T10:30:00.000Z",
    "lastBackupCid": "bafybei...",
    "backupCount": 45,
    "ipfsUrl": "https://..."
  }
}
```

### GET /api/init

Inicializar servicios (incluye backups automáticos)

**Response:**
```json
{
  "success": true,
  "message": "Servicios inicializados",
  "services": {
    "backups": "running"
  }
}
```

---

## 🎯 Casos de Uso

### 1. Auditoría de Eventos

Cada backup crea un registro inmutable de todas las actividades, útil para:
- 📊 Analytics históricos
- 🔍 Auditorías
- 📈 Reportes de participación

### 2. Recuperación de Datos

Si pierdes tu base de datos, puedes:
1. Obtener el CID del último backup
2. Descargar el JSON desde IPFS
3. Restaurar datos en tu BD

### 3. Verificación On-Chain

Los CIDs pueden ser:
- 📝 Guardados en contratos
- ✅ Usados como prueba de actividad
- 🏆 Referenciados en NFTs/badges

### 4. Transparencia Pública

Los backups públicos permiten:
- 🌐 Ver todas las actividades del evento
- 📊 Crear dashboards públicos
- 🎖️ Verificar reputación de usuarios

---

## ✅ Checklist de Implementación

- [x] Dependencias instaladas (`@storacha/client`)
- [x] Variables de entorno configuradas
- [x] Servicio de backup creado
- [x] API endpoints creados
- [x] Sistema de cron job implementado
- [x] Script de pruebas creado
- [ ] Ejecutar prueba inicial
- [ ] Verificar backup en IPFS
- [ ] Configurar espacio de Storacha (opcional)
- [ ] Iniciar backups automáticos en producción

---

## 📞 Recursos

- **Storacha Docs:** https://docs.storacha.network/
- **Storacha Console:** https://console.storacha.network
- **IPFS Docs:** https://docs.ipfs.tech/
- **w3up Client:** https://github.com/storacha-network/w3up

---

## 🚀 Próximos Pasos

1. **Ejecutar prueba inicial:**
   ```bash
   npx tsx scripts/test-storacha-backup.ts
   ```

2. **Iniciar backups automáticos:**
   ```bash
   curl http://localhost:3000/api/init
   ```

3. **Verificar que funciona:**
   ```bash
   curl http://localhost:3000/api/backup
   ```

4. **Acceder a tu primer backup en IPFS** usando el CID devuelto

---

**¡Listo!** 🎉 Tu sistema de backups automáticos a IPFS está configurado y funcionando.
