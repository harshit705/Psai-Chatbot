import React from 'react';
import { motion } from 'framer-motion';
import './LandingPage.css';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.65, ease: 'easeOut' },
  }),
};

const features = [
  {
    icon: '🤖',
    title: 'AI-Powered Chat',
    desc: 'Natural language understanding with lightning-fast AI responses powered by TarqaAI.',
  },
  {
    icon: '💬',
    title: 'Multi-Session',
    desc: 'Keep separate conversations for different projects without losing context.',
  },
  {
    icon: '🔒',
    title: 'Secure & Private',
    desc: 'All data secured with JWT authentication and MongoDB cloud storage.',
  },
  {
    icon: '📜',
    title: 'Chat History',
    desc: 'Full conversation history persisted across sessions and devices.',
  },
  {
    icon: '⚡',
    title: 'Instant Responses',
    desc: 'Real-time streaming responses so you never wait long.',
  },
  {
    icon: '📱',
    title: 'Fully Responsive',
    desc: 'Works beautifully on desktop, tablet, and mobile.',
  },
];

const pricingPlans = [
  {
    name: 'Free',
    price: '₹0',
    period: '/ month',
    features: ['50 messages / day', '1 chat session', 'Basic AI model', 'Chat history (7 days)'],
    cta: 'Get Started',
    highlight: false,
  },
  {
    name: 'Starter',
    price: '₹299',
    period: '/ month',
    features: ['500 messages / day', '5 chat sessions', 'Advanced AI model', 'Chat history (30 days)', 'Priority support'],
    cta: 'Start Free Trial',
    highlight: true,
    badge: 'Most Popular',
  },
  {
    name: 'Pro',
    price: '₹999',
    period: '/ month',
    features: ['Unlimited messages', 'Unlimited sessions', 'GPT-4 class model', 'Unlimited history', '24/7 priority support', 'API access'],
    cta: 'Go Pro',
    highlight: false,
  },
];

const faqs = [
  { q: 'Is there a free plan?', a: 'Yes! Our Free plan gives you 50 messages per day at no cost.' },
  { q: 'Can I upgrade anytime?', a: 'Absolutely. You can upgrade or downgrade your plan at any time from your profile settings.' },
  { q: 'Is my data safe?', a: 'Yes. All conversations are encrypted and stored securely with JWT-based authentication.' },
  { q: 'Which AI model does PSAI use?', a: 'PSAI uses TarqaAI to access state-of-the-art models including GPT-4 class models.' },
];

const LandingPage = ({ onLoginClick, onSignupClick }) => {
  return (
    <div className="landing-page">
      {/* Gradient orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* ── NAVBAR ── */}
      <header className="landing-nav">
        <div className="logo">PSAI</div>
        <nav className="nav-links">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="nav-actions">
          <button className="landing-btn ghost" onClick={onLoginClick}>Login</button>
          <button className="landing-btn primary" onClick={onSignupClick}>Sign Up Free</button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="hero">
        <motion.div
          className="hero-content"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
        >
          <div className="hero-badge">✨ AI-Powered Chatbot Platform</div>
          <h1 className="hero-title">
            PSAI<br />
            <span className="gradient-text">AI Assistant</span>
          </h1>
          <p className="hero-subtitle">
            Build smarter conversations with<br />
            AI-powered automation.
          </p>
          <div className="hero-cta">
            <button className="landing-btn primary large" onClick={onSignupClick}>
              🚀 Start Free Trial
            </button>
            <button className="landing-btn ghost large" onClick={onLoginClick}>
              ▶ Login to Dashboard
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat"><span className="stat-num">10K+</span><span className="stat-label">Users</span></div>
            <div className="stat-divider" />
            <div className="stat"><span className="stat-num">1M+</span><span className="stat-label">Messages</span></div>
            <div className="stat-divider" />
            <div className="stat"><span className="stat-num">99.9%</span><span className="stat-label">Uptime</span></div>
          </div>
        </motion.div>

        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
        >
          <div className="hero-img-wrapper">
            <img
              src="/dashboard-screenshot.png"
              alt="PSAI Dashboard Preview"
              className="dashboard-screenshot"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className="hero-img-glow" />
          </div>
        </motion.div>
      </section>

      {/* ── TRUSTED BY ── */}
      <section className="trusted">
        <p className="trusted-label">Trusted by builders around the world</p>
        <div className="trusted-logos">
          {['Developers', 'Startups', 'Enterprises', 'Creators', 'Researchers'].map((t) => (
            <span key={t} className="trusted-tag">{t}</span>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="features-section">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          Everything you need
        </motion.h2>
        <p className="section-subtitle">Powerful features built for modern AI conversations</p>
        <div className="features-grid">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="feature-card glass-card"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i * 0.5}
              whileHover={{ scale: 1.04, transition: { duration: 0.2 } }}
            >
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── DASHBOARD PREVIEW ── */}
      <section className="dashboard-preview-section">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          See it in action
        </motion.h2>
        <p className="section-subtitle">A clean, powerful interface built for productivity</p>
        <motion.div
          className="preview-wrapper"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <img
            src="/dashboard-screenshot.png"
            alt="PSAI Dashboard"
            className="preview-img"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </motion.div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="pricing-section">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          Simple Pricing
        </motion.h2>
        <p className="section-subtitle">Start free, scale as you grow</p>
        <div className="pricing-cards">
          {pricingPlans.map((plan, i) => (
            <motion.div
              key={plan.name}
              className={`pricing-card glass-card ${plan.highlight ? 'highlighted' : ''}`}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i * 0.5}
              whileHover={{ scale: plan.highlight ? 1.06 : 1.03, transition: { duration: 0.2 } }}
            >
              {plan.badge && <div className="plan-badge">{plan.badge}</div>}
              <h3 className="plan-name">{plan.name}</h3>
              <div className="plan-price">
                <span className="price-amount">{plan.price}</span>
                <span className="price-period">{plan.period}</span>
              </div>
              <ul className="plan-features">
                {plan.features.map((feat) => (
                  <li key={feat}><span className="check">✓</span> {feat}</li>
                ))}
              </ul>
              <button
                className={`landing-btn ${plan.highlight ? 'primary' : 'ghost'} full-width`}
                onClick={onSignupClick}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="faq-section">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          Frequently Asked Questions
        </motion.h2>
        <div className="faq-list">
          {faqs.map((item, i) => (
            <motion.div
              key={item.q}
              className="faq-item glass-card"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i * 0.3}
            >
              <h4>{item.q}</h4>
              <p>{item.a}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="landing-footer">
        <div className="footer-logo">PSAI</div>
        <p>© {new Date().getFullYear()} PSAI. All rights reserved.</p>
        <div className="footer-links">
          <button className="footer-link" onClick={onLoginClick}>Login</button>
          <span>·</span>
          <button className="footer-link" onClick={onSignupClick}>Sign Up</button>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
