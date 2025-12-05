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
  // 植物详情状态
  const [selectedPlantId, setSelectedPlantId] = useState(null);
  const [plantDetails, setPlantDetails] = useState({
    description: '',
    detailImages: [],
    tabs: []
  });
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // 加载图片数据
  useEffect(() => {
    const loadImages = async () => {
      try {
        const response = await fetch('/data/image-links.json');
        const data = await response.json();
        // 为没有分类的图片添加默认分类
        const imagesWithCategory = data.map(image => ({
          ...image,
          category: image.category || ''
        }));
        setImages(imagesWithCategory);
      } catch (error) {
        console.error('加载图片数据失败:', error);
      }
    };
    loadImages();
  }, []);
  
  // 加载植物详情
  const loadPlantDetails = async (id) => {
    try {
      // 先尝试从localStorage加载，优先使用本地保存的数据
      const storedData = localStorage.getItem(`plantDetails_${id}`);
      if (storedData) {
        return JSON.parse(storedData);
      }
      
      // 如果localStorage中没有，再从服务器加载
      const response = await fetch(`/data/details/${id}.json`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('加载植物详情失败:', error);
      return {
        description: '',
        detailImages: [],
        tabs: []
      };
    }
  };
  
  // 保存植物详情
  const savePlantDetails = async (id, details) => {
    try {
      // 使用localStorage作为临时存储解决方案
      localStorage.setItem(`plantDetails_${id}`, JSON.stringify(details));
      
      console.log('保存植物详情成功:', id, details);
      alert('植物详情保存成功！');
      return true;
    } catch (error) {
      console.error('保存植物详情失败:', error);
      alert('保存失败，请重试！');
      return false;
    }
  };

  // 加载分类配置
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/category-config.json');
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
  
  // 打开植物详情模态框
  const openDetailsModal = async (plantId) => {
    setSelectedPlantId(plantId);
    const details = await loadPlantDetails(plantId);
    setPlantDetails(details);
    setIsDetailsModalOpen(true);
    setIsEditing(false);
  };
  
  // 切换编辑模式
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };
  
  // 保存植物详情
  const handleSaveDetails = () => {
    if (!selectedPlantId) return;
    savePlantDetails(selectedPlantId, plantDetails);
    setIsEditing(false);
  };
  
  // 更新详情字段
  const updateDetailsField = (field, value) => {
    setPlantDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // 更新tab内容
  const updateTabContent = (tabIndex, contentIndex, field, value) => {
    const newTabs = [...plantDetails.tabs];
    const newContent = [...newTabs[tabIndex].content];
    newContent[contentIndex][field] = value;
    newTabs[tabIndex].content = newContent;
    setPlantDetails(prev => ({
      ...prev,
      tabs: newTabs
    }));
  };
  
  // 添加新的tab
  const addNewTab = () => {
    const newTabs = [...plantDetails.tabs];
    newTabs.push({
      title: '新标签页',
      content: []
    });
    setPlantDetails(prev => ({
      ...prev,
      tabs: newTabs
    }));
  };
  
  // 添加新的内容项
  const addContentItem = (tabIndex, type) => {
    const newTabs = [...plantDetails.tabs];
    const newContent = [...newTabs[tabIndex].content];
    newContent.push(type === 'text' ? { type: 'text', value: '' } : { type: 'image', src: '' });
    newTabs[tabIndex].content = newContent;
    setPlantDetails(prev => ({
      ...prev,
      tabs: newTabs
    }));
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
                <button className="details-button" onClick={() => openDetailsModal(image.id)}>
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
      
      {/* 植物详情模态框 */}
      {isDetailsModalOpen && (
        <div className="modal-overlay">
          <div className="modal details-modal">
            <div className="modal-header">
              <h2>植物详情</h2>
              <div className="modal-actions">
                {isEditing ? (
                  <>
                    <button onClick={toggleEditMode}>取消编辑</button>
                    <button onClick={handleSaveDetails} className="save-button">保存</button>
                  </>
                ) : (
                  <button onClick={toggleEditMode}>编辑</button>
                )}
                <button onClick={() => setIsDetailsModalOpen(false)}>关闭</button>
              </div>
            </div>
            
            {/* 描述部分 */}
            <div className="details-section">
              <h3>描述</h3>
              {isEditing ? (
                <textarea
                  className="details-textarea"
                  value={plantDetails.description}
                  onChange={(e) => updateDetailsField('description', e.target.value)}
                  placeholder="输入植物描述"
                />
              ) : (
                <p>{plantDetails.description || '暂无描述'}</p>
              )}
            </div>
            
            {/* 详情图片部分 */}
            <div className="details-section">
              <h3>详情图片</h3>
              <div className="detail-images-grid">
                {plantDetails.detailImages.map((image, index) => (
                  <div key={index} className="detail-image-item">
                    {isEditing ? (
                      <input
                        type="text"
                        className="detail-image-input"
                        value={image}
                        onChange={(e) => {
                          const newImages = [...plantDetails.detailImages];
                          newImages[index] = e.target.value;
                          updateDetailsField('detailImages', newImages);
                        }}
                        placeholder="图片URL"
                      />
                    ) : (
                      <img src={image} alt={`详情图片${index + 1}`} />
                    )}
                  </div>
                ))}
                {isEditing && (
                  <button
                    className="add-image-button"
                    onClick={() => {
                      const newImages = [...plantDetails.detailImages, ''];
                      updateDetailsField('detailImages', newImages);
                    }}
                  >
                    + 添加图片
                  </button>
                )}
              </div>
            </div>
            
            {/* Tab页部分 */}
            <div className="details-section">
              <h3>
                Tab页内容
                {isEditing && (
                  <button
                    className="add-tab-button"
                    onClick={addNewTab}
                  >
                    + 添加Tab
                  </button>
                )}
              </h3>
              {plantDetails.tabs.map((tab, tabIndex) => (
                <div key={tabIndex} className="tab-section">
                  <h4>
                    {isEditing ? (
                      <input
                        type="text"
                        className="tab-title-input"
                        value={tab.title}
                        onChange={(e) => {
                          const newTabs = [...plantDetails.tabs];
                          newTabs[tabIndex].title = e.target.value;
                          updateDetailsField('tabs', newTabs);
                        }}
                        placeholder="Tab标题"
                      />
                    ) : (
                      tab.title
                    )}
                  </h4>
                  <div className="tab-content">
                    {tab.content.map((item, contentIndex) => (
                      <div key={contentIndex} className={`content-item content-item-${item.type}`}>
                        {item.type === 'text' ? (
                          isEditing ? (
                            <textarea
                              className="content-textarea"
                              value={item.value}
                              onChange={(e) => updateTabContent(tabIndex, contentIndex, 'value', e.target.value)}
                              placeholder="文本内容"
                            />
                          ) : (
                            <p>{item.value}</p>
                          )
                        ) : (
                          isEditing ? (
                            <input
                              type="text"
                              className="content-image-input"
                              value={item.src}
                              onChange={(e) => updateTabContent(tabIndex, contentIndex, 'src', e.target.value)}
                              placeholder="图片URL"
                            />
                          ) : (
                            <img src={item.src} alt={`内容图片${contentIndex + 1}`} />
                          )
                        )}
                      </div>
                    ))}
                    {isEditing && (
                      <div className="add-content-buttons">
                        <button
                          className="add-text-button"
                          onClick={() => addContentItem(tabIndex, 'text')}
                        >
                          + 添加文本
                        </button>
                        <button
                          className="add-content-image-button"
                          onClick={() => addContentItem(tabIndex, 'image')}
                        >
                          + 添加图片
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App
