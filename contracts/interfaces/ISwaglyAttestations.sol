// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ISwaglyAttestations
 * @notice Interface para el contrato SwaglyAttestations
 */
interface ISwaglyAttestations {

    // ============================================
    // ENUMS
    // ============================================

    enum AttestationType {
        ACTIVITY_COMPLETION,
        PROOF_VALIDATION,
        PASSPORT_CLAIM,
        REFERRAL_VERIFICATION,
        TRANSACTION_PROOF
    }

    enum AttestationStatus {
        ACTIVE,
        REVOKED,
        EXPIRED
    }

    // ============================================
    // STRUCTS
    // ============================================

    struct Attestation {
        bytes32 uid;
        address recipient;
        address attestor;
        AttestationType attestationType;
        AttestationStatus status;
        uint256 timestamp;
        uint256 expirationTime;
        bytes32 schemaId;
        bytes data;
    }

    struct AttestationSchema {
        bytes32 schemaId;
        string name;
        string description;
        AttestationType attestationType;
        bool active;
        uint256 createdAt;
    }

    struct ActivityCompletionData {
        bytes32 eventId;
        bytes32 activityId;
        uint256 tokensAwarded;
        string scanType;
        string activityName;
        uint256 completedAt;
    }

    struct ProofValidationData {
        bytes32 activityId;
        bytes32 proofId;
        string proofType;
        bool approved;
        address validator;
        uint256 tokensAwarded;
        uint256 validatedAt;
    }

    // ============================================
    // EVENTS
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

    // ============================================
    // FUNCTIONS
    // ============================================

    function attestActivityCompletion(
        address recipient,
        bytes32 eventId,
        bytes32 activityId,
        uint256 tokensAwarded,
        string calldata scanType,
        string calldata activityName
    ) external returns (bytes32 uid);

    function attestProofValidation(
        address recipient,
        bytes32 activityId,
        bytes32 proofId,
        string calldata proofType,
        bool approved,
        uint256 tokensAwarded
    ) external returns (bytes32 uid);

    function revoke(bytes32 uid, string calldata reason) external;

    function isValid(bytes32 uid) external view returns (bool);

    function isActivityCompleted(
        bytes32 eventId,
        bytes32 activityId,
        address user
    ) external view returns (bool);

    function getAttestation(bytes32 uid) external view returns (Attestation memory);

    function getUserAttestations(address user) external view returns (bytes32[] memory);
}
