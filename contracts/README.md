# 🚀 Cómo Deployar en Remix - Paso a Paso

## ⚡ Guía Rápida (5 minutos)

### **1. Abrir Remix**
Ve a: **https://remix.ethereum.org/**

---

### **2. Crear el Archivo del Contrato**

1. En el panel izquierdo (File Explorer), haz click en el icono **📄 "Create New File"**

2. Nombra el archivo: `SwaglyAttestations.sol`

3. **Abre el archivo** que creaste en Remix (haz click en él)

4. **Copia y pega** todo el código del archivo `contracts/SwaglyAttestations.sol` que está en tu proyecto

---

### **3. Compilar**

1. Haz click en el icono de **Solidity Compiler** (tercer icono en la barra lateral izquierda)

2. Configura:
   - **Compiler**: `0.8.20` o superior
   - **EVM Version**: `default`
   - ✅ Activa **"Auto compile"** (opcional pero recomendado)

3. Haz click en el botón azul **"Compile SwaglyAttestations.sol"**

4. Espera el checkmark verde ✅ (significa que compiló correctamente)

---

### **4. Conectar MetaMask a Scroll Sepolia**

#### **4.1. Agregar Scroll Sepolia a MetaMask**

**Opción A - Automático:**
1. Ve a: https://chainlist.org/?search=scroll+sepolia
2. Haz click en **"Connect Wallet"**
3. Haz click en **"Add to MetaMask"** en la red "Scroll Sepolia"

**Opción B - Manual:**
1. Abre MetaMask
2. Click en el selector de redes (arriba)
3. Click en **"Add Network"** → **"Add a network manually"**
4. Llena los datos:
   ```
   Network Name: Scroll Sepolia Testnet
   RPC URL: https://sepolia-rpc.scroll.io/
   Chain ID: 534351
   Currency Symbol: ETH
   Block Explorer: https://sepolia.scrollscan.com/
   ```
5. Click en **"Save"**

#### **4.2. Obtener ETH de Testnet (GRATIS)**

1. Ve al faucet: **https://faucet.scroll.io/**

2. Conecta tu wallet

3. Completa el CAPTCHA

4. Haz click en **"Request ETH"**

5. Espera 1-2 minutos y verás ~0.5 ETH en tu wallet

---

### **5. Deploy del Contrato**

1. En Remix, haz click en el icono de **Deploy & Run Transactions** (cuarto icono en la barra lateral)

2. Configura:
   - **Environment**: `Injected Provider - MetaMask`
     (Si no aparece, asegúrate de que MetaMask esté conectado)

   - **Account**: Tu wallet address (debe aparecer automáticamente con tu balance)

   - **Contract**: `SwaglyAttestations` (debe estar seleccionado)

3. Haz click en el botón naranja **"Deploy"**

4. **MetaMask abrirá un popup:**
   - Revisa que estés en **Scroll Sepolia**
   - El gas fee debe ser ~$0 (es testnet)
   - Haz click en **"Confirm"**

5. **Espera la confirmación** (~10-30 segundos)
   - Verás un spinner en Remix
   - Cuando termine, aparecerá tu contrato en "Deployed Contracts"

6. **¡Listo! 🎉** Copia la dirección del contrato
   - Aparecerá algo como: `SwaglyAttestations at 0x1234...5678`
   - Haz click en el icono de copiar 📋
   - **GUARDA ESTA DIRECCIÓN** - la necesitarás

---

### **6. Verificar que Funciona**

Expande tu contrato en "Deployed Contracts" y prueba estas funciones:

#### **Test 1: Ver el Owner**
1. Haz click en el botón azul `owner`
2. Debe mostrar tu wallet address

#### **Test 2: Ver Total de Attestations**
1. Haz click en `totalAttestations`
2. Debe mostrar `0` (aún no hay ninguna)

#### **Test 3: Crear una Attestation de Prueba**
1. Busca y expande `attestActivityCompletion`
2. Llena los campos:
   ```
   recipient: [TU_WALLET_ADDRESS]
   eventId: 0x0000000000000000000000000000000000000000000000000000000000000001
   activityId: 0x0000000000000000000000000000000000000000000000000000000000000002
   tokensAwarded: 100
   scanType: nfc
   activityName: Test Activity
   ```
3. Haz click en **"transact"** (botón naranja)
4. Confirma en MetaMask
5. Si funciona, verás el transaction hash ✅

#### **Test 4: Verificar tu Attestation**
1. Busca `getUserAttestations`
2. Pega tu wallet address
3. Haz click en **"call"** (botón azul - es gratis)
4. Debe mostrar un array con el UID de tu attestation

---

## 🎯 ¿Qué Sigue?

### **Configurar Roles (IMPORTANTE)**

Para que tu backend pueda crear attestations, necesitas dar permisos:

1. En Remix, busca la función `addAttestor`

2. Pega la wallet address de tu backend (la que usarás en `CREATOR_WALLET_ADDRESS`)

3. Haz click en **"transact"**

4. Confirma en MetaMask

**Repite** con `addValidator` para los admins que validarán evidencias.

---

### **Guardar la Info del Deployment**

Crea un archivo `.env.local` o `.env` en tu proyecto con:

```env
# Scroll Sepolia Testnet
NEXT_PUBLIC_SCROLL_TESTNET_CHAIN_ID=534351
SCROLL_TESTNET_RPC_URL=https://sepolia-rpc.scroll.io/

# Contrato de Attestations
NEXT_PUBLIC_ATTESTATION_CONTRACT_ADDRESS=0xTuContratoAqui

# Wallet del backend
CREATOR_WALLET_ADDRESS=0xTuWalletBackend
CREATOR_WALLET_PRIVATE_KEY=tu_private_key
```

---

### **Verificar en Scrollscan (Opcional pero Recomendado)**

1. Ve a: https://sepolia.scrollscan.com/

2. Pega la dirección de tu contrato

3. Ve a la pestaña **"Contract"**

4. Haz click en **"Verify and Publish"**

5. Llena:
   - **Compiler Type**: Solidity (Single file)
   - **Compiler Version**: v0.8.20+...
   - **Optimization**: Yes, 200 runs
   - **Source Code**: Copia y pega todo el código de `SwaglyAttestations.sol`

6. Haz click en **"Verify and Publish"**

7. Espera y verás un checkmark verde ✅

Esto permite que otros puedan leer tu contrato directamente en Scrollscan.

---

## 📹 Video Tutorial (Alternativa)

Si prefieres video, busca en YouTube:
- "How to deploy smart contract on Remix"
- "Remix Ethereum tutorial"

Los pasos son idénticos, solo cambia la red a Scroll Sepolia.

---

## 🚨 Problemas Comunes

### **"Injected Provider not found"**
- Solución: Instala MetaMask o asegúrate de que esté desbloqueado

### **"Insufficient funds"**
- Solución: Ve al faucet y obtén ETH gratis: https://faucet.scroll.io/

### **"Not attestor" al crear attestation**
- Solución: Llama `addAttestor` con tu wallet address primero

### **Compilación falla**
- Solución: Asegúrate de usar Solidity 0.8.20 o superior

---

## 📞 ¿Necesitas Ayuda?

1. Revisa la guía completa: `contracts/DEPLOYMENT_GUIDE.md`
2. Ve la documentación de Remix: https://remix-ide.readthedocs.io/
3. Documentación de Scroll: https://docs.scroll.io/

---

**¡Eso es todo!** En 5 minutos deberías tener tu contrato desplegado y funcionando en Scroll Sepolia. 🚀
