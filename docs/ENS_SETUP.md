# Configuración ENS - Guía Rápida

## 1. Variables de Entorno

Agrega estas variables a tu archivo `.env`:

```bash
# ENS Owner Private Key
ENS_OWNER_PRIVATE_KEY=a6cc20eb71f53f746c3b26a5e08756e7b7b721102dba0ff549c06420d2156162

# Thirdweb Secret Key (para firmar transacciones)
THIRDWEB_SECRET_KEY=tu_secret_key_aqui
```

## 2. Verificar Fondos

Asegúrate de que la wallet del owner tenga ETH en Ethereum Mainnet para pagar el gas:

**Wallet Owner**: `0x64cdf0ff7e1afb47081663317ee9f734e503ef80`

Verifica el balance en: https://etherscan.io/address/0x64cdf0ff7e1afb47081663317ee9f734e503ef80

**Estimación de costos por registro**: ~0.01-0.03 ETH (dependiendo del precio del gas)

## 3. Actualizar Base de Datos

Los cambios ya están aplicados con `prisma db push`. Si necesitas regenerar el cliente:

```bash
npx prisma generate
```

## 4. Probar la Implementación

### Paso 1: Iniciar el servidor
```bash
npm run dev
```

### Paso 2: Conectar wallet
1. Ve a http://localhost:3000/profile
2. Conecta tu wallet de thirdweb

### Paso 3: Registrar nombre ENS
1. Haz clic en "Register ENS Name"
2. Elige un nombre (ej: "daniel")
3. Verifica que esté disponible (marca verde ✓)
4. Haz clic en "Register ENS Name"
5. Espera a que se procesen las transacciones en Ethereum Mainnet

### Paso 4: Verificar
1. En la página de perfil verás tu nombre ENS
2. Puedes verificar en ENS App: https://app.ens.domains/
3. Busca tu nombre completo (ej: `daniel.swagly.eth`)

## 5. Cómo Funciona

### Usuario elige nombre
- Usuario ingresa "daniel"
- Sistema valida formato y disponibilidad
- Usuario confirma registro

### Owner procesa (automático)
1. **Transacción 1**: Crear subdominio `daniel.swagly.eth`
2. **Transacción 2**: Establecer resolver
3. **Transacción 3**: Configurar dirección del usuario
4. **Transacción 4**: Transferir propiedad al usuario

### Resultado
- Usuario obtiene `daniel.swagly.eth`
- Nombre apunta a su wallet
- Usuario es el propietario completo
- Puede gestionar su nombre en ENS App

## 6. Archivos Creados

```
src/
├── lib/
│   └── ens-manager.ts              # Lógica ENS
├── app/
│   └── api/
│       ├── ens/
│       │   ├── check-availability/
│       │   │   └── route.ts        # Verificar disponibilidad
│       │   └── register/
│       │       └── route.ts        # Registrar nombre
│       └── user/
│           └── route.ts            # Obtener datos usuario + ENS
└── components/
    ├── ens-display.tsx             # Mostrar nombre ENS
    └── ens-registration-modal.tsx  # Modal de registro

prisma/
└── schema.prisma                   # Actualizado con campos ENS

docs/
├── ENS_IMPLEMENTATION.md           # Documentación completa
└── ENS_SETUP.md                    # Esta guía
```

## 7. Troubleshooting

### Error: "Insufficient funds"
- La wallet del owner necesita más ETH
- Envía ETH a `0x64cdf0ff7e1afb47081663317ee9f734e503ef80`

### Error: "Name already taken"
- El nombre ya está registrado en la blockchain
- Prueba con otro nombre

### Error: "Invalid name"
- Solo minúsculas, números y guiones
- 3-30 caracteres
- No puede empezar/terminar con guión

### Transacciones muy lentas
- El gas price en Ethereum puede estar alto
- Las transacciones pueden tomar 1-5 minutos
- Puedes verificar el progreso en Etherscan

## 8. Próximos Pasos

Una vez implementado y probado:

1. **Seguridad**: Mover la private key a un gestor de secretos seguro (AWS KMS, etc.)
2. **Monitoreo**: Configurar alertas para el balance de ETH del owner
3. **Rate Limiting**: Implementar límites de registro por usuario/IP
4. **UI/UX**: Mostrar nombres ENS en lugar de direcciones en toda la app
5. **Reverse Records**: Configurar para que las wallets muestren el nombre ENS

## 9. Recursos

- ENS Docs: https://docs.ens.domains/
- ENS App: https://app.ens.domains/
- Etherscan: https://etherscan.io/
- Swagly.eth: https://app.ens.domains/swagly.eth
