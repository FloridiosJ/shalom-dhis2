# 🎨 Intégration du Logo Shalom - Application Web

Ce guide explique comment intégrer le logo Shalom DHIS2 dans l'application web React.

## 📁 Assets Disponibles

Tous les assets de branding sont disponibles dans le dossier racine:
```
../assets/branding/
```

## 🌐 Intégration dans le HTML

### 1. Favicon

Ajoutez dans `index.html`:

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/assets/branding/icons/favicon.svg" />
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/branding/icons/favicon-32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/assets/branding/icons/favicon-16.png" />
  
  <!-- Apple Touch Icon -->
  <link rel="apple-touch-icon" href="/assets/branding/icons/app-icon-192.png" />
  
  <title>Shalom DHIS2</title>
</head>
```

### 2. Meta Tags pour Réseaux Sociaux

```html
<!-- Open Graph (Facebook, LinkedIn) -->
<meta property="og:title" content="Shalom DHIS2" />
<meta property="og:description" content="Système de gestion de données de santé pour dispensaires" />
<meta property="og:image" content="/assets/branding/social/social-preview.svg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:type" content="website" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Shalom DHIS2" />
<meta name="twitter:description" content="Système de gestion de données de santé pour dispensaires" />
<meta name="twitter:image" content="/assets/branding/social/social-preview.svg" />
```

### 3. Manifest pour PWA

Créez un fichier `manifest.json`:

```json
{
  "name": "Shalom DHIS2",
  "short_name": "Shalom",
  "description": "Système de gestion de données de santé pour dispensaires",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2E7D32",
  "icons": [
    {
      "src": "/assets/branding/icons/app-icon-96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/assets/branding/icons/app-icon-144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/assets/branding/icons/app-icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/assets/branding/icons/app-icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

Puis ajoutez dans le HTML:
```html
<link rel="manifest" href="/manifest.json" />
```

## ⚛️ Composants React

### 1. Composant Logo Simple

```tsx
// src/components/AppLogo.tsx
import React from 'react';

interface AppLogoProps {
  width?: number;
  height?: number;
  variant?: 'full' | 'mark' | 'mono';
  className?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  width = 200,
  height = 200,
  variant = 'full',
  className = '',
}) => {
  const getLogoPath = () => {
    switch (variant) {
      case 'mark':
        return '/assets/branding/logos/shalom-mark.svg';
      case 'mono':
        return '/assets/branding/logos/shalom-logo-mono.svg';
      default:
        return '/assets/branding/logos/shalom-logo.svg';
    }
  };

  return (
    <img
      src={getLogoPath()}
      alt="Logo Shalom DHIS2 - Système de gestion de santé"
      width={width}
      height={height}
      className={className}
    />
  );
};
```

### 2. Utilisation dans le Header

```tsx
// src/components/Header.tsx
import React from 'react';
import { AppLogo } from './AppLogo';
import './Header.css';

export const Header: React.FC = () => {
  return (
    <header className="app-header">
      <div className="logo-container">
        <AppLogo width={120} height={40} variant="full" />
      </div>
      <nav className="main-nav">
        {/* Navigation items */}
      </nav>
    </header>
  );
};
```

### 3. Logo dans la Page de Connexion

```tsx
// src/pages/Login.tsx
import React from 'react';
import { AppLogo } from '../components/AppLogo';
import './Login.css';

export const LoginPage: React.FC = () => {
  return (
    <div className="login-container">
      <div className="login-box">
        <AppLogo width={180} height={180} variant="full" />
        <h1>Connexion</h1>
        <form>
          {/* Form fields */}
        </form>
      </div>
    </div>
  );
};
```

### 4. Badge Département

```tsx
// src/components/DepartmentBadge.tsx
import React from 'react';

interface DepartmentBadgeProps {
  department: 'general' | 'maternity' | 'pediatrics';
  className?: string;
}

export const DepartmentBadge: React.FC<DepartmentBadgeProps> = ({
  department,
  className = '',
}) => {
  const getBadgePath = () => {
    const badges = {
      general: '/assets/branding/badges/badge-general.svg',
      maternity: '/assets/branding/badges/badge-maternity.svg',
      pediatrics: '/assets/branding/badges/badge-pediatrics.svg',
    };
    return badges[department];
  };

  const getAltText = () => {
    const texts = {
      general: 'Badge Médecine Générale',
      maternity: 'Badge Maternité',
      pediatrics: 'Badge Pédiatrie',
    };
    return texts[department];
  };

  return (
    <img
      src={getBadgePath()}
      alt={getAltText()}
      className={`department-badge ${className}`}
    />
  );
};
```

## 🎨 CSS / Styles

### Styles pour le Logo

```css
/* src/components/AppLogo.css */
.app-logo {
  display: inline-block;
  vertical-align: middle;
}

.app-logo img {
  width: auto;
  height: auto;
  max-width: 100%;
}

/* Header logo */
.header-logo {
  height: 40px;
  width: auto;
}

/* Login logo */
.login-logo {
  width: 180px;
  height: auto;
  margin-bottom: 2rem;
}

/* Favicon-like small logo */
.logo-small {
  width: 32px;
  height: 32px;
}

/* Responsive */
@media (max-width: 768px) {
  .header-logo {
    height: 32px;
  }
  
  .login-logo {
    width: 140px;
  }
}
```

### Badge Département Styles

```css
/* src/components/DepartmentBadge.css */
.department-badge {
  display: block;
  width: 100%;
  max-width: 600px;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.department-badge-small {
  max-width: 300px;
}
```

## 📦 Configuration Vite

Assurez-vous que les assets sont copiés dans le build:

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, '../assets'),
    },
  },
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
```

Créez un lien symbolique dans le dossier public:
```bash
cd web/public
ln -s ../../assets/branding assets
```

## ♿ Accessibilité

### Texte Alternatif

Toujours fournir un texte alternatif descriptif:

```tsx
<img
  src="/assets/branding/logos/shalom-logo.svg"
  alt="Logo Shalom DHIS2 - Système de gestion de santé pour dispensaires"
  role="img"
  aria-label="Logo de l'application"
/>
```

### Contraste

Le logo respecte les standards WCAG AA:
- Vert principal (#2E7D32) sur blanc: ratio 4.5:1
- Version monochrome disponible si nécessaire

### Focus States

```css
.logo-link:focus-visible {
  outline: 2px solid #2E7D32;
  outline-offset: 4px;
  border-radius: 4px;
}
```

## 📱 Responsive Design

### Breakpoints recommandés

```css
/* Mobile */
@media (max-width: 640px) {
  .app-logo {
    width: 100px;
    height: auto;
  }
}

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) {
  .app-logo {
    width: 140px;
    height: auto;
  }
}

/* Desktop */
@media (min-width: 1025px) {
  .app-logo {
    width: 180px;
    height: auto;
  }
}
```

## 🔄 Mise à Jour des Assets

Pour mettre à jour les assets après modification:

```bash
# Régénérer les PNG depuis les SVG
cd ../assets/branding
npm run regenerate

# Reconstruire l'application web
cd ../../web
npm run build
```

## 📖 Exemples Complets

### Page d'accueil avec logo

```tsx
import React from 'react';
import { AppLogo } from '../components/AppLogo';

export default function HomePage() {
  return (
    <div className="home-page">
      <header>
        <AppLogo width={150} variant="full" />
        <h1>Bienvenue sur Shalom DHIS2</h1>
      </header>
      <main>
        {/* Content */}
      </main>
    </div>
  );
}
```

### Footer avec logo monochrome

```tsx
import React from 'react';
import { AppLogo } from '../components/AppLogo';

export default function Footer() {
  return (
    <footer className="app-footer">
      <AppLogo width={100} variant="mono" />
      <p>&copy; 2024 Shalom DHIS2. Tous droits réservés.</p>
    </footer>
  );
}
```

## 📚 Resources

- [Guide complet du logo](../assets/branding/LOGO_GUIDELINES.md)
- [Assets branding](../assets/branding/)
- [Documentation PWA](https://web.dev/progressive-web-apps/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
