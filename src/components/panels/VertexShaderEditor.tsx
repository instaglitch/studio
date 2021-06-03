import React from 'react';
import { observer } from 'mobx-react-lite';

import { useProjectStore } from '../../ProjectStore';
import { ShaderEditor } from './ShaderEditor';

export const VertexShaderEditor: React.FC = observer(() => {
  const projectStore = useProjectStore();

  return (
    <div className="editor panel flex">
      <ShaderEditor
        value={projectStore.vertexShader}
        onChange={value => (projectStore.vertexShader = value)}
        errors={projectStore.vertexShaderErrors}
      />
    </div>
  );
});
