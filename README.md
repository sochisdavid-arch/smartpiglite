
# SmartPig Lite - Gestión Porcina en la Nube

Esta es una aplicación profesional para la gestión de granjas porcinas, construida con Next.js, Tailwind CSS y Firebase (Firestore y Auth).

## 🚀 Guía de Publicación Final (Indispensable)

Debido a que GitHub requiere **tus credenciales personales** (usuario y contraseña), tú debes ejecutar los comandos finales en la terminal. Yo ya preparé todo el código, solo falta este paso:

### Paso 1: Subir el código a GitHub
1. Abre la **Terminal** aquí mismo en el editor (está en la pestaña de abajo).
2. Copia y pega estos comandos uno por uno (presiona Enter después de cada uno):

```bash
# 1. Iniciar el sistema de seguimiento
git init

# 2. Preparar todos los archivos del proyecto
git add .

# 3. Crear el registro de los archivos
git commit -m "Versión 1.0: SmartPig Lite Completa"

# 4. Definir la rama principal como 'main'
git branch -M main

# 5. Conectar con TU repositorio (REEMPLAZA LA URL POR LA TUYA)
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git

# 6. Enviar el código a GitHub
git push -u origin main
```

*Nota: GitHub te pedirá tu usuario y un "Personal Access Token" (que se usa como contraseña). Si no tienes uno, se crea en GitHub -> Settings -> Developer Settings -> Personal Access Tokens.*

### Paso 2: Activar el Hosting en Firebase
Una vez que el código aparezca en tu página de GitHub:
1. Ve a la [Consola de Firebase](https://console.firebase.google.com/).
2. Entra en tu proyecto y busca **"Build"** -> **"App Hosting"**.
3. Haz clic en **"Comenzar"** y conecta tu GitHub.
4. Elige el repositorio `smartpig-lite`.
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
- **IA PigDoctor:** Diagnósticos asistidos por inteligencia artificial.
