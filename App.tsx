import React, { useState, useCallback, useMemo, useEffect } from 'react';
import DailyLogScreen from './components/DailyLogScreen';
import DashboardScreen from './components/DashboardScreen';
import SalesScreen from './components/SalesScreen';
import BatchManagementScreen from './components/BatchManagementScreen';
import TeamManagementScreen from './components/TeamManagementScreen';
import SettingsScreen from './components/SettingsScreen';
import { FarmManagementScreen } from './components/FarmManagementScreen';
import BroilerLogScreen from './components/BroilerLogScreen';
import FishLogScreen from './components/FishLogScreen';
import AnalyticsScreen from './components/AnalyticsScreen';
import LoginScreen from './components/LoginScreen';
import WelcomeGuide from './components/WelcomeGuide';
import BusinessScreen from './components/BusinessScreen';
import InventoryScreen from './components/InventoryScreen';
import HealthScheduleScreen from './components/HealthScheduleScreen';
import TaskManagementScreen from './components/TaskManagementScreen';
import ResetPasswordScreen from './components/ResetPasswordScreen';
import { GridIcon, ClipboardListIcon, WalletIcon, PlusIcon, BatchIcon, TaskIcon } from './components/icons';
import { AnalyticsIcon, SettingsIcon } from './components/CustomIcons';
import { FarmProvider, useFarm, Sector, Batch, Farm } from './contexts/FarmContext';
import { TaskProvider } from './contexts/TaskContext';
import { BusinessProvider } from './contexts/BusinessContext';
import { SalesProvider } from './contexts/SalesContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ActivityProvider } from './contexts/ActivityContext';

export type Screen = 'dashboard' | 'log' | 'tasks' | 'sales' | 'batches' | 'settings' | 'team' | 'farms' | 'analytics' | 'business' | 'inventory' | 'health_schedules';
export type Theme = 'light' | 'dark' | 'system';

const AppContent: React.FC<{ theme: Theme; setTheme: (t: Theme) => void }> = ({ theme, setTheme }) => {
  const { farms, batches, updateBatch, addBatch, deleteBatch, updateFarm, addFarm, deleteFarm } = useFarm();
  const { signOut } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [isNewBatchModalOpen, setIsNewBatchModalOpen] = useState(false);
  const [activeSector, setActiveSector] = useState<Sector>('Layer');
  const [selectedScope, setSelectedScope] = useState("");
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);

  // Initialize selectedScope if not set and farms exist
  useEffect(() => {
    if (selectedScope === "" && farms.length > 0) {
      setSelectedScope(`All ${activeSector} Farms`);
    }
  }, [farms, activeSector, selectedScope]);

  const selectedBatch = useMemo(() => {
    if (!selectedScope.includes(' - ')) return null;
    const [farmName, batchName] = selectedScope.split(' - ');
    const batch = batches.find(b => b.farm === farmName && b.name === batchName);
    return batch?.sector === activeSector ? batch : null;
  }, [selectedScope, batches, activeSector]);

  const selectedFarm = useMemo(() => {
    if (selectedScope.startsWith('All') || !selectedScope) return null;
    const farmName = selectedScope.split(' - ')[0];
    return farms.find(f => f.name === farmName) || null;
  }, [selectedScope, farms]);

  const navigateTo = useCallback((screen: Screen) => {
    setCurrentScreen(screen);
    // Scroll to top when navigating to a new screen
    window.scrollTo(0, 0);
  }, []);

  const handleFabClick = () => {
    switch (currentScreen) {
      case 'batches':
        setIsNewBatchModalOpen(true);
        break;
      case 'sales':
        setIsSalesModalOpen(true);
        break;
      default:
        navigateTo('log');
        break;
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <DashboardScreen
          onNavigate={navigateTo}
          selectedScope={selectedScope}
          onScopeChange={setSelectedScope}
          activeSector={activeSector}
          onSectorChange={setActiveSector}
          theme={theme}
        />;
      case 'log':
        switch (activeSector) {
          case 'Broiler':
            return <BroilerLogScreen onNavigate={navigateTo} farm={selectedFarm} batch={selectedBatch} />;
          case 'Fish':
            return <FishLogScreen onNavigate={navigateTo} farm={selectedFarm} batch={selectedBatch} />;
          case 'Layer':
          default:
            return <DailyLogScreen onNavigate={navigateTo} farm={selectedFarm} batch={selectedBatch} />;
        }
      case 'tasks':
        return <TaskManagementScreen onNavigate={navigateTo} />;
      case 'analytics':
        return <AnalyticsScreen
          onNavigate={navigateTo}
          farms={farms}
          batches={batches}
          activeSector={activeSector}
          onSectorChange={setActiveSector}
          theme={theme}
        />;
      case 'business':
        return <BusinessScreen onNavigate={navigateTo} />;
      case 'inventory':
        return <InventoryScreen onNavigate={navigateTo} />;
      case 'sales':
        return <SalesScreen
          onNavigate={navigateTo}
          isModalOpen={isSalesModalOpen}
          setIsModalOpen={setIsSalesModalOpen}
          activeSector={activeSector}
        />;
      case 'batches':
        return <BatchManagementScreen
          onNavigate={navigateTo}
          isModalOpen={isNewBatchModalOpen}
          setIsModalOpen={setIsNewBatchModalOpen}
          farms={farms}
          batches={batches}
          onSaveBatch={(b: any) => 'id' in b ? updateBatch(b) : addBatch(b)}
          onDeleteBatch={(id: any) => deleteBatch(String(id))}
          activeSector={activeSector}
        />;
      case 'settings':
        return <SettingsScreen onNavigate={navigateTo} onLogout={handleLogout} currentTheme={theme} onThemeChange={setTheme} />;
      case 'team':
        return <TeamManagementScreen onNavigate={navigateTo} />;
      case 'farms':
        return <FarmManagementScreen
          onNavigate={navigateTo}
          farms={farms}
          batches={batches}
          onSaveFarm={(f: any) => 'id' in f ? updateFarm(f) : addFarm(f)}
          onDeleteFarm={(id: any) => deleteFarm(String(id))}
        />;
      case 'health_schedules':
        return <HealthScheduleScreen onNavigate={navigateTo} />;
      default:
        return <DashboardScreen
          onNavigate={navigateTo}
          selectedScope={selectedScope}
          onScopeChange={setSelectedScope}
          activeSector={activeSector}
          onSectorChange={setActiveSector}
          theme={theme}
        />;
    }
  }

  const screensWithoutFab: Screen[] = ['team', 'farms', 'log', 'inventory', 'health_schedules', 'tasks'];
  const showFab = !screensWithoutFab.includes(currentScreen);

  return (
    <div className="antialiased font-sans text-text-primary">
      <div className="lg:max-w-screen-xl lg:mx-auto lg:my-4 lg:shadow-2xl lg:shadow-slate-300/20 dark:lg:shadow-black/20 lg:rounded-3xl lg:overflow-hidden lg:border lg:border-border">
        <div className="lg:flex min-h-screen lg:min-h-0 bg-background">
          <aside className="hidden lg:flex lg:flex-col lg:w-60 xl:w-64 bg-card p-4 border-r border-border flex-shrink-0">
            <div className="text-3xl font-bold text-primary mb-10 px-2">HomeFarm</div>
            <nav className="flex-grow space-y-2">
              <SidebarNavItem icon={GridIcon} label="Dashboard" screen="dashboard" currentScreen={currentScreen} onNavigate={navigateTo} />
              <SidebarNavItem icon={ClipboardListIcon} label="Logs" screen="log" currentScreen={currentScreen} onNavigate={navigateTo} />
              <SidebarNavItem icon={TaskIcon} label="Tasks" screen="tasks" currentScreen={currentScreen} onNavigate={navigateTo} />
              <SidebarNavItem icon={AnalyticsIcon} label="Analytics" screen="analytics" currentScreen={currentScreen} onNavigate={navigateTo} />
              <SidebarNavItem icon={WalletIcon} label="Business" screen="business" currentScreen={currentScreen} onNavigate={navigateTo} />
              <SidebarNavItem icon={SettingsIcon} label="Settings" screen="settings" currentScreen={currentScreen} onNavigate={navigateTo} />
            </nav>
            <div className="mt-auto">
              <button onClick={handleLogout} className="w-full text-left p-3 rounded-lg text-sm text-text-secondary hover:bg-muted hover:text-text-primary">Log Out</button>
            </div>
          </aside>

          <div className="flex-grow relative">
            {isFirstTimeUser && <WelcomeGuide onClose={() => setIsFirstTimeUser(false)} />}
            <main className="pb-24 lg:pb-4">
              <div key={currentScreen} className="animate-fade-in">
                {renderScreen()}
              </div>
            </main>

            {showFab && (
              <button
                onClick={handleFabClick}
                className="fixed bottom-24 right-6 bg-primary text-white w-16 h-16 rounded-2xl shadow-lg flex items-center justify-center transform hover:scale-105 transition-transform z-20 lg:hidden"
              >
                <PlusIcon className="w-8 h-8" />
              </button>
            )}

            <footer className="fixed bottom-0 left-0 right-0 bg-card shadow-t border-t border-border z-20 lg:hidden">
              <div className="flex justify-around">
                <BottomNavItem icon={GridIcon} label="Home" screen="dashboard" currentScreen={currentScreen} onNavigate={navigateTo} />
                <BottomNavItem icon={ClipboardListIcon} label="Logs" screen="log" currentScreen={currentScreen} onNavigate={navigateTo} />
                <BottomNavItem icon={TaskIcon} label="Tasks" screen="tasks" currentScreen={currentScreen} onNavigate={navigateTo} />
                <BottomNavItem icon={AnalyticsIcon} label="Stats" screen="analytics" currentScreen={currentScreen} onNavigate={navigateTo} />
                <BottomNavItem icon={WalletIcon} label="Biz" screen="business" currentScreen={currentScreen} onNavigate={navigateTo} />
                <BottomNavItem icon={SettingsIcon} label="Settings" screen="settings" currentScreen={currentScreen} onNavigate={navigateTo} />
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('homefarm-theme') as Theme) || 'light';
    }
    return 'light';
  });

  // Apply theme to HTML element
  useEffect(() => {
    const applyTheme = () => {
      const root = window.document.documentElement;
      const isDark =
        theme === 'dark' ||
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();
    localStorage.setItem('homefarm-theme', theme);

    // Listen for system theme changes when in 'system' mode
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  return (
    <AuthProvider>
      <AuthenticatedApp theme={theme} setTheme={setTheme} />
    </AuthProvider>
  );
};

// Separate component to use auth context
const AuthenticatedApp: React.FC<{ theme: Theme; setTheme: (t: Theme) => void }> = ({ theme, setTheme }) => {
  const { user, loading } = useAuth();
  const [showResetPassword, setShowResetPassword] = useState(
    window.location.pathname.includes('reset-password')
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show reset password screen if URL contains reset-password and user is authenticated via magic link
  if (showResetPassword && user) {
    return <ResetPasswordScreen onComplete={() => setShowResetPassword(false)} />;
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <FarmProvider>
      <TaskProvider>
        <BusinessProvider>
          <SalesProvider>
            <ActivityProvider>
              <AppContent theme={theme} setTheme={setTheme} />
            </ActivityProvider>
          </SalesProvider>
        </BusinessProvider>
      </TaskProvider>
    </FarmProvider>
  );
};

interface NavItemProps {
  icon: React.FC<{ className?: string; isActive?: boolean }>;
  label: string;
  screen: Screen;
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

const BottomNavItem: React.FC<NavItemProps> = ({ icon: Icon, label, screen, currentScreen, onNavigate }) => {
  const isActive = currentScreen === screen ||
    (screen === 'business' && (currentScreen === 'sales' || currentScreen === 'inventory')) ||
    (screen === 'settings' && (currentScreen === 'team' || currentScreen === 'farms' || currentScreen === 'batches' || currentScreen === 'health_schedules'));

  return (
    <button onClick={() => onNavigate(screen)} className={`flex flex-col items-center justify-center p-3 w-full transition-colors ${isActive ? 'text-primary' : 'text-text-secondary hover:text-primary'}`}>
      <Icon className="w-6 h-6 mb-1" isActive={isActive} />
      <span className={`text-xs font-medium`}>{label}</span>
    </button>
  )
}

const SidebarNavItem: React.FC<NavItemProps> = ({ icon: Icon, label, screen, currentScreen, onNavigate }) => {
  const isActive = currentScreen === screen ||
    (screen === 'business' && (currentScreen === 'sales' || currentScreen === 'inventory')) ||
    (screen === 'settings' && (currentScreen === 'team' || currentScreen === 'farms' || currentScreen === 'batches' || currentScreen === 'health_schedules'));

  return (
    <button onClick={() => onNavigate(screen)} className={`w-full flex items-center space-x-4 p-3 rounded-xl transition-colors ${isActive ? 'bg-primary/10 text-primary font-bold' : 'text-text-secondary hover:bg-muted hover:text-text-primary'}`}>
      <Icon className="w-6 h-6 flex-shrink-0" isActive={isActive} />
      <span className="text-base">{label}</span>
    </button>
  );
};

export default App;
