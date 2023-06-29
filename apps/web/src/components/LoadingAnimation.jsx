import React from 'react';
import PropTypes from 'prop-types';

const LoadingAnimation = ({ size, color }) => {
  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  };

  const spinnerStyle = {
    borderRadius: '50%',
    borderTop: `2px solid ${color}`,
    borderRight: '2px solid transparent',
    borderBottom: '2px solid transparent',
    borderLeft: '2px solid transparent',
    width: size,
    height: size,
    animation: 'spin 1s linear infinite',
  };

  const keyframes = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  const styleId = 'loading-animation-style';

  React.useEffect(() => {
    // Inject the keyframes into a style tag
    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = keyframes;
    document.head.appendChild(styleElement);

    // Cleanup function to remove the style tag
    return () => {
      const element = document.getElementById(styleId);
      if (element) {
        element.remove();
      }
    };
  }, []);

  return (
    <div style={containerStyle}>
      <div style={spinnerStyle}></div>
    </div>
  );
};

LoadingAnimation.propTypes = {
  size: PropTypes.string,
  color: PropTypes.string,
};

LoadingAnimation.defaultProps = {
  size: '40px',
  color: '#000',
};

export default LoadingAnimation;
