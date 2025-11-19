# Folder Structure Viewer

![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/cristiandev.folder-structure-viewer?style=for-the-badge&label=Marketplace)
![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/cristiandev.folder-structure-viewer?style=for-the-badge&label=Installs)
![Visual Studio Marketplace Rating](https://img.shields.io/visual-studio-marketplace/r/cristiandev.folder-structure-viewer?style=for-the-badge&label=Rating)
![GitHub License](https://img.shields.io/github/license/Cris04Koty/Folder-Structure-Viewer?style=for-the-badge)

**Folder Structure Viewer** es una extensión simple pero potente para Visual Studio Code que te permite generar rápidamente una representación en texto de la estructura de directorios de tu proyecto. Es perfecta para documentación, compartir la disposición de un proyecto, o simplemente para tener una vista de pájaro de un nuevo código base.

---

## Características Principales

- **Menú Contextual Rápido:** Accede a todas las funciones con un simple clic derecho sobre cualquier carpeta en el explorador de archivos.
- **Generación de Árbol de Directorios:** Crea una representación visual y anidada de tus carpetas y archivos.
- **Copia Directa al Portapapeles:** Genera y copia la estructura de una carpeta al portapapeles con una sola acción.
- **Contenido Personalizable:** Elige si quieres incluir solo las carpetas o tanto carpetas como archivos.
- **Nombre de Archivo Flexible:** ¡Tú decides cómo se llamará el archivo de salida!
- **Ignora Archivos Irrelevantes:** Por defecto, ignora directorios comunes como `.git`, `node_modules`, `dist`, etc.
- **Patrones de Ignorar Configurables:** Añade tus propias carpetas o archivos a la lista de ignorados.
- **Soporte para Multi-Root Workspaces:** El comando original de la paleta sigue funcionando perfectamente en entornos con múltiples carpetas.

---

## ¿Cómo se Usa?

### Método 1: Desde el Explorador de Archivos (Recomendado)

Esta es la forma más rápida y directa de usar la extensión.

1.  En el explorador de archivos de VS Code, haz **clic derecho** sobre la carpeta que deseas analizar.
2.  En el menú contextual, elige una de las dos nuevas opciones:
    - **`Generar Estructura en Archivo...`**: Te guiará para elegir el contenido y el nombre del archivo de salida.
    - **`Copiar Estructura al Portapapeles`**: Genera la estructura y la copia directamente, ¡listo para pegar!

### Método 2: Desde la Paleta de Comandos

Este método es útil si no tienes una carpeta visible o trabajas en un workspace con múltiples raíces.

1.  Abre la **Paleta de Comandos**:
    - `Ctrl+Shift+P` en Windows/Linux
    - `Cmd+Shift+P` en macOS
2.  Escribe y selecciona el comando **`Generar estructura de carpetas (desde Paleta de Comandos)`**.
3.  Sigue los pasos que te irá pidiendo la extensión.

### Demostración

¡Mira qué fácil es usar el nuevo menú contextual!

_(Recomendación: Actualiza tu GIF para mostrar el nuevo flujo de trabajo con clic derecho, ¡es mucho más impresionante!)_

![Demostración de la extensión en acción](./demostracion/demostracionUso.gif)

---

## Configuración

Puedes personalizar los patrones de archivos y carpetas a ignorar.

1.  Abre la configuración de VS Code (`Archivo > Preferencias > Configuración` o `Ctrl+,`).
2.  Busca `folderStructureViewer.ignorePatterns`.
3.  O, directamente en tu archivo `settings.json`, añade la siguiente propiedad:

**Ejemplo (`settings.json`):**

```json
{
  "folderStructureViewer.ignorePatterns": [
    "logs",
    ".cache",
    "*.tmp",
    "__pycache__"
  ]
}
```

---

## Historial de Cambios (Changelog)

### 2.0.0

- **¡NUEVO!** Menú contextual en el explorador de archivos.
- **¡NUEVO!** Opción para "Generar Estructura en Archivo..." directamente con clic derecho en una carpeta.
- **¡NUEVO!** Opción para "Copiar Estructura al Portapapeles" directamente con clic derecho.
- Refactorización interna del código para mejorar el rendimiento y la mantenibilidad.

### 1.0.0

- Lanzamiento inicial de **Folder Structure Viewer**.
- Funcionalidad para generar árbol de directorios y archivos.
- Soporte para workspaces multi-raíz.
- Opción para elegir el nombre del archivo de salida.
- Botón para copiar el resultado al portapapeles.
- Patrones de ignorar personalizables.

---

## Para Desarrolladores

Si quieres contribuir o modificar el proyecto:

1.  Clona el repositorio.
2.  Ejecuta `npm install` para instalar las dependencias.
3.  Presiona `F5` en VS Code para iniciar una sesión de depuración.

---

**¡Disfruta de la extensión!**
