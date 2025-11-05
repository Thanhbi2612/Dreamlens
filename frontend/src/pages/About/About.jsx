import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <main className="about-main-content">
        <div className="about-container">
          {/* Hero Section */}
          <section className="about-hero">
            <h1 className="about-title">
              Về <span className="gradient-text">DreamLens</span>
            </h1>
            <p className="about-subtitle">
              Nơi giấc mơ của bạn trở thành hiện thực qua sức mạnh của AI
            </p>
          </section>

          {/* Story Section */}
          <section className="about-section">
            <div className="section-icon">✨</div>
            <h2 className="section-title">Câu chuyện của chúng tôi</h2>
            <p className="section-text">
              DreamLens ra đời từ niềm đam mê biến những ý tưởng trừu tượng thành hình ảnh cụ thể.
              Chúng tôi tin rằng mỗi người đều có một thế giới riêng trong tâm trí, và AI có thể
              giúp bạn chia sẻ thế giới đó với mọi người.
            </p>
            <p className="section-text">
              Với công nghệ Stable Diffusion tiên tiến, chúng tôi mang đến cho bạn công cụ để
              sáng tạo không giới hạn - chỉ cần mô tả, và để AI vẽ lên giấc mơ của bạn.
            </p>
          </section>

          {/* Features Section */}
          <section className="about-section">
            <div className="section-icon">🎨</div>
            <h2 className="section-title">Tính năng nổi bật</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🤖</div>
                <h3 className="feature-title">AI Mạnh mẽ</h3>
                <p className="feature-text">
                  Sử dụng Stable Diffusion XL - mô hình AI hàng đầu trong việc tạo ảnh từ văn bản
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">💾</div>
                <h3 className="feature-title">Lưu trữ giấc mơ</h3>
                <p className="feature-text">
                  Quản lý và sắp xếp tất cả sáng tạo của bạn trong các dream sessions riêng biệt
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <h3 className="feature-title">Nhanh chóng</h3>
                <p className="feature-text">
                  Tạo ảnh chất lượng cao chỉ trong vài giây với API tốc độ cao
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🎭</div>
                <h3 className="feature-title">Đa dạng phong cách</h3>
                <p className="feature-text">
                  Từ anime đến realistic, từ nghệ thuật đến khoa học viễn tưởng - bạn chọn, AI vẽ
                </p>
              </div>
            </div>
          </section>

          {/* Technology Section */}
          <section className="about-section">
            <div className="section-icon">⚙️</div>
            <h2 className="section-title">Công nghệ</h2>
            <div className="tech-stack">
              <div className="tech-category">
                <h3 className="tech-category-title">Frontend</h3>
                <div className="tech-tags">
                  <span className="tech-tag">React</span>
                  <span className="tech-tag">Vite</span>
                  <span className="tech-tag">Tailwind CSS</span>
                </div>
              </div>

              <div className="tech-category">
                <h3 className="tech-category-title">Backend</h3>
                <div className="tech-tags">
                  <span className="tech-tag">FastAPI</span>
                  <span className="tech-tag">PostgreSQL</span>
                  <span className="tech-tag">SQLAlchemy</span>
                </div>
              </div>

              <div className="tech-category">
                <h3 className="tech-category-title">AI & Cloud</h3>
                <div className="tech-tags">
                  <span className="tech-tag">Stable Diffusion XL</span>
                  <span className="tech-tag">Hugging Face API</span>
                  <span className="tech-tag">OAuth 2.0</span>
                </div>
              </div>
            </div>
          </section>

          {/* Mission Section */}
          <section className="about-section mission-section">
            <div className="section-icon">🌟</div>
            <h2 className="section-title">Sứ mệnh</h2>
            <blockquote className="mission-quote">
              "Làm cho sức mạnh của AI trở nên dễ tiếp cận với mọi người,
              giúp mỗi cá nhân có thể biến ý tưởng sáng tạo của mình thành hiện thực."
            </blockquote>
          </section>

          {/* About Project Section */}
          <section className="about-section project-info-section">
            <div className="section-icon">👨‍💻</div>
            <h2 className="section-title">Về dự án</h2>
            <p className="section-text center">
              <strong>DreamLens</strong> là một dự án cá nhân được phát triển bởi một người
              nhằm mục đích học tập, thử nghiệm và giải trí.
            </p>
            <p className="section-text center">
              Dự án này không phục vụ mục đích thương mại, mà là nơi để khám phá
              và thử nghiệm các công nghệ AI hiện đại, đồng thời chia sẻ niềm vui
              sáng tạo với cộng đồng.
            </p>
          </section>

          {/* Contact Section */}
          <section className="about-section contact-section">
            <div className="section-icon">📧</div>
            <h2 className="section-title">Liên hệ</h2>
            <p className="section-text center">
              Có câu hỏi hoặc phản hồi? Chúng tôi rất mong được nghe từ bạn!
            </p>
            <div className="contact-info">
              <a href="mailto:contact@dreamlens.ai" className="contact-link">
                dinhnhatthanh02@gmail.com
              </a>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default About;
