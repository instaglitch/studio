import React from 'react';
import { observer } from 'mobx-react-lite';

import { projectStore } from '../../ProjectStore';
import { ShaderEditor } from './ShaderEditor';

export const VertexShaderEditor: React.FC = observer(() => {
  return (
    <div className="editor panel flex">
      <ShaderEditor
        value={projectStore.vertexShader}
        onChange={value => {
          projectStore.vertexShader = value;
          projectStore.updateShader();
          projectStore.requestDebouncedPreviewRender();
        }}
        errors={projectStore.vertexShaderErrors}
      />
    </div>
  );
});
