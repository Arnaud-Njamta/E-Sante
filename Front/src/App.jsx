import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { FamilleProfilProvider } from './context/FamilleProfilContext';
import ThemeProvider from './theme/ThemeProvider';
import RoleRoute from './utils/RoleRoute';
import AppLayout from './components/layout/AppLayout';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { ROLES } from './config/branding';

const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = React.lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('./pages/ResetPasswordPage'));
const RegisterProfessionnelPage = React.lazy(() => import('./pages/RegisterProfessionnelPage'));
const PrivacyPolicyPage = React.lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsOfServicePage = React.lazy(() => import('./pages/TermsOfServicePage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const PatientPharmacyHubPage = React.lazy(() => import('./pages/PatientPharmacyHubPage'));
const MedicationsPage = React.lazy(() => import('./pages/MedicationsPage'));
const PrisesPage = React.lazy(() => import('./pages/PrisesPage'));
const OrdonnancePage = React.lazy(() => import('./pages/OrdonnancePage'));
const AnalyticsPage = React.lazy(() => import('./pages/AnalyticsPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const SantePage = React.lazy(() => import('./pages/SantePage'));
const EtablissementDetailPage = React.lazy(() => import('./pages/EtablissementDetailPage'));
const MedecinDetailPage = React.lazy(() => import('./pages/MedecinDetailPage'));
const PharmacieChatPage = React.lazy(() => import('./pages/PharmacieChatPage'));
const MedecinDashboardPage = React.lazy(() => import('./pages/MedecinDashboardPage'));
const MedecinAvisPage = React.lazy(() => import('./pages/MedecinAvisPage'));
const PharmacieDashboardPage = React.lazy(() => import('./pages/PharmacieDashboardPage'));
const MedecinProfilPage = React.lazy(() => import('./pages/MedecinProfilPage'));
const MedecinRendezVousPage = React.lazy(() => import('./pages/MedecinRendezVousPage'));
const MedecinParametresPage = React.lazy(() => import('./pages/MedecinParametresPage'));
const MedecinOrdonnancesPage = React.lazy(() => import('./pages/MedecinOrdonnancesPage'));
const MedecinServicesPage = React.lazy(() => import('./pages/MedecinServicesPage'));
const PharmacieMessagesPage = React.lazy(() => import('./pages/PharmacieMessagesPage'));
const PharmacieHorairesPage = React.lazy(() => import('./pages/PharmacieHorairesPage'));
const PharmacieProduitsPage = React.lazy(() => import('./pages/PharmacieProduitsPage'));
const StructureReservationsPage = React.lazy(() => import('./pages/StructureReservationsPage'));
const PatientReservationsPage = React.lazy(() => import('./pages/PatientReservationsPage'));
const PatientRendezVousPage = React.lazy(() => import('./pages/PatientRendezVousPage'));
const PaymentReturnPage = React.lazy(() => import('./pages/PaymentReturnPage'));
const CarnetMedicalPage = React.lazy(() => import('./pages/CarnetMedicalPage'));
const UrgencePage = React.lazy(() => import('./pages/UrgencePage'));
const StructureDemandesPage = React.lazy(() => import('./pages/StructureDemandesPage'));
const PatientOrdonnancesElecPage = React.lazy(() => import('./pages/PatientOrdonnancesElecPage'));
const DispensaireProduitsPage = React.lazy(() => import('./pages/DispensaireProduitsPage'));
const PharmacieLocalisationPage = React.lazy(() => import('./pages/PharmacieLocalisationPage'));
const StructureProfilPage = React.lazy(() => import('./pages/StructureProfilPage'));
const StructureDashboardPage = React.lazy(() => import('./pages/StructureDashboardPage'));
const StructureMedecinsPage = React.lazy(() => import('./pages/StructureMedecinsPage'));
const StructureServicesPage = React.lazy(() => import('./pages/StructureServicesPage'));
const StructureRendezVousPage = React.lazy(() => import('./pages/StructureRendezVousPage'));
const ActualitesPage = React.lazy(() => import('./pages/ActualitesPage'));
const PublicationDetailPage = React.lazy(() => import('./pages/PublicationDetailPage'));
const TeleconsultationPage = React.lazy(() => import('./pages/TeleconsultationPage'));
const AdminDashboardPage = React.lazy(() => import('./pages/AdminDashboardPage'));
const AdminInscriptionsPage = React.lazy(() => import('./pages/AdminInscriptionsPage'));
const AdminAuditPage = React.lazy(() => import('./pages/AdminAuditPage'));
const AdminCommissionsPage = React.lazy(() => import('./pages/AdminCommissionsPage'));
const PatientPaiementsPage = React.lazy(() => import('./pages/PatientPaiementsPage'));
const PharmacieOrdonnanceVerifyPage = React.lazy(() => import('./pages/PharmacieOrdonnanceVerifyPage'));
const MedecinProfilProPage = React.lazy(() => import('./pages/MedecinProfilProPage'));
const StructureEquipePage = React.lazy(() => import('./pages/StructureEquipePage'));
const FamillePage = React.lazy(() => import('./pages/FamillePage'));
const QrMedicalPage = React.lazy(() => import('./pages/QrMedicalPage'));
const QrPublicPage = React.lazy(() => import('./pages/QrPublicPage'));
const ProQrScanPage = React.lazy(() => import('./pages/ProQrScanPage'));
const AdminAlertesPage = React.lazy(() => import('./pages/AdminAlertesPage'));
const AdminSantePubliquePage = React.lazy(() => import('./pages/AdminSantePubliquePage'));
const StructureAlertesPage = React.lazy(() => import('./pages/StructureAlertesPage'));

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            staleTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
            placeholderData: (prev) => prev,
        },
    },
});

const AuthPageLoader = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#64748B' }}>
        …
    </div>
);

function LazyRoute({ children }) {
    return <Suspense fallback={<AuthPageLoader />}>{children}</Suspense>;
}

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <AuthProvider>
                    <FamilleProfilProvider>
                    <ThemeProvider>
                        <ErrorBoundary>
                            <Routes>
                                <Route path="/login" element={<LazyRoute><LoginPage /></LazyRoute>} />
                                <Route path="/register" element={<LazyRoute><RegisterPage /></LazyRoute>} />
                                <Route path="/mot-de-passe-oublie" element={<LazyRoute><ForgotPasswordPage /></LazyRoute>} />
                                <Route path="/reset-password" element={<LazyRoute><ResetPasswordPage /></LazyRoute>} />
                                <Route path="/register/professionnel" element={<LazyRoute><RegisterProfessionnelPage /></LazyRoute>} />
                                <Route path="/confidentialite" element={<LazyRoute><PrivacyPolicyPage /></LazyRoute>} />
                                <Route path="/cgu" element={<LazyRoute><TermsOfServicePage /></LazyRoute>} />
                                <Route path="/actualites" element={<LazyRoute><ActualitesPage /></LazyRoute>} />
                                <Route path="/actualites/:id" element={<LazyRoute><PublicationDetailPage /></LazyRoute>} />
                                <Route path="/qr/:token" element={<LazyRoute><QrPublicPage /></LazyRoute>} />

                                <Route element={<RoleRoute allowedRoles={[ROLES.PATIENT]} />}>
                                    <Route element={<AppLayout />}>
                                    <Route path="/dashboard" element={<DashboardPage />} />
                                    <Route path="/pharmacie-hub" element={<PatientPharmacyHubPage />} />
                                    <Route path="/medications" element={<MedicationsPage />} />
                                    <Route path="/prises" element={<PrisesPage />} />
                                    <Route path="/ordonnances" element={<OrdonnancePage />} />
                                    <Route path="/analytics" element={<AnalyticsPage />} />
                                    <Route path="/sante" element={<SantePage />} />
                                    <Route path="/sante/etablissement/:id" element={<EtablissementDetailPage />} />
                                    <Route path="/sante/medecin/:id" element={<MedecinDetailPage />} />
                                    <Route path="/rendez-vous" element={<PatientRendezVousPage />} />
                                    <Route path="/paiement/retour" element={<PaymentReturnPage />} />
                                    <Route path="/rendez-vous/:id/video" element={<TeleconsultationPage />} />
                                    <Route path="/reservations" element={<PatientReservationsPage />} />
                                    <Route path="/paiements" element={<PatientPaiementsPage />} />
                                    <Route path="/ordonnances-electroniques" element={<PatientOrdonnancesElecPage />} />
                                    <Route path="/carnet-medical" element={<CarnetMedicalPage />} />
                                    <Route path="/famille" element={<FamillePage />} />
                                    <Route path="/qr-medical" element={<QrMedicalPage />} />
                                    <Route path="/urgence" element={<UrgencePage />} />
                                    <Route path="/actualites" element={<ActualitesPage />} />
                                    <Route path="/actualites/:id" element={<PublicationDetailPage />} />
                                    <Route path="/pharmacie/chat" element={<PharmacieChatPage />} />
                                    <Route path="/pharmacie/chat/:conversationId" element={<PharmacieChatPage />} />
                                    <Route path="/profil" element={<ProfilePage />} />
                                    </Route>
                                </Route>

                                <Route element={<RoleRoute allowedRoles={[ROLES.MEDECIN]} />}>
                                    <Route element={<AppLayout />}>
                                    <Route path="/medecin/dashboard" element={<MedecinDashboardPage />} />
                                    <Route path="/medecin/profil" element={<MedecinProfilPage />} />
                                    <Route path="/medecin/rendez-vous" element={<MedecinRendezVousPage />} />
                                    <Route path="/medecin/rendez-vous/:id/video" element={<TeleconsultationPage />} />
                                    <Route path="/medecin/parametres" element={<MedecinParametresPage />} />
                                    <Route path="/medecin/carriere" element={<MedecinProfilProPage />} />
                                    <Route path="/medecin/ordonnances" element={<MedecinOrdonnancesPage />} />
                                    <Route path="/medecin/services" element={<MedecinServicesPage />} />
                                    <Route path="/medecin/avis" element={<MedecinAvisPage />} />
                                    <Route path="/medecin/qr-scan" element={<ProQrScanPage />} />
                                    <Route path="/medecin/actualites" element={<ActualitesPage />} />
                                    <Route path="/medecin/actualites/:id" element={<PublicationDetailPage />} />
                                    <Route path="/sante/medecin/:id" element={<MedecinDetailPage />} />
                                    </Route>
                                </Route>

                                <Route element={<RoleRoute allowedRoles={[ROLES.PHARMACIE]} />}>
                                    <Route element={<AppLayout />}>
                                    <Route path="/pharmacie/dashboard" element={<PharmacieDashboardPage />} />
                                    <Route path="/pharmacie/messages" element={<PharmacieMessagesPage />} />
                                    <Route path="/pharmacie/messages/:conversationId" element={<PharmacieMessagesPage />} />
                                    <Route path="/pharmacie/produits" element={<PharmacieProduitsPage />} />
                                    <Route path="/pharmacie/reservations" element={<StructureReservationsPage />} />
                                    <Route path="/pharmacie/horaires" element={<PharmacieHorairesPage />} />
                                    <Route path="/pharmacie/localisation" element={<PharmacieLocalisationPage />} />
                                    <Route path="/pharmacie/profil" element={<StructureProfilPage />} />
                                    <Route path="/pharmacie/equipe" element={<StructureEquipePage />} />
                                    <Route path="/pharmacie/ordonnances" element={<PharmacieOrdonnanceVerifyPage />} />
                                    <Route path="/pharmacie/qr-scan" element={<ProQrScanPage />} />
                                    <Route path="/pharmacie/actualites" element={<ActualitesPage />} />
                                    <Route path="/pharmacie/actualites/:id" element={<PublicationDetailPage />} />
                                    </Route>
                                </Route>

                                <Route element={<RoleRoute allowedRoles={[ROLES.HOPITAL]} />}>
                                    <Route element={<AppLayout />}>
                                    <Route path="/hopital/dashboard" element={<StructureDashboardPage />} />
                                    <Route path="/hopital/medecins" element={<StructureMedecinsPage />} />
                                    <Route path="/hopital/services" element={<StructureServicesPage />} />
                                    <Route path="/hopital/rendez-vous" element={<StructureRendezVousPage />} />
                                    <Route path="/hopital/demandes" element={<StructureDemandesPage />} />
                                    <Route path="/hopital/alertes" element={<StructureAlertesPage />} />
                                    <Route path="/hopital/dispensaire" element={<DispensaireProduitsPage />} />
                                    <Route path="/hopital/reservations" element={<StructureReservationsPage />} />
                                    <Route path="/hopital/messages" element={<PharmacieMessagesPage />} />
                                    <Route path="/hopital/messages/:conversationId" element={<PharmacieMessagesPage />} />
                                    <Route path="/hopital/horaires" element={<PharmacieHorairesPage />} />
                                    <Route path="/hopital/localisation" element={<PharmacieLocalisationPage />} />
                                    <Route path="/hopital/profil" element={<StructureProfilPage />} />
                                    <Route path="/hopital/equipe" element={<StructureEquipePage />} />
                                    <Route path="/hopital/ordonnances" element={<PharmacieOrdonnanceVerifyPage />} />
                                    <Route path="/hopital/qr-scan" element={<ProQrScanPage />} />
                                    <Route path="/hopital/actualites" element={<ActualitesPage />} />
                                    <Route path="/hopital/actualites/:id" element={<PublicationDetailPage />} />
                                    </Route>
                                </Route>

                                <Route element={<RoleRoute allowedRoles={[ROLES.CLINIQUE]} />}>
                                    <Route element={<AppLayout />}>
                                    <Route path="/clinique/dashboard" element={<StructureDashboardPage />} />
                                    <Route path="/clinique/medecins" element={<StructureMedecinsPage />} />
                                    <Route path="/clinique/services" element={<StructureServicesPage />} />
                                    <Route path="/clinique/rendez-vous" element={<StructureRendezVousPage />} />
                                    <Route path="/clinique/demandes" element={<StructureDemandesPage />} />
                                    <Route path="/clinique/alertes" element={<StructureAlertesPage />} />
                                    <Route path="/clinique/dispensaire" element={<DispensaireProduitsPage />} />
                                    <Route path="/clinique/reservations" element={<StructureReservationsPage />} />
                                    <Route path="/clinique/messages" element={<PharmacieMessagesPage />} />
                                    <Route path="/clinique/messages/:conversationId" element={<PharmacieMessagesPage />} />
                                    <Route path="/clinique/horaires" element={<PharmacieHorairesPage />} />
                                    <Route path="/clinique/localisation" element={<PharmacieLocalisationPage />} />
                                    <Route path="/clinique/profil" element={<StructureProfilPage />} />
                                    <Route path="/clinique/equipe" element={<StructureEquipePage />} />
                                    <Route path="/clinique/ordonnances" element={<PharmacieOrdonnanceVerifyPage />} />
                                    <Route path="/clinique/qr-scan" element={<ProQrScanPage />} />
                                    <Route path="/clinique/actualites" element={<ActualitesPage />} />
                                    <Route path="/clinique/actualites/:id" element={<PublicationDetailPage />} />
                                    </Route>
                                </Route>

                                <Route element={<RoleRoute allowedRoles={[ROLES.ADMIN]} />}>
                                    <Route element={<AppLayout />}>
                                    <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                                    <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                                    <Route path="/admin/inscriptions" element={<AdminInscriptionsPage />} />
                                    <Route path="/admin/audit" element={<AdminAuditPage />} />
                                    <Route path="/admin/commissions" element={<AdminCommissionsPage />} />
                                    <Route path="/admin/alertes" element={<AdminAlertesPage />} />
                                    <Route path="/admin/sante-publique" element={<AdminSantePubliquePage />} />
                                    </Route>
                                </Route>

                                <Route path="*" element={<Navigate to="/login" replace />} />
                            </Routes>
                        </ErrorBoundary>
                        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
                    </ThemeProvider>
                    </FamilleProfilProvider>
                </AuthProvider>
            </BrowserRouter>
        </QueryClientProvider>
    );
}
