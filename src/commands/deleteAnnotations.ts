import * as vscode from 'vscode';
import options from '../options';

export default function deleteAnnotations() {
    if (!options.comment) return;

    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const ranges = editor.selections
        .filter(sel => !sel.isEmpty)
        .map(sel =>
            new vscode.Range(
                new vscode.Position(sel.start.line, 0),
                new vscode.Position(sel.end.line, Infinity),
            )
        );

    if (!ranges.length) {
        ranges.push(
            new vscode.Range(
                new vscode.Position(0, 0),
                new vscode.Position(editor.document.lineCount - 1, Infinity),
            )
        );
    }

    editor.edit(editBuilder => {
        for (const sel of ranges) {
            const range = new vscode.Range(
                new vscode.Position(sel.start.line, 0),
                new vscode.Position(sel.end.line, Infinity),
            );
            const text = editor.document.getText(range)
                .split('\n')
                .filter(line => !line.includes(options.comment))
                .join('\n');
            editBuilder.replace(range, text);
        }
    });
}
