const acorn = require('acorn');
const escodegen = require('escodegen');

function formatWarbandScriptLanguageCode(code) {
    const parsedAst = acorn.parse(code, { ecmaVersion: 5 });

    let indentationLevel = 0;

    traverse(parsedAst, {
        enter(node, parent) {
            if (node.type === 'CallExpression') {
                const operationNames = [
                    'try_begin',
                    'try_for_range',
                    'try_for_range_backwards',
                    'try_for_parties',
                    'try_for_agents',
                    'try_for_prop_instances',
                    'try_for_players',
                    'try_for_dict_keys',
                ];

                if (operationNames.includes(node.callee.name)) {
                    // Insert a newline before the operation call
                    if (parent.body.indexOf(node) === 0) {
                        const newlineNode = {
                            type: 'WhiteSpace',
                            value: '\n' + '    '.repeat(indentationLevel), // Adjust the desired indentation
                        };
                        parent.body.unshift(newlineNode);
                    }

                    // Add a tab indentation to the arguments of the operation
                    node.arguments.forEach(arg => {
                        if (arg.type === 'ArrayExpression') {
                            arg.elements.forEach(element => {
                                element.loc.indent += 1; // Adjust the indentation level
                            });
                        }
                    });

                    indentationLevel++;
                }
            }
        },
        leave(node) {
            if (node.type === 'CallExpression') {
                const operationNames = [
                    'try_begin',
                    'try_for_range',
                    'try_for_range_backwards',
                    'try_for_parties',
                    'try_for_agents',
                    'try_for_prop_instances',
                    'try_for_players',
                    'try_for_dict_keys',
                ];

                if (operationNames.includes(node.callee.name)) {
                    indentationLevel--;
                }
            }
        },
    });

    const formattedCode = escodegen.generate(parsedAst);
    return formattedCode;
}


module.exports = {
    formatWarbandScriptLanguageCode,
};

function activate(context) {
    // ... other activation code ...

    let disposable = vscode.commands.registerCommand('warbandsl.formatWarbandScript', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        const document = editor.document;
        const text = document.getText();

        // Format the code
        const formattedCode = formatWarbandScriptLanguageCode(text);

        // Apply the formatted code
        const edit = new vscode.TextEdit(
            new vscode.Range(0, 0, document.lineCount, 0),
            formattedCode
        );

        const workspaceEdit = new vscode.WorkspaceEdit();
        workspaceEdit.set(document.uri, [edit]);
        vscode.workspace.applyEdit(workspaceEdit);
    });

    context.subscriptions.push(disposable);
}

exports.activate = activate;