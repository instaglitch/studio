import React from 'react';
import { observer } from 'mobx-react-lite';

import { useProjectStore } from '../../ProjectStore';
import { FilterSettingType } from '../../types';
import { PreviewCanvas } from './PreviewCanvas';

export const Preview: React.FC = observer(() => {
  const projectStore = useProjectStore();

  const renderOffsetMarks = () => {
    const offsetSettings = projectStore.settings.filter(
      setting => setting.type === FilterSettingType.OFFSET
    );
    if (offsetSettings.length === 0) {
      return null;
    }

    return offsetSettings.map(setting => {
      if (!projectStore.settingValues[setting.key]) {
        return null;
      }

      const [x, y] = projectStore.settingValues[setting.key];

      return (
        <div
          key={setting.id}
          className="offset-mark"
          style={{
            backgroundColor: setting.color,
            top: (y + 0.5) * projectStore.height,
            left: (x + 0.5) * projectStore.width,
          }}
        />
      );
    });
  };

  return (
    <div className="preview-wrap">
      {renderOffsetMarks()}
      <PreviewCanvas />
    </div>
  );
});
