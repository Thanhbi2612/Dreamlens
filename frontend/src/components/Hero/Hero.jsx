import { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { useDream } from '../../contexts/DreamContext';
import imageService from '../../services/imageService';
import './Hero.css';

// Function to get greeting based on time of day
const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 12) {
    return 'Chào buổi sáng';
  } else if (hour >= 12 && hour < 18) {
    return 'Chào buổi chiều';
  } else if (hour >= 18 && hour < 22) {
    return 'Chào buổi tối';
  } else {
    return 'Chúc ngủ ngon';
  }
};

const Hero = () => {
  const { user, isAuthenticated } = useAuth();
  const { currentDream, createNewDream, updateDreamTitle, loadDreams } = useDream();
  const [dreamText, setDreamText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);

  const handleAnalyzeDream = async (e) => {
    e.preventDefault();
    if (!dreamText.trim()) return;

    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để sử dụng tính năng này!');
      return;
    }

    setIsAnalyzing(true);
    setGeneratedImage(null);

    try {
      // Đảm bảo có currentDream, nếu không thì tạo mới
      let activeDream = currentDream;
      if (!activeDream) {
        // Tạo dream mới với title từ prompt (first 50 chars)
        const dreamTitle = dreamText.length > 50
          ? dreamText.substring(0, 50) + '...'
          : dreamText;

        activeDream = await createNewDream(dreamTitle);

        if (!activeDream) {
          throw new Error('Không thể tạo giấc mơ mới');
        }
      }

      // Generate image với dream_id
      const result = await imageService.generateImage(
        dreamText,
        activeDream.id,
        null // negative_prompt
      );
      setGeneratedImage(result);

      // Nếu dream title vẫn là "Giấc mơ mới", update thành prompt
      if (activeDream.title === "Giấc mơ mới") {
        const dreamTitle = dreamText.length > 50
          ? dreamText.substring(0, 50) + '...'
          : dreamText;
        await updateDreamTitle(activeDream.id, dreamTitle);
      }

      // Reload dreams để cập nhật image_count
      await loadDreams();

      toast.success('Đã tạo ảnh minh họa giấc mơ thành công!', {
        position: "top-right",
        autoClose: 2000,
      });

    } catch (error) {
      console.error('Error analyzing dream:', error);
      const errorMessage = error.response?.data?.detail || 'Có lỗi xảy ra!';
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadImage = () => {
    if (!generatedImage?.image_url) return;

    const link = document.createElement('a');
    link.href = generatedImage.image_url;
    link.download = `dreamlens-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Đang tải ảnh xuống...', {
      position: "top-right",
      autoClose: 2000,
    });
  };

  return (
    <div className="hero-section">
      <div className="hero-container">
        {/* Hero Title */}
        <div className="hero-title-wrapper">
          <h1 className="hero-title">
            Khám Phá Giấc Mơ
          </h1>
          <p className="hero-subtitle">
            {isAuthenticated
              ? `${getGreeting()}, ${user?.username || user?.email}! `
              : "Giải mã thế giới tiềm thức của bạn với AI"
            }
          </p>
          <p className="hero-features">
            Phân tích cảm xúc • Trực quan hóa • Tạo hình ảnh minh họa
          </p>
        </div>

        {/* Dream Input Card */}
        <div className="dream-card-wrapper">
          {/* Glow effect */}
          <div className="dream-card-glow"></div>

          {/* Card content */}
          <div className="dream-card">
            <form onSubmit={handleAnalyzeDream} className="form-content">
              {/* Input Label */}
              <div>
                <div className="input-label-wrapper">
                  <span className="feature-icon">🌙</span>
                  <label htmlFor="dream-input" className="input-label">
                    Kể cho tôi nghe về giấc mơ của bạn...
                  </label>
                </div>

                {/* Textarea */}
                <textarea
                  id="dream-input"
                  value={dreamText}
                  onChange={(e) => setDreamText(e.target.value)}
                  placeholder="Tối qua, tôi mơ thấy mình đang bay trên bầu trời đầy sao..."
                  className="dream-textarea"
                  disabled={isAnalyzing}
                />
              </div>

              {/* Character count */}
              <div className="textarea-info">
                <span>{dreamText.length} ký tự</span>
                <span className="textarea-hint">
                  <span>✨</span>
                  <span>Hãy mô tả chi tiết để tôi hiểu rõ hơn</span>
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!dreamText.trim() || isAnalyzing}
                className="submit-button"
              >
                <span className="submit-button-content">
                  {isAnalyzing ? (
                    <>
                      <svg className="spinner" viewBox="0 0 24 24">
                        <circle
                          className="spinner-circle"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="spinner-path"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Đang tạo ảnh... (10-30s)</span>
                    </>
                  ) : (
                    <>
                      <span>🔮</span>
                      <span>Giải Mã Giấc Mơ</span>
                    </>
                  )}
                </span>

                {/* Shimmer effect */}
                <div className="button-shimmer"></div>
              </button>
            </form>

            {/* Features */}
            <div className="features-grid">
              <div className="feature-item">
                <div>
                  <div className="feature-title feature-title-aqua">Phân tích cảm xúc</div>
                  <div className="feature-description">Biểu đồ tâm trạng chi tiết</div>
                </div>
              </div>
              <div className="feature-item">
                <div>
                  <div className="feature-title feature-title-purple">Hình ảnh AI</div>
                  <div className="feature-description">Minh họa giấc mơ của bạn</div>
                </div>
              </div>
              <div className="feature-item">
                <div>
                  <div className="feature-title feature-title-pink">Lưu trữ</div>
                  <div className="feature-description">Theo dõi hành trình giấc mơ</div>
                </div>
              </div>
            </div>

            {/* Generated Image Display */}
            {generatedImage && (
              <div className="generated-image-section">
                <div className="generated-image-header">
                  <h3>Hình ảnh minh họa giấc mơ</h3>
                  <button
                    className="download-btn"
                    onClick={handleDownloadImage}
                    title="Tải xuống"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                </div>
                <div className="generated-image-container">
                  <img
                    src={generatedImage.image_url}
                    alt={generatedImage.prompt}
                    className="generated-image"
                  />
                </div>

                {/* Dream Analysis Display */}
                {generatedImage.analysis && (
                  <div className="dream-analysis-section">
                    <div className="analysis-header">
                      <h3>
                        <span className="analysis-icon">🔮</span>
                        Phân tích giấc mơ
                      </h3>
                    </div>
                    <div className="analysis-content">
                      {generatedImage.analysis}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Floating elements decoration */}
        <div className="floating-blob floating-blob-1"></div>
        <div className="floating-blob floating-blob-2"></div>
      </div>
    </div>
  );
};

export default Hero;
