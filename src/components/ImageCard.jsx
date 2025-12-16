import React, { useState } from 'react';
import { PLACEHOLDER_IMG } from '../config';
import { getImageDisplaySrc, getImageStatus } from '../utils/imageUtils';

export const ImageCard = ({
  image,
  onDelete,
  onEdit,
  onAttachLocal,
  onUploadWeChat
}) => {
  const { hasLocal, hasRemote, srcItem } = getImageStatus(image.srcIcon, image.srcList);
  const displaySrc = getImageDisplaySrc(image.srcIcon, image.srcList, PLACEHOLDER_IMG);
  const [copiedText, setCopiedText] = useState('');

  const handleCopy = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(type);
      setTimeout(() => setCopiedText(''), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedText(type);
        setTimeout(() => setCopiedText(''), 2000);
      } catch (fallbackErr) {
        console.error('Failed to copy:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="image-card">
      <div className="image-wrapper">
        <img
          src={displaySrc}
          alt={image.title}
          onError={(e) => {
            e.target.src = PLACEHOLDER_IMG;
          }}
        />
        {!hasLocal && <div className="image-badge placeholder-badge">占位</div>}
        {hasRemote && (
          <div
            className="image-badge remote-badge"
            onClick={() => window.open(srcItem.remote, '_blank')}
          >
            已上传(微信)
          </div>
        )}
      </div>
      <div className="image-info">
        <span
          className={`image-title ${copiedText === 'title' ? 'copied' : ''}`}
          onClick={() => handleCopy(image.title, 'title')}
          title="点击复制"
        >
          {image.title}
          {copiedText === 'title' && <span className="copy-hint">已复制</span>}
        </span>
        {image.enTitle && (
          <span
            className={`image-en-title ${copiedText === 'enTitle' ? 'copied' : ''}`}
            onClick={() => handleCopy(image.enTitle, 'enTitle')}
            title="点击复制"
          >
            {image.enTitle}
            {copiedText === 'enTitle' && <span className="copy-hint">已复制</span>}
          </span>
        )}
        <div className="image-category">
          <span className="category-label">分类：</span>
          <span className="category-value">{image.category}</span>
        </div>
        <div className="image-actions">
          <button className="delete-button" onClick={() => onDelete(image.id, image.category)}>
            删除
          </button>
          <button className="details-button" onClick={() => onEdit(image)}>
            编辑/查看
          </button>
          {hasRemote && !hasLocal && (
            <label className="upload-local-button">
              补本地
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files && e.target.files[0];
                  if (file) {
                    onAttachLocal(file, image);
                  }
                  e.target.value = '';
                }}
              />
            </label>
          )}
          {hasLocal && !hasRemote && (
            <button className="wechat-button" onClick={() => onUploadWeChat(image)}>
              上传微信
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

