import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';

interface FolderNode {
  name: string;
  fsPath: string;
  children: FolderNode[];
}

export async function showExclusionWebview(
  folderUri: vscode.Uri,
  ignorePatterns: string[]
): Promise<string[] | undefined> {
  return new Promise(async (resolve) => {
    const panel = vscode.window.createWebviewPanel(
      'folderExclusion',
      'Carpetas a Excluir',
      vscode.ViewColumn.Active,
      { enableScripts: true }
    );

    panel.webview.html = getLoadingHtml();

    panel.onDidDispose(() => resolve(undefined));
    
    panel.webview.onDidReceiveMessage((message) => {
      if (message.command === 'submit') {
        resolve(message.excludedPaths);
        panel.dispose();
      } else if (message.command === 'cancel') {
        resolve(undefined);
        panel.dispose();
      }
    });

    try {
      const treeData = await getFolderTree(folderUri.fsPath, ignorePatterns);
      
      panel.webview.html = getWebviewContent();
      panel.webview.postMessage({ command: 'loadData', data: treeData });
    } catch (error) {
      vscode.window.showErrorMessage('Error al leer las carpetas.');
      resolve(undefined);
      panel.dispose();
    }
  });
}

async function getFolderTree(dirPath: string, ignorePatterns: string[]): Promise<FolderNode> {
  const name = path.basename(dirPath);
  const node: FolderNode = { name, fsPath: dirPath, children: [] };

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    const validFolders = entries.filter(
      (entry) => entry.isDirectory() && !ignorePatterns.includes(entry.name)
    );

    validFolders.sort((a, b) => a.name.localeCompare(b.name));

    for (const folder of validFolders) {
      const childPath = path.join(dirPath, folder.name);
      const childNode = await getFolderTree(childPath, ignorePatterns);
      node.children.push(childNode);
    }
  } catch (error) {
    console.warn(`No se pudo leer el directorio: ${dirPath}. Error:`, error);
  }

  return node;
}

function getLoadingHtml(): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head><style>body { font-family: var(--vscode-font-family); padding: 20px; }</style></head>
    <body><h2>Escaneando carpetas...</h2><p>Por favor, espera.</p></body>
    </html>
  `;
}

function getWebviewContent(): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Excluir Carpetas</title>
        <style>
            body { font-family: var(--vscode-font-family); padding: 20px; color: var(--vscode-editor-foreground); }
            ul { list-style-type: none; margin: 0; padding: 0; } 
            .root-ul { padding-left: 0; }
            li { margin: 0; display: flex; flex-direction: column; position: relative; }
            .node-content { display: flex; align-items: center; padding: 4px 0; }
            
            .caret { cursor: pointer; user-select: none; display: inline-block; width: 16px; text-align: center; color: var(--vscode-icon-foreground); z-index: 2;}
            .caret::before { content: '▶'; font-size: 10px; }
            .caret-down::before { content: '▼'; }
            .caret-empty { display: inline-block; width: 16px; }
            
            .nested { 
                display: none; 
                margin-left: 7px; 
                padding-left: 14px; 
                border-left: 1px solid var(--vscode-tree-indentGuidesStroke, var(--vscode-panel-border));
            }
            
            .nested li::before {
                content: '';
                position: absolute;
                top: 13px; 
                left: -15px; 
                width: 10px; 
                border-top: 1px solid var(--vscode-tree-indentGuidesStroke, var(--vscode-panel-border));
            }

            .active { display: block; }

            label { cursor: pointer; margin-left: 5px; }
            input[type="checkbox"] { cursor: pointer; margin: 0; }
            input[type="checkbox"]:disabled + label { opacity: 0.6; }
            
            .actions { margin-top: 20px; padding-top: 15px; border-top: 1px solid var(--vscode-panel-border); }
            button { background-color: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; padding: 8px 12px; cursor: pointer; margin-right: 10px; }
            button:hover { background-color: var(--vscode-button-hoverBackground); }
            .btn-secondary { background-color: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); }
            .btn-secondary:hover { background-color: var(--vscode-button-secondaryHoverBackground); }
        </style>
    </head>
    <body>
        <h2>Selecciona las carpetas a excluir</h2>
        <p>Marca las carpetas que deseas ocultar en el resultado final.</p>
        
        <div id="tree-container"></div>

        <div class="actions">
            <button onclick="submitSelection()">Generar Estructura</button>
            <button class="btn-secondary" onclick="cancel()">Cancelar</button>
        </div>

        <script>
            const vscode = acquireVsCodeApi();

            window.addEventListener('message', event => {
                const message = event.data;
                if (message.command === 'loadData') {
                    const container = document.getElementById('tree-container');
                    if (message.data.children && message.data.children.length > 0) {
                        const ul = document.createElement('ul');
                        ul.className = 'root-ul';
                        renderTree(message.data.children, ul);
                        container.appendChild(ul);
                    } else {
                        container.innerHTML = '<p>No se encontraron subcarpetas.</p>';
                    }
                }
            });

            function renderTree(nodes, parentElement) {
                nodes.forEach(node => {
                    const li = document.createElement('li');
                    const nodeContent = document.createElement('div');
                    nodeContent.className = 'node-content';
                    
                    const hasChildren = node.children && node.children.length > 0;

                    const caret = document.createElement('span');
                    if (hasChildren) {
                        caret.className = 'caret caret-down'; 
                        caret.addEventListener('click', function() {
                            this.classList.toggle('caret-down');
                            const nested = li.querySelector('.nested');
                            if (nested) {
                                nested.classList.toggle('active');
                            }
                        });
                    } else {
                        caret.className = 'caret-empty'; 
                    }
                    nodeContent.appendChild(caret);

                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.value = node.fsPath; 
                    checkbox.id = node.fsPath;

                    checkbox.addEventListener('change', function(e) {
                        const isChecked = e.target.checked;
                        const nestedUl = li.querySelector('.nested');
                        if (nestedUl) {
                            const childCheckboxes = nestedUl.querySelectorAll('input[type="checkbox"]');
                            childCheckboxes.forEach(cb => {
                                cb.checked = isChecked;
                                cb.disabled = isChecked;
                            });
                        }
                    });

                    const label = document.createElement('label');
                    label.htmlFor = node.fsPath;
                    label.textContent = node.name;

                    nodeContent.appendChild(checkbox);
                    nodeContent.appendChild(label);
                    li.appendChild(nodeContent);

                    if (hasChildren) {
                        const childUl = document.createElement('ul');
                        childUl.className = 'nested active'; 
                        renderTree(node.children, childUl);
                        li.appendChild(childUl);
                    }

                    parentElement.appendChild(li);
                });
            }

            function submitSelection() {
                const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
                const excludedPaths = Array.from(checkboxes).map(cb => cb.value);
                vscode.postMessage({ command: 'submit', excludedPaths: excludedPaths });
            }

            function cancel() {
                vscode.postMessage({ command: 'cancel' });
            }
        </script>
    </body>
    </html>
  `;
}