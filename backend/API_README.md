# Neighbourly API Documentation

This document lists all currently implemented API endpoints, their request bodies, and response shapes.

## Base URL

- Local: `http://localhost:3000`
- API prefix: `/api/v1`
- Full API base: `http://localhost:3000/api/v1`

## Authentication

Protected endpoints require:

`Authorization: Bearer <jwt_token>`

## Standard Response Format

### Success

```json
{
  "success": true,
  "message": "Optional message",
  "data": {}
}
```

### Error (production)

```json
{
  "success": false,
  "status": "fail",
  "message": "Error message"
}
```

---

## Health Endpoints

### GET /health

- Auth: No
- Request body: None
- Response:

```json
{
  "status": "ok",
  "timestamp": "2026-04-24T10:00:00.000Z",
  "uptime": 1234.56,
  "environment": "development"
}
```

### GET /health/db

- Auth: No
- Request body: None
- Response (success):

```json
{
  "status": "ok",
  "database": {
    "connected": true,
    "time": "2026-04-24T10:00:00.000Z",
    "version": "16.2"
  }
}
```

### GET /health/pool

- Auth: No
- Request body: None
- Response:

```json
{
  "status": "ok",
  "pool": {
    "totalCount": 10,
    "idleCount": 8,
    "waitingCount": 0
  }
}
```

---

## API Info

### GET /api/v1

- Auth: No
- Request body: None
- Response:

```json
{
  "success": true,
  "message": "Neighbourly API v1 - Stage 2",
  "version": "1.0.0",
  "stage": 2,
  "endpoints": {
    "auth": "/api/v1/auth",
    "services": "/api/v1/services",
    "bookings": "/api/v1/bookings",
    "transactions": "/api/v1/transactions",
    "disputes": "/api/v1/disputes",
    "reviews": "/api/v1/reviews",
    "locations": "/api/v1/locations"
  },
  "features": {
    "geospatial": "H3 radius-based search",
    "auth": "JWT with RBAC",
    "payments": "Demo payment system",
    "disputes": "Regional moderation",
    "reviews": "Smart reputation algorithm",
    "locations": "Cities, neighborhoods, categories"
  }
}
```

---

## Auth APIs

Base path: `/api/v1/auth`

### POST /auth/register

- Auth: No
- Body:

```json
{
  "email": "user@example.com",
  "password": "StrongPassword123",
  "phone": "+15550000000",
  "role": "seeker",
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Optional bio"
}
```

- Response (201):

```json
{
  "success": true,
  "message": "Registration successful. Please verify the OTP sent to your email.",
  "data": {
    "email": "user@example.com"
  }
}
```

### POST /auth/login

- Auth: No
- Body:

```json
{
  "email": "user@example.com",
  "password": "StrongPassword123"
}
```

- Response:

```json
{
  "success": true,
  "message": "OTP sent to your email. Please verify to complete login.",
  "data": {
    "email": "user@example.com"
  }
}
```

### POST /auth/verify-otp

- Auth: No
- Body:

```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

- Response:

```json
{
  "success": true,
  "message": "Verification successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "seeker"
    },
    "token": "jwt-token"
  }
}
```

### GET /auth/me

- Auth: Yes
- Body: None
- Response:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "seeker"
    }
  }
}
```

### PATCH /auth/profile

- Auth: Yes
- Body:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Updated bio",
  "avatarUrl": "https://example.com/avatar.png"
}
```

- Response:

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "profile": {}
  }
}
```

---

## Services APIs

Base path: `/api/v1/services`

### GET /services/nearby

- Auth: No
- Note: This GET endpoint currently reads filters from request body.
- Body:

```json
{
  "lat": 24.8607,
  "lng": 67.0011,
  "radius": 5,
  "categoryId": 1,
  "minPrice": 10,
  "maxPrice": 100,
  "page": 1,
  "limit": 20
}
```

- Response:

```json
{
  "success": true,
  "data": {
    "services": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 0
    }
  }
}
```

### GET /services/search

- Auth: No
- Query params:
  - `q` (required, min 2 chars)
  - `categoryId` (optional)
  - `page` (optional, default 1)
  - `limit` (optional, default 20)
- Response:

```json
{
  "success": true,
  "data": {
    "services": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 0
    }
  }
}
```

### GET /services/:id

- Auth: No
- Body: None
- Response:

```json
{
  "success": true,
  "data": {
    "service": {}
  }
}
```

### POST /services

- Auth: Yes (provider, admin)
- Body: Dynamic service payload from model. Common fields include:

```json
{
  "title": "Home Cleaning",
  "description": "2 hour deep clean",
  "categoryId": 1,
  "priceAmount": 25,
  "priceType": "hourly",
  "cityId": 1,
  "neighborhoodId": 10,
  "lat": 24.8607,
  "lng": 67.0011
}
```

- Response (201):

```json
{
  "success": true,
  "message": "Service created successfully",
  "data": {
    "service": {}
  }
}
```

### GET /services/my/services

- Auth: Yes (provider, admin)
- Query params:
  - `status` (optional)
  - `page` (optional, default 1)
  - `limit` (optional, default 20)
- Response:

```json
{
  "success": true,
  "data": {
    "services": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 0
    }
  }
}
```

### PATCH /services/:id

- Auth: Yes (provider, admin)
- Body: Partial service fields to update

```json
{
  "title": "Updated title",
  "priceAmount": 30
}
```

- Response:

```json
{
  "success": true,
  "message": "Service updated successfully",
  "data": {
    "service": {}
  }
}
```

### DELETE /services/:id

- Auth: Yes (provider, admin)
- Body: None
- Response:

```json
{
  "success": true,
  "message": "Service deleted successfully"
}
```

---

## Booking APIs

Base path: `/api/v1/bookings`

All booking endpoints require auth.

### POST /bookings

- Body:

```json
{
  "serviceId": "uuid",
  "scheduledStart": "2026-04-25T09:00:00.000Z",
  "scheduledEnd": "2026-04-25T11:00:00.000Z",
  "specialInstructions": "Bring your own supplies"
}
```

- Response (201):

```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "booking": {}
  }
}
```

### GET /bookings

- Query params:
  - `role` (optional, default `both`)
  - `status` (optional)
  - `page` (optional, default 1)
  - `limit` (optional, default 20)
- Response:

```json
{
  "success": true,
  "data": {
    "bookings": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 0
    }
  }
}
```

### GET /bookings/upcoming

- Body: None
- Response:

```json
{
  "success": true,
  "data": {
    "bookings": []
  }
}
```

### GET /bookings/:id

- Body: None
- Response:

```json
{
  "success": true,
  "data": {
    "booking": {}
  }
}
```

### PATCH /bookings/:id/status

- Body:

```json
{
  "status": "confirmed"
}
```

Allowed status values: `confirmed`, `in_progress`, `completed`, `cancelled`.

- Response:

```json
{
  "success": true,
  "message": "Booking confirmed successfully",
  "data": {
    "booking": {}
  }
}
```

### POST /bookings/:id/cancel

- Body:

```json
{
  "reason": "Need to reschedule"
}
```

- Response:

```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "booking": {}
  }
}
```

---

## Transactions APIs

Base path: `/api/v1/transactions`

All transaction endpoints require auth.

### POST /transactions/pay

- Body:

```json
{
  "bookingId": "uuid",
  "paymentMethod": "demo_card"
}
```

- Response (201):

```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "transaction": {}
  }
}
```

### GET /transactions

- Query params:
  - `type` (optional, default `all`)
  - `page` (optional, default 1)
  - `limit` (optional, default 20)
- Response:

```json
{
  "success": true,
  "data": {
    "transactions": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 0
    }
  }
}
```

### GET /transactions/earnings

- Auth: Yes (provider, admin)
- Body: None
- Response:

```json
{
  "success": true,
  "data": {
    "summary": {}
  }
}
```

### GET /transactions/:id

- Body: None
- Response:

```json
{
  "success": true,
  "data": {
    "transaction": {}
  }
}
```

---

## Disputes APIs

Base path: `/api/v1/disputes`

All dispute endpoints require auth.

### POST /disputes

- Auth: Yes (seeker/provider/admin/moderator can call route; business logic is tied to booking participants)
- Body:

```json
{
  "bookingId": "uuid",
  "category": "service_quality",
  "description": "Service did not match listing",
  "evidence": {
    "images": ["https://example.com/image.jpg"],
    "notes": "Optional evidence details"
  }
}
```

- Response (201):

```json
{
  "success": true,
  "message": "Dispute created successfully",
  "data": {
    "dispute": {}
  }
}
```

### GET /disputes/my

- Query params:
  - `status` (optional)
  - `page` (optional, default 1)
  - `limit` (optional, default 20)
- Response:

```json
{
  "success": true,
  "data": {
    "disputes": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 0
    }
  }
}
```

### GET /disputes/regional

- Auth: Yes (moderator, admin)
- Query params:
  - `neighborhoodIds` (required comma-separated list, e.g. `1,2,3`)
  - `status` (optional)
  - `page` (optional, default 1)
  - `limit` (optional, default 50)
- Response:

```json
{
  "success": true,
  "data": {
    "disputes": [],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 0
    }
  }
}
```

### POST /disputes/:id/assign

- Auth: Yes (moderator, admin)
- Body: None
- Response:

```json
{
  "success": true,
  "message": "Dispute assigned successfully",
  "data": {
    "dispute": {}
  }
}
```

### POST /disputes/:id/resolve

- Auth: Yes (moderator, admin)
- Body:

```json
{
  "resolution": "Refund of 50% approved"
}
```

- Response:

```json
{
  "success": true,
  "message": "Dispute resolved successfully",
  "data": {
    "dispute": {}
  }
}
```

### POST /disputes/:id/close

- Auth: Yes (moderator, admin)
- Body: None
- Response:

```json
{
  "success": true,
  "message": "Dispute closed successfully",
  "data": {
    "dispute": {}
  }
}
```

### GET /disputes/:id

- Body: None
- Response:

```json
{
  "success": true,
  "data": {
    "dispute": {}
  }
}
```

---

## Reviews APIs

Base path: `/api/v1/reviews`

### GET /reviews/provider/:providerId

- Auth: No
- Query params:
  - `page` (optional, default 1)
  - `limit` (optional, default 5)
- Response:

```json
{
  "success": true,
  "data": {
    "reviews": [],
    "stats": {
      "averageRating": 4.8,
      "totalReviews": 24
    },
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 0
    }
  }
}
```

### GET /reviews/:id

- Auth: No
- Body: None
- Response:

```json
{
  "success": true,
  "data": {
    "review": {}
  }
}
```

### POST /reviews

- Auth: Yes
- Body:

```json
{
  "bookingId": "uuid",
  "rating": 5,
  "title": "Great service",
  "comment": "Very professional and on time",
  "isAnonymous": false
}
```

- Response (201):

```json
{
  "success": true,
  "message": "Review created successfully",
  "data": {
    "review": {}
  }
}
```

### POST /reviews/:id/response

- Auth: Yes
- Body:

```json
{
  "response": "Thank you for your feedback"
}
```

- Response:

```json
{
  "success": true,
  "message": "Response added successfully",
  "data": {
    "review": {}
  }
}
```

### POST /reviews/:id/flag

- Auth: Yes
- Body:

```json
{
  "reason": "Contains abusive language"
}
```

- Response:

```json
{
  "success": true,
  "message": "Review flagged for moderation",
  "data": {
    "review": {}
  }
}
```

---

## Locations APIs

Base path: `/api/v1/locations`

### GET /locations/cities

- Auth: No
- Body: None
- Response:

```json
{
  "success": true,
  "data": {
    "cities": []
  }
}
```

### GET /locations/cities/:id

- Auth: No
- Body: None
- Response:

```json
{
  "success": true,
  "data": {
    "city": {}
  }
}
```

### GET /locations/cities/:cityId/neighborhoods

- Auth: No
- Body: None
- Response:

```json
{
  "success": true,
  "data": {
    "neighborhoods": []
  }
}
```

### GET /locations/neighborhoods/:id

- Auth: No
- Body: None
- Response:

```json
{
  "success": true,
  "data": {
    "neighborhood": {}
  }
}
```

### GET /locations/neighborhoods/find

- Auth: No
- Query params:
  - `lat` (required)
  - `lng` (required)
- Response:

```json
{
  "success": true,
  "data": {
    "neighborhood": {},
    "h3Index": "8a2a1072b59ffff"
  }
}
```

### GET /locations/categories

- Auth: No
- Body: None
- Response:

```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "Home Services",
        "subcategories": []
      }
    ],
    "all": []
  }
}
```

### GET /locations/categories/:id

- Auth: No
- Body: None
- Response:

```json
{
  "success": true,
  "data": {
    "category": {},
    "subcategories": []
  }
}
```

### POST /locations/cities

- Auth: Yes (admin)
- Body:

```json
{
  "name": "Karachi",
  "stateProvince": "Sindh",
  "country": "Pakistan",
  "countryCode": "PK",
  "timezone": "Asia/Karachi"
}
```

- Response (201):

```json
{
  "success": true,
  "message": "City created successfully",
  "data": {
    "city": {}
  }
}
```

### POST /locations/neighborhoods

- Auth: Yes (admin)
- Body:

```json
{
  "cityId": 1,
  "name": "DHA Phase 5",
  "description": "Residential area",
  "coordinates": [
    [67.05, 24.82],
    [67.08, 24.82],
    [67.08, 24.85],
    [67.05, 24.85],
    [67.05, 24.82]
  ],
  "boundaryGeoJson": {
    "type": "Polygon",
    "coordinates": [
      [
        [67.05, 24.82],
        [67.08, 24.82],
        [67.08, 24.85],
        [67.05, 24.85],
        [67.05, 24.82]
      ]
    ]
  }
}
```

- Response (201):

```json
{
  "success": true,
  "message": "Neighborhood created successfully",
  "data": {
    "neighborhood": {}
  }
}
```

### POST /locations/categories

- Auth: Yes (admin)
- Body:

```json
{
  "parentId": null,
  "name": "Cleaning",
  "description": "Cleaning related services",
  "iconUrl": "https://example.com/icon.png",
  "sortOrder": 10
}
```

- Response (201):

```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "category": {}
  }
}
```

---

## Common Status Codes

- `200` OK
- `201` Created
- `400` Bad Request
- `401` Unauthorized
- `403` Forbidden
- `404` Not Found
- `409` Conflict
- `500` Internal Server Error
