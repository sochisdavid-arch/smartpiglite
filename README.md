# SmartPig Lite - Gestión Porcina en la Nube

Esta es una aplicación profesional para la gestión de granjas porcinas, construida con Next.js, Tailwind CSS y Firebase (Firestore y Auth).

## 🚀 Guía de Despliegue (Cómo subir a GitHub)

Como tu asistente IA, he dejado todo listo. Sigue estos 3 pasos simples:

### Paso 1: Crear el repositorio en GitHub
1. Entra en [GitHub](https://github.com/) e inicia sesión.
2. Haz clic en el botón verde **"New"** (Nuevo).
3. Nombre del repositorio: `smartpig-lite`.
4. Haz clic en **"Create repository"** (No marques ninguna casilla de inicialización).

### Paso 2: Ejecutar estos comandos
Abre la terminal en la carpeta de este proyecto y copia/pega esto (uno por uno):

```bash
git init
git add .
git commit -m "Proyecto SmartPig listo para la nube"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/smartpig-lite.git
git push -u origin main
```
*(Nota: Cambia `TU_USUARIO` por tu nombre real de usuario de GitHub en la URL).*

### Paso 3: Publicar en Internet (Firebase App Hosting)
1. Ve a la [Consola de Firebase](https://console.firebase.google.com/).
2. Entra en tu proyecto y busca la sección **"App Hosting"**.
3. Haz clic en **"Comenzar"** y conecta tu cuenta de GitHub.
4. Selecciona el repositorio `smartpig-lite` que acabas de subir.
5. Firebase hará el resto: compilará y publicará tu app en una URL segura (HTTPS).

## ✨ Características
- **Base de Datos en la Nube:** Sincronización en tiempo real con Cloud Firestore.
- **Seguridad:** Autenticación con Google y Email.
- **PWA:** Instalable en Android e iOS como una aplicación nativa.
- **IA de Diagnóstico:** Incluye PigDoctor AI para análisis veterinarios presuntivos.
