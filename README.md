# Folder Structure Viewer

![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/tu-publisher-aqui.folder-structure-viewer?style=for-the-badge&label=Marketplace)

**Folder Structure Viewer** es una extensión simple pero potente para Visual Studio Code que te permite generar rápidamente una representación en texto de la estructura de directorios de tu proyecto. Es perfecta para documentación, compartir la disposición de un proyecto, o simplemente para tener una vista de pájaro de un nuevo código base.

---

## Características Principales

- **Generación de Árbol de Directorios:** Crea una representación visual y anidada de tus carpetas y archivos.
- **Contenido Personalizable:** Elige si quieres incluir solo las carpetas o tanto carpetas como archivos.
- **Soporte para Multi-Root Workspaces:** Si tienes varias carpetas en tu espacio de trabajo, la extensión te permitirá elegir sobre cuál actuar.
- **Nombre de Archivo Flexible:** ¡Tú decides cómo se llamará el archivo de salida!
- **Copia Rápida al Portapapeles:** Con un solo clic en la notificación, puedes copiar toda la estructura generada.
- **Ignora Archivos Irrelevantes:** Por defecto, ignora directorios comunes como `.git`, `node_modules`, `dist`, etc., para mantener la salida limpia.
- **Patrones de Ignorar Configurables:** Puedes añadir tus propias carpetas o archivos a la lista de ignorados a través de la configuración de VS Code.
- **Orden Alfabético:** Las carpetas y archivos se ordenan alfabéticamente en cada nivel para una fácil lectura.

---

## ¿Cómo se Usa?

Usar la extensión es muy sencillo. Sigue estos pasos:

1.  Abre la **Paleta de Comandos**:

    - `Ctrl+Shift+P` en Windows/Linux
    - `Cmd+Shift+P` en macOS

2.  Escribe y selecciona el comando **`Generar estructura de carpetas (estructura.txt)`**.

3.  Sigue los sencillos pasos que te irá pidiendo la extensión:
    - **Paso 1 (si aplica):** Si tienes varias carpetas abiertas, selecciona la carpeta raíz que quieres analizar.
    - **Paso 2:** Elige si quieres incluir "Carpetas y archivos" o "Solo carpetas".
    - **Paso 3:** Escribe el nombre que quieres darle al archivo de salida (por ejemplo, `arbol-del-proyecto.md`).

¡Y listo! La extensión generará el archivo, lo abrirá en una nueva pestaña y te mostrará una notificación para que puedas copiar el resultado directamente.

### Demostración

¡Mira qué fácil es usar la extensión!

![Demostración de la extensión en acción](./demostracion/demostracionUso.gif)

---

## Configuración

Puedes personalizar los patrones de archivos y carpetas a ignorar.

1.  Abre la configuración de VS Code (`Archivo > Preferencias > Configuración` o `Ctrl+,`).
2.  Busca `folderStructureViewer.ignorePatterns`.
3.  O, directamente en tu archivo `settings.json`, añade la siguiente propiedad con los patrones que desees:

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

Estos patrones se sumarán a la lista de ignorados por defecto.

---

## Historial de Cambios (Changelog)

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
3.  Presiona `F5` en VS Code para iniciar una sesión de depuración en el **Host de Desarrollo de Extensiones**.

---

**¡Disfruta de la extensión!**
