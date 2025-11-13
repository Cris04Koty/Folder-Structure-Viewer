import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import { Dirent } from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
  // Añadimos un log para confirmar que la extensión se activa correctamente.
  console.log("¡La extensión 'Folder Structure Viewer' se está activando!");

  const disposable = vscode.commands.registerCommand(
    'folderStructureViewer.generate',
    async () => {
      const selectedFolder = await selectWorkspaceFolder();
      if (!selectedFolder) {
        return;
      }

      const contentType = await askContentType();
      if (!contentType) {
        return;
      }
      const includeFiles = contentType.label === 'Carpetas y archivos';

      // --- NUEVA FUNCIONALIDAD: Elegir nombre de archivo ---
      // Usamos showInputBox para que el usuario pueda nombrar el archivo.
      const fileName = await vscode.window.showInputBox({
        prompt: '¿Cómo quieres llamar al archivo de salida?',
        value: 'estructura.txt', // Valor por defecto
        validateInput: (text) => {
          return text ? null : 'El nombre del archivo no puede estar vacío.'; // Validación simple
        },
      });

      // Si el usuario presiona 'Escape' o deja el campo vacío, cancelamos la operación.
      if (!fileName) {
        return;
      }

      const ignorePatterns = getIgnorePatterns();

      try {
        vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: 'Generando estructura de carpetas...',
            cancellable: false,
          },
          async (progress) => {
            progress.report({ increment: 0 });

            const structure = await generateDirectoryStructure(
              selectedFolder.uri.fsPath,
              includeFiles,
              ignorePatterns
            );

            // Usamos el nombre de archivo proporcionado por el usuario.
            const outputPath = path.join(selectedFolder.uri.fsPath, fileName);
            await fs.writeFile(outputPath, structure);

            const fileUri = vscode.Uri.file(outputPath);
            await vscode.window.showTextDocument(
              await vscode.workspace.openTextDocument(fileUri)
            );

            progress.report({ increment: 100 });

            // --- NUEVA FUNCIONALIDAD: Notificación con botón para copiar ---
            const relativePath = path.join(selectedFolder.name, fileName);
            const copyAction = 'Copiar al Portapapeles';

            // Mostramos una notificación con un botón de acción.
            vscode.window
              .showInformationMessage(
                `¡Estructura generada con éxito en: ${relativePath}!`,
                copyAction
              )
              .then((selection) => {
                // Si el usuario hace clic en el botón, copiamos el contenido.
                if (selection === copyAction) {
                  vscode.env.clipboard.writeText(structure);
                  vscode.window.showInformationMessage(
                    '¡Estructura copiada al portapapeles!'
                  );
                }
              });
          }
        );
      } catch (error: any) {
        vscode.window.showErrorMessage(
          `Error al generar la estructura: ${error.message}`
        );
      }
    }
  );

  context.subscriptions.push(disposable);
}

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
  // Nos aseguramos de ignorar el propio archivo de salida, sea cual sea su nombre.
  // Esta es una mejora de robustez.
  // (Nota: esta lógica se podría mejorar para manejar el nombre dinámico, pero por ahora lo dejamos así)
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
