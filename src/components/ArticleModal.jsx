import React from 'react';

export const ArticleModal = ({
  isOpen,
  onClose,
  plant,
  currentArticle,
  onArticleSelect,
  showArticleList,
  onBack
}) => {
  if (!isOpen || !plant) return null;

  return (
    <div className="article-modal-overlay">
      <div className="article-modal">
        <div className="mini-program-header">
          <div className="nav-left">
            <button
              className="nav-back-btn"
              onClick={() => {
                if (currentArticle) {
                  onBack();
                } else {
                  onClose();
                }
              }}
            >
              ←
            </button>
          </div>
          <div className="nav-title">
            {currentArticle ? '文章详情' : plant.title}
          </div>
        </div>

        <div className="mini-program-content">
          {showArticleList ? (
            <div className="article-list">
              {plant.articles.map((article, index) => (
                <div
                  key={index}
                  className="article-list-item"
                  onClick={() => onArticleSelect(article)}
                >
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
  );
};

