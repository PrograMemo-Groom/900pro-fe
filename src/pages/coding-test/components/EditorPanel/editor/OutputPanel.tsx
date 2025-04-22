import React from 'react';

interface OutputPanelProps {
  output: string;
}

const OutputPanel: React.FC<OutputPanelProps> = ({ output }) => {
  return (
    <div className="output-panel">
      <pre>{output || "// 실행 결과가 여기에 표시됩니다."}</pre>
    </div>
  );
};

export default OutputPanel;
