# 🔧 Dépannage - Système de Branding Shalom

Ce document liste les problèmes courants et leurs solutions lors de l'utilisation du système de branding.

## 🚨 Problèmes Courants

### 1. Erreur Sharp: "undefined symbol: vips_fail_on_get_type"

**Symptôme:**
```bash
npm run generate-splash

> mobile@0.0.1 generate-splash
> npx react-native generate-bootsplash ../assets/branding/splash/shalom-splash-1080x1920.png --background-color=#FFFFFF --logo-width=200

node: symbol lookup error: /path/to/node_modules/react-native-bootsplash/node_modules/sharp/build/Release/sharp-linux-x64.node: undefined symbol: vips_fail_on_get_type
```

**Cause:**
Cette erreur survient lorsque les bindings natifs de Sharp (utilisé par react-native-bootsplash) sont incompatibles avec la version de libvips installée sur votre système. C'est un problème courant sur Linux.

**Solutions:**

#### Solution 1: Réinstaller react-native-bootsplash (Recommandé)

```bash
cd mobile
rm -rf node_modules/react-native-bootsplash
npm install react-native-bootsplash --force
npm run generate-splash
```

#### Solution 2: Downgrader Sharp à une version stable

```bash
cd mobile
npm install sharp@0.32.6 --save-dev --force
rm -rf node_modules/react-native-bootsplash/node_modules/sharp
npm run generate-splash
```

#### Solution 3: Régénérer les bindings natifs

```bash
cd mobile
npm rebuild sharp
npm run generate-splash
```

#### Solution 4: Utiliser l'outil en ligne (Sans installation)

Si toutes les solutions ci-dessus échouent:

1. Visitez le générateur en ligne: https://github.com/zoontek/react-native-bootsplash#-setup
2. Téléchargez l'image: `assets/branding/splash/shalom-splash-1080x1920.png`
3. Configurez:
   - Background color: `#FFFFFF`
   - Logo width: `200px`
4. Générez et téléchargez les assets
5. Extrayez les fichiers dans votre projet mobile selon la structure attendue

#### Solution 5: Installation système de libvips (Linux)

Si vous êtes sur Linux et que le problème persiste:

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install libvips-dev
cd mobile
npm rebuild sharp
```

**Fedora/RHEL:**
```bash
sudo dnf install vips-devel
cd mobile
npm rebuild sharp
```

**Arch Linux:**
```bash
sudo pacman -S libvips
cd mobile
npm rebuild sharp
```

---

### 2. Erreur: "Cannot find module 'sharp'"

**Symptôme:**
```bash
npm run generate-assets
Error: Cannot find module 'sharp'
```

**Solution:**

```bash
cd assets/branding
npm install
npm run generate
```

Si le problème persiste:
```bash
cd assets/branding
rm -rf node_modules package-lock.json
npm install
npm run generate
```

---

### 3. Les PNG ne sont pas générés

**Symptôme:**
Le script `generate-assets.js` s'exécute sans erreur mais les PNG ne sont pas créés.

**Solution:**

1. Vérifier que les SVG sources existent:
   ```bash
   cd assets/branding
   ls -la logos/*.svg
   ls -la icons/*.svg
   ls -la splash/*.svg
   ```

2. Exécuter avec verbose pour voir les erreurs:
   ```bash
   cd assets/branding
   node generate-assets.js
   ```

3. Vérifier les permissions:
   ```bash
   chmod 755 generate-assets.js
   chmod -R 755 logos icons splash
   ```

---

### 4. Erreur: "react-native set-icon: command not found"

**Symptôme:**
```bash
npm run set-icon
react-native: command not found
```

**Solution:**

Installer @bam.tech/react-native-make globalement ou localement:

```bash
cd mobile
npm install --save-dev @bam.tech/react-native-make
npm run set-icon
```

Si cela ne fonctionne pas, utilisez npx:
```bash
cd mobile
npx @bam.tech/react-native-make set-icon ../assets/branding/icons/app-icon-1024.png
```

---

### 5. Les assets ne s'affichent pas dans l'app web

**Symptôme:**
Le logo ne s'affiche pas sur l'application web, erreur 404.

**Solution:**

1. Vérifier que le lien symbolique existe:
   ```bash
   ls -la web/public/assets/branding
   ```

2. Si le lien est cassé ou n'existe pas, le recréer:
   ```bash
   cd web/public/assets
   rm -f branding  # Supprimer l'ancien lien si présent
   ln -s ../../../assets/branding branding
   ```

3. Sur Windows (utiliser une copie au lieu d'un symlink):
   ```bash
   # PowerShell
   Copy-Item -Path "..\..\assets\branding" -Destination "web\public\assets\branding" -Recurse
   ```

4. Vérifier que Vite est configuré pour servir les assets:
   ```bash
   cd web
   npm run dev
   ```

---

### 6. Le composant AppLogo ne s'affiche pas (Mobile)

**Symptôme:**
Erreur lors du rendu du composant AppLogo.

**Solution:**

1. Vérifier que react-native-svg est installé:
   ```bash
   cd mobile
   npm list react-native-svg
   ```

2. Si non installé:
   ```bash
   npm install react-native-svg
   ```

3. Pour iOS, installer les pods:
   ```bash
   cd ios
   pod install
   cd ..
   ```

4. Nettoyer le cache Metro:
   ```bash
   npm start -- --reset-cache
   ```

---

### 7. Tests AppLogo échouent

**Symptôme:**
```bash
npm test -- __tests__/AppLogo.test.tsx
FAIL
```

**Solution:**

1. Vérifier que les mocks sont à jour:
   ```bash
   cd mobile
   cat __tests__/AppLogo.test.tsx
   ```

2. Réexécuter les tests avec cache clear:
   ```bash
   npm test -- --clearCache
   npm test -- __tests__/AppLogo.test.tsx
   ```

---

### 8. Erreur de permissions lors de la génération

**Symptôme:**
```bash
EACCES: permission denied
```

**Solution:**

```bash
cd assets/branding
sudo chown -R $USER:$USER .
chmod -R 755 .
npm run generate
```

---

## 🆘 Support Additionnel

Si aucune de ces solutions ne résout votre problème:

1. **Vérifier la version de Node.js:**
   ```bash
   node --version  # Doit être >= 20
   ```

2. **Vérifier les logs complets:**
   ```bash
   cd mobile
   npm run generate-splash 2>&1 | tee splash-error.log
   ```

3. **Nettoyer complètement et réinstaller:**
   ```bash
   cd mobile
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Consulter la documentation officielle:**
   - react-native-bootsplash: https://github.com/zoontek/react-native-bootsplash
   - Sharp: https://sharp.pixelplumbing.com/install
   - react-native-make: https://github.com/bamlab/react-native-make

---

## 📝 Rapporter un Bug

Si vous rencontrez un problème non documenté ici:

1. Vérifier d'abord les issues GitHub du projet
2. Inclure dans votre rapport:
   - Système d'exploitation et version
   - Version de Node.js (`node --version`)
   - Version de npm (`npm --version`)
   - Message d'erreur complet
   - Étapes pour reproduire le problème

---

**Dernière mise à jour**: 2025-11-05
