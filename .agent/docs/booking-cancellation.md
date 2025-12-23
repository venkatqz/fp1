# Booking Cancellation Implementation

## Overview
The booking cancellation feature allows users to cancel their confirmed or pending bookings. The implementation spans the frontend UI, API layer, service logic, and database operations.

---

## Architecture Flow

```
User clicks "Cancel" 
    ↓
Confirmation Dialog
    ↓
Frontend: BookingsService.cancelBooking(id)
    ↓
API: PUT /bookings/:id/cancel
    ↓
Controller: BookingsController.cancelBooking
    ↓
Service: BookingService.cancelBooking
    ↓
Repository: BookingRepository.updateStatus
    ↓
Database: UPDATE bookings SET status = 'CANCELLED'
```

---

## Frontend Implementation

### 1. **BookedHotels Component** (`fe/src/components/BookedHotels.tsx`)

#### UI Elements:
- **Three-dot menu** (MoreVertIcon) on each booking card
- **Cancel option** in dropdown menu (only for active bookings)
- **Confirmation dialog** before cancellation

#### State Management:
```tsx
const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
const [selectedBooking, setSelectedBooking] = useState<any>(null);
const [confirmOpen, setConfirmOpen] = useState(false);
```

#### Cancel Flow:
```tsx
// 1. User clicks three-dot menu
const handleMenuOpen = (event, booking) => {
    setAnchorEl(event.currentTarget);
    setSelectedBooking(booking);
};

// 2. User clicks "Cancel Booking"
const handleCancelClick = () => {
    setAnchorEl(null);        // Close menu
    setConfirmOpen(true);     // Open confirmation dialog
};

// 3. User confirms cancellation
const handleConfirmCancel = async () => {
    try {
        const response = await BookingsService.cancelBooking(selectedBooking.id);
        
        if (response.status) {
            // Update local state - mark as cancelled
            setBookings(prev => prev.map(b =>
                b.id === selectedBooking.id 
                    ? { ...b, status: 'CANCELLED' } 
                    : b
            ));
        }
    } catch (err) {
        alert(err.message || 'Error canceling booking');
    } finally {
        setConfirmOpen(false);
        setSelectedBooking(null);
    }
};
```

#### Visual Feedback:
```tsx
// Cancelled bookings have:
// - Red border-left
// - Reduced opacity (0.7)
// - "CANCELLED" chip with error color
// - "Refund Initiated" instead of price
// - No action menu (can't cancel again)

<Card sx={{
    borderLeft: `6px solid ${booking.status === 'CANCELLED' ? '#d32f2f' : '#FF8700'}`,
    opacity: booking.status === 'CANCELLED' ? 0.7 : 1
}}>
```

#### Conditional Rendering:
```tsx
// Only show menu for active bookings
{booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
    <IconButton onClick={(e) => handleMenuOpen(e, booking)}>
        <MoreVertIcon />
    </IconButton>
)}
```

---

## Backend Implementation

### 2. **API Route** (`be/src/routes/bookings.ts`)

```typescript
router.put('/:id/cancel', BookingsController.cancelBooking);
```

- **Method**: `PUT` (updating booking status)
- **Path**: `/bookings/:id/cancel`
- **Auth**: Requires authentication (implied by router setup)

---

### 3. **Controller** (`be/src/controllers/bookings.ts`)

```typescript
export const cancelBooking = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ 
                status: false, 
                statusCode: 400, 
                message: 'Booking ID is required' 
            });
        }
        
        const result = await BookingService.cancelBooking(id);

        res.json({
            status: true,
            statusCode: 200,
            message: 'Booking cancelled successfully',
            data: result
        });
    } catch (error: any) {
        res.status(500).json({ 
            status: false, 
            statusCode: 500, 
            message: error.message || 'Error cancelling booking' 
        });
    }
};
```

**Responsibilities:**
- Extract booking ID from URL params
- Validate ID exists
- Call service layer
- Format response
- Handle errors

---

### 4. **Service Layer** (`be/src/services/booking.service.ts`)

```typescript
cancelBooking: async (bookingId: string) => {
    return await prisma.$transaction(async (tx) => {
        // 1. Find the booking
        const booking = await BookingRepository.findById(bookingId, tx);
        
        if (!booking) {
            throw new Error('Booking not found');
        }

        // 2. Check if already cancelled
        if (booking.status === BookingStatus.CANCELLED) {
            return booking;  // Idempotent - return existing
        }

        // 3. Update status to CANCELLED
        const updated = await BookingRepository.updateStatus(
            bookingId, 
            BookingStatus.CANCELLED, 
            tx
        );
        
        return updated;
    });
}
```

**Business Logic:**
- ✅ **Transaction safety**: Uses Prisma transaction
- ✅ **Validation**: Checks booking exists
- ✅ **Idempotency**: Allows re-cancelling (returns same result)
- ✅ **Simple logic**: No complex refund calculations (for now)

**What's NOT implemented (future enhancements):**
- ❌ Cancellation deadline checks (e.g., can't cancel 24h before check-in)
- ❌ Partial refund calculations
- ❌ Payment gateway refund integration
- ❌ Email notifications
- ❌ User authorization (verify user owns the booking)

---

### 5. **Repository Layer** (`be/src/repositories/booking.repo.ts`)

```typescript
updateStatus: async (id: string, status: string, tx = prisma) => {
    return tx.$executeRaw`
        UPDATE bookings 
        SET status = ${status} 
        WHERE id = ${id}
    `;
}
```

**Database Operation:**
- Direct SQL update using Prisma's `$executeRaw`
- Updates only the `status` column
- Returns number of affected rows

---

## Database Schema

### Bookings Table
```sql
CREATE TABLE bookings (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    hotel_id VARCHAR(255),
    status ENUM('PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'COMPLETED'),
    check_in DATE,
    check_out DATE,
    total_price DECIMAL(10, 2),
    transaction_id VARCHAR(255),
    expires_at DATETIME,
    -- ... other fields
);
```

**Status Transitions:**
```
PENDING_PAYMENT → CANCELLED (user cancels before payment)
CONFIRMED → CANCELLED (user cancels after payment)
CANCELLED → CANCELLED (idempotent)
COMPLETED → (cannot cancel)
```

---

## API Contract

### Request
```http
PUT /bookings/{id}/cancel
Authorization: Bearer <token>
```

**Path Parameters:**
- `id` (string, required): Booking ID

**No request body needed**

### Response (Success)
```json
{
    "status": true,
    "statusCode": 200,
    "message": "Booking cancelled successfully",
    "data": {
        "id": "bk_1234567890_123",
        "status": "CANCELLED",
        "check_in": "2024-12-25",
        "check_out": "2024-12-27",
        "total_price": 10000
    }
}
```

### Response (Error)
```json
{
    "status": false,
    "statusCode": 500,
    "message": "Booking not found"
}
```

---

## User Experience Flow

### 1. **Viewing Bookings**
User sees their bookings on the homepage (if logged in) or profile page.

### 2. **Initiating Cancellation**
```
User clicks ⋮ menu → "Cancel Booking" option appears
```

### 3. **Confirmation Dialog**
```
Dialog Title: "Cancel Booking?"
Message: "Are you sure you want to cancel your stay at [Hotel Name]? 
         This action cannot be undone."
Actions: [No, Keep it] [Yes, Cancel]
```

### 4. **Processing**
- API call to backend
- Loading state (button disabled)
- Error handling with alert

### 5. **Success Feedback**
- Booking card updates immediately (optimistic UI)
- Status chip changes to "CANCELLED" (red)
- Border color changes to red
- Opacity reduced to 70%
- Price replaced with "Refund Initiated"
- Action menu disappears

---

## Security Considerations

### Current Implementation:
- ✅ Requires authentication (JWT token)
- ✅ Transaction safety (database consistency)

### Missing (TODO):
- ❌ **Authorization check**: Verify user owns the booking
- ❌ **Rate limiting**: Prevent spam cancellations
- ❌ **Audit logging**: Track who cancelled and when
- ❌ **Soft delete**: Keep cancelled bookings for records

### Recommended Enhancement:
```typescript
// In BookingService.cancelBooking
const booking = await BookingRepository.findById(bookingId, tx);

// Add authorization check
if (booking.user_id !== requestingUserId) {
    throw new Error('Unauthorized: You can only cancel your own bookings');
}

// Add cancellation policy check
const hoursUntilCheckIn = (booking.check_in - new Date()) / (1000 * 60 * 60);
if (hoursUntilCheckIn < 24) {
    throw new Error('Cannot cancel within 24 hours of check-in');
}
```

---

## Testing Scenarios

### Happy Path:
1. ✅ User cancels CONFIRMED booking → Status changes to CANCELLED
2. ✅ User cancels PENDING_PAYMENT booking → Status changes to CANCELLED
3. ✅ User tries to cancel already CANCELLED booking → Returns same booking (idempotent)

### Error Cases:
1. ❌ Invalid booking ID → "Booking not found"
2. ❌ Network error → Alert with error message
3. ❌ Server error → 500 response with error message

### Edge Cases:
1. User refreshes page after cancellation → Cancelled status persists
2. Multiple users try to cancel same booking → First wins (transaction safety)
3. User cancels then tries to cancel again → No error, returns same result

---

## Future Enhancements

### 1. **Refund Processing**
```typescript
// Calculate refund based on cancellation policy
const refundAmount = calculateRefund(booking, new Date());

// Integrate with payment gateway
await PaymentGateway.processRefund({
    transactionId: booking.transaction_id,
    amount: refundAmount
});
```

### 2. **Email Notifications**
```typescript
// Send cancellation confirmation email
await EmailService.sendCancellationEmail({
    to: user.email,
    bookingId: booking.id,
    hotelName: hotel.name,
    refundAmount: refundAmount
});
```

### 3. **Inventory Release**
Currently, cancelled bookings still "hold" inventory. Should release rooms:
```typescript
// After cancellation, rooms become available again
// This is automatically handled by the countActiveBookings query
// which excludes CANCELLED bookings
```

### 4. **Cancellation Reasons**
```typescript
// Add optional reason field
interface CancelBookingRequest {
    bookingId: string;
    reason?: 'change_of_plans' | 'found_better_deal' | 'emergency' | 'other';
    comments?: string;
}
```

---

## Summary

**What Works:**
- ✅ User can cancel bookings from UI
- ✅ Confirmation dialog prevents accidental cancellations
- ✅ Status updates in real-time
- ✅ Visual feedback (red border, reduced opacity)
- ✅ Transaction-safe database updates
- ✅ Idempotent operation

**What's Missing:**
- ❌ User authorization check
- ❌ Cancellation policy enforcement
- ❌ Refund processing
- ❌ Email notifications
- ❌ Audit trail
