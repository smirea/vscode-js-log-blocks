import { QuickPickItem } from 'vscode';
import type { AnnotateOptions } from './commands/annotate';

const pattern = (
    label: string,
    startPattern: AnnotateOptions['startPattern'],
    endPattern?: AnnotateOptions['endPattern'],
): AnnotateOptions & QuickPickItem => ({
    label,
    startPattern,
    endPattern,
    detail: `${startPattern} <selection> ${endPattern}`,
});

const patterns = {
    time: pattern('console.time()', 'console.time($NAME)', 'console.timeEnd($NAME)'),
    group: pattern('console.group()', 'console.group($NAME)', 'console.groupEnd()'),
    log: pattern('console.log()', 'console.log($LINE)'),
};

export default patterns;
