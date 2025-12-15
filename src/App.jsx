import { useState, useEffect } from 'react';
import './App.css';

// Base API URL
const API_BASE = 'http://localhost:3001/api';

function App() {
  // 状态管理
  const [images, setImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null); // use Index or ID
  const [newName, setNewName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [categories, setCategories] = useState([]); // List of category objects or strings
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // all | missingLocal | missingRemote

  // Articles Modal
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [currentPlant, setCurrentPlant] = useState(null);
  const [currentArticle, setCurrentArticle] = useState(null);
  const [showArticleList, setShowArticleList] = useState(true);

  // Upload Modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadCategory, setUploadCategory] = useState('');

  // 加载分类配置
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch(`${API_BASE}/categories`);
        const data = await response.json();
        const categoryList = data.map(c => c.name || c); // Handle object or string
        setCategories(categoryList);

        // Default to first category if available
        if (categoryList.length > 0) {
          setSelectedCategory(categoryList[0]);
        }
      } catch (error) {
        console.error('加载分类配置失败:', error);
      }
    };
    loadCategories();
  }, []);

  // 加载选中分类的数据
  useEffect(() => {
    if (!selectedCategory) return;

    const loadData = async () => {
      try {
        // If uncategorized, endpoint is '未分类' (encoded)
        const catName = selectedCategory === '__uncategorized__' ? '未分类' : selectedCategory;
        const response = await fetch(`${API_BASE}/data/${encodeURIComponent(catName)}`);
        if (!response.ok) {
          if (response.status === 404) {
            setImages([]);
            return;
          }
          throw new Error('Network response was not ok');
        }
        const data = await response.json();

        // Ensure data consistency with new structure
        const normalizedData = data.map(item => {
          const legacySrc =
            item.srcList && item.srcList.length > 0
              ? item.srcList[0]
              : item.src
                ? { local: '', remote: item.src }
                : { local: '', remote: '' };
          const srcIcon = item.srcIcon || legacySrc;
          return {
            ...item,
            category: item.category || '未分类',
            articles: item.articles || [],
            srcIcon,
            srcList: []
          };
        });

        setImages(normalizedData);
      } catch (error) {
        console.error(`Error loading data for ${selectedCategory}:`, error);
        setImages([]);
      }
    };

    loadData();
  }, [selectedCategory]);

  // 防抖搜索
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timerId);
  }, [searchTerm]);

  const upsertImage = async (item) => {
    if (item.id === undefined || item.id === null) {
      alert('数据缺少 id，无法保存');
      return;
    }
    const catName = item.category === '__uncategorized__' ? '未分类' : item.category;
    try {
      const res = await fetch(`${API_BASE}/data/${encodeURIComponent(catName)}/item`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (!res.ok) throw new Error('upsert failed');
      if (catName === (selectedCategory === '__uncategorized__' ? '未分类' : selectedCategory)) {
        setImages(prev => {
          const exists = prev.some(img => img.id === item.id);
          if (exists) {
            return prev.map(img => (img.id === item.id ? item : img));
          }
          return [...prev, item];
        });
      }
    } catch (error) {
      console.error('Failed to save item:', error);
      alert('保存失败');
    }
  };

  const deleteImageById = async (id, category) => {
    const catName = category === '__uncategorized__' ? '未分类' : category;
    const res = await fetch(`${API_BASE}/data/${encodeURIComponent(catName)}/item/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('delete failed');
    if (catName === (selectedCategory === '__uncategorized__' ? '未分类' : selectedCategory)) {
      setImages(prev => prev.filter(img => img.id !== id));
    }
  };

  // 删除图片
  const deleteImage = async (index) => {
    if (!window.confirm('确定要删除吗？')) return;
    const target = images[index];
    if (!target) return;
    try {
      await deleteImageById(target.id, target.category);
    } catch (error) {
      console.error(error);
      alert('删除失败');
    }
  };

  // 打开重命名
  const openRenameModal = (index) => {
    setSelectedImageIndex(index);
    setNewName(images[index].title);
    setIsModalOpen(true);
  };

  // 保存新名称
  const saveNewName = async () => {
    if (selectedImageIndex === null || !newName.trim()) return;
    const updated = { ...images[selectedImageIndex], title: newName.trim() };
    await upsertImage(updated);
    setIsModalOpen(false);
  };

  // 新增图片逻辑 (Upload 新增条目)
  const openUploadModal = () => {
    setUploadName('');
    setUploadFile(null);
    setUploadCategory(selectedCategory || categories[0]);
    setIsUploadModalOpen(true);
  }

  const handleUpload = async () => {
    if (!uploadFile || !uploadName) {
      alert('请填写名称并选择文件');
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadFile);

    // Query params for backend naming (icon upload on home)
    const type = 'icon';
    const cat = uploadCategory === '__uncategorized__' ? '未分类' : uploadCategory;

    try {
      // 1. Upload File
      const uploadRes = await fetch(`${API_BASE}/upload?name=${encodeURIComponent(uploadName)}&type=${type}&category=${encodeURIComponent(cat)}`, {
        method: 'POST',
        body: formData
      });

      if (!uploadRes.ok) throw new Error('Upload failed');
      const uploadData = await uploadRes.json();

      // 2. Add to JSON
      const newItem = {
        id: Date.now(), // Temp ID
        title: uploadName,
        category: cat,
        articles: [],
        introduction: '',
        morphology: [],
        carePoints: [],
        careInfo: {},
        srcIcon: {
          local: uploadData.path,
          remote: ''
        },
        srcList: []
      };

      await upsertImage(newItem);

      setIsUploadModalOpen(false);
      alert('上传成功');
    } catch (err) {
      console.error(err);
      alert('上传失败');
    }
  };

  // 针对已有远程但无本地的补图上传
  const handleAttachLocal = async (file, image, index) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    const cat = image.category || '未分类';
    const type = 'icon';
    const name = image.title || 'unknown';

    try {
      const uploadRes = await fetch(`${API_BASE}/upload?name=${encodeURIComponent(name)}&type=${type}&category=${encodeURIComponent(cat)}`, {
        method: 'POST',
        body: formData
      });
      if (!uploadRes.ok) throw new Error('Upload failed');
      const uploadData = await uploadRes.json();

      const updatedItem = {
        ...image,
        srcIcon: {
          local: uploadData.path,
          remote: image.srcIcon ? image.srcIcon.remote : ''
        },
        srcList: []
      };
      await upsertImage(updatedItem);
      alert('本地图片已上传并更新');
    } catch (err) {
      console.error(err);
      alert('上传失败');
    }
  };

  const filteredImages = images.filter(image => {
    const matchesSearch = image.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
    if (!matchesSearch) return false;
    const icon = image.srcIcon || { local: '', remote: '' };
    if (filterMode === 'missingLocal') return !icon.local;
    if (filterMode === 'missingRemote') return !icon.remote;
    return true;
  });

  const PLACEHOLDER_IMG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="#f0f0f0"/><text x="50%" y="50%" fill="#999" font-size="20" font-family="Arial" text-anchor="middle" dominant-baseline="middle">No Image</text></svg>`;

  return (
    <div className="app">
      <header className="app-header">
        <h1>多肉管理系统</h1>
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="搜索当前分类..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-container">
          <select
            className="filter-select"
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
          >
            <option value="all">全部</option>
            <option value="missingLocal">缺本地</option>
            <option value="missingRemote">缺远端</option>
          </select>
        </div>
        <div className="category-filter-container">
          <select
            className="category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
            <option value="__uncategorized__">未分类</option>
          </select>
        </div>
        <button className="add-button" onClick={openUploadModal}>
          新增/上传
        </button>
      </header>

      <main className="image-grid">
        {filteredImages.length === 0 && <div className="no-data">暂无数据</div>}
        {filteredImages.map((image, index) => {
          // 展示逻辑：优先本地；如果没有本地，用占位图；如果有微信远端则显示标识并允许预览
          const srcItem = image.srcIcon
            ? image.srcIcon
            : (image.srcList && image.srcList.length > 0 ? image.srcList[0] : null);
          const hasLocal = !!(srcItem && srcItem.local);
          const hasRemote = !!(srcItem && srcItem.remote);
          const localSrc = hasLocal ? '/' + srcItem.local.replace(/^public\//, 'flower/') : '';
          const displaySrc = hasLocal ? localSrc : PLACEHOLDER_IMG;

          return (
            <div key={index} className="image-card">
              <div className="image-wrapper">
                <img src={displaySrc} alt={image.title} onError={(e) => { e.target.src = PLACEHOLDER_IMG; }} />
                {!hasLocal && <div className="image-badge placeholder-badge">占位</div>}
                {hasRemote && <div className="image-badge remote-badge" onClick={() => window.open(srcItem.remote, '_blank')}>已上传(微信)</div>}
              </div>
              <div className="image-info">
                <span className="image-title">{image.title}</span>
                <div className="image-category">
                  <span className="category-label">分类：</span>
                  <span className="category-value">{image.category}</span>
                </div>
                <div className="image-actions">
                  <button className="rename-button" onClick={() => openRenameModal(index)}>
                    重命名
                  </button>
                  <button className="details-button" onClick={() => {
                    if (image.articles && image.articles.length > 0) {
                      setCurrentPlant(image);
                      setShowArticleList(true);
                      setIsArticleModalOpen(true);
                    } else {
                      alert('暂无文章');
                    }
                  }}>详情</button>
                  <button className="delete-button" onClick={() => deleteImage(index)}>
                    删除
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
                          handleAttachLocal(file, image, index);
                          e.target.value = '';
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </main>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>新增图片</h2>
            <div className="form-group">
              <label>名称：</label>
              <input type="text" value={uploadName} onChange={e => setUploadName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>分类：</label>
              <select value={uploadCategory} onChange={e => setUploadCategory(e.target.value)}>
                {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
                <option value="__uncategorized__">未分类</option>
              </select>
            </div>
            <div className="form-group">
              <label>图片：</label>
              <input type="file" onChange={e => setUploadFile(e.target.files[0])} accept="image/*" />
            </div>
            <div className="modal-actions">
              <button onClick={() => setIsUploadModalOpen(false)}>取消</button>
              <button onClick={handleUpload}>上传并保存</button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>重命名</h2>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <div className="modal-actions">
              <button onClick={() => setIsModalOpen(false)}>取消</button>
              <button onClick={saveNewName}>保存</button>
            </div>
          </div>
        </div>
      )}

      {/* Article Modal (Kept mostly same, just simplified logic) */}
      {isArticleModalOpen && currentPlant && (
        <div className="article-modal-overlay">
          <div className="article-modal">
            <div className="mini-program-header">
              <div className="nav-left">
                <button className="nav-back-btn" onClick={() => {
                  if (currentArticle) {
                    setCurrentArticle(null);
                    setShowArticleList(true);
                  } else {
                    setIsArticleModalOpen(false);
                  }
                }}>←</button>
              </div>
              <div className="nav-title">
                {currentArticle ? '文章详情' : currentPlant.title}
              </div>
            </div>

            <div className="mini-program-content">
              {showArticleList ? (
                <div className="article-list">
                  {currentPlant.articles.map((article, index) => (
                    <div key={index} className="article-list-item" onClick={() => {
                      setCurrentArticle(article);
                      setShowArticleList(false);
                    }}>
                      <div className="article-item-title">{article.title}</div>
                    </div>
                  ))}
                </div>
              ) : (
                currentArticle && (
                  <div className="article-content">
                    <iframe src={currentArticle.url} className="article-iframe" />
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
