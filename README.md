
# SmartPig Lite - Gestión Porcina en la Nube

Esta es una aplicación profesional para la gestión de granjas porcinas, construida con Next.js, Tailwind CSS y Firebase (Firestore y Auth).

## 🚀 Guía de Despliegue Final

Sigue estos pasos para poner tu app en internet hoy mismo:

### Paso 1: Subir el código a GitHub
Abre la **Terminal** en este editor y pega estos comandos uno por uno:

1. **Inicializar Git:**
   ```bash
   git init
   ```

2. **Preparar archivos:**
   ```bash
   git add .
   ```

3. **Crear el primer registro:**
   ```bash
   git commit -m "Versión 1.0: SmartPig Lite lista para la nube"
   ```

4. **Conectar con tu repositorio:**
   *(Copia la URL de tu repositorio de GitHub, debería terminar en .git)*
   ```bash
   git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
   ```

5. **Subir el código:**
   ```bash
   git branch -M main
   git push -u origin main
   ```

### Paso 2: Publicar en Internet (Firebase App Hosting)
1. Ve a la [Consola de Firebase](https://console.firebase.google.com/).
2. Entra en tu proyecto **"smartpig-lite"**.
3. En el menú lateral, busca **"Build"** -> **"App Hosting"**.
4. Haz clic en **"Comenzar"** y selecciona tu cuenta de GitHub.
5. Elige el repositorio que acabas de subir.
6. **Configuración de implementación:**
   - **Rama activa:** Escribe `main`
   - **Directorio raíz:** Deja `/` (barra diagonal)
7. Firebase detectará que es Next.js automáticamente. Dale a **"Desplegar"**.

### Paso 3: Instalar en tu Celular (PWA)
Una vez que Firebase te dé la URL (ej: `https://smartpig-xxx.web.app`):
1. Ábrela en tu celular.
2. En Android (Chrome): Toca los 3 puntos y elige **"Instalar aplicación"**.
3. En iOS (Safari): Toca "Compartir" (cuadrado con flecha) y elige **"Añadir a pantalla de inicio"**.

## ✨ Características
- **Base de Datos en la Nube:** Todo se guarda en Google Firestore automáticamente.
- **Seguridad Profesional:** Acceso privado por usuario y granja.
- **Modo Offline:** Funciona incluso si pierdes el internet momentáneamente en la granja.
- **PigDoctor IA:** Diagnósticos veterinarios presuntivos integrados.
