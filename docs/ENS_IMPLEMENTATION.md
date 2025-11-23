# Implementación de ENS en Swagly

## Resumen

Swagly ahora permite a los usuarios registrar subdominios de `swagly.eth` en Ethereum Mainnet. Cada usuario puede elegir su propio nombre único (ej: `daniel.swagly.eth`) que apuntará a su wallet de Scroll.

## Arquitectura

### Flujo de Propiedad

1. **Registro inicial**: El owner de `swagly.eth` (wallet `0x64cdf0ff7e1afb47081663317ee9f734e503ef80`) crea el subdominio
2. **Configuración**: El owner establece el resolver y la dirección del usuario
3. **Transferencia**: El owner **transfiere la propiedad completa** del subdominio al usuario
4. **Resultado**: El usuario tiene control total sobre su nombre ENS

### ¿Qué puede hacer el usuario con su nombre?

Una vez registrado, el usuario es el **propietario completo** de su subdominio y puede:
- Cambiar la dirección a la que apunta (resolver address)
- Configurar registros adicionales (avatar, email, Twitter, etc.)
- Transferir el nombre a otra wallet
- Venderlo o regalarlo

### Red de operación

- **Scroll**: Todas las operaciones de la app (SWAG tokens, actividades, compras)
- **Ethereum Mainnet**: Solo registro y gestión de nombres ENS

## Componentes

### 1. Base de datos (Prisma)

Nuevos campos en el modelo `User`:
```prisma
model User {
  ensName       String?  @unique  // Nombre sin dominio (ej: "daniel")
  ensFullName   String?            // Nombre completo (ej: "daniel.swagly.eth")
  ensRegistered Boolean  @default(false)
  ensTxHash     String?            // Hash de la transacción de registro
}
```

### 2. ENS Manager (`src/lib/ens-manager.ts`)

Librería que maneja la interacción con los contratos ENS en Ethereum Mainnet:

**Funciones principales:**
- `checkSubdomainAvailability()`: Verifica si un nombre está disponible
- `registerSubdomain()`: Registra un nuevo subdominio
- `isValidEnsName()`: Valida el formato del nombre
- `getAddressForEnsName()`: Resuelve un nombre a una dirección

**Contratos usados:**
- ENS Registry: `0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e`
- Public Resolver: `0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63`

### 3. API Routes

#### `/api/ens/check-availability` (POST)
Verifica si un nombre está disponible:
```json
{
  "name": "daniel"
}
```

Respuesta:
```json
{
  "available": true,
  "name": "daniel",
  "fullName": "daniel.swagly.eth"
}
```

#### `/api/ens/register` (POST)
Registra un subdominio:
```json
{
  "name": "daniel",
  "walletAddress": "0x..."
}
```

Respuesta:
```json
{
  "success": true,
  "name": "daniel",
  "fullName": "daniel.swagly.eth",
  "txHash": "0x..."
}
```

#### `/api/user` (GET)
Obtiene datos del usuario incluyendo ENS:
```
GET /api/user?address=0x...
```

### 4. Componentes UI

#### `EnsRegistrationModal`
Modal para que el usuario elija y registre su nombre:
- Validación en tiempo real
- Verificación de disponibilidad
- Feedback visual

#### `EnsDisplay`
Muestra el nombre ENS del usuario o un botón para registrarlo

### 5. Integración en Profile

El componente `EnsDisplay` se muestra en la página de perfil entre la información del usuario y la sección de gestión de wallet.

## Proceso de Registro On-Chain

Cuando un usuario registra un nombre, se ejecutan las siguientes transacciones en Ethereum Mainnet:

1. **`setSubnodeOwner`**: Crea el subdominio con el owner temporal
2. **`setResolver`**: Establece el Public Resolver para el subdominio
3. **`setAddr`**: Configura la dirección del usuario en el resolver
4. **`setSubnodeOwner`** (segunda vez): Transfiere la propiedad al usuario

Todas estas transacciones son pagadas por la wallet del owner de Swagly usando su private key.

## Reglas de Nombres

- **Longitud**: 3-30 caracteres
- **Caracteres permitidos**: letras minúsculas, números y guiones (-)
- **Restricciones**: No puede empezar ni terminar con guión
- **Unicidad**: Cada nombre solo puede ser registrado una vez

## Variables de Entorno

Agrega estas variables a tu `.env`:

```bash
# ENS Owner Configuration
ENS_OWNER_PRIVATE_KEY=a6cc20eb71f53f746c3b26a5e08756e7b7b721102dba0ff549c06420d2156162

# Thirdweb (necesario para transacciones)
THIRDWEB_SECRET_KEY=tu_secret_key
```

## Migración de Base de Datos

Para aplicar los cambios del schema:

```bash
npx prisma migrate dev --name add_ens_fields
npx prisma generate
```

## Dependencias

Asegúrate de tener instaladas:
- `viem`: Para funciones ENS (namehash, keccak256, etc.)
- `thirdweb`: Para interacción con contratos

```bash
npm install viem
```

## Costos

- **Gas fees**: Pagados por la wallet del owner de Swagly
- **Usuario**: No paga nada
- **Red**: Ethereum Mainnet (costos pueden variar según congestión de la red)

## Seguridad

⚠️ **IMPORTANTE**:
- La clave privada del owner está en el código solo para desarrollo
- En producción, usa un servicio seguro de gestión de claves (AWS KMS, HashiCorp Vault, etc.)
- Considera implementar rate limiting en las APIs de registro
- Valida que solo usuarios autenticados puedan registrar nombres

## Testing

Para probar localmente:

1. Asegúrate de tener fondos en ETH Mainnet en la wallet del owner
2. Conéctate con una wallet de thirdweb
3. Ve a la página de perfil
4. Haz clic en "Register ENS Name"
5. Elige un nombre y confirma
6. Espera a que las transacciones se confirmen en Ethereum

## Verificación

Puedes verificar los nombres registrados en:
- ENS App: https://app.ens.domains/
- Etherscan: https://etherscan.io/

Busca el nombre completo (ej: `daniel.swagly.eth`) para ver todos los detalles.

## Futuras Mejoras

- [ ] Configurar reverse records (para que la wallet muestre el nombre ENS)
- [ ] Permitir al usuario actualizar su avatar y otros registros
- [ ] Implementar sistema de renovación (si es necesario)
- [ ] Agregar soporte para transferencia de nombres entre usuarios
- [ ] Mostrar nombres ENS en lugar de direcciones en toda la app
