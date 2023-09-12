import React from 'react';
import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';
import {
  VarUI,
  VarSlider,
  VarColor,
  VarToggle,
  VarXY,
  VarSelect,
  VarAngle,
  VarImage,
} from 'react-var-ui';

import { projectStore } from '../../ProjectStore';
import { FilterSettingType } from '../../types';

export const PreviewSettings: React.FC = observer(() => {
  return (
    <VarUI
      values={{
        ...toJS(projectStore.settingValues),
        _image: projectStore.image?.src,
      }}
      updateValues={(data: any) => {
        for (const setting of projectStore.settings!) {
          if (setting.type === FilterSettingType.SELECT) {
            data[setting.key] = parseInt(data[setting.key]);
          }
        }

        if (data._image !== projectStore.image?.src) {
          projectStore.loadImage(data._image);
        }

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
              <VarSlider
                min={setting.minValue ?? -1}
                max={setting.maxValue ?? 1}
                step={setting.step ?? 1}
                path={setting.key}
                label={name}
                key={setting.id}
                defaultValue={setting.defaultValue}
                integer
              />
            );
          case FilterSettingType.FLOAT:
            return (
              <VarSlider
                min={setting.minValue ?? -1}
                max={setting.maxValue ?? 1}
                step={setting.step ?? 0.01}
                path={setting.key}
                label={name}
                defaultValue={setting.defaultValue}
                key={setting.id}
              />
            );
          case FilterSettingType.COLOR:
            return (
              <VarColor
                path={setting.key}
                label={name}
                key={setting.id}
                defaultValue={setting.defaultValue}
                alpha={setting.alpha}
              />
            );
          case FilterSettingType.BOOLEAN:
            return (
              <VarToggle
                path={setting.key}
                label={name}
                key={setting.id}
                defaultValue={setting.defaultValue}
              />
            );
          case FilterSettingType.OFFSET:
            return (
              <VarXY
                label={name}
                path={setting.key}
                key={setting.id}
                defaultValue={setting.defaultValue}
              />
            );
          case FilterSettingType.SELECT:
            return (
              <VarSelect
                path={setting.key}
                label={name}
                key={setting.id}
                options={
                  setting.selectValues?.map(value => ({
                    key: value.id,
                    label: value.name,
                    value: value.value,
                  })) || []
                }
                defaultValue={setting.defaultValue}
              />
            );
          case FilterSettingType.ANGLE:
            return (
              <VarAngle
                label={name}
                path={setting.key}
                key={setting.id}
                defaultValue={setting.defaultValue}
              />
            );
        }

        return null;
      })}
      <VarImage label="Preview image" path="_image" />
    </VarUI>
  );
});
