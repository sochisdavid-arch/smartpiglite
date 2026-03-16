
# SmartPig Lite - Gestión Porcina en la Nube

Esta es una aplicación profesional para la gestión de granjas porcinas, construida con Next.js, Tailwind CSS y Firebase (Firestore y Auth).

## 🚀 Guía de Publicación Final (Indispensable)

Si ves el error `error: remote origin already exists`, usa el comando del **Paso 1.1** en lugar del 1.5.

### Paso 1: Subir el código a GitHub
1. Abre la **Terminal** aquí mismo en el editor (está en la pestaña de abajo).
2. Copia y pega estos comandos uno por uno (presiona Enter después de cada uno):

```bash
# 1. Iniciar el sistema de seguimiento (si no se ha hecho)
git init

# 2. Preparar todos los archivos del proyecto
git add .

# 3. Crear el registro de los archivos
git commit -m "Versión 1.0: SmartPig Lite Completa (Sin IA)"

# 4. Definir la rama principal como 'main'
git branch -M main

# 5. SOLUCIÓN AL ERROR: Conectar con tu repositorio
# Si te sale el error "remote origin already exists", usa este:
git remote set-url origin https://github.com/sochisdavid-arch/smartpiglite.git

# 6. Enviar el código a GitHub
git push -u origin main
```

### 🔑 NOTA IMPORTANTE SOBRE LA CONTRASEÑA
Cuando ejecutes `git push`, GitHub te pedirá tu usuario y contraseña. 
**¡Atención!** GitHub ya no acepta tu contraseña normal en la terminal. Debes usar un **"Personal Access Token" (PAT)**:

1. Ve a tu GitHub -> **Settings** (esquina superior derecha).
2. Abajo a la izquierda: **Developer Settings**.
3. **Personal access tokens** -> **Tokens (classic)**.
4. Genera uno nuevo (**Generate new token**) con permisos de `repo`.
5. Copia ese código largo. **Esa es tu contraseña para la terminal.**

---

### Paso 2: Activar el Hosting en Firebase
Una vez que el código aparezca en tu página de GitHub:
1. Ve a la [Consola de Firebase](https://console.firebase.google.com/).
2. Entra en tu proyecto y busca **"Build"** -> **"App Hosting"**.
3. Haz clic en **"Comenzar"** y conecta tu GitHub.
4. Elige el repositorio `smartpiglite`.
5. En **Configuración de la implementación**, donde pregunta **Rama activa**, escribe: `main`.
6. Haz clic en **"Desplegar"**. Firebase te dará tu link público en unos minutos.

### Paso 3: Instalar en tu Celular (App Real)
Abre el link que te dio Firebase en tu celular:
- **Android:** Toca los 3 puntos y elige **"Instalar aplicación"**.
- **iOS (iPhone):** Toca el botón central de "Compartir" y elige **"Añadir a pantalla de inicio"**.

---

## ✨ Beneficios de esta Versión
- **Sincronización:** Los datos se guardan en Firestore (Nube) y se ven en todos tus dispositivos.
- **Seguridad:** Acceso protegido por contraseña y granja privada.
- **Eficiencia:** Gestión completa de gestación, lactancia, precebo, ceba e inventario.
