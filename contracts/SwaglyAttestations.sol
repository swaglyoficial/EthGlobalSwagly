// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SwaglyAttestations
 * @notice Contrato para gestionar attestations de actividades en Swagly
 * @dev Registra completaciones de actividades, validaciones de evidencias, y más
 *
 * Diseñado para:
 * - Escaneos NFC/QR
 * - Validación de evidencias (imágenes, transacciones, referidos)
 * - Sistema de pasaportes digitales
 * - Prevención de duplicados
 *
 * Compatible con Scroll Mainnet
 */
contract SwaglyAttestations {

    // ============================================
    // ROLES Y PERMISOS
    // ============================================

    address public owner;
    mapping(address => bool) public attestors;    // Pueden crear attestations
    mapping(address => bool) public validators;   // Pueden validar evidencias
    mapping(address => bool) public revokers;     // Pueden revocar attestations

    // ============================================
    // ESTRUCTURAS DE DATOS
    // ============================================

    /// @notice Tipos de attestation soportados
    enum AttestationType {
        ACTIVITY_COMPLETION,    // Completar actividad (scan NFC/QR)
        PROOF_VALIDATION,       // Validación de evidencia
        PASSPORT_CLAIM,         // Reclamar pasaporte
        REFERRAL_VERIFICATION,  // Verificación de referido
        TRANSACTION_PROOF       // Prueba de transacción on-chain
    }

    /// @notice Estados de una attestation
    enum AttestationStatus {
        ACTIVE,
        REVOKED,
        EXPIRED
    }

    /// @notice Estructura de una attestation
    struct Attestation {
        bytes32 uid;                    // ID único
        address recipient;              // Wallet del usuario
        address attestor;               // Quien creó la attestation
        AttestationType attestationType;
        AttestationStatus status;
        uint256 timestamp;              // Cuándo se creó
        uint256 expirationTime;         // Cuándo expira (0 = nunca)
        bytes32 schemaId;               // ID del schema usado
        bytes data;                     // Datos específicos del tipo
    }

    /// @notice Schema para validar attestations
    struct AttestationSchema {
        bytes32 schemaId;
        string name;
        string description;
        AttestationType attestationType;
        bool active;
        uint256 createdAt;
    }

    /// @notice Datos de completación de actividad
    struct ActivityCompletionData {
        bytes32 eventId;
        bytes32 activityId;
        uint256 tokensAwarded;
        string scanType;        // "nfc" o "qr"
        string activityName;
        uint256 completedAt;
    }

    /// @notice Datos de validación de evidencia
    struct ProofValidationData {
        bytes32 activityId;
        bytes32 proofId;
        string proofType;       // "image", "text", "transaction", "referral"
        bool approved;
        address validator;
        uint256 tokensAwarded;
        uint256 validatedAt;
    }

    /// @notice Parámetros para batch attestation de actividades
    struct BatchActivityParams {
        address recipient;
        bytes32 eventId;
        bytes32 activityId;
        uint256 tokensAwarded;
        string scanType;
        string activityName;
    }

    // ============================================
    // STORAGE
    // ============================================

    /// @notice Mapping de UID → Attestation
    mapping(bytes32 => Attestation) public attestations;

    /// @notice Mapping de usuario → lista de UIDs
    mapping(address => bytes32[]) public userAttestations;

    /// @notice Mapping de schema ID → Schema
    mapping(bytes32 => AttestationSchema) public schemas;

    /// @notice Mapping de eventId+activityId+user → UID (prevenir duplicados)
    mapping(bytes32 => bytes32) public activityCompletions;

    /// @notice Contador de attestations totales
    uint256 public totalAttestations;

    /// @notice Contador de schemas registrados
    uint256 public totalSchemas;

    /// @notice Contrato pausado
    bool public paused;

    // ============================================
    // EVENTOS
    // ============================================

    event AttestationCreated(
        bytes32 indexed uid,
        address indexed recipient,
        address indexed attestor,
        AttestationType attestationType,
        bytes32 schemaId,
        uint256 timestamp
    );

    event AttestationRevoked(
        bytes32 indexed uid,
        address indexed revoker,
        string reason,
        uint256 timestamp
    );

    event SchemaRegistered(
        bytes32 indexed schemaId,
        string name,
        AttestationType attestationType,
        uint256 timestamp
    );

    event SchemaDeactivated(
        bytes32 indexed schemaId,
        uint256 timestamp
    );

    event AttestorAdded(address indexed attestor, uint256 timestamp);
    event AttestorRemoved(address indexed attestor, uint256 timestamp);
    event ValidatorAdded(address indexed validator, uint256 timestamp);
    event ValidatorRemoved(address indexed validator, uint256 timestamp);
    event RevokerAdded(address indexed revoker, uint256 timestamp);
    event RevokerRemoved(address indexed revoker, uint256 timestamp);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // ============================================
    // MODIFIERS
    // ============================================

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyAttestor() {
        require(attestors[msg.sender], "Not attestor");
        _;
    }

    modifier onlyValidator() {
        require(validators[msg.sender], "Not validator");
        _;
    }

    modifier onlyRevoker() {
        require(revokers[msg.sender], "Not revoker");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Contract paused");
        _;
    }

    // ============================================
    // CONSTRUCTOR
    // ============================================

    constructor() {
        owner = msg.sender;

        // El owner tiene todos los roles por defecto
        attestors[msg.sender] = true;
        validators[msg.sender] = true;
        revokers[msg.sender] = true;

        // Registrar schemas por defecto
        _registerDefaultSchemas();
    }

    // ============================================
    // FUNCIONES DE GESTIÓN DE ROLES
    // ============================================

    function addAttestor(address _attestor) external onlyOwner {
        require(_attestor != address(0), "Invalid address");
        attestors[_attestor] = true;
        emit AttestorAdded(_attestor, block.timestamp);
    }

    function removeAttestor(address _attestor) external onlyOwner {
        attestors[_attestor] = false;
        emit AttestorRemoved(_attestor, block.timestamp);
    }

    function addValidator(address _validator) external onlyOwner {
        require(_validator != address(0), "Invalid address");
        validators[_validator] = true;
        emit ValidatorAdded(_validator, block.timestamp);
    }

    function removeValidator(address _validator) external onlyOwner {
        validators[_validator] = false;
        emit ValidatorRemoved(_validator, block.timestamp);
    }

    function addRevoker(address _revoker) external onlyOwner {
        require(_revoker != address(0), "Invalid address");
        revokers[_revoker] = true;
        emit RevokerAdded(_revoker, block.timestamp);
    }

    function removeRevoker(address _revoker) external onlyOwner {
        revokers[_revoker] = false;
        emit RevokerRemoved(_revoker, block.timestamp);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        address previousOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(previousOwner, newOwner);
    }

    // ============================================
    // FUNCIONES PRINCIPALES DE ATTESTATION
    // ============================================

    /**
     * @notice Crear una nueva attestation genérica
     * @param recipient Wallet que recibe la attestation
     * @param attestationType Tipo de attestation
     * @param schemaId ID del schema a usar
     * @param data Datos codificados específicos del tipo
     * @param expirationTime Timestamp de expiración (0 = nunca)
     * @return uid ID único de la attestation creada
     */
    function attest(
        address recipient,
        AttestationType attestationType,
        bytes32 schemaId,
        bytes memory data,
        uint256 expirationTime
    )
        public
        onlyAttestor
        whenNotPaused
        returns (bytes32 uid)
    {
        require(recipient != address(0), "Invalid recipient");
        require(schemas[schemaId].active, "Schema not active");
        require(
            schemas[schemaId].attestationType == attestationType,
            "Schema type mismatch"
        );

        // Generar UID único
        uid = keccak256(
            abi.encodePacked(
                recipient,
                attestationType,
                schemaId,
                block.timestamp,
                totalAttestations
            )
        );

        // Crear attestation
        attestations[uid] = Attestation({
            uid: uid,
            recipient: recipient,
            attestor: msg.sender,
            attestationType: attestationType,
            status: AttestationStatus.ACTIVE,
            timestamp: block.timestamp,
            expirationTime: expirationTime,
            schemaId: schemaId,
            data: data
        });

        // Agregar a lista de usuario
        userAttestations[recipient].push(uid);

        // Incrementar contador
        totalAttestations++;

        emit AttestationCreated(
            uid,
            recipient,
            msg.sender,
            attestationType,
            schemaId,
            block.timestamp
        );

        return uid;
    }

    /**
     * @notice Crear attestation de completación de actividad (NFC/QR scan)
     * @dev Previene duplicados usando hash de eventId+activityId+user
     * @param recipient Wallet del usuario que completó la actividad
     * @param eventId ID del evento (convertido a bytes32)
     * @param activityId ID de la actividad (convertido a bytes32)
     * @param tokensAwarded Cantidad de tokens SWAG otorgados
     * @param scanType "nfc" o "qr"
     * @param activityName Nombre de la actividad
     * @return uid ID único de la attestation creada
     */
    function attestActivityCompletion(
        address recipient,
        bytes32 eventId,
        bytes32 activityId,
        uint256 tokensAwarded,
        string calldata scanType,
        string calldata activityName
    )
        external
        onlyAttestor
        whenNotPaused
        returns (bytes32 uid)
    {
        // Generar hash único para prevenir duplicados
        bytes32 completionHash = keccak256(
            abi.encodePacked(eventId, activityId, recipient)
        );

        require(
            activityCompletions[completionHash] == bytes32(0),
            "Activity already attested"
        );

        // Codificar datos específicos
        bytes memory data = abi.encode(
            eventId,
            activityId,
            tokensAwarded,
            scanType,
            activityName,
            block.timestamp
        );

        // Schema por defecto para activity completion
        bytes32 schemaId = keccak256("ACTIVITY_COMPLETION_V1");

        // Crear attestation
        uid = attest(
            recipient,
            AttestationType.ACTIVITY_COMPLETION,
            schemaId,
            data,
            0 // Sin expiración
        );

        // Marcar como completado
        activityCompletions[completionHash] = uid;

        return uid;
    }

    /**
     * @notice Crear attestation de validación de evidencia
     * @param recipient Wallet del usuario
     * @param activityId ID de la actividad
     * @param proofId ID de la evidencia en la base de datos
     * @param proofType Tipo de evidencia ("image", "text", "transaction", "referral")
     * @param approved Si fue aprobada o rechazada
     * @param tokensAwarded Tokens otorgados (si fue aprobada)
     * @return uid ID único de la attestation
     */
    function attestProofValidation(
        address recipient,
        bytes32 activityId,
        bytes32 proofId,
        string calldata proofType,
        bool approved,
        uint256 tokensAwarded
    )
        external
        onlyValidator
        whenNotPaused
        returns (bytes32 uid)
    {
        // Codificar datos
        bytes memory data = abi.encode(
            activityId,
            proofId,
            proofType,
            approved,
            msg.sender, // validator
            tokensAwarded,
            block.timestamp
        );

        // Schema para proof validation
        bytes32 schemaId = keccak256("PROOF_VALIDATION_V1");

        // Crear attestation
        uid = attest(
            recipient,
            AttestationType.PROOF_VALIDATION,
            schemaId,
            data,
            0 // Sin expiración
        );

        return uid;
    }

    /**
     * @notice Revocar una attestation
     * @param uid ID de la attestation a revocar
     * @param reason Razón de la revocación
     */
    function revoke(bytes32 uid, string calldata reason)
        external
        onlyRevoker
    {
        require(attestations[uid].uid != bytes32(0), "Attestation not found");
        require(
            attestations[uid].status == AttestationStatus.ACTIVE,
            "Attestation not active"
        );

        attestations[uid].status = AttestationStatus.REVOKED;

        emit AttestationRevoked(uid, msg.sender, reason, block.timestamp);
    }

    /**
     * @notice Batch: Crear múltiples attestations de actividades
     * @dev Optimización de gas para crear múltiples attestations a la vez
     * @param params Array de parámetros para cada attestation
     * @return uids Array de UIDs de las attestations creadas
     */
    function batchAttestActivities(
        BatchActivityParams[] calldata params
    )
        external
        onlyAttestor
        whenNotPaused
        returns (bytes32[] memory uids)
    {
        uint256 length = params.length;
        uids = new bytes32[](length);

        for (uint256 i = 0; i < length; i++) {
            uids[i] = this.attestActivityCompletion(
                params[i].recipient,
                params[i].eventId,
                params[i].activityId,
                params[i].tokensAwarded,
                params[i].scanType,
                params[i].activityName
            );
        }

        return uids;
    }

    // ============================================
    // FUNCIONES DE SCHEMA MANAGEMENT
    // ============================================

    /**
     * @notice Registrar un nuevo schema
     * @param name Nombre del schema
     * @param description Descripción
     * @param attestationType Tipo de attestation
     * @return schemaId ID del schema creado
     */
    function registerSchema(
        string calldata name,
        string calldata description,
        AttestationType attestationType
    )
        external
        onlyOwner
        returns (bytes32 schemaId)
    {
        schemaId = keccak256(
            abi.encodePacked(name, attestationType, block.timestamp)
        );

        schemas[schemaId] = AttestationSchema({
            schemaId: schemaId,
            name: name,
            description: description,
            attestationType: attestationType,
            active: true,
            createdAt: block.timestamp
        });

        totalSchemas++;

        emit SchemaRegistered(
            schemaId,
            name,
            attestationType,
            block.timestamp
        );

        return schemaId;
    }

    /**
     * @notice Desactivar un schema
     * @param schemaId ID del schema
     */
    function deactivateSchema(bytes32 schemaId) external onlyOwner {
        require(schemas[schemaId].schemaId != bytes32(0), "Schema not found");
        schemas[schemaId].active = false;
        emit SchemaDeactivated(schemaId, block.timestamp);
    }

    /**
     * @notice Registrar schemas por defecto
     * @dev Se llama automáticamente en el constructor
     */
    function _registerDefaultSchemas() internal {
        // Schema para activity completion
        bytes32 activitySchemaId = keccak256("ACTIVITY_COMPLETION_V1");
        schemas[activitySchemaId] = AttestationSchema({
            schemaId: activitySchemaId,
            name: "ACTIVITY_COMPLETION_V1",
            description: "Attestation for NFC/QR activity completion",
            attestationType: AttestationType.ACTIVITY_COMPLETION,
            active: true,
            createdAt: block.timestamp
        });
        totalSchemas++;

        // Schema para proof validation
        bytes32 proofSchemaId = keccak256("PROOF_VALIDATION_V1");
        schemas[proofSchemaId] = AttestationSchema({
            schemaId: proofSchemaId,
            name: "PROOF_VALIDATION_V1",
            description: "Attestation for proof validation (admin approval)",
            attestationType: AttestationType.PROOF_VALIDATION,
            active: true,
            createdAt: block.timestamp
        });
        totalSchemas++;
    }

    // ============================================
    // VIEW FUNCTIONS
    // ============================================

    /**
     * @notice Obtener attestation por UID
     * @param uid ID de la attestation
     * @return Attestation completa
     */
    function getAttestation(bytes32 uid)
        external
        view
        returns (Attestation memory)
    {
        return attestations[uid];
    }

    /**
     * @notice Obtener todas las attestations de un usuario
     * @param user Dirección del usuario
     * @return Array de UIDs
     */
    function getUserAttestations(address user)
        external
        view
        returns (bytes32[] memory)
    {
        return userAttestations[user];
    }

    /**
     * @notice Obtener cantidad de attestations de un usuario
     * @param user Dirección del usuario
     * @return Cantidad de attestations
     */
    function getUserAttestationCount(address user)
        external
        view
        returns (uint256)
    {
        return userAttestations[user].length;
    }

    /**
     * @notice Verificar si una attestation es válida
     * @param uid ID de la attestation
     * @return true si es válida
     */
    function isValid(bytes32 uid) external view returns (bool) {
        Attestation memory att = attestations[uid];

        if (att.uid == bytes32(0)) return false;
        if (att.status != AttestationStatus.ACTIVE) return false;
        if (att.expirationTime != 0 && block.timestamp > att.expirationTime) {
            return false;
        }

        return true;
    }

    /**
     * @notice Verificar si una actividad ya fue completada
     * @param eventId ID del evento
     * @param activityId ID de la actividad
     * @param user Dirección del usuario
     * @return true si ya fue completada
     */
    function isActivityCompleted(
        bytes32 eventId,
        bytes32 activityId,
        address user
    ) external view returns (bool) {
        bytes32 completionHash = keccak256(
            abi.encodePacked(eventId, activityId, user)
        );
        return activityCompletions[completionHash] != bytes32(0);
    }

    /**
     * @notice Obtener el UID de una actividad completada
     * @param eventId ID del evento
     * @param activityId ID de la actividad
     * @param user Dirección del usuario
     * @return UID de la attestation (bytes32(0) si no existe)
     */
    function getActivityCompletionUid(
        bytes32 eventId,
        bytes32 activityId,
        address user
    ) external view returns (bytes32) {
        bytes32 completionHash = keccak256(
            abi.encodePacked(eventId, activityId, user)
        );
        return activityCompletions[completionHash];
    }

    /**
     * @notice Decodificar datos de activity completion
     * @param uid ID de la attestation
     * @return Datos decodificados
     */
    function decodeActivityCompletion(bytes32 uid)
        external
        view
        returns (ActivityCompletionData memory)
    {
        Attestation memory att = attestations[uid];
        require(att.uid != bytes32(0), "Attestation not found");
        require(
            att.attestationType == AttestationType.ACTIVITY_COMPLETION,
            "Wrong attestation type"
        );

        (
            bytes32 eventId,
            bytes32 activityId,
            uint256 tokensAwarded,
            string memory scanType,
            string memory activityName,
            uint256 completedAt
        ) = abi.decode(
            att.data,
            (bytes32, bytes32, uint256, string, string, uint256)
        );

        return ActivityCompletionData({
            eventId: eventId,
            activityId: activityId,
            tokensAwarded: tokensAwarded,
            scanType: scanType,
            activityName: activityName,
            completedAt: completedAt
        });
    }

    /**
     * @notice Decodificar datos de proof validation
     * @param uid ID de la attestation
     * @return Datos decodificados
     */
    function decodeProofValidation(bytes32 uid)
        external
        view
        returns (ProofValidationData memory)
    {
        Attestation memory att = attestations[uid];
        require(att.uid != bytes32(0), "Attestation not found");
        require(
            att.attestationType == AttestationType.PROOF_VALIDATION,
            "Wrong attestation type"
        );

        (
            bytes32 activityId,
            bytes32 proofId,
            string memory proofType,
            bool approved,
            address validator,
            uint256 tokensAwarded,
            uint256 validatedAt
        ) = abi.decode(
            att.data,
            (bytes32, bytes32, string, bool, address, uint256, uint256)
        );

        return ProofValidationData({
            activityId: activityId,
            proofId: proofId,
            proofType: proofType,
            approved: approved,
            validator: validator,
            tokensAwarded: tokensAwarded,
            validatedAt: validatedAt
        });
    }

    /**
     * @notice Obtener schema por ID
     * @param schemaId ID del schema
     * @return Schema completo
     */
    function getSchema(bytes32 schemaId)
        external
        view
        returns (AttestationSchema memory)
    {
        return schemas[schemaId];
    }

    // ============================================
    // FUNCIONES ADMIN
    // ============================================

    /**
     * @notice Pausar el contrato
     */
    function pause() external onlyOwner {
        paused = true;
    }

    /**
     * @notice Despausar el contrato
     */
    function unpause() external onlyOwner {
        paused = false;
    }
}
