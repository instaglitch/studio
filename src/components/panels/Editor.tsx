import React, { useCallback, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import MonacoEditor from 'react-monaco-editor';

import { useProjectStore } from '../../ProjectStore';

export const Editor: React.FC = observer(() => {
  const projectStore = useProjectStore();
  const editorRef = useRef<MonacoEditor>(null);

  const onResize = useCallback(() => editorRef.current?.editor?.layout(), []);
  useEffect(() => {
    window.addEventListener('resize', onResize);

    return () => window.removeEventListener('resize', onResize);
  }, [onResize]);

  switch (projectStore.tab) {
    case 'vertex':
      return (
        <div className="editor panel flex">
          <MonacoEditor
            language="glsl"
            theme="instaglitch"
            value={projectStore.vertexShader}
            onChange={val => (projectStore.vertexShader = val)}
            options={{ automaticLayout: true }}
            ref={editorRef}
          />
        </div>
      );
    case 'fragment':
      return (
        <div className="editor panel flex">
          <MonacoEditor
            language="glsl"
            theme="instaglitch"
            value={projectStore.fragmentShader}
            onChange={val => (projectStore.fragmentShader = val)}
            options={{ automaticLayout: true }}
            ref={editorRef}
          />
        </div>
      );
    case 'settings':
      return <div className="panel flex">Currently not implemented.</div>;
  }

  return null;
});
