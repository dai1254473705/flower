import React, { useState } from 'react';
import { PLACEHOLDER_IMG } from '../config';
import { normalizeImagePath } from '../utils/imageUtils';
import { stringifyList, parseFlexibleList } from '../utils/dataUtils';

export const EditModal = ({
  isOpen,
  onClose,
  editForm,
  onFormChange,
  categories,
  onSave,
  onDetailUpload,
  onUploadWeChatSrcList
}) => {
  const [jsonInput, setJsonInput] = useState('');
  const [showJsonImport, setShowJsonImport] = useState(false);
  const [importError, setImportError] = useState('');

  if (!isOpen || !editForm) return null;

  // JSON 导入功能
  const handleJsonImport = () => {
    if (!jsonInput.trim()) {
      setImportError('请输入 JSON 数据');
      return;
    }

    try {
      const imported = JSON.parse(jsonInput);
      
      // 只更新存在的字段，不改变 id
      const updates = {};
      
      if (imported.title !== undefined) {
        updates.title = imported.title;
      }
      if (imported.enTitle !== undefined) {
        updates.enTitle = imported.enTitle;
      }
      if (imported.category !== undefined) {
        // 处理 category 可能是数组的情况
        if (Array.isArray(imported.category)) {
          updates.category = imported.category[0] || editForm.category;
        } else {
          updates.category = imported.category;
        }
      }
      if (imported.introduction !== undefined) {
        updates.introduction = imported.introduction;
      }
      if (imported.morphology !== undefined) {
        // morphology 是数组，需要转换为文本格式
        if (Array.isArray(imported.morphology)) {
          updates.morphologyText = imported.morphology.join('\n');
        } else {
          updates.morphologyText = String(imported.morphology);
        }
      }
      if (imported.carePoints !== undefined) {
        // carePoints 是数组，需要转换为文本格式
        if (Array.isArray(imported.carePoints)) {
          updates.carePointsText = imported.carePoints.join('\n');
        } else {
          updates.carePointsText = String(imported.carePoints);
        }
      }
      if (imported.careInfo !== undefined && typeof imported.careInfo === 'object') {
        // 合并 careInfo 对象
        updates.careInfo = {
          ...editForm.careInfo,
          ...imported.careInfo
        };
      }

      // 应用更新
      Object.keys(updates).forEach((key) => {
        if (key === 'careInfo') {
          onFormChange('careInfo', updates.careInfo);
        } else {
          onFormChange(key, updates[key]);
        }
      });

      setJsonInput('');
      setShowJsonImport(false);
      setImportError('');
      alert('导入成功！');
    } catch (err) {
      setImportError('JSON 格式错误：' + err.message);
    }
  };

  // 处理文章列表
  const normalizeArticles = (articles) => {
    if (!Array.isArray(articles)) return [];
    return articles.map((item) => {
      if (typeof item === 'string') {
        // 如果是字符串，尝试解析为对象或保持为字符串
        try {
          const parsed = JSON.parse(item);
          if (typeof parsed === 'object' && parsed !== null) {
            return { title: parsed.title || '', url: parsed.url || '' };
          }
        } catch {
          // 如果不是JSON，可能是URL字符串
          return { title: '', url: item };
        }
      }
      if (typeof item === 'object' && item !== null) {
        return { title: item.title || '', url: item.url || '' };
      }
      return { title: '', url: '' };
    });
  };

  const handleArticleChange = (index, field, value) => {
    const articles = normalizeArticles(editForm.articles || []);
    const updated = [...articles];
    if (!updated[index]) {
      updated[index] = { title: '', url: '' };
    }
    updated[index] = { ...updated[index], [field]: value };
    onFormChange('articles', updated);
  };

  const handleAddArticle = () => {
    const articles = normalizeArticles(editForm.articles || []);
    onFormChange('articles', [...articles, { title: '', url: '' }]);
  };

  const handleRemoveArticle = (index) => {
    const articles = normalizeArticles(editForm.articles || []);
    const updated = articles.filter((_, i) => i !== index);
    onFormChange('articles', updated);
  };

  const handleSave = () => {
    const articles = normalizeArticles(editForm.articles || []);
    // 排除临时编辑字段，只保存实际数据字段
    const { morphologyText, carePointsText, articlesText, ...restForm } = editForm;
    const updated = {
      ...restForm,
      morphology: parseFlexibleList(morphologyText ?? stringifyList(editForm.morphology)),
      carePoints: parseFlexibleList(carePointsText ?? stringifyList(editForm.carePoints)),
      articles: articles.filter((a) => a.title || a.url), // 过滤空项
      careInfo: {
        wateringFrequency: editForm.careInfo?.wateringFrequency || '',
        lightRequirement: editForm.careInfo?.lightRequirement || '',
        suitableTemperature: editForm.careInfo?.suitableTemperature || '',
        soilRequirement: editForm.careInfo?.soilRequirement || ''
      },
      srcList: editForm.srcList || [],
      srcIcon: editForm.srcIcon || { local: '', remote: '' }
    };
    onSave(updated);
  };

  return (
    <div className="modal-overlay">
      <div className="modal large-modal">
        <div className="modal-header-with-actions">
          <h2>编辑 / 查看</h2>
          <button
            type="button"
            className="json-import-btn"
            onClick={() => {
              setShowJsonImport(!showJsonImport);
              setJsonInput('');
              setImportError('');
            }}
          >
            {showJsonImport ? '取消导入' : 'JSON 导入'}
          </button>
        </div>
        {showJsonImport && (
          <div className="json-import-section">
            <label>
              JSON 数据（粘贴后点击导入）
              <textarea
                className="json-input"
                value={jsonInput}
                onChange={(e) => {
                  setJsonInput(e.target.value);
                  setImportError('');
                }}
                placeholder='{"title": "粉姬莲", "enTitle": "Echeveria minima cv.", ...}'
                rows={8}
              />
            </label>
            {importError && <div className="import-error">{importError}</div>}
            <button type="button" className="import-json-btn" onClick={handleJsonImport}>
              导入 JSON
            </button>
          </div>
        )}
        <div className="modal-scroll">
          <div className="form-grid">
            <label>
              标题
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => onFormChange('title', e.target.value)}
              />
            </label>
            <label>
              英文名
              <input
                type="text"
                value={editForm.enTitle || ''}
                onChange={(e) => onFormChange('enTitle', e.target.value)}
              />
            </label>
            <label>
              分类
              <select
                value={editForm.category}
                onChange={(e) => onFormChange('category', e.target.value)}
              >
                {categories.map((c, i) => (
                  <option key={i} value={c}>
                    {c}
                  </option>
                ))}
                <option value="未分类">未分类</option>
              </select>
            </label>
            <label>
              介绍
              <textarea
                rows={3}
                value={editForm.introduction}
                onChange={(e) => onFormChange('introduction', e.target.value)}
              />
            </label>
            <label>
              形态（每行一条）
              <textarea
                rows={3}
                value={editForm.morphologyText ?? stringifyList(editForm.morphology)}
                onChange={(e) => onFormChange('morphologyText', e.target.value)}
              />
            </label>
            <label>
              养护要点（每行一条）
              <textarea
                rows={3}
                value={editForm.carePointsText ?? stringifyList(editForm.carePoints)}
                onChange={(e) => onFormChange('carePointsText', e.target.value)}
              />
            </label>
            <div className="care-info-grid">
              <label>
                浇水频率
                <input
                  type="text"
                  value={editForm.careInfo?.wateringFrequency || ''}
                  onChange={(e) =>
                    onFormChange('careInfo', {
                      ...editForm.careInfo,
                      wateringFrequency: e.target.value
                    })
                  }
                />
              </label>
              <label>
                光照需求
                <input
                  type="text"
                  value={editForm.careInfo?.lightRequirement || ''}
                  onChange={(e) =>
                    onFormChange('careInfo', {
                      ...editForm.careInfo,
                      lightRequirement: e.target.value
                    })
                  }
                />
              </label>
              <label>
                适宜温度
                <input
                  type="text"
                  value={editForm.careInfo?.suitableTemperature || ''}
                  onChange={(e) =>
                    onFormChange('careInfo', {
                      ...editForm.careInfo,
                      suitableTemperature: e.target.value
                    })
                  }
                />
              </label>
              <label>
                土壤需求
                <input
                  type="text"
                  value={editForm.careInfo?.soilRequirement || ''}
                  onChange={(e) =>
                    onFormChange('careInfo', {
                      ...editForm.careInfo,
                      soilRequirement: e.target.value
                    })
                  }
                />
              </label>
            </div>
            <div className="articles-section">
              <div className="articles-header">
                <label>文章列表</label>
                <button type="button" className="add-article-btn" onClick={handleAddArticle}>
                  + 添加文章
                </button>
              </div>
              <div className="articles-list">
                {normalizeArticles(editForm.articles || []).map((article, idx) => (
                  <div key={idx} className="article-item">
                    <input
                      type="text"
                      placeholder="标题"
                      value={article.title || ''}
                      onChange={(e) => handleArticleChange(idx, 'title', e.target.value)}
                      className="article-title-input"
                    />
                    <input
                      type="text"
                      placeholder="链接"
                      value={article.url || ''}
                      onChange={(e) => handleArticleChange(idx, 'url', e.target.value)}
                      className="article-url-input"
                    />
                    <button
                      type="button"
                      className="remove-article-btn"
                      onClick={() => handleRemoveArticle(idx)}
                    >
                      删除
                    </button>
                  </div>
                ))}
                {normalizeArticles(editForm.articles || []).length === 0 && (
                  <div className="no-articles">暂无文章，点击"添加文章"添加</div>
                )}
              </div>
            </div>
          </div>

          <div className="src-section">
            <div className="src-header">
              <h3>图集（srcList，多图）</h3>
              <label className="upload-local-button">
                上传多张
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    onDetailUpload(e.target.files);
                    e.target.value = '';
                  }}
                />
              </label>
            </div>
            <div className="src-list">
              {(editForm.srcList || []).map((s, idx) => {
                const hasLocal = !!s.local;
                const hasRemote = !!s.remote;
                const localSrc = hasLocal ? normalizeImagePath(s.local) : '';
                const displaySrc = hasLocal ? localSrc : PLACEHOLDER_IMG;
                return (
                  <div key={idx} className="src-item image-wrapper detail-wrapper">
                    <img
                      src={displaySrc}
                      alt={`detail-${idx}`}
                      onError={(e) => {
                        e.target.src = PLACEHOLDER_IMG;
                      }}
                    />
                    {!hasLocal && <div className="image-badge placeholder-badge">占位</div>}
                    {hasRemote && (
                      <div
                        className="image-badge remote-badge"
                        onClick={() => window.open(s.remote, '_blank')}
                      >
                        已上传(微信)
                      </div>
                    )}
                    {hasLocal && !hasRemote && (
                      <button
                        className="wechat-button small"
                        onClick={() => onUploadWeChatSrcList(editForm, idx)}
                      >
                        上传微信
                      </button>
                    )}
                    <div className="src-meta">
                      <div className="src-meta-row">local: {s.local || '-'}</div>
                      <div className="src-meta-row">remote: {s.remote || '-'}</div>
                    </div>
                  </div>
                );
              })}
              {(editForm.srcList || []).length === 0 && (
                <div className="no-data">暂无 srcList</div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={onClose}>关闭</button>
          <button onClick={handleSave}>保存</button>
        </div>
      </div>
    </div>
  );
};

