import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const SpinnerSVG = styled.svg`
  animation: ${spin} 0.8s linear infinite;
  color: ${({ $color, theme }) => $color || theme.colors.primary[500]};
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[8]};
`;

const Text = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export default function Spinner({ size = 32, color, text, fullPage = false }) {
    const spinner = (
        <SpinnerSVG
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            $color={color}
        >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
            <path
                d="M12 2a10 10 0 0 1 10 10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
            />
        </SpinnerSVG>
    );

    if (fullPage) {
        return (
            <Wrapper style={{ minHeight: '60vh' }}>
                {spinner}
                {text && <Text>{text}</Text>}
            </Wrapper>
        );
    }

    return (
        <Wrapper>
            {spinner}
            {text && <Text>{text}</Text>}
        </Wrapper>
    );
}
