import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { DEMO_ACCOUNTS } from '../../config/demoAccounts';

const Panel = styled.div`
  margin-top: 20px;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};

  h3 {
    margin: 0 0 4px;
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.textMuted};
  }

  > p {
    margin: 0 0 12px;
    font-size: 0.76rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.4;
  }
`;

const Grid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Row = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s, background 0.15s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary[200]};
    background: ${({ theme }) => theme.colors.primary[50]};
  }

  strong {
    display: block;
    font-size: 0.82rem;
    color: ${({ theme }) => theme.colors.text};
  }

  span {
    display: block;
    margin-top: 2px;
    font-size: 0.7rem;
    color: ${({ theme }) => theme.colors.textMuted};
  }

  code {
    font-size: 0.68rem;
    color: ${({ theme }) => theme.colors.primary[700]};
    white-space: nowrap;
  }
`;

export default function DemoAccountsPanel({ onPick, disabled }) {
  const { t } = useTranslation();

  return (
    <Panel>
      <h3>{t('auth.demo_accounts_title')}</h3>
      <p>{t('auth.demo_accounts_hint')}</p>
      <Grid>
        {DEMO_ACCOUNTS.map((account) => (
          <Row
            key={account.id}
            type="button"
            disabled={disabled}
            onClick={() => onPick(account.email, account.password)}
          >
            <div>
              <strong>{account.label}</strong>
              <span>{account.description}</span>
            </div>
            <code>{account.email}</code>
          </Row>
        ))}
      </Grid>
    </Panel>
  );
}
