import React from 'react';

export const UploadModal = ({
  isOpen,
  onClose,
  uploadName,
  onNameChange,
  categories,
  uploadCategory,
  onCategoryChange,
  onFileChange,
  onSubmit
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>新增图片</h2>
        <div className="form-group">
          <label>名称：</label>
          <input type="text" value={uploadName} onChange={(e) => onNameChange(e.target.value)} />
        </div>
        <div className="form-group">
          <label>分类：</label>
          <select value={uploadCategory} onChange={(e) => onCategoryChange(e.target.value)}>
            {categories.map((c, i) => (
              <option key={i} value={c}>
                {c}
              </option>
            ))}
            <option value="__uncategorized__">未分类</option>
          </select>
        </div>
        <div className="form-group">
          <label>图片：</label>
          <input type="file" onChange={(e) => onFileChange(e.target.files?.[0])} accept="image/*" />
        </div>
        <div className="modal-actions">
          <button onClick={onClose}>取消</button>
          <button onClick={onSubmit}>上传并保存</button>
        </div>
      </div>
    </div>
  );
};

