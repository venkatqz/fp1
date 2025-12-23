# TypeScript + Material-UI Learning Guide
## From Your Actual Codebase

This guide explains TypeScript and MUI patterns used in your hotel booking app with real code examples.

---

# Part 1: TypeScript Fundamentals

## 1.1 Type Annotations

TypeScript lets you define the "shape" of data.

```typescript
// Basic types
const name: string = "Hotel Grand";
const price: number = 5000;
const isAvailable: boolean = true;

// Arrays
const images: string[] = ["url1.jpg", "url2.jpg"];
const numbers: Array<number> = [1, 2, 3]; // Alternative syntax
```

### From Your Code (`HotelCard.tsx` line 25):
```typescript
// hotel.images could be undefined, so we check before accessing
const mainImage = (hotel.images && hotel.images.length > 0)
    ? hotel.images[0]
    : 'https://placehold.co/600x400?text=No+Image';
```

**What's happening:**
- `&&` is "short-circuit evaluation" - if first part is false, don't evaluate second
- This prevents `Cannot read property 'length' of undefined` error

---

## 1.2 Interfaces - Defining Object Shapes

```typescript
// From client/models/Hotel.ts (auto-generated)
interface Hotel {
    id: string;
    name: string;
    city: string;
    rating?: number;        // ? means optional (could be undefined)
    images: string[];
    amenities: Amenity[];   // Array of another interface
}
```

### Props Interface (`HotelCard.tsx` line 17-19):
```typescript
// Define what props this component expects
interface HotelCardProps {
    hotel: Hotel;  // Must pass a Hotel object
}

// Use it in the component
const HotelCard: React.FC<HotelCardProps> = ({ hotel }) => {
    // Now TypeScript knows hotel has .name, .city, .rating etc.
    return <Typography>{hotel.name}</Typography>;
};
```

**`React.FC<Props>`** = "React Functional Component" with these Props

---

## 1.3 Generics - Flexible Types

Generics let you create reusable components that work with different types.

```typescript
// useState with generic type
const [user, setUser] = useState<User | null>(null);
//                              ↑ Can be User OR null

const [hotels, setHotels] = useState<Hotel[]>([]);
//                                  ↑ Array of Hotel objects

const [formData, setFormData] = useState<any>({});
//                                      ↑ 'any' = disable type checking (use sparingly!)
```

### From `RoomTypeManager.tsx` (line 39):
```typescript
const [editingRoom, setEditingRoom] = useState<RoomType | null>(null);
```
- Initially `null` (no room being edited)
- Later becomes a `RoomType` object when editing

---

## 1.4 Event Types

When handling DOM events, TypeScript needs to know the event type:

### From `LoginPage.tsx` (line 22-24):
```typescript
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
};
```

**Common Event Types:**
| Event | Type |
|-------|------|
| Input change | `React.ChangeEvent<HTMLInputElement>` |
| Form submit | `React.FormEvent` |
| Button click | `React.MouseEvent<HTMLButtonElement>` |
| Select change | `SelectChangeEvent` (MUI specific) |

---

## 1.5 Nullish Coalescing & Optional Chaining

### Nullish Coalescing `??`
```typescript
// If left side is null/undefined, use right side
hotel.rating ?? 0        // If rating is undefined, use 0
hotel.description ?? ""  // If no description, use empty string
```

### Optional Chaining `?.`
```typescript
// Safely access nested properties
hotel.lowestPrice?.toLocaleString()  // Won't crash if lowestPrice is undefined
user?.name                            // Returns undefined instead of crashing
```

### From `HotelCard.tsx` (line 159):
```typescript
₹{hotel.lowestPrice?.toLocaleString() ?? 0}
//      ↑ If lowestPrice exists, format it
//                                    ↑ Otherwise show 0
```

---

## 1.6 Type Assertions

When you know the type better than TypeScript:

```typescript
// From LoginPage.tsx (line 35)
const data = response as any;  // Tell TS "trust me, treat this as any"

// From HotelCard.tsx (line 176)
navigate(`/hotel/${hotel.id}`, { state: { hotel } });
```

---

## 1.7 Union Types

A variable can be one of several types:

```typescript
type ToastType = 'success' | 'error' | 'warning' | 'info';

// From UIContext.tsx
const showToast = (config: ToastConfig) => { ... };
// config.type must be one of those 4 strings
```

---

# Part 2: Material-UI (MUI) Fundamentals

## 2.1 The `sx` Prop - Inline Styling

MUI's `sx` prop is a **powerful inline styling system** that:
- Uses theme values automatically
- Supports responsive design
- Enables pseudo-selectors like `:hover`

### Basic Usage (`HotelCard.tsx` line 32-46):
```tsx
<Card
    sx={{
        display: 'flex',           // CSS property
        flexDirection: 'column',
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',    // Uses theme.palette.divider
        borderRadius: 4,           // 4 * 8px = 32px (MUI spacing)
        transition: 'all 0.3s ease',
        
        // Hover state (like CSS :hover)
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
        }
    }}
>
```

### Spacing Shorthand:
| Prop | Meaning | Example |
|------|---------|---------|
| `m` | margin | `m: 2` = 16px (2 * 8) |
| `p` | padding | `p: 3` = 24px |
| `mt` | margin-top | `mt: 4` = 32px |
| `px` | padding-left + padding-right | `px: 2` = 16px each side |
| `py` | padding-top + padding-bottom | `py: 1.5` = 12px each |

### Theme Colors:
```tsx
bgcolor: 'primary.main'      // Primary color
bgcolor: 'secondary.light'   // Lighter secondary
color: 'text.primary'        // Main text color
color: 'text.secondary'      // Muted text
borderColor: 'divider'       // Standard divider color
bgcolor: 'grey.50'           // Very light grey
```

---

## 2.2 Common MUI Components

### Box - Generic Container
```tsx
// Box is like a <div> with sx superpowers
<Box sx={{ display: 'flex', gap: 2, p: 3 }}>
    {children}
</Box>
```

### Typography - Text Styling
```tsx
<Typography 
    variant="h5"           // Predefined size (h1-h6, body1, body2, caption)
    component="h3"         // Actual HTML tag rendered
    color="text.secondary" // Theme color
    fontWeight="bold"      // Font weight
    gutterBottom           // Adds margin-bottom
>
    Hotel Name
</Typography>
```

### Button Variants
```tsx
<Button variant="contained">Filled Button</Button>
<Button variant="outlined">Outlined Button</Button>
<Button variant="text">Text Button</Button>

// Full example from LoginPage.tsx (line 139-148):
<Button
    type="submit"
    fullWidth                // 100% width
    variant="contained"
    color="secondary"        // Use secondary theme color
    size="large"
    sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 'bold' }}
>
    Sign In
</Button>
```

### Stack - Flex Layout Helper
```tsx
// Horizontal row with spacing
<Stack direction="row" spacing={1} alignItems="center">
    <Icon />
    <Typography>Label</Typography>
</Stack>

// Vertical stack (default)
<Stack spacing={2}>
    <Item1 />
    <Item2 />
</Stack>
```

### Paper - Elevated Surface
```tsx
<Paper elevation={6} sx={{ p: 4, borderRadius: 3 }}>
    Content with shadow and padding
</Paper>
```

---

## 2.3 Form Components

### TextField (`LoginPage.tsx` line 115-126):
```tsx
<TextField
    margin="normal"          // Adds spacing
    required                 // Shows asterisk, basic validation
    fullWidth                // 100% width
    id="email"               // For label association
    label="Email Address"    // Floating label
    name="email"             // For form handling
    autoComplete="email"     // Browser autocomplete hint
    autoFocus               // Focus on page load
    value={formData.email}   // Controlled input
    onChange={handleChange}  // Update state on change
/>
```

### Table (`RoomTypeManager.tsx`):
```tsx
<TableContainer component={Paper}>
    <Table>
        <TableHead>
            <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Price</TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            {rooms.map((room) => (
                <TableRow key={room.id}>
                    <TableCell>{room.name}</TableCell>
                    <TableCell>₹{room.price}</TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
</TableContainer>
```

### Dialog (Modal)
```tsx
<Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
    <DialogTitle>Add Room Type</DialogTitle>
    <DialogContent>
        {/* Form fields */}
    </DialogContent>
    <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">Save</Button>
    </DialogActions>
</Dialog>
```

---

## 2.4 Icons

MUI provides Material Icons:

```tsx
// Import specific icons
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

// Use in JSX
<AddIcon />
<EditIcon fontSize="small" />
<LocationOnIcon color="primary" />

// Inside IconButton for clickable icons
<IconButton onClick={handleEdit}>
    <EditIcon />
</IconButton>
```

---

## 2.5 Conditional Rendering Patterns

### Short-circuit with `&&`
```tsx
// Only render if condition is true
{hotel.rating && (
    <Box>★ {hotel.rating}</Box>
)}

// Only show badge if rating >= 4.5
{(hotel.rating ?? 0) >= 4.5 && (
    <Box>Top Rated</Box>
)}
```

### Ternary for either/or
```tsx
{loading ? (
    <CircularProgress />
) : (
    <Button>Submit</Button>
)}
```

---

## 2.6 Layout with Grid

```tsx
<Grid container spacing={3}>
    <Grid item xs={12} md={6}>
        {/* Full width on mobile, half on medium+ */}
        <TextField />
    </Grid>
    <Grid item xs={12} md={6}>
        <TextField />
    </Grid>
</Grid>
```

**Breakpoints:**
| Prop | Screen Size |
|------|-------------|
| `xs` | 0px+ (mobile) |
| `sm` | 600px+ |
| `md` | 900px+ |
| `lg` | 1200px+ |
| `xl` | 1536px+ |

---

# Part 3: React Patterns in the Codebase

## 3.1 Controlled Form Pattern

```tsx
// State holds form data
const [formData, setFormData] = useState({
    email: '',
    password: '',
});

// Handler updates state from input
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
        ...prev,                    // Keep existing values
        [e.target.name]: e.target.value  // Update the changed field
    }));
};

// Input is "controlled" - value comes from state
<TextField
    name="email"
    value={formData.email}      // Controlled by state
    onChange={handleChange}     // Updates state
/>
```

## 3.2 Callback Props Pattern

Parent component passes a function to child:

```tsx
// Parent (ManageHotelPage.tsx)
<RoomTypeManager 
    hotelId={hotelId}
    rooms={rooms}
    onUpdate={() => fetchHotelDetails()}  // Refresh when child updates
/>

// Child (RoomTypeManager.tsx)
interface RoomTypeManagerProps {
    hotelId: string;
    rooms: RoomType[];
    onUpdate: () => void;  // Callback function type
}

const RoomTypeManager: React.FC<RoomTypeManagerProps> = ({ hotelId, rooms, onUpdate }) => {
    const handleSubmit = async () => {
        await ManagerService.createRoomType(payload);
        onUpdate();  // Tell parent to refresh!
    };
};
```

## 3.3 Custom Hook for Context

```tsx
// Define in context file
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Use anywhere in the app
const { user, login, logout, isAuthenticated } = useAuth();
```

## 3.4 Async/Await with Error Handling

```tsx
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
        showLoader();  // Show loading spinner
        
        const response = await AuthService.loginUser(formData);
        
        login(response.data.token, response.data.user);
        showToast({ type: 'success', msg: 'Welcome back!' });
        navigate('/dashboard');
        
    } catch (err: any) {
        // Handle specific error types
        if (err instanceof ApiError) {
            showToast({ type: 'error', msg: err.body?.message || 'Failed' });
        } else {
            showToast({ type: 'error', msg: err.message });
        }
    } finally {
        hideLoader();  // Always runs, even after error
    }
};
```

---

# Part 4: Quick Reference Cheatsheet

## TypeScript Syntax
```typescript
// Optional property
interface User { name: string; phone?: string; }

// Union type
type Status = 'pending' | 'confirmed' | 'cancelled';

// Generic useState
const [data, setData] = useState<Type | null>(null);

// Event handler
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {};

// Nullish coalescing
const value = data ?? 'default';

// Optional chaining
const name = user?.profile?.name;
```

## MUI sx Shortcuts
```tsx
sx={{
    m: 2,           // margin: 16px
    p: 3,           // padding: 24px
    mt: 1,          // margin-top: 8px
    px: 2,          // padding-left & right: 16px
    py: 1.5,        // padding-top & bottom: 12px
    gap: 1,         // gap: 8px (flexbox)
    borderRadius: 2, // 16px
    boxShadow: 3,   // predefined shadow level
    bgcolor: 'primary.main',
    color: 'text.secondary',
    '&:hover': { ... }
}}
```

## Common MUI Components
```tsx
<Box />           // Generic div with sx
<Stack />         // Flex container
<Typography />    // Text
<Button />        // Button
<TextField />     // Input
<Paper />         // Card surface
<Dialog />        // Modal
<Table />         // Data table
<Grid />          // 12-column layout
<Chip />          // Tag/badge
<IconButton />    // Clickable icon
<CircularProgress /> // Loading spinner
```

---

# Exercises

1. **Find in `HotelCard.tsx`**: How does the component show a fallback image?
2. **Find in `LoginPage.tsx`**: Where is the form state managed?
3. **Find in `RoomTypeManager.tsx`**: How does the child component notify the parent?
4. **Try**: Add a new TextField to the HotelForm component
5. **Try**: Change the hover animation in HotelCard

---

*Next: Study the Backend Architecture*
