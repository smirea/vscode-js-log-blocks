import * as vscode from 'vscode';
import annotate, { AnnotateOptions } from './commands/annotate';
import deleteAnnotations from './commands/deleteAnnotations';
import patterns from './patterns';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('vscode-js-log-blocks.wrap', async ({ pattern }: Partial<AnnotateOptions & { pattern: keyof typeof patterns }> = {}) => {
			if (pattern && patterns[pattern]) return annotate(patterns[pattern]);

			const result = await vscode.window.showQuickPick(Object.values(patterns), {
				title: 'Select Wrappers',
				canPickMany: false,
			});
			if (result) annotate(result);
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('vscode-js-log-blocks.delete', deleteAnnotations)
	);
}

// this method is called when your extension is deactivated
export function deactivate() {}
