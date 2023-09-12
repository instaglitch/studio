import React, { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';

import { projectStore } from '../../ProjectStore';

export const PreviewCanvas: React.FC = observer(() => {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!divRef.current) {
      return;
    }

    const div = divRef.current;
    div.textContent = '';

    if (projectStore.previewCanvas) {
      div.append(projectStore.previewCanvas);
    }
  }, [projectStore.previewCanvas]);

  return <div ref={divRef} />;
});
