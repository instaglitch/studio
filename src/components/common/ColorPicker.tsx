import React, { useCallback, useState } from 'react';
import { ColorResult, SketchPicker } from 'react-color';
import clsx from 'clsx';

export interface ColorPickerProps {
  className?: string;
  value?: string;
  onChange?: (result: ColorResult) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  className,
  value,
  onChange,
}) => {
  const [show, setShow] = useState(false);
  const toggle = useCallback(() => setShow(show => !show), [setShow]);
  const close = useCallback(() => setShow(false), [setShow]);

  return (
    <div className={clsx('colorpicker', className)}>
      <div className="colorpicker-swatch" onClick={toggle}>
        <div className="colorpicker-color" style={{ background: value }} />
      </div>
      {show ? (
        <div className="colorpicker-popover">
          <div className="colorpicker-cover" onClick={close} />
          <SketchPicker color={value} onChange={onChange} />
        </div>
      ) : null}
    </div>
  );
};
