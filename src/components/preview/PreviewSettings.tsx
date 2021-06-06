import React from 'react';
import { observer } from 'mobx-react-lite';
import DatGui, { DatNumber, DatBoolean, DatFolder } from 'react-dat-gui';

import { useProjectStore } from '../../ProjectStore';
import { FilterSettingType } from '../../types';

export const PreviewSettings: React.FC = observer(() => {
  const projectStore = useProjectStore();

  return (
    <DatGui
      data={projectStore.settingValues}
      onUpdate={data => {
        console.log(data);
        projectStore.settingValues = data;
        projectStore.requestPreviewRender();
      }}
    >
      {projectStore.settings.map(setting => {
        if (!setting.key) {
          return null;
        }

        const name = setting.name || setting.key;

        switch (setting.type) {
          case FilterSettingType.INTEGER:
            return (
              <DatNumber
                min={setting.minValue ?? -1}
                max={setting.maxValue ?? 1}
                step={setting.step ?? 1}
                path={setting.key}
                label={name}
                key={setting.id}
              />
            );
          case FilterSettingType.FLOAT:
            return (
              <DatNumber
                min={setting.minValue ?? -1}
                max={setting.maxValue ?? 1}
                step={setting.step ?? 0.01}
                path={setting.key}
                label={name}
                key={setting.id}
              />
            );
          case FilterSettingType.COLOR:
            return null; // TODO: handle
          case FilterSettingType.BOOLEAN:
            return (
              <DatBoolean path={setting.key} label={name} key={setting.id} />
            );
          case FilterSettingType.OFFSET:
            return (
              <DatFolder key={setting.id} title={name} closed={false}>
                <DatNumber
                  min={-1}
                  max={1}
                  step={0.01}
                  path={setting.key + '.0'}
                  label={'X'}
                />
                <DatNumber
                  min={-1}
                  max={1}
                  step={0.01}
                  path={setting.key + '.1'}
                  label={'Y'}
                />
              </DatFolder>
            );
          case FilterSettingType.SELECT:
            return null; // TODO: handle
        }

        return null;
      })}
    </DatGui>
  );
});
