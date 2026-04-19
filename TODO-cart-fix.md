# Cart & Checkout Fix Plan

**Diagnosis**: cart.js imports from utils.js & sanitizer.js fail because:
1. ES6 imports require `<script type="module">` (missing)
2. Import paths wrong ( `./utils.js` vs `scripts/utils.js`)
3. Module validation blocks cart storage

**Step 1**: Update cart.html - add `type="module"` to scripts
**Step 2**: Fix cart.js imports & add error handling/fallback
**Step 3**: Test localStorage → cart render flow
**Step 4**: Verify checkout → Netlify function call

Proceed?
