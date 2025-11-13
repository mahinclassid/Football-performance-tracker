# Theme Usage Guide

This document explains how to use the centralized theme system.

## Importing Theme

```typescript
import { theme, themeClasses, getTextColor, getBgColor } from '@/lib/theme';
```

## Using Theme Colors

### Option 1: Using Theme Classes (Recommended)

Use pre-defined Tailwind classes from `themeClasses`:

```tsx
import { themeClasses } from '@/lib/theme-classes';

// Text colors
<p className={themeClasses.text.primary}>Primary text</p>
<p className={themeClasses.text.secondary}>Secondary text</p>
<p className={themeClasses.text.label}>Form label</p>

// Background colors
<div className={themeClasses.bg.card}>Card background</div>

// Form elements
<label className={themeClasses.form.label}>Email</label>
<input className={themeClasses.input.DEFAULT} />
```

### Option 2: Using Helper Functions

```tsx
import { getTextColor, getBgColor } from '@/lib/theme';

<p className={getTextColor('primary')}>Primary text</p>
<div className={getBgColor('primary')}>Background</div>
```

### Option 3: Direct Color Values

For inline styles or CSS:

```tsx
import { colors } from '@/lib/theme';

<div style={{ color: colors.text.primary }}>
  Text with inline style
</div>
```

## Common Patterns

### Form Labels
```tsx
<label className={themeClasses.form.label}>
  Email Address
</label>
```

### Page Headings
```tsx
<h1 className="text-3xl font-bold text-gray-900">
  Page Title
</h1>
```

### Cards
```tsx
<div className={themeClasses.card.container}>
  <h2 className={themeClasses.card.header}>Card Title</h2>
  <p className={themeClasses.card.body}>Card content</p>
</div>
```

### Buttons
```tsx
<button className={themeClasses.button.primary}>
  Primary Button
</button>
```

## Updating Colors

To change colors globally, update:
1. `lib/theme.ts` - Theme configuration
2. `app/globals.css` - CSS variables
3. `lib/theme-classes.ts` - Tailwind class mappings

All components will automatically use the new colors.




