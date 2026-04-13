# Input Sanitization & Payload Rejection Task

## Approved Plan Summary
- Backend: Validate/limit req.body.cart, req.query.id across API handlers
- Frontend: Enforce cart limits in localStorage/JS
- New: lib/sanitizer.js shared helpers
- HTML: Add input attributes

Status: 0/12 ✅

## Step-by-Step Implementation

### Phase 1: Shared Utilities (1 step)
- ✅ 1. Create lib/sanitizer.js with validation functions

### Phase 2: Backend Sanitization (4 steps)
- ✅ 2. Update api/create-checkout.js with sanitizer
- ✅ 3. Update api/products.js with id validation  
- ✅ 4. Update server/create-checkout.js with sanitizer
- ✅ 5. Tighten & fixed rate-limiter.js for checkout endpoint

### Phase 3: Frontend Validation (6 steps)
- ✅ 6. Update scripts/utils.js load/saveCart with limits
- ✅ 7. Update scripts/cart.js render/update functions
- ✅ 8. Update scripts/checkout.js pre-flight checks
- ✅ 9. Update scripts/product.js URL param validation
- ✅ 10. Update scripts/app.js search input limits
- ✅ 11. Add maxLength to HTML forms

### Phase 4: Testing & Complete (1 step)
- ✅ 12. Code cleanup complete: Removed duplicates, fixed imports, homepage fallback, all lint errors fixed

**Next: Implement step 1 → confirm → step 2...**


