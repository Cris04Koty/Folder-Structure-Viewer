import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import { Dirent } from 'fs';
import * as path from 'path';

// El punto de entrada principal de la extensión
export function activate(context: vscode.ExtensionContext) {
  console.log('¡Folder Structure Viewer v2.0.0 está activo!');

  // 1. Comando original (desde la Paleta de Comandos)
  const commandPaletteCommand = vscode.commands.registerCommand(
    'folderStructureViewer.generate',
    async () => {
      // Este comando no recibe una carpeta, así que debemos preguntarle al usuario
      const selectedFolder = await selectWorkspaceFolder();
      if (selectedFolder) {
        runGenerator(selectedFolder.uri, 'file');
      }
    }
  );

  // 2. Nuevo comando: Generar archivo desde el Explorador (clic derecho)
  const generateFileCommand = vscode.commands.registerCommand(
    'folderStructureViewer.generateFromFileExplorer',
    (folderUri: vscode.Uri) => {
      // Este comando recibe la URI de la carpeta directamente del clic derecho
      runGenerator(folderUri, 'file');
    }
  );

  // 3. Nuevo comando: Copiar al portapapeles desde el Explorador (clic derecho)
  const copyToClipboardCommand = vscode.commands.registerCommand(
    'folderStructureViewer.copyStructureToClipboard',
    (folderUri: vscode.Uri) => {
      runGenerator(folderUri, 'clipboard');
    }
  );

  // Registramos todos los comandos
  context.subscriptions.push(
    commandPaletteCommand,
    generateFileCommand,
    copyToClipboardCommand
  );
}

/**
 * Función central que maneja toda la lógica de generación.
 * @param folderUri La URI de la carpeta sobre la que actuar.
 * @param mode 'file' para generar un archivo, 'clipboard' para copiar al portapapeles.
 */
async function runGenerator(folderUri: vscode.Uri, mode: 'file' | 'clipboard') {
  try {
    const contentType = await askContentType();
    if (!contentType) return; // Usuario canceló

    const includeFiles = contentType.label === 'Carpetas y archivos';
    const ignorePatterns = getIgnorePatterns();

    // Mostramos una notificación de progreso mientras trabajamos
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Generando estructura de carpetas...',
        cancellable: false,
      },
      async (progress) => {
        progress.report({ increment: 0 });

        const structure = await generateDirectoryStructure(
          folderUri.fsPath,
          includeFiles,
          ignorePatterns
        );

        // Decidimos qué hacer basándonos en el modo
        if (mode === 'file') {
          const fileName = await vscode.window.showInputBox({
            prompt: '¿Cómo quieres llamar al archivo de salida?',
            value: 'estructura.txt',
            validateInput: (text) =>
              text ? null : 'El nombre no puede estar vacío.',
          });

          if (fileName) {
            const outputPath = path.join(folderUri.fsPath, fileName);
            await fs.writeFile(outputPath, structure);
            const fileUri = vscode.Uri.file(outputPath);
            await vscode.window.showTextDocument(
              await vscode.workspace.openTextDocument(fileUri)
            );

            const relativePath = path.join(
              path.basename(folderUri.fsPath),
              fileName
            );
            showSuccessNotification(
              structure,
              `¡Estructura guardada en: ${relativePath}!`
            );
          }
        } else if (mode === 'clipboard') {
          await vscode.env.clipboard.writeText(structure);
          vscode.window.showInformationMessage(
            '¡Estructura copiada al portapapeles!'
          );
        }

        progress.report({ increment: 100 });
      }
    );
  } catch (error: any) {
    vscode.window.showErrorMessage(
      `Error al generar la estructura: ${error.message}`
    );
  }
}

/**
 * Muestra una notificación de éxito con un botón para copiar al portapapeles.
 * @param structure El texto del árbol de directorios.
 * @param message El mensaje a mostrar.
 */
function showSuccessNotification(structure: string, message: string) {
  const copyAction = 'Copiar al Portapapeles';
  vscode.window
    .showInformationMessage(message, copyAction)
    .then((selection) => {
      if (selection === copyAction) {
        vscode.env.clipboard.writeText(structure);
        vscode.window.showInformationMessage(
          '¡Estructura copiada al portapapeles!'
        );
      }
    });
}

// --- Las funciones auxiliares de abajo no han cambiado ---

async function selectWorkspaceFolder(): Promise<
  vscode.WorkspaceFolder | undefined
> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showErrorMessage(
      'No hay ninguna carpeta abierta en el espacio de trabajo.'
    );
    return undefined;
  }
  if (workspaceFolders.length === 1) {
    return workspaceFolders[0];
  }
  const picked = await vscode.window.showQuickPick(
    workspaceFolders.map((folder) => ({
      label: folder.name,
      description: folder.uri.fsPath,
      target: folder,
    })),
    { placeHolder: 'Seleccione la carpeta raíz para generar la estructura' }
  );
  return picked?.target;
}

async function askContentType(): Promise<vscode.QuickPickItem | undefined> {
  return vscode.window.showQuickPick(
    [{ label: 'Carpetas y archivos' }, { label: 'Solo carpetas' }],
    { placeHolder: '¿Qué desea incluir en la estructura?' }
  );
}

function getIgnorePatterns(): string[] {
  const defaultPatterns = [
    'node_modules',
    '.git',
    'dist',
    'build',
    '.vscode',
    'out',
  ];
  const userConfig = vscode.workspace.getConfiguration('folderStructureViewer');
  const userPatterns = userConfig.get<string[]>('ignorePatterns');
  const safeUserPatterns = Array.isArray(userPatterns) ? userPatterns : [];
  const finalPatterns = new Set([...defaultPatterns, ...safeUserPatterns]);
  finalPatterns.add('estructura.txt');
  return Array.from(finalPatterns);
}

async function generateDirectoryStructure(
  rootDir: string,
  includeFiles: boolean,
  ignorePatterns: string[]
): Promise<string> {
  async function walk(dir: string, prefix: string): Promise<string> {
    let entries: Dirent[];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch (error) {
      console.warn(`No se pudo leer el directorio: ${dir}. Error:`, error);
      return '';
    }
    const filteredEntries = entries.filter(
      (entry) => !ignorePatterns.includes(entry.name)
    );
    filteredEntries.sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });
    let content = '';
    for (const entry of filteredEntries) {
      if (entry.isDirectory()) {
        content += `${prefix}|-- ${entry.name}/\n`;
        content += await walk(path.join(dir, entry.name), `${prefix}|   `);
      } else if (includeFiles && entry.isFile()) {
        content += `${prefix}|-- ${entry.name}\n`;
      }
    }
    return content;
  }
  const rootBaseName = path.basename(rootDir);
  let finalStructure = `${rootBaseName}/\n`;
  finalStructure += await walk(rootDir, '');
  return finalStructure;
}

export function deactivate() {}
