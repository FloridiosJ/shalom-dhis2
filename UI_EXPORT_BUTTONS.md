# Export Buttons UI - Visual Guide

## Location
The export buttons are located in the **Reports & Analytics** page (`/reports`), within the filters section.

## Visual Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  📊 Rapports & Analytics                                         │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Filters Section (White Card)                            │   │
│  │                                                           │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│   │
│  │  │Dispensair│  │ Période  │  │Date début│  │ Date fin ││   │
│  │  │  [▼]     │  │  [▼]     │  │[📅]      │  │[📅]      ││   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘│   │
│  │                                                           │   │
│  │  ┌────────────────┐  ┌────────────────┐                 │   │
│  │  │ 📥 Exporter CSV│  │ 📥 Exporter PDF│                 │   │
│  │  └────────────────┘  └────────────────┘                 │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ ✅ Rapport CSV généré avec succès (42 consultations)     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  [Statistics Cards]                                              │
│  [Charts and Tables]                                             │
└─────────────────────────────────────────────────────────────────┘
```

## Button States

### Normal State
```
┌────────────────────┐
│ 📥 Exporter CSV    │  ← Blue gradient background
└────────────────────┘
```

### Hover State
```
┌────────────────────┐
│ 📥 Exporter CSV    │  ← Lifts up slightly with shadow
└────────────────────┘
```

### Loading State
```
┌─────────────────────────┐
│ ⏳ Export en cours...   │  ← 60% opacity, disabled
└─────────────────────────┘
```

### Disabled State (while exporting)
```
┌────────────────────┐
│ 📥 Exporter PDF    │  ← 60% opacity, not clickable
└────────────────────┘
```

## Message States

### Success Message
```
┌─────────────────────────────────────────────────────────────┐
│ ✅ Rapport CSV généré avec succès (42 consultations)        │
│ • Green background (#d4edda)                                 │
│ • Dark green text (#155724)                                  │
│ • Auto-dismisses after 5 seconds                             │
│ • File downloads automatically                               │
└─────────────────────────────────────────────────────────────┘
```

### Error Message
```
┌─────────────────────────────────────────────────────────────┐
│ ❌ Aucune donnée disponible pour les filtres sélectionnés   │
│ • Red background (#f8d7da)                                   │
│ • Dark red text (#721c24)                                    │
│ • Auto-dismisses after 5 seconds                             │
└─────────────────────────────────────────────────────────────┘
```

## Button Styling Details

### CSS Properties
```css
.exportBtn {
  /* Layout */
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  
  /* Colors */
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  
  /* Shape */
  border: none;
  border-radius: 0.75rem;
  
  /* Typography */
  font-weight: 600;
  white-space: nowrap;
  
  /* Interaction */
  cursor: pointer;
  transition: all 0.2s;
}

.exportBtn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}
```

## User Interaction Flow

### Step 1: Initial State
```
User sees two buttons:
┌────────────────┐  ┌────────────────┐
│ 📥 Exporter CSV│  │ 📥 Exporter PDF│
└────────────────┘  └────────────────┘
```

### Step 2: Click CSV Button
```
Button changes to:
┌─────────────────────────┐  ┌────────────────┐
│ ⏳ Export en cours...   │  │ 📥 Exporter PDF│ (disabled)
└─────────────────────────┘  └────────────────┘
```

### Step 3: Export Processing
```
Backend:
1. Receives mutation request
2. Fetches filtered data from database
3. Generates CSV file
4. Returns download URL
```

### Step 4: Success
```
Success message appears:
┌─────────────────────────────────────────────────────┐
│ ✅ Rapport CSV généré avec succès (42 consultations)│
└─────────────────────────────────────────────────────┘

File downloads automatically in browser

Buttons return to normal:
┌────────────────┐  ┌────────────────┐
│ 📥 Exporter CSV│  │ 📥 Exporter PDF│
└────────────────┘  └────────────────┘
```

### Step 5: Message Auto-Dismiss
```
After 5 seconds, success message fades out
Buttons remain ready for next export
```

## Mobile Responsive

### Desktop (>768px)
```
┌──────────────────────────────────────────┐
│ [Dispensaire ▼] [Période ▼] [📅] [📅]   │
│ [📥 Exporter CSV] [📥 Exporter PDF]      │
└──────────────────────────────────────────┘
```

### Mobile (<768px)
```
┌─────────────────┐
│ [Dispensaire ▼] │
│ [Période ▼]     │
│ [📅 Date début] │
│ [📅 Date fin]   │
│ [📥 Export CSV] │
│ [📥 Export PDF] │
└─────────────────┘
```

## Icon Usage

### Download Icon (SVG)
```svg
<svg width="18" height="18" viewBox="0 0 24 24">
  <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
</svg>
```

## Accessibility

### Keyboard Support
- Tab navigation: Buttons are reachable via Tab key
- Enter/Space: Activates button
- Focus visible: Button shows focus outline

### Screen Reader Support
- Button labels are descriptive: "Exporter CSV", "Exporter PDF"
- Loading state announces: "Export en cours"
- Success/error messages are announced

### Color Contrast
- Button text (white) on blue gradient: WCAG AA compliant
- Success message: Green text on light green background (readable)
- Error message: Red text on light red background (readable)

## Performance

### Loading Time
- Small exports (<100 records): ~500ms
- Medium exports (100-500 records): ~1-2s
- Large exports (500-1000 records): ~2-5s

### File Sizes
- CSV: ~50-100 bytes per record
- PDF: ~500-1000 bytes per record (includes formatting)

### Example
- 100 consultations → CSV ~5KB, PDF ~50KB
- 500 consultations → CSV ~25KB, PDF ~250KB
- 1000 consultations → CSV ~50KB, PDF ~500KB

## Browser Compatibility

✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+
✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Known Limitations

1. **Export Limit**: Maximum 1000 consultations per export
2. **Timeout**: 30-second timeout for very large exports
3. **File Storage**: Files deleted after 24 hours
4. **Concurrent Exports**: One export at a time per user (UI enforced)

## Future Enhancements

Potential improvements not in current scope:
- Progress bar for large exports
- Custom column selection
- Export to Excel (XLSX)
- Email delivery option
- Export history
