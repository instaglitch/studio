import React from 'react';
import { observer } from 'mobx-react-lite';

import { useProjectStore } from '../../ProjectStore';
import { VertexShaderEditor } from './VertexShaderEditor';
import { FragmentShaderEditor } from './FragmentShaderEditor';

export const Editor: React.FC = observer(() => {
  const projectStore = useProjectStore();

  switch (projectStore.tab) {
    case 'vertex':
      return <VertexShaderEditor />;
    case 'fragment':
      return <FragmentShaderEditor />;
    case 'settings':
      return <div className="panel flex">Currently not implemented.</div>;
  }

  return null;
});
