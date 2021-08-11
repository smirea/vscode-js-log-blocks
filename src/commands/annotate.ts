import * as vscode from 'vscode';
import options from '../options';

export type AnnotateOptions = {
    startPattern: string;
    endPattern?: string;
};

export default function annotate({ startPattern, endPattern }: AnnotateOptions) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return; // No open text editor

    const updates: Array<{
        name: string;
        line: string;
        prefix: string;
        start: vscode.Position;
        end: vscode.Position;
        startIndent: string;
        endIndent: string;
    }> = [];

    for (const [index, selection] of editor.selections.entries()) {
        const { start, end } = selection;
        const range = new vscode.Range(
            new vscode.Position(start.line, 0),
            new vscode.Position(end.line, Infinity),
        );
        const text = editor.document.getText(range);
        const lines = text.split('\n');
        const [startIndent] = lines[0].match(/^\s*/)!;
        const [endIndent] = lines[lines.length - 1].match(/^\s*/)!;
        let [name] = lines[0]
            .replace(/\b(var|let|const|while|if|then|else|switch|case|break|return|async|await|function)\b/, '')
            .replace(/'/g, '')
            .match(/[$\w\d][\w\d_$]+/i) || ['selection'];

        if (options.indexMultiple) {
            name = editor.selections.length === 1 ? name : `${index}. ${name}`;
        }

        let prefix = '';

        if (options.newlineAfterConsecutiveLogs) {
            if (updates[index - 1] && updates[index - 1].end.line === start.line) {
                prefix = '\n';
            }
        }

        updates.push({
            name,
            line: lines[0].trim().replace(/'/g, ''),
            prefix,
            start: new vscode.Position(start.line, 0),
            end: new vscode.Position(end.line + 1, 0),
            startIndent,
            endIndent,
        });
    }


    editor.edit(editBuilder => {
        for (const { name, line, prefix, start, end, startIndent, endIndent } of updates) {
            const lp = options.logPrefix || '';
            const replace = (str: string) =>
                str.replace('$NAME', `'${lp}${name}'`).replace('$LINE', `'${lp}${line}'`);

            const startStr = [
                prefix,
                startIndent,
                replace(startPattern),
                ';',
                options.comment || '',
                '\n',
            ].join('');
            editBuilder.insert(start, startStr);

            if (endPattern) {
                const endStr = [
                    endIndent,
                    replace(endPattern),
                    ';',
                    options.comment || '',
                    '\n',
                ].join('');
                editBuilder.insert(end, endStr);
            }
        }
    });
}
