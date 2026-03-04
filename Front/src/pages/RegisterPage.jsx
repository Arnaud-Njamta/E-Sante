import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Activity, Phone, ArrowRight } from 'lucide-react';

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary[50]} 0%, ${({ theme }) => theme.colors.background} 50%);
  padding: ${({ theme }) => theme.spacing[6]};
`;

const FormCard = styled.div`
  width: 100%;
  max-width: 480px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  padding: ${({ theme }) => theme.spacing[8]};
  animation: fadeInUp 0.5s ease both;
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const LogoIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary[500]}, ${({ theme }) => theme.colors.primary[600]});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  svg { width: 24px; height: 24px; }
`;

const FormTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.sizes['2xl']};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing[1]};
`;

const FormSubtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing[3]};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const BottomText = styled.p`
  text-align: center;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: ${({ theme }) => theme.spacing[6]};

  a {
    color: ${({ theme }) => theme.colors.primary[500]};
    font-weight: ${({ theme }) => theme.typography.weights.semibold};
    &:hover { text-decoration: underline; }
  }
`;

export default function RegisterPage() {
    const navigate = useNavigate();
    const { register: registerUser } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const { register, handleSubmit, formState: { errors }, watch } = useForm();

    const onSubmit = async (formData) => {
        setSubmitting(true);
        try {
            await registerUser({
                nom: formData.nom,
                prenom: formData.prenom,
                email: formData.email,
                password: formData.password,
                telephone: formData.telephone,
                date_naissance: formData.dateNaissance,
            });
            toast.success('Compte créé avec succès !');
            navigate('/dashboard', { replace: true });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur lors de la création du compte');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <PageWrapper>
            <FormCard>
                <LogoSection>
                    <LogoIcon><Activity /></LogoIcon>
                    <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>E-Santé</span>
                </LogoSection>

                <FormTitle>Créer un compte</FormTitle>
                <FormSubtitle>Rejoignez E-Santé pour un meilleur suivi de vos traitements.</FormSubtitle>

                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Row>
                        <Input
                            label="Prénom"
                            placeholder="Jean"
                            icon={User}
                            error={errors.prenom?.message}
                            {...register('prenom', { required: 'Le prénom est requis' })}
                        />
                        <Input
                            label="Nom"
                            placeholder="Dupont"
                            icon={User}
                            error={errors.nom?.message}
                            {...register('nom', { required: 'Le nom est requis' })}
                        />
                    </Row>

                    <Input
                        label="E-mail"
                        type="email"
                        placeholder="jean.dupont@email.com"
                        icon={Mail}
                        error={errors.email?.message}
                        {...register('email', {
                            required: 'L\'email est requis',
                            pattern: { value: /^\S+@\S+$/i, message: 'Email invalide' },
                        })}
                    />

                    <Input
                        label="Téléphone"
                        type="tel"
                        placeholder="+33 6 12 34 56 78"
                        icon={Phone}
                        error={errors.telephone?.message}
                        {...register('telephone')}
                    />

                    <Input
                        label="Date de naissance"
                        type="date"
                        error={errors.dateNaissance?.message}
                        {...register('dateNaissance', { required: 'La date de naissance est requise' })}
                    />

                    <Input
                        label="Mot de passe"
                        type="password"
                        placeholder="Minimum 8 caractères"
                        icon={Lock}
                        error={errors.password?.message}
                        {...register('password', {
                            required: 'Le mot de passe est requis',
                            minLength: { value: 8, message: 'Minimum 8 caractères' },
                        })}
                    />

                    <Input
                        label="Confirmer le mot de passe"
                        type="password"
                        placeholder="••••••••"
                        icon={Lock}
                        error={errors.confirmPassword?.message}
                        {...register('confirmPassword', {
                            required: 'Confirmez le mot de passe',
                            validate: (val) => val === watch('password') || 'Les mots de passe ne correspondent pas',
                        })}
                    />

                    <Button type="submit" fullWidth disabled={submitting} iconRight={ArrowRight}>
                        {submitting ? 'Création…' : 'Créer mon compte'}
                    </Button>
                </Form>

                <BottomText>
                    Déjà un compte ? <Link to="/login">Se connecter</Link>
                </BottomText>
            </FormCard>
        </PageWrapper>
    );
}
