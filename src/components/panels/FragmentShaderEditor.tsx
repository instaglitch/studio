import React from 'react';
import { observer } from 'mobx-react-lite';

import { useProjectStore } from '../../ProjectStore';
import { ShaderEditor } from './ShaderEditor';

export const FragmentShaderEditor: React.FC = observer(() => {
  const projectStore = useProjectStore();

  return (
    <div className="editor panel flex">
      <ShaderEditor
        value={projectStore.fragmentShader}
        onChange={value => {
          projectStore.fragmentShader = value;
          projectStore.requestDebouncedPreviewRender();
        }}
        errors={projectStore.fragmentShaderErrors}
      />
    </div>
  );
});
