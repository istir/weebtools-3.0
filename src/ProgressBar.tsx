// eslint-disable-next-line no-use-before-define
import React from 'react';

interface Props {
  percentage: number;
  shouldStop: boolean;
}
function ProgressBar(props: Props) {
  return (
    <div className="progress parent">
      <div
        style={{
          width: `${props.shouldStop ? 0 : props.percentage}%`,
        }}
        className="progress value"
      />
      <div
        style={{
          opacity: `${props.percentage > 0 && !props.shouldStop ? '1' : 0}`,
        }}
        className="progress textbox"
      >
        {`${props.percentage}%`}
      </div>
    </div>
  );
}

export default ProgressBar;
