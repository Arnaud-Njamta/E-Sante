import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import ThemeProvider from './theme/ThemeProvider';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './utils/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MedicationsPage from './pages/MedicationsPage';
import PrisesPage from './pages/PrisesPage';
import OrdonnancePage from './pages/OrdonnancePage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';
import SantePage from './pages/SantePage';
import EtablissementDetailPage from './pages/EtablissementDetailPage';
import MedecinDetailPage from './pages/MedecinDetailPage';
import PharmacieChatPage from './pages/PharmacieChatPage';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
        },
    },
});

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <BrowserRouter>
                    <AuthProvider>
                        <Routes>
                            {/* Public routes */}
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />

                            {/* Protected routes with layout */}
                            <Route
                                element={
                                    <ProtectedRoute>
                                        <AppLayout />
                                    </ProtectedRoute>
                                }
                            >
                                <Route path="/dashboard" element={<DashboardPage />} />
                                <Route path="/medications" element={<MedicationsPage />} />
                                <Route path="/prises" element={<PrisesPage />} />
                                <Route path="/ordonnances" element={<OrdonnancePage />} />
                                <Route path="/analytics" element={<AnalyticsPage />} />
                                <Route path="/sante" element={<SantePage />} />
                                <Route path="/sante/etablissement/:id" element={<EtablissementDetailPage />} />
                                <Route path="/sante/medecin/:id" element={<MedecinDetailPage />} />
                                <Route path="/pharmacie/chat" element={<PharmacieChatPage />} />
                                <Route path="/pharmacie/chat/:conversationId" element={<PharmacieChatPage />} />
                                <Route path="/profil" element={<ProfilePage />} />
                            </Route>

                            {/* Default redirect */}
                            <Route path="*" element={<Navigate to="/login" replace />} />
                        </Routes>
                    </AuthProvider>
                </BrowserRouter>

                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            borderRadius: '10px',
                            background: '#0F172A',
                            color: '#fff',
                            fontSize: '14px',
                            padding: '12px 16px',
                        },
                    }}
                />
            </ThemeProvider>
        </QueryClientProvider>
    );
}
