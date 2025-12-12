# Prisma Workflow Guide

## 📋 **When You Make Database Changes**

### **Scenario: You manually altered the database**
Example: `ALTER TABLE users ADD COLUMN refresh_token VARCHAR(500) NULL;`

### **Steps to Sync Everything:**

#### 1️⃣ **Update Prisma Schema**
Edit `be/src/prisma/schema.prisma`:
```prisma
model users {
  // ... existing fields
  refresh_token  String?  @db.VarChar(500)  // ← Add this
}
```

#### 2️⃣ **Update Split Model (if using split/merge)**
Edit `be/src/models/users.prisma`:
```prisma
model users {
  // ... existing fields
  refresh_token  String?  @db.VarChar(500)  // ← Add this
}
```

#### 3️⃣ **Regenerate Prisma Client**
```bash
cd be
npx prisma generate --schema=./src/prisma/schema.prisma
```

✅ **Done!** Now your TypeScript code has access to `user.refresh_token`

---

## 🔄 **Complete Workflow for Schema Changes**

### **Option A: Change Database First (What you just did)**
```
1. ALTER TABLE in MySQL
   ↓
2. Update schema.prisma manually
   ↓
3. Update split model (if using)
   ↓
4. npx prisma generate
```

### **Option B: Change Prisma First (Recommended)**
```
1. Update schema.prisma
   ↓
2. npx prisma migrate dev --name add_refresh_token
   ↓
3. Prisma creates migration SQL + updates DB
   ↓
4. Prisma Client auto-regenerates
```

---

## 📁 **File Locations**

| File | Location | Purpose |
|------|----------|---------|
| Main schema | `be/src/prisma/schema.prisma` | Single source of truth |
| Split models | `be/src/models/*.prisma` | Individual model files (optional) |
| Prisma Client | `be/node_modules/@prisma/client` | Auto-generated types |
| Migrations | `be/prisma/migrations/` | Migration history (if using migrations) |

---

## 🛠️ **Common Commands**

```bash
# Generate Prisma Client (after schema changes)
npx prisma generate --schema=./src/prisma/schema.prisma

# Create a migration (recommended way to change DB)
npx prisma migrate dev --name your_migration_name --schema=./src/prisma/schema.prisma

# Pull schema from existing database
npx prisma db pull --schema=./src/prisma/schema.prisma

# Push schema to database (without migrations)
npx prisma db push --schema=./src/prisma/schema.prisma

# Open Prisma Studio (database GUI)
npx prisma studio --schema=./src/prisma/schema.prisma
```

---

## ✅ **Best Practices**

### **DO:**
- ✅ Use `prisma migrate dev` for schema changes (creates migration files)
- ✅ Run `prisma generate` after every schema change
- ✅ Keep split models in sync with main schema
- ✅ Commit migration files to git

### **DON'T:**
- ❌ Manually ALTER tables in production (use migrations)
- ❌ Forget to run `prisma generate` after schema changes
- ❌ Edit Prisma Client code directly (it's auto-generated)

---

## 🔧 **Using the New refresh_token Field**

### **In Your Code:**

```typescript
import prisma from './src/lib/prisma';

// Save refresh token
await prisma.users.update({
  where: { id: userId },
  data: { refresh_token: newRefreshToken }
});

// Get user with refresh token
const user = await prisma.users.findUnique({
  where: { id: userId },
  select: {
    id: true,
    email: true,
    refresh_token: true  // ← Now available!
  }
});

// Clear refresh token (logout)
await prisma.users.update({
  where: { id: userId },
  data: { refresh_token: null }
});
```

---

## 📝 **Next Steps for Your Project**

1. **Implement JWT Refresh Token Logic**
   - Generate access token (short-lived, e.g., 15 min)
   - Generate refresh token (long-lived, e.g., 7 days)
   - Store refresh token in database
   - Use refresh token to get new access token

2. **Update API Contract**
   - Add refresh token endpoint to `openapi.yaml`
   - Update `apicontract.ts` if needed

3. **Update Frontend**
   - Regenerate client types
   - Implement token refresh logic
