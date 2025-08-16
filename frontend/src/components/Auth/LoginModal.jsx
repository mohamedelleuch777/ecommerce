import React, { useState } from 'react';
import { X, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import styles from './LoginModal.module.css';

const LoginModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register } = useAuth();
  const { t } = useLanguage();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError(t('passwordsDoNotMatch'));
          setLoading(false);
          return;
        }
        result = await register({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        });
      }

      if (result.success) {
        onClose();
        // Reset form
        setFormData({
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          confirmPassword: ''
        });
      } else {
        setError(result.error);
      }
    } catch {
      setError(t('somethingWentWrong'));
    }
    
    setLoading(false);
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      confirmPassword: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className={styles.authModalOverlay} onClick={onClose}>
      <div className={styles.authModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.authModalHeader}>
          <h2>{isLogin ? t('signIn') : t('signUp')}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form className={styles.authForm} onSubmit={handleSubmit}>
          {error && <div className={styles.errorMessage}>{error}</div>}

          {!isLogin && (
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>{t('firstName')}</label>
                <div className={styles.inputWithIcon}>
                  <User size={20} />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder={t('enterFirstName')}
                    required={!isLogin}
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>{t('lastName')}</label>
                <div className={styles.inputWithIcon}>
                  <User size={20} />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder={t('enterLastName')}
                    required={!isLogin}
                  />
                </div>
              </div>
            </div>
          )}

          <div className={styles.formGroup}>
            <label>{t('email')}</label>
            <div className={styles.inputWithIcon}>
              <Mail size={20} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder={t('enterEmail')}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>{t('password')}</label>
            <div className={styles.inputWithIcon}>
              <Lock size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder={t('enterPassword')}
                required
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} style={{ position: 'relative' }} /> : <Eye size={20} style={{ position: 'relative' }} />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className={styles.formGroup}>
              <label>{t('confirmPassword')}</label>
              <div className={styles.inputWithIcon}>
                <Lock size={20} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder={t('confirmPassword')}
                  required={!isLogin}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={20} style={{ position: 'relative' }} /> : <Eye size={20} style={{ position: 'relative' }} />}
                </button>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className={styles.authSubmitBtn}
            disabled={loading}
          >
            {loading ? t('processingAction') : (isLogin ? t('signIn') : t('signUp'))}
          </button>
        </form>

        <div className={styles.authDivider}>
          <span>{t('or')}</span>
        </div>

        <div className={styles.authSwitch}>
          <p>
            {isLogin ? t('noAccount') : t('alreadyHaveAccount')}
            <button 
              type="button" 
              className={styles.switchModeBtn} 
              onClick={switchMode}
            >
              {isLogin ? t('signUp') : t('signIn')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;