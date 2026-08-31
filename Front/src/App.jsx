import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ThemeProvider from './theme/ThemeProvider';
import RoleRoute from './utils/RoleRoute';
import AppLayout from './components/layout/AppLayout';
import { ROLES } from './config/branding';

const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordSmsPage = React.lazy(() => import('./pages/ForgotPasswordSmsPage'));
const RegisterProfessionnelPage = React.lazy(() => import('./pages/RegisterProfessionnelPage'));
const PrivacyPolicyPage = React.lazy(() => import('./pages/PrivacyPolicyPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
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
const PharmacieDashboardPage = React.lazy(() => import('./pages/PharmacieDashboardPage'));
const MedecinProfilPage = React.lazy(() => import('./pages/MedecinProfilPage'));
const MedecinRendezVousPage = React.lazy(() => import('./pages/MedecinRendezVousPage'));
const MedecinParametresPage = React.lazy(() => import('./pages/MedecinParametresPage'));
const MedecinOrdonnancesPage = React.lazy(() => import('./pages/MedecinOrdonnancesPage'));
const PharmacieMessagesPage = React.lazy(() => import('./pages/PharmacieMessagesPage'));
const PharmacieHorairesPage = React.lazy(() => import('./pages/PharmacieHorairesPage'));
const PharmacieProduitsPage = React.lazy(() => import('./pages/PharmacieProduitsPage'));
const StructureReservationsPage = React.lazy(() => import('./pages/StructureReservationsPage'));
const PatientReservationsPage = React.lazy(() => import('./pages/PatientReservationsPage'));
const PaymentReturnPage = React.lazy(() => import('./pages/PaymentReturnPage'));
const PatientOrdonnancesElecPage = React.lazy(() => import('./pages/PatientOrdonnancesElecPage'));
const DispensaireProduitsPage = React.lazy(() => import('./pages/DispensaireProduitsPage'));
const PharmacieLocalisationPage = React.lazy(() => import('./pages/PharmacieLocalisationPage'));
const StructureProfilPage = React.lazy(() => import('./pages/StructureProfilPage'));
const StructureDashboardPage = React.lazy(() => import('./pages/StructureDashboardPage'));
const StructureMedecinsPage = React.lazy(() => import('./pages/StructureMedecinsPage'));
const StructureServicesPage = React.lazy(() => import('./pages/StructureServicesPage'));
const StructureRendezVousPage = React.lazy(() => import('./pages/StructureRendezVousPage'));
const ActualitesPage = React.lazy(() => import('./pages/ActualitesPage'));
const TeleconsultationPage = React.lazy(() => import('./pages/TeleconsultationPage'));
const AdminInscriptionsPage = React.lazy(() => import('./pages/AdminInscriptionsPage'));
const AdminAuditPage = React.lazy(() => import('./pages/AdminAuditPage'));
const AdminCommissionsPage = React.lazy(() => import('./pages/AdminCommissionsPage'));
const PatientPaiementsPage = React.lazy(() => import('./pages/PatientPaiementsPage'));
const PharmacieOrdonnanceVerifyPage = React.lazy(() => import('./pages/PharmacieOrdonnanceVerifyPage'));
const MedecinProfilProPage = React.lazy(() => import('./pages/MedecinProfilProPage'));
const StructureEquipePage = React.lazy(() => import('./pages/StructureEquipePage'));

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: 1, staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false },
    },
});

const PageLoader = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#64748B' }}>
        Chargement…
    </div>
);

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <AuthProvider>
                    <ThemeProvider>
                        <Suspense fallback={<PageLoader />}>
                            <Routes>
                                <Route path="/login" element={<LoginPage />} />
                                <Route path="/register" element={<RegisterPage />} />
                                <Route path="/mot-de-passe-oublie" element={<ForgotPasswordSmsPage />} />
                                <Route path="/register/professionnel" element={<RegisterProfessionnelPage />} />
                                <Route path="/confidentialite" element={<PrivacyPolicyPage />} />
                                <Route path="/actualites" element={<ActualitesPage />} />

                                <Route element={<RoleRoute allowedRoles={[ROLES.PATIENT]}><AppLayout /></RoleRoute>}>
                                    <Route path="/dashboard" element={<DashboardPage />} />
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
                                    <Route path="/pharmacie/chat" element={<PharmacieChatPage />} />
                                    <Route path="/pharmacie/chat/:conversationId" element={<PharmacieChatPage />} />
                                    <Route path="/profil" element={<ProfilePage />} />
                                </Route>

                                <Route element={<RoleRoute allowedRoles={[ROLES.MEDECIN]}><AppLayout /></RoleRoute>}>
                                    <Route path="/medecin/dashboard" element={<MedecinDashboardPage />} />
                                    <Route path="/medecin/profil" element={<MedecinProfilPage />} />
                                    <Route path="/medecin/rendez-vous" element={<MedecinRendezVousPage />} />
                                    <Route path="/medecin/rendez-vous/:id/video" element={<TeleconsultationPage />} />
                                    <Route path="/medecin/parametres" element={<MedecinParametresPage />} />
                                    <Route path="/medecin/carriere" element={<MedecinProfilProPage />} />
                                    <Route path="/medecin/ordonnances" element={<MedecinOrdonnancesPage />} />
                                    <Route path="/medecin/avis" element={<MedecinDashboardPage />} />
                                    <Route path="/medecin/actualites" element={<ActualitesPage />} />
                                    <Route path="/sante/medecin/:id" element={<MedecinDetailPage />} />
                                </Route>

                                <Route element={<RoleRoute allowedRoles={[ROLES.PHARMACIE]}><AppLayout /></RoleRoute>}>
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
                                    <Route path="/pharmacie/actualites" element={<ActualitesPage />} />
                                </Route>

                                <Route element={<RoleRoute allowedRoles={[ROLES.HOPITAL]}><AppLayout /></RoleRoute>}>
                                    <Route path="/hopital/dashboard" element={<StructureDashboardPage />} />
                                    <Route path="/hopital/medecins" element={<StructureMedecinsPage />} />
                                    <Route path="/hopital/services" element={<StructureServicesPage />} />
                                    <Route path="/hopital/rendez-vous" element={<StructureRendezVousPage />} />
                                    <Route path="/hopital/dispensaire" element={<DispensaireProduitsPage />} />
                                    <Route path="/hopital/reservations" element={<StructureReservationsPage />} />
                                    <Route path="/hopital/messages" element={<PharmacieMessagesPage />} />
                                    <Route path="/hopital/messages/:conversationId" element={<PharmacieMessagesPage />} />
                                    <Route path="/hopital/horaires" element={<PharmacieHorairesPage />} />
                                    <Route path="/hopital/localisation" element={<PharmacieLocalisationPage />} />
                                    <Route path="/hopital/profil" element={<StructureProfilPage />} />
                                    <Route path="/hopital/equipe" element={<StructureEquipePage />} />
                                    <Route path="/hopital/ordonnances" element={<PharmacieOrdonnanceVerifyPage />} />
                                    <Route path="/hopital/actualites" element={<ActualitesPage />} />
                                </Route>

                                <Route element={<RoleRoute allowedRoles={[ROLES.CLINIQUE]}><AppLayout /></RoleRoute>}>
                                    <Route path="/clinique/dashboard" element={<StructureDashboardPage />} />
                                    <Route path="/clinique/medecins" element={<StructureMedecinsPage />} />
                                    <Route path="/clinique/services" element={<StructureServicesPage />} />
                                    <Route path="/clinique/rendez-vous" element={<StructureRendezVousPage />} />
                                    <Route path="/clinique/dispensaire" element={<DispensaireProduitsPage />} />
                                    <Route path="/clinique/reservations" element={<StructureReservationsPage />} />
                                    <Route path="/clinique/messages" element={<PharmacieMessagesPage />} />
                                    <Route path="/clinique/messages/:conversationId" element={<PharmacieMessagesPage />} />
                                    <Route path="/clinique/horaires" element={<PharmacieHorairesPage />} />
                                    <Route path="/clinique/localisation" element={<PharmacieLocalisationPage />} />
                                    <Route path="/clinique/profil" element={<StructureProfilPage />} />
                                    <Route path="/clinique/equipe" element={<StructureEquipePage />} />
                                    <Route path="/clinique/ordonnances" element={<PharmacieOrdonnanceVerifyPage />} />
                                    <Route path="/clinique/actualites" element={<ActualitesPage />} />
                                </Route>

                                <Route element={<RoleRoute allowedRoles={[ROLES.ADMIN]}><AppLayout /></RoleRoute>}>
                                    <Route path="/admin/inscriptions" element={<AdminInscriptionsPage />} />
                                    <Route path="/admin/audit" element={<AdminAuditPage />} />
                                    <Route path="/admin/commissions" element={<AdminCommissionsPage />} />
                                </Route>

                                <Route path="*" element={<Navigate to="/login" replace />} />
                            </Routes>
                        </Suspense>
                        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
                    </ThemeProvider>
                </AuthProvider>
            </BrowserRouter>
        </QueryClientProvider>
    );
}
