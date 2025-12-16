import React from 'react';

export const RenameModal = ({ isOpen, onClose, name, onNameChange, onSave }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>重命名</h2>
        <input type="text" value={name} onChange={(e) => onNameChange(e.target.value)} />
        <div className="modal-actions">
          <button onClick={onClose}>取消</button>
          <button onClick={onSave}>保存</button>
        </div>
      </div>
    </div>
  );
};

