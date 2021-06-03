import React, { useEffect, useState } from 'react';
import { Controlled as CMControlled } from 'react-codemirror2';

export interface ShaderEditorProps {
  value: string;
  onChange: (value: string) => void;
  errors: Record<number, string[]>;
}

export const ShaderEditor: React.FC<ShaderEditorProps> = ({
  value,
  onChange,
  errors,
}) => {
  const [editor, setEditor] = useState<CodeMirror.Editor>();

  useEffect(() => {
    if (!editor) {
      return;
    }

    const lines = value.split('\n').length;
    for (let i = 0; i < lines; i++) {
      editor.setGutterMarker(i, 'errors', null);
    }

    for (const key of Object.keys(errors)) {
      const line = parseInt(key);

      const el = document.createElement('span');
      el.classList.add('error-icon');
      const elText = document.createElement('pre');
      elText.textContent = errors[line].join('\n');
      el.append(elText);

      editor.setGutterMarker(line, 'errors', el);
    }
  }, [editor, errors, value]);

  return (
    <CMControlled
      options={{
        mode: 'x-shader/x-fragment',
        theme: 'dracula',
        lineNumbers: true,
        tabSize: 2,
        gutters: ['errors', 'CodeMirror-linenumbers'],
      }}
      value={value}
      onBeforeChange={(editor, data, value) => onChange(value)}
      editorDidMount={editor => {
        setEditor(editor);
      }}
    />
  );
};
