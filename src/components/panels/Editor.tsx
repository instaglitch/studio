import React, { useCallback, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Controlled as CodeMirror } from 'react-codemirror2';

import { useProjectStore } from '../../ProjectStore';

export const Editor: React.FC = observer(() => {
  const projectStore = useProjectStore();

  const onResize = useCallback(() => {}, []);
  useEffect(() => {
    window.addEventListener('resize', onResize);

    return () => window.removeEventListener('resize', onResize);
  }, [onResize]);

  switch (projectStore.tab) {
    case 'vertex':
      return (
        <div className="editor panel flex">
          <CodeMirror
            key="vertex"
            options={{
              mode: 'x-shader/x-fragment',
              theme: 'dracula',
              lineNumbers: true,
              tabSize: 2,
            }}
            value={projectStore.vertexShader}
            onBeforeChange={(editor, data, value) =>
              (projectStore.vertexShader = value)
            }
            onChange={(editor, data, value) => {}}
          />
        </div>
      );
    case 'fragment':
      return (
        <div className="editor panel flex">
          <CodeMirror
            key="fragment"
            options={{
              mode: 'x-shader/x-fragment',
              theme: 'dracula',
              lineNumbers: true,
              tabSize: 2,
            }}
            value={projectStore.fragmentShader}
            onBeforeChange={(editor, data, value) =>
              (projectStore.fragmentShader = value)
            }
            onChange={(editor, data, value) => {}}
          />
        </div>
      );
    case 'settings':
      return <div className="panel flex">Currently not implemented.</div>;
  }

  return null;
});
