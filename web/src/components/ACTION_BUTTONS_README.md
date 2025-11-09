# Action Button Components

This directory contains reusable, accessible action button components used throughout the application.

## Components

### Icons (`icons/`)

#### `EditIcon.jsx`
SVG icon for edit actions.

**Props:**
- `width` (number, default: 18) - Icon width in pixels
- `height` (number, default: 18) - Icon height in pixels

**Usage:**
```jsx
import EditIcon from './icons/EditIcon';

<EditIcon width={24} height={24} />
```

#### `DeleteIcon.jsx`
SVG icon for delete actions.

**Props:**
- `width` (number, default: 18) - Icon width in pixels
- `height` (number, default: 18) - Icon height in pixels

**Usage:**
```jsx
import DeleteIcon from './icons/DeleteIcon';

<DeleteIcon width={24} height={24} />
```

### Core Components

#### `ActionIconButton.jsx`
Generic, accessible icon button with tooltip support. This is the foundation component used by EditButton and DeleteButton.

**Props:**
- `icon` (React.ReactNode, required) - Icon component to display
- `onClick` (Function, required) - Click handler
- `ariaLabel` (string, required) - Accessibility label for screen readers
- `variant` (string, default: 'edit') - Button variant: 'edit' | 'delete'
- `tooltipText` (string, optional) - Tooltip text to display on hover
- `tooltipPosition` (string, default: 'left') - Tooltip position: 'top' | 'bottom' | 'left' | 'right'
- `disabled` (boolean, default: false) - Disabled state
- `className` (string, optional) - Additional CSS classes

**Features:**
- Integrated tooltip support
- Full keyboard navigation support
- Focus-visible outline for accessibility
- Hover and focus states with color transitions
- Support for disabled state

**Usage:**
```jsx
import ActionIconButton from './ActionIconButton';
import EditIcon from './icons/EditIcon';

<ActionIconButton
  icon={<EditIcon />}
  onClick={handleEdit}
  ariaLabel="Edit user"
  variant="edit"
  tooltipText="Edit this user"
  tooltipPosition="left"
/>
```

### Convenience Wrappers

#### `EditButton.jsx`
Pre-configured button for edit actions with sensible defaults.

**Props:**
- `onClick` (Function, required) - Click handler
- `ariaLabel` (string, default: "Modifier") - Accessibility label
- `tooltipText` (string, optional) - Tooltip text
- `tooltipPosition` (string, default: 'left') - Tooltip position
- `disabled` (boolean, default: false) - Disabled state
- `className` (string, optional) - Additional CSS classes

**Usage:**
```jsx
import EditButton from './EditButton';

// Simple usage
<EditButton onClick={() => handleEdit(item)} />

// With custom label and tooltip
<EditButton
  onClick={() => handleEdit(patient)}
  ariaLabel="Modifier le patient"
  tooltipText="Modifier le patient"
/>
```

#### `DeleteButton.jsx`
Pre-configured button for delete actions with sensible defaults.

**Props:**
- `onClick` (Function, required) - Click handler
- `ariaLabel` (string, default: "Supprimer") - Accessibility label
- `tooltipText` (string, optional) - Tooltip text
- `tooltipPosition` (string, default: 'left') - Tooltip position
- `disabled` (boolean, default: false) - Disabled state
- `className` (string, optional) - Additional CSS classes

**Usage:**
```jsx
import DeleteButton from './DeleteButton';

// Simple usage
<DeleteButton onClick={() => handleDelete(item)} />

// With custom label and tooltip
<DeleteButton
  onClick={() => handleDelete(patient)}
  ariaLabel="Supprimer le patient"
  tooltipText="Supprimer le patient"
/>
```

## Accessibility Features

All button components include:

1. **ARIA Labels**: Proper `aria-label` attributes for screen readers
2. **Keyboard Navigation**: Full support for Tab navigation
3. **Focus Indicators**: Visible focus outline (`:focus-visible`) with 2px blue border
4. **Tooltips**: Optional accessible tooltips with `role="tooltip"` and `aria-live="polite"`
5. **Disabled State**: Proper disabled attribute and visual feedback
6. **Icon Hiding**: SVG icons marked with `aria-hidden="true"` to avoid duplication

## Styling

Components use CSS Modules for scoped styling. The main styles are in:
- `ActionIconButton.module.css`

**Color Scheme:**
- **Edit variant**: Blue (#2563eb) with light blue hover background (#eff6ff)
- **Delete variant**: Red (#dc2626) with light red hover background (#fef2f2)
- **Focus outline**: Blue (#2563eb) with 2px width and 2px offset
- **Disabled**: 50% opacity with not-allowed cursor

## Examples

### Patient List Actions
```jsx
import EditButton from '../components/EditButton';
import DeleteButton from '../components/DeleteButton';

<td style={{ textAlign: 'right' }}>
  <EditButton
    onClick={() => {
      setPatientToEdit(patient);
      setShowEditModal(true);
    }}
    ariaLabel="Modifier le patient"
    tooltipText="Modifier le patient"
    tooltipPosition="left"
  />
  <DeleteButton
    onClick={() => {
      setPatientToDelete(patient);
      setShowDeleteModal(true);
    }}
    ariaLabel="Supprimer le patient"
    tooltipText="Supprimer le patient"
    tooltipPosition="left"
  />
</td>
```

### Data Entry Row Actions
```jsx
import EditButton from './EditButton';
import DeleteButton from './DeleteButton';

<td>
  <EditButton
    onClick={() => onEdit(entry)}
    ariaLabel={`Modifier la consultation du ${dateStr}`}
  />
  <DeleteButton
    onClick={() => onDelete(entry)}
    ariaLabel={`Supprimer la consultation du ${dateStr}`}
  />
</td>
```

## Testing

Comprehensive test coverage is provided in:
- `tests/Icons.test.jsx` - Icon components tests (4 tests)
- `tests/ActionIconButton.test.jsx` - Core button tests (7 tests)
- `tests/EditDeleteButtons.test.jsx` - Wrapper components tests (10 tests)

Run tests with:
```bash
npm run test
```

## Migration Guide

To migrate from old button implementation to new components:

**Before:**
```jsx
<Tooltip text="Modifier le patient" position="left">
  <button
    className={styles.iconBtnEdit}
    aria-label="Modifier le patient"
    onClick={() => handleEdit(patient)}
    type="button"
  >
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M15.232 5.232l3.536 3.536M4 20h4.586a1 1 0 0 0 .707-.293l9.414-9.414a2 2 0 0 0 0-2.828l-3.172-3.172a2 2 0 0 0-2.828 0L4.293 14.879A1 1 0 0 0 4 15.586V20z"/>
    </svg>
  </button>
</Tooltip>
```

**After:**
```jsx
<EditButton
  onClick={() => handleEdit(patient)}
  ariaLabel="Modifier le patient"
  tooltipText="Modifier le patient"
  tooltipPosition="left"
/>
```

**Benefits:**
- 75% reduction in code (~32 lines → 8 lines)
- Consistent styling and behavior
- Better accessibility
- Easier to maintain and update
