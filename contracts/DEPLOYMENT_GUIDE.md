# 📘 Guía de Deployment - SwaglyAttestations

## 🎯 Deployment en Remix (Scroll Sepolia Testnet)

### **Paso 1: Preparar Remix**

1. Ve a **[Remix IDE](https://remix.ethereum.org/)**

2. En el explorador de archivos (izquierda), crea una nueva carpeta:
   - Click derecho → "New Folder" → nombre: `SwaglyAttestations`

3. Dentro de esa carpeta, crea un archivo:
   - Click derecho → "New File" → nombre: `SwaglyAttestations.sol`

4. Copia y pega todo el contenido del archivo `contracts/SwaglyAttestations.sol`

---

### **Paso 2: Compilar el Contrato**

1. Ve a la pestaña **"Solidity Compiler"** (icono de Solidity)

2. Configura el compilador:
   - **Compiler version**: `0.8.20` o superior
   - **EVM Version**: `default` (o `paris`)
   - **Optimization**: Activado con `200` runs (recomendado)

3. Click en **"Compile SwaglyAttestations.sol"**

4. Verifica que no haya errores (debe aparecer un checkmark verde ✅)

---

### **Paso 3: Configurar Wallet (MetaMask)**

1. **Agregar Scroll Sepolia Testnet a MetaMask:**

   - Network Name: `Scroll Sepolia Testnet`
   - RPC URL: `https://sepolia-rpc.scroll.io/`
   - Chain ID: `534351`
   - Currency Symbol: `ETH`
   - Block Explorer: `https://sepolia.scrollscan.com/`

   O usa el botón automático en: https://chainlist.org/?search=scroll+sepolia

2. **Obtener ETH de testnet:**
   - Ve al faucet: https://sepolia.scrollscan.com/faucet
   - O usa: https://faucet.scroll.io/
   - Pega tu wallet address y solicita ETH gratis
   - Espera 1-2 minutos a recibir ~0.1 ETH

3. **Verificar balance:**
   - Abre MetaMask y asegúrate de tener al menos 0.01 ETH

---

### **Paso 4: Deploy del Contrato**

1. Ve a la pestaña **"Deploy & Run Transactions"** (icono de Ethereum)

2. Configura el entorno:
   - **Environment**: `Injected Provider - MetaMask`
   - **Account**: Tu wallet address (debe aparecer automáticamente)
   - **Contract**: `SwaglyAttestations`

3. Click en **"Deploy"**

4. MetaMask abrirá un popup:
   - Revisa el gas fee (debería ser ~$0.50-2.00)
   - Click en **"Confirm"**

5. **Espera la confirmación** (~10-30 segundos)

6. Una vez confirmado, verás el contrato en la sección **"Deployed Contracts"**

7. **IMPORTANTE**: Copia la dirección del contrato desplegado
   - Ejemplo: `0x1234567890abcdef1234567890abcdef12345678`
   - **Guarda esta dirección**, la necesitarás para el backend

---

### **Paso 5: Verificar el Contrato en Scrollscan**

1. Ve a **[Scroll Sepolia Explorer](https://sepolia.scrollscan.com/)**

2. Pega la dirección de tu contrato en el buscador

3. Ve a la pestaña **"Contract"**

4. Click en **"Verify and Publish"**

5. Completa el formulario:
   - **Compiler Type**: `Solidity (Single file)`
   - **Compiler Version**: `v0.8.20+commit.xxxxx` (la misma que usaste en Remix)
   - **Open Source License Type**: `MIT`
   - **Optimization**: `Yes` con `200` runs
   - **Source Code**: Copia y pega el código completo de `SwaglyAttestations.sol`

6. Click en **"Verify and Publish"**

7. Si todo está bien, verás un mensaje de éxito ✅

---

### **Paso 6: Configurar Roles Iniciales**

Una vez desplegado, necesitas dar permisos a las wallets que usarás:

#### **6.1. Agregar Wallet del Backend como Attestor**

1. En Remix, en la sección "Deployed Contracts", expande tu contrato

2. Busca la función `addAttestor`

3. Pega la **wallet address del backend** (la que usarás en `CREATOR_WALLET_ADDRESS`)
   - Ejemplo: `0xYourBackendWalletAddress`

4. Click en **"transact"**

5. Confirma en MetaMask

#### **6.2. Agregar Admins como Validators**

1. Busca la función `addValidator`

2. Pega la wallet address de los admins que validarán evidencias

3. Click en **"transact"**

4. Confirma en MetaMask

#### **6.3. (Opcional) Agregar Revokers**

Si quieres que alguien más pueda revocar attestations:

1. Busca la función `addRevoker`

2. Pega la wallet address

3. Click en **"transact"**

---

### **Paso 7: Probar el Contrato**

#### **Test 1: Crear una Attestation de Prueba**

1. En Remix, busca la función `attestActivityCompletion`

2. Llena los parámetros:
   ```
   recipient: 0xTuWalletAddress
   eventId: 0x0000000000000000000000000000000000000000000000000000000000000001
   activityId: 0x0000000000000000000000000000000000000000000000000000000000000002
   tokensAwarded: 100
   scanType: "nfc"
   activityName: "Test Activity"
   ```

3. Click en **"transact"**

4. Confirma en MetaMask

5. Si todo funciona, recibirás un UID de la attestation

#### **Test 2: Verificar la Attestation**

1. Busca la función `getUserAttestations`

2. Pega tu wallet address

3. Click en **"call"** (no cuesta gas, es solo lectura)

4. Deberías ver un array con el UID de la attestation que creaste

#### **Test 3: Decodificar Datos**

1. Busca la función `decodeActivityCompletion`

2. Pega el UID que obtuviste

3. Click en **"call"**

4. Deberías ver todos los datos de la actividad

---

## 🔧 Configuración en el Backend

Una vez desplegado, actualiza tu archivo `.env`:

```env
# Scroll Sepolia Testnet
SCROLL_TESTNET_CHAIN_ID=534351
SCROLL_TESTNET_RPC_URL=https://sepolia-rpc.scroll.io/

# Contrato de Attestations (REEMPLAZA CON TU DIRECCIÓN)
ATTESTATION_CONTRACT_ADDRESS=0xYourDeployedContractAddress

# Wallet del backend (debe ser attestor)
CREATOR_WALLET_ADDRESS=0xYourBackendWalletAddress
CREATOR_WALLET_PRIVATE_KEY=your_private_key_here
```

---

## 📊 Información del Deployment

### **Costos Aproximados (Scroll Sepolia)**

| Acción | Gas Estimado | Costo (~) |
|--------|--------------|-----------|
| Deploy contrato | ~2,500,000 | GRATIS (testnet) |
| Add attestor | ~50,000 | GRATIS (testnet) |
| Create attestation | ~150,000 | GRATIS (testnet) |
| Revoke attestation | ~30,000 | GRATIS (testnet) |

**En Mainnet (Scroll):**
- Deploy: ~$5-10 USD
- Por attestation: ~$0.05-0.15 USD

---

## 🔍 Monitoreo y Debugging

### **Ver Eventos en Scrollscan**

1. Ve a tu contrato en Scrollscan

2. Pestaña **"Events"**

3. Verás todos los eventos:
   - `AttestationCreated`: Cada vez que se crea una attestation
   - `AttestationRevoked`: Cuando se revoca
   - `SchemaRegistered`: Cuando se registra un schema
   - Etc.

### **Leer Datos del Contrato**

Todas las funciones `view` son **gratuitas** (no cuestan gas):

- `getAttestation(uid)`: Ver attestation completa
- `getUserAttestations(address)`: Ver todas las attestations de un user
- `isValid(uid)`: Verificar si es válida
- `isActivityCompleted(eventId, activityId, user)`: Ver si completó actividad
- `totalAttestations()`: Total de attestations creadas
- `owner()`: Ver quién es el owner

---

## 🚨 Troubleshooting

### **Error: "Not attestor"**
- Solución: Asegúrate de haber llamado `addAttestor` con la wallet correcta

### **Error: "Activity already attested"**
- Solución: Esa combinación de eventId+activityId+user ya tiene una attestation
- Puedes verificar con `isActivityCompleted()`

### **Error: "Schema not active"**
- Solución: El schema que intentas usar no existe o está desactivado
- Los schemas por defecto son:
  - `keccak256("ACTIVITY_COMPLETION_V1")`
  - `keccak256("PROOF_VALIDATION_V1")`

### **MetaMask no aparece**
- Solución: Asegúrate de estar en "Injected Provider - MetaMask" en Remix
- Refresca la página si es necesario

---

## 📝 Próximos Pasos

1. ✅ Contrato desplegado en Scroll Sepolia
2. ✅ Roles configurados (attestors, validators)
3. ✅ Contract verificado en Scrollscan
4. 🔄 Integrar con backend (siguiente fase)
5. 🔄 Crear UI para mostrar attestations
6. 🔄 Testing exhaustivo en testnet
7. 🚀 Deploy a Scroll Mainnet (cuando esté listo)

---

## 🔗 Links Útiles

- **Remix IDE**: https://remix.ethereum.org/
- **Scroll Sepolia Explorer**: https://sepolia.scrollscan.com/
- **Scroll Faucet**: https://faucet.scroll.io/
- **Chainlist (agregar red)**: https://chainlist.org/?search=scroll+sepolia
- **Documentación Scroll**: https://docs.scroll.io/

---

## 💡 Tips

1. **Siempre prueba en testnet primero** antes de ir a mainnet
2. **Guarda la dirección del contrato** en un lugar seguro
3. **Verifica el contrato en Scrollscan** para que otros puedan ver el código
4. **Usa batch functions** cuando vayas a producción para ahorrar gas
5. **Monitorea los eventos** para debugging

---

¿Necesitas ayuda? Revisa la documentación completa en `/docs/ATTESTATIONS.md`
