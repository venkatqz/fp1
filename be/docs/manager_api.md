# Manager API Documentation

This document outlines the API endpoints available for Hotel Managers.

## 1. Get My Hotels
Fetch a list of all hotels where the current user is assigned as a manager.

- **Endpoint**: `GET /hotels/my-hotels`
- **Authentication**: Required (`Bearer <token>`)

### Request
No parameters required.

### Response
**Success (200 OK):**
```json
{
  "status": true,
  "statusCode": 200,
  "message": "My hotels retrieved",
  "data": [
    {
      "id": "uuid-string-123",
      "name": "Hotel Sunshine",
      "city": "Mumbai",
      "address": "123 Beach Road, Bandra",
      "description": "Luxury sea view hotel...",
      "rating": 4.5,
      "lowestPrice": 2500,
      "images": [
        "https://example.com/img1.jpg",
        "https://example.com/img2.jpg"
      ],
      "amenities": [], 
      "rooms": []
    }
  ]
}
```

**Errors:**
- `401 Unauthorized`: Token missing or invalid.

---

## 2. Get Hotel Bookings
Fetch all bookings associated with hotels managed by the current user.

- **Endpoint**: `GET /hotels/:id/bookings`
- **Authentication**: Required (`Bearer <token>`)

### Parameters
| Name | Type | In | Required | Description |
|------|------|----|----------|-------------|
| `id` | string | Path | Yes | Hotel ID (Note: Currently fetches *all* manager bookings) |

### Response
**Success (200 OK):**
```json
{
  "status": true,
  "statusCode": 200,
  "message": "My bookings retrieved",
  "data": [
    {
      "id": "booking-uuid-456",
      "hotelName": "Hotel Sunshine",
      "status": "CONFIRMED",
      "checkIn": "2024-12-01T14:00:00.000Z",
      "checkOut": "2024-12-05T11:00:00.000Z",
      "totalPrice": 12000,
      "guestName": "Rahul Sharma",
      "guestEmail": "rahul@example.com",
      "guestPhone": "9876543210",
      "rooms": "Deluxe Room (1), Super Deluxe (2)"
    }
  ]
}
```

**Errors:**
- `401 Unauthorized`: Token missing or invalid.
- `403 Forbidden`: User is not a manager.
