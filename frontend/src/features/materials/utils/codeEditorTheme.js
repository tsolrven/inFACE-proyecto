import { createTheme } from '@uiw/codemirror-themes';
import { tags as t } from '@lezer/highlight';

export const codeEditorTheme = createTheme({
  theme: 'dark',
  settings: {
    background: '#111114',
    foreground: '#E4E4E7',
    caret: '#EC4899',
    selection: 'rgba(236, 72, 153, 0.18)',
    selectionMatch: 'rgba(236, 72, 153, 0.12)',
    lineHighlight: 'rgba(255, 255, 255, 0.03)',
    gutterBackground: 'transparent',
    gutterForeground: '#52525B',
    gutterBorder: 'transparent',
    fontFamily:
      "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
  },
  styles: [
    { tag: t.comment, color: '#6B7280', fontStyle: 'italic' },
    { tag: t.string, color: '#86EFAC' },
    { tag: [t.number, t.bool, t.null], color: '#FBBF24' },
    { tag: [t.keyword, t.controlKeyword, t.moduleKeyword], color: '#F472B6' },
    { tag: [t.definitionKeyword, t.typeName], color: '#818CF8' },
    {
      tag: [t.function(t.variableName), t.function(t.propertyName)],
      color: '#60A5FA',
    },
    { tag: t.variableName, color: '#E4E4E7' },
    { tag: t.propertyName, color: '#93C5FD' },
    { tag: [t.operator, t.punctuation], color: '#A1A1AA' },
    { tag: t.tagName, color: '#F472B6' },
    { tag: t.attributeName, color: '#FBBF24' },
    { tag: t.angleBracket, color: '#71717A' },
    { tag: t.className, color: '#818CF8' },
    { tag: t.invalid, color: '#F87171' },
  ],
});
