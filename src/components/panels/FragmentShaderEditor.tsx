import React from 'react';
import { observer } from 'mobx-react-lite';

import { projectStore } from '../../ProjectStore';
import { ShaderEditor } from './ShaderEditor';

export const FragmentShaderEditor: React.FC = observer(() => {
  return (
    <div className="editor panel flex">
      <ShaderEditor
        value={projectStore.fragmentShader}
        onChange={value => {
          projectStore.fragmentShader = value;
          projectStore.updateShader();
          projectStore.requestDebouncedPreviewRender();
        }}
        errors={projectStore.fragmentShaderErrors}
      />
    </div>
  );
});
