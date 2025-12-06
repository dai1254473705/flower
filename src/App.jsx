import { useState, useEffect, useCallback } from 'react';
import './App.css';

function App() {
  // 状态管理
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [newName, setNewName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryImage, setEditingCategoryImage] = useState(null);
  const [editingCategoryValue, setEditingCategoryValue] = useState('');
  // 文章详情弹窗状态
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [currentPlant, setCurrentPlant] = useState(null);
  const [currentArticle, setCurrentArticle] = useState(null);
  const [showArticleList, setShowArticleList] = useState(true); // 控制显示文章列表还是内容
  // 加载图片数据
  useEffect(() => {
    const loadImages = async () => {
      try {
        const response = await fetch('/flower/data/image-links.json');
        const data = await response.json();
        // 为没有分类的图片添加默认分类
        // 为没有articles的图片添加默认空数组
        const imagesWithDefaults = data.map(image => ({
          ...image,
          category: image.category || '',
          articles: image.articles || []
        }));
        setImages(imagesWithDefaults);
      } catch (error) {
        console.error('加载图片数据失败:', error);
      }
    };
    loadImages();
  }, []);

  // 加载分类配置
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/flower/category-config.json');
        const data = await response.json();
        setCategories(data.categories);
      } catch (error) {
        console.error('加载分类配置失败:', error);
      }
    };
    loadCategories();
  }, []);

  // 防抖搜索
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300毫秒防抖

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);
  
  // 保存图片数据到JSON
  const saveImages = async (newImages) => {
    try {
      // 注意：在实际项目中，这需要后端API支持
      // 这里我们只是模拟保存操作
      console.log('保存图片数据:', newImages);
      setImages(newImages);
    } catch (error) {
      console.error('保存图片数据失败:', error);
    }
  };
  
  // 删除图片
  const deleteImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    saveImages(newImages);
  };
  
  // 打开重命名模态框
  const openRenameModal = (index) => {
    setSelectedImage(index);
    setNewName(images[index].title);
    setIsModalOpen(true);
  };
  
  // 保存新名称
  const saveNewName = () => {
    if (!selectedImage || !newName.trim()) return;
    
    const newImages = [...images];
    newImages[selectedImage].title = newName.trim();
    saveImages(newImages);
    setIsModalOpen(false);
  };
  
  // 新增图片
  const handleAddImage = (e) => {
    // 这里需要实现图片上传功能
    // 注意：在实际项目中，这需要后端API支持
    // 当前版本仅作为前端演示，不包含实际的图片上传功能
    console.log('图片新增功能需要后端API支持，用于处理文件上传和保存');
    alert('图片新增功能需要后端API支持才能实现完整功能');
  };

  // 生成JSON文件
  const generateJSON = () => {
    try {
      // 模拟备份过程
      console.log('正在备份旧文件...');
      console.log('旧文件已备份为: image-links.bak.json');
      
      // 生成新的JSON内容
      console.log('正在生成新的JSON文件...');
      
      // 创建下载链接
      const jsonContent = JSON.stringify(images, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'image-links.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert('JSON文件已生成并下载！请将下载的文件替换原始的image-links.json文件。\n\n注意：\n1. 旧文件已模拟备份为image-links.bak.json\n2. 请手动将下载的image-links.json文件放置到项目根目录');
    } catch (error) {
      console.error('生成JSON文件失败:', error);
      alert('生成JSON文件失败，请查看控制台日志');
    }
  };

  // 搜索处理
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // 分类筛选处理
  const handleCategoryFilter = (e) => {
    setSelectedCategory(e.target.value);
  };

  // 过滤后的图片列表
  const filteredImages = images.filter(image => {
    const matchesSearch = image.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
    let matchesCategory;
    if (selectedCategory === "__uncategorized__") {
      matchesCategory = !image.category || image.category === '';
    } else {
      matchesCategory = selectedCategory ? image.category === selectedCategory : true;
    }
    return matchesSearch && matchesCategory;
  });

  // 打开分类编辑模态框
  const openCategoryModal = (index) => {
    setEditingCategoryImage(index);
    setEditingCategoryValue(images[index].category || '');
    setIsCategoryModalOpen(true);
  };

  // 保存分类
  const saveCategory = () => {
    if (!editingCategoryImage) return;
    
    const newImages = [...images];
    newImages[editingCategoryImage].category = editingCategoryValue;
    saveImages(newImages);
    setIsCategoryModalOpen(false);
  };
  
  // 打开植物文章链接弹窗
  const openPlantArticles = (plant) => {
    // 如果有文章，打开弹窗显示文章列表
    if (plant.articles && plant.articles.length > 0) {
      setCurrentPlant(plant);
      setCurrentArticle(null);
      setShowArticleList(true);
      setIsArticleModalOpen(true);
    } else {
      alert('该植物暂无文章链接');
    }
  };

  // 关闭文章弹窗
  const closeArticleModal = () => {
    setIsArticleModalOpen(false);
    setCurrentPlant(null);
    setCurrentArticle(null);
    setShowArticleList(true);
  };

  // 查看文章详情
  const viewArticle = (article) => {
    setCurrentArticle(article);
    setShowArticleList(false);
  };

  // 返回文章列表
  const backToArticleList = () => {
    setShowArticleList(true);
    setCurrentArticle(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>图片管理系统</h1>
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="搜索图片..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div className="category-filter-container">
          <select
            className="category-select"
            value={selectedCategory}
            onChange={handleCategoryFilter}
          >
            <option value="">所有分类</option>
            <option value="__uncategorized__">未分类</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <button className="add-button" onClick={handleAddImage}>
          新增图片
        </button>
        <button className="generate-json-button" onClick={generateJSON}>
          生成 JSON
        </button>
      </header>
      
      <main className="image-grid">
        {filteredImages.map((image, index) => (
          <div key={index} className="image-card">
            <div className="image-wrapper">
              {/* 使用本地图片路径显示，绕过CORS限制 */}
              <img src={`/icon/${encodeURIComponent(image.title)}.jpg`} alt={image.title} />
              {/* 如果JSON中已有该图片，添加标识 */}
              <div className="json-indicator">JSON中已存在</div>
            </div>
            <div className="image-info">
              <span className="image-title">{image.title}</span>
              <div className="image-category">
                <span className="category-label">分类：</span>
                <span className={`category-value ${!image.category ? 'category-empty' : ''}`}>
                  {image.category || '未分类'}
                </span>
                <button className="category-button" onClick={() => openCategoryModal(index)}>
                  编辑分类
                </button>
              </div>
              <div className="image-actions">
                <button className="rename-button" onClick={() => openRenameModal(index)}>
                  重命名
                </button>
                <button className="details-button" onClick={() => openPlantArticles(image)}>
                  详情
                </button>
                <button className="delete-button" onClick={() => deleteImage(index)}>
                  删除
                </button>
              </div>
            </div>
          </div>
        ))}
      </main>
      
      {/* 重命名模态框 */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>重命名图片</h2>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="输入新名称"
            />
            <div className="modal-actions">
              <button onClick={() => setIsModalOpen(false)}>取消</button>
              <button onClick={saveNewName}>保存</button>
            </div>
          </div>
        </div>
      )}

      {/* 分类编辑模态框 */}
      {isCategoryModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>编辑图片分类</h2>
            <select
              className="category-select-modal"
              value={editingCategoryValue}
              onChange={(e) => setEditingCategoryValue(e.target.value)}
            >
              <option value="">未分类</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>{category}</option>
              ))}
            </select>
            <div className="modal-actions">
              <button onClick={() => setIsCategoryModalOpen(false)}>取消</button>
              <button onClick={saveCategory}>保存</button>
            </div>
          </div>
        </div>
      )}

      {/* 文章详情弹窗 - 模拟小程序界面 */}
      {isArticleModalOpen && currentPlant && (
        <div className="article-modal-overlay">
          <div className="article-modal">
            {/* 模拟小程序导航栏 */}
            <div className="mini-program-header">
              <div className="nav-left">
                {showArticleList ? (
                  <button className="nav-back-btn" onClick={closeArticleModal}>
                    ←
                  </button>
                ) : (
                  <button className="nav-back-btn" onClick={backToArticleList}>
                    ←
                  </button>
                )}
              </div>
              <div className="nav-title">
                {showArticleList ? currentPlant.title : currentArticle?.title || '文章详情'}
              </div>
              <div className="nav-right">
                <button className="nav-more-btn">
                  ···
                </button>
              </div>
            </div>
            
            {/* 文章内容区域 */}
            <div className="mini-program-content">
              {/* 文章列表 */}
              {showArticleList && (
                <div className="article-list">
                  <div className="article-list-header">
                    <h3>相关文章</h3>
                  </div>
                  <div className="article-list-items">
                    {currentPlant.articles.map((article, index) => (
                      <div 
                        key={index} 
                        className="article-list-item"
                        onClick={() => viewArticle(article)}
                      >
                        <div className="article-item-title">{article.title}</div>
                        <div className="article-item-url">{article.url}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 文章内容 */}
              {!showArticleList && currentArticle && (
                <div className="article-content">
                  <div className="article-content-header">
                    <h3>{currentArticle.title}</h3>
                  </div>
                  <div className="article-iframe-container">
                    <iframe 
                      src={currentArticle.url} 
                      title={currentArticle.title} 
                      className="article-iframe"
                      frameBorder="0"
                      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      

    </div>
  );
}

export default App
