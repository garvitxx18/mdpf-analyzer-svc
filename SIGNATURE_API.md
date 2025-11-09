# Signature Management API

Complete API reference for managing signatures used in custom index creation.

## Base URL

```
http://localhost:3000
```

---

## Overview

Signatures define the sector composition rules for custom index creation. They specify which sectors to include and their percentage allocations. Once a signature is created, it can be reused to generate multiple custom indexes based on approved constituent scores.

### Key Concepts

- **Signature**: A reusable configuration that defines sector allocations
- **Composition**: Array of sector-percentage pairs that must sum to 100%
- **Custom Index**: Generated index that uses a signature to select top-scoring constituents from approved scores

---

## Endpoints

### POST /index/signature

Creates a new signature configuration.

**Request Body:**
```json
{
  "name": "GreenGrowthIndex",
  "description": "Tech and Energy focused index",
  "composition": [
    { "sector": "Technology", "percentage": 40 },
    { "sector": "Energy", "percentage": 30 },
    { "sector": "Finance", "percentage": 30 }
  ],
  "createdBy": "user123"
}
```

**Request Schema:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Name of the signature (e.g., "GreenGrowthIndex") |
| `description` | string | No | Optional description of the signature |
| `composition` | array | Yes | Array of sector allocation objects |
| `composition[].sector` | string | Yes | Sector name (e.g., "Technology", "Energy", "Finance") |
| `composition[].percentage` | number | Yes | Percentage allocation (0-100) |
| `createdBy` | string | Yes | Username of the creator |

**Validation Rules:**
- Composition percentages must sum to exactly 100
- Each sector percentage must be between 0 and 100
- At least one sector must be specified

**Response (201 Created):**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440000",
  "name": "GreenGrowthIndex",
  "description": "Tech and Energy focused index",
  "composition": [
    { "sector": "Technology", "percentage": 40 },
    { "sector": "Energy", "percentage": 30 },
    { "sector": "Finance", "percentage": 30 }
  ],
  "createdBy": "user123",
  "createdAt": "2025-11-08T10:00:00Z"
}
```

**Response Schema:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Unique identifier for the signature |
| `name` | string | Signature name |
| `description` | string \| null | Signature description |
| `composition` | array | Array of sector allocation objects |
| `composition[].sector` | string | Sector name |
| `composition[].percentage` | number | Percentage allocation |
| `createdBy` | string | Creator username |
| `createdAt` | Date (ISO 8601) | Creation timestamp |

**Example Request:**
```bash
curl -X POST http://localhost:3000/index/signature \
  -H "Content-Type: application/json" \
  -d '{
    "name": "GreenGrowthIndex",
    "description": "Tech and Energy focused index",
    "composition": [
      { "sector": "Technology", "percentage": 40 },
      { "sector": "Energy", "percentage": 30 },
      { "sector": "Finance", "percentage": 30 }
    ],
    "createdBy": "user123"
  }'
```

**Example Response:**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440000",
  "name": "GreenGrowthIndex",
  "description": "Tech and Energy focused index",
  "composition": [
    { "sector": "Technology", "percentage": 40 },
    { "sector": "Energy", "percentage": 30 },
    { "sector": "Finance", "percentage": 30 }
  ],
  "createdBy": "user123",
  "createdAt": "2025-11-08T10:00:00Z"
}
```

**Error Responses:**

**400 Bad Request** - Invalid composition percentages:
```json
{
  "message": "Composition percentages must sum to 100. Current sum: 95"
}
```

**Status Code:** `400`

---

### GET /index/signature

Retrieves all signatures.

**Response (200 OK):**
```json
[
  {
    "id": "770e8400-e29b-41d4-a716-446655440000",
    "name": "GreenGrowthIndex",
    "description": "Tech and Energy focused index",
    "composition": [
      { "sector": "Technology", "percentage": 40 },
      { "sector": "Energy", "percentage": 30 },
      { "sector": "Finance", "percentage": 30 }
    ],
    "createdBy": "user123",
    "createdAt": "2025-11-08T10:00:00Z"
  },
  {
    "id": "880e8400-e29b-41d4-a716-446655440000",
    "name": "BalancedPortfolio",
    "description": "Equal weight across sectors",
    "composition": [
      { "sector": "Technology", "percentage": 25 },
      { "sector": "Finance", "percentage": 25 },
      { "sector": "Energy", "percentage": 25 },
      { "sector": "Healthcare", "percentage": 25 }
    ],
    "createdBy": "user456",
    "createdAt": "2025-11-08T11:00:00Z"
  }
]
```

**Response Schema:**
- Array of signature objects (same structure as POST response)

**Example Request:**
```bash
curl http://localhost:3000/index/signature
```

**Example Response:**
```json
[
  {
    "id": "770e8400-e29b-41d4-a716-446655440000",
    "name": "GreenGrowthIndex",
    "description": "Tech and Energy focused index",
    "composition": [
      { "sector": "Technology", "percentage": 40 },
      { "sector": "Energy", "percentage": 30 },
      { "sector": "Finance", "percentage": 30 }
    ],
    "createdBy": "user123",
    "createdAt": "2025-11-08T10:00:00Z"
  }
]
```

**Status Code:** `200`

---

### GET /index/signature/:id

Retrieves a specific signature by ID.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | Yes | Signature ID |

**Response (200 OK):**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440000",
  "name": "GreenGrowthIndex",
  "description": "Tech and Energy focused index",
  "composition": [
    { "sector": "Technology", "percentage": 40 },
    { "sector": "Energy", "percentage": 30 },
    { "sector": "Finance", "percentage": 30 }
  ],
  "createdBy": "user123",
  "createdAt": "2025-11-08T10:00:00Z"
}
```

**Response Schema:**
- Same structure as POST response

**Example Request:**
```bash
curl http://localhost:3000/index/signature/770e8400-e29b-41d4-a716-446655440000
```

**Example Response:**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440000",
  "name": "GreenGrowthIndex",
  "description": "Tech and Energy focused index",
  "composition": [
    { "sector": "Technology", "percentage": 40 },
    { "sector": "Energy", "percentage": 30 },
    { "sector": "Finance", "percentage": 30 }
  ],
  "createdBy": "user123",
  "createdAt": "2025-11-08T10:00:00Z"
}
```

**Error Responses:**

**404 Not Found** - Signature not found:
```json
{
  "error": "Signature not found"
}
```

**Status Code:** `404`

---

## Usage Examples

### Example 1: Create a Tech-Heavy Signature

```bash
curl -X POST http://localhost:3000/index/signature \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TechHeavyIndex",
    "description": "Technology-focused portfolio",
    "composition": [
      { "sector": "Technology", "percentage": 60 },
      { "sector": "Finance", "percentage": 25 },
      { "sector": "Healthcare", "percentage": 15 }
    ],
    "createdBy": "pm_user"
  }'
```

### Example 2: Create a Balanced Signature

```bash
curl -X POST http://localhost:3000/index/signature \
  -H "Content-Type: application/json" \
  -d '{
    "name": "BalancedPortfolio",
    "description": "Equal weight across major sectors",
    "composition": [
      { "sector": "Technology", "percentage": 20 },
      { "sector": "Finance", "percentage": 20 },
      { "sector": "Energy", "percentage": 20 },
      { "sector": "Healthcare", "percentage": 20 },
      { "sector": "Consumer Goods", "percentage": 20 }
    ],
    "createdBy": "pm_user"
  }'
```

### Example 3: List All Signatures

```bash
curl http://localhost:3000/index/signature
```

### Example 4: Get Specific Signature

```bash
curl http://localhost:3000/index/signature/770e8400-e29b-41d4-a716-446655440000
```

---

## Integration with Custom Index Creation

Once a signature is created, it can be used to generate custom indexes:

1. **Create Signature** (one-time setup):
```bash
POST /index/signature
{
  "name": "GreenGrowthIndex",
  "composition": [
    { "sector": "Technology", "percentage": 40 },
    { "sector": "Energy", "percentage": 30 },
    { "sector": "Finance", "percentage": 30 }
  ],
  "createdBy": "user123"
}
```

2. **Use Signature to Create Custom Index**:
```bash
POST /index/custom
{
  "signatureId": "770e8400-e29b-41d4-a716-446655440000",
  "name": "GreenGrowthIndex_2025-11-08"
}
```

The custom index creation will:
- Use approved constituent scores from the latest effective date
- Select top-scoring constituents per sector based on signature percentages
- Generate a custom index with the selected constituents

---

## Common Sector Names

Common sector names used in the system:
- `Technology`
- `Finance`
- `Energy`
- `Healthcare`
- `Consumer Goods`
- `Telecommunications`
- `Industrial`
- `Materials`
- `Utilities`
- `Real Estate`

**Note:** Sector names must match exactly with the sectors assigned to constituent scores. Use the same sector names that appear in your index constituents.

---

## Validation Rules

### Composition Validation

1. **Percentage Sum**: All percentages must sum to exactly 100
   - ✅ Valid: `[40, 30, 30]` = 100
   - ❌ Invalid: `[40, 30, 25]` = 95
   - ❌ Invalid: `[40, 30, 35]` = 105

2. **Individual Percentages**: Each percentage must be between 0 and 100
   - ✅ Valid: `[50, 30, 20]`
   - ❌ Invalid: `[150, -10, -40]`

3. **At Least One Sector**: Must have at least one sector in composition
   - ✅ Valid: `[{ "sector": "Technology", "percentage": 100 }]`
   - ❌ Invalid: `[]`

---

## Error Handling

### Common Errors

**400 Bad Request - Invalid Percentage Sum:**
```json
{
  "message": "Composition percentages must sum to 100. Current sum: 95"
}
```

**Solution:** Ensure all percentages add up to exactly 100.

**400 Bad Request - Invalid Percentage Range:**
```json
{
  "message": "Each percentage must be between 0 and 100"
}
```

**Solution:** Check that all percentages are within the valid range.

**500 Internal Server Error:**
```json
{
  "message": "Failed to create signature"
}
```

**Solution:** Check database connection and try again.

---

## Frontend Integration Tips

1. **Percentage Validation**: Implement client-side validation to ensure percentages sum to 100 before submitting
2. **Sector Dropdown**: Use `GET /index/signature` to populate available signatures in dropdowns
3. **Real-time Sum Display**: Show running total of percentages as user adds sectors
4. **Signature Reuse**: Allow users to select existing signatures when creating custom indexes
5. **Error Handling**: Display validation errors clearly when percentage sum is incorrect

---

## Related Endpoints

- **POST /index/custom** - Create custom index using a signature
- **GET /approval/:effectiveDate** - Get approved scores for custom index creation
- **POST /index/score** - Score an index to generate constituent scores

---

## Complete Workflow

```
1. Create Signature
   POST /index/signature
   ↓
2. Score Index
   POST /index/score
   ↓
3. Approve Scores
   POST /approval/:effectiveDate/approve
   ↓
4. Create Custom Index
   POST /index/custom (uses signature from step 1)
```

---

## Notes

- Signatures are reusable - create once, use many times
- Signature composition percentages must sum to exactly 100
- Sector names are case-sensitive and must match constituent score sectors
- Signatures can be created before scoring indexes
- Custom indexes only use approved scores from the latest effective date

