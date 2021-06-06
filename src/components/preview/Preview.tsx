import React from 'react';
import { observer } from 'mobx-react-lite';

import { PreviewCanvas } from './PreviewCanvas';
import { PreviewSettings } from './PreviewSettings';

export const Preview: React.FC = observer(() => {
  return (
    <>
      <div className="preview-wrap">
        <PreviewCanvas />
      </div>
      <PreviewSettings />
    </>
  );
});
