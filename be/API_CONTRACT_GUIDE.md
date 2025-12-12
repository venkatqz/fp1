# API Contract Quick Reference

## ✅ What You Have Now

```
be/
├── apicontract.ts          ← API DTOs & transformers (MANUAL)
├── openapi.yaml            ← API documentation (MANUAL)
└── src/prisma/schema.prisma ← Database schema (MANUAL)

fe/
└── src/client/             ← Generated from openapi.yaml (AUTO)
```

## 🚫 What You DON'T Need

- ❌ **ZenStack** - Not needed! Too complex for your use case
- ❌ **tsoa** - Not needed! You're using Express, not decorators
- ❌ **NestJS** - Not needed! You're not using NestJS framework

## 📝 Simple Workflow

### When You Change Database Schema:

```bash
# 1. Edit Prisma schema
# Edit: be/src/prisma/schema.prisma

# 2. Regenerate Prisma Client
cd be
npx prisma generate --schema=./src/prisma/schema.prisma

# 3. Update apicontract.ts (if API response changes)
# Edit: be/apicontract.ts

# 4. Update OpenAPI (if API response changes)
# Edit: be/openapi.yaml

# 5. Regenerate frontend
cd ../fe
npx openapi-typescript-codegen --input ../be/openapi.yaml --output ./src/client
```

## 💡 How to Use apicontract.ts

### In Your Controllers:

```typescript
import { toHotelDTO, type HotelDTO } from '../apicontract';
import prisma from '../src/lib/prisma';

export const getHotels = async (req: Request, res: Response) => {
  // 1. Query database with Prisma
  const hotelsFromDB = await prisma.hotels.findMany({
    include: {
      hotel_amenities: {
        include: { amenities: true }
      }
    }
  });
  
  // 2. Transform to DTO
  const hotels: HotelDTO[] = hotelsFromDB.map(toHotelDTO);
  
  // 3. Return (matches OpenAPI spec!)
  res.json(hotels);
};
```

## 🎯 Key Files Explained

| File | Purpose | When to Edit |
|------|---------|--------------|
| `apicontract.ts` | Backend types & transformers | When API response structure changes |
| `openapi.yaml` | API documentation | When endpoints or responses change |
| `fe/src/client/` | Frontend types & API methods | Never (auto-generated) |

## ✅ You're All Set!

No additional tools needed. Just:
1. Write your API logic
2. Use `apicontract.ts` types
3. Keep `openapi.yaml` in sync
4. Regenerate frontend when needed

Simple! 🎉
