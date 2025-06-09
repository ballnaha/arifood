import { Box, Typography } from '@mui/material';
import { keyframes } from '@mui/system';

// Animation keyframes
const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

const dots = keyframes`
  0%, 20% {
    color: transparent;
  }
  40% {
    color: #666666;
  }
  60%, 100% {
    color: transparent;
  }
`;

interface LoadingProps {
  type?: 'spinner' | 'dots' | 'pulse';
  size?: 'small' | 'medium' | 'large';
  text?: string;
  fullScreen?: boolean;
}

export default function Loading({ 
  type = 'spinner', 
  size = 'medium', 
  text = 'กำลังโหลด',
  fullScreen = false 
}: LoadingProps) {
  const sizeMap = {
    small: { spinner: 24, text: '0.8rem' },
    medium: { spinner: 40, text: '1rem' },
    large: { spinner: 56, text: '1.2rem' }
  };

  const containerSx = fullScreen 
    ? {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)',
      }
    : {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
        width: '100%'
      };

  const renderSpinner = () => (
    <Box
      sx={{
        width: sizeMap[size].spinner,
        height: sizeMap[size].spinner,
        border: '3px solid #F5F5F5',
        borderTop: '3px solid #000000',
        borderRadius: '50%',
        animation: `${spin} 1s linear infinite`,
        mb: 2
      }}
    />
  );

  const renderDots = () => (
    <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
      {[0, 1, 2].map((index) => (
        <Box
          key={index}
          sx={{
            width: sizeMap[size].spinner / 4,
            height: sizeMap[size].spinner / 4,
            backgroundColor: '#666666',
            borderRadius: '50%',
            animation: `${pulse} 1.5s ease-in-out infinite`,
            animationDelay: `${index * 0.3}s`
          }}
        />
      ))}
    </Box>
  );

  const renderPulse = () => (
    <Box
      sx={{
        width: sizeMap[size].spinner,
        height: sizeMap[size].spinner,
        backgroundColor: '#F5F5F5',
        borderRadius: '50%',
        animation: `${pulse} 2s ease-in-out infinite`,
        mb: 2,
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '60%',
          height: '60%',
          backgroundColor: '#CCCCCC',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          animation: `${pulse} 2s ease-in-out infinite 0.4s`,
        }
      }}
    />
  );

  const renderAnimation = () => {
    switch (type) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      default:
        return renderSpinner();
    }
  };

  const renderText = () => {
    if (type === 'dots') {
      return (
        <Typography 
          sx={{ 
            color: '#666666', 
            fontSize: sizeMap[size].text,
            fontWeight: 500,
            '&::after': {
              content: '"..."',
              animation: `${dots} 1.5s steps(4, end) infinite`,
            }
          }}
        >
          {text}
        </Typography>
      );
    }

    return (
      <Typography 
        sx={{ 
          color: '#666666', 
          fontSize: sizeMap[size].text,
          fontWeight: 500
        }}
      >
        {text}
      </Typography>
    );
  };

  return (
    <Box sx={containerSx}>
      {renderAnimation()}
      {renderText()}
    </Box>
  );
} 