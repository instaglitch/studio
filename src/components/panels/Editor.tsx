import React from 'react';
import { observer } from 'mobx-react-lite';

import { projectStore } from '../../ProjectStore';
import { VertexShaderEditor } from './VertexShaderEditor';
import { FragmentShaderEditor } from './FragmentShaderEditor';
import { SettingsEditor } from './SettingsEditor';
import { Introduction } from './Introduction';

export const Editor: React.FC = observer(() => {
  switch (projectStore.tab) {
    case 'introduction':
      return <Introduction />;
    case 'vertex':
      return <VertexShaderEditor />;
    case 'fragment':
      return <FragmentShaderEditor />;
    case 'settings':
      return <SettingsEditor />;
  }

  return null;
});
