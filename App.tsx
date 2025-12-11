
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import DailyLogScreen from './components/DailyLogScreen';
import DashboardScreen from './components/DashboardScreen';
import SalesScreen from './components/SalesScreen';
import BatchManagementScreen, { Batch, Sector } from './components/BatchManagementScreen';
import TeamManagementScreen from './components/TeamManagementScreen';
import SettingsScreen from './components/SettingsScreen';
import { FarmManagementScreen, Farm } from './components/FarmManagementScreen';
import BroilerLogScreen from './components/BroilerLogScreen';
import FishLogScreen from './components/FishLogScreen';
import AnalyticsScreen from './components/AnalyticsScreen';
import LoginScreen from './components/LoginScreen';
import WelcomeGuide from './components/WelcomeGuide';
import BusinessScreen from './components/BusinessScreen';
import InventoryScreen from './components/InventoryScreen';
import HealthScheduleScreen from './components/HealthScheduleScreen';
import { GridIcon, ClipboardListIcon, WalletIcon, PlusIcon, BatchIcon } from './components/icons';
import { AnalyticsIcon, SettingsIcon } from './components/CustomIcons';

export type Screen = 'dashboard' | 'log' | 'sales' | 'batches' | 'settings' | 'team' | 'farms' | 'analytics' | 'business' | 'inventory' | 'health_schedules';
export type Theme = 'light' | 'dark' | 'system';

// Mock Data lifted to App level
const MOCK_FARMS_DATA: Farm[] = [
    { id: 1, name: "Ibadan Farm", location: "Abeokuta Road, Ibadan" },
    { id: 2, name: "Abeokuta Farm", location: "Shagamu Interchange, Abeokuta" },
    { id: 3, name: "Epe Fish Farm", location: "Epe, Lagos" },
];

const MOCK_BATCHES_DATA: Batch[] = [
    { id: 1, name: "Layer Batch 2", farm: "Ibadan Farm", status: "Active", stockCount: 495, age: "18 weeks", sector: "Layer" },
    { id: 2, name: "Broiler Batch 5", farm: "Ibadan Farm", status: "Active", stockCount: 1500, age: "8 weeks", sector: "Broiler" },
    { id: 3, name: "Layer Batch 1", farm: "Abeokuta Farm", status: "Active", stockCount: 750, age: "32 weeks", sector: "Layer" },
    { id: 4, name: "Tilapia Batch 1", farm: "Epe Fish Farm", status: "Active", stockCount: 2500, age: "6 weeks", sector: "Fish" },
    { id: 5, name: "Catfish Batch 3", farm: "Epe Fish Farm", status: "Active", stockCount: 3000, age: "10 weeks", sector: "Fish" },
];

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [isNewBatchModalOpen, setIsNewBatchModalOpen] = useState(false);
  
  const [farms, setFarms] = useState<Farm[]>(MOCK_FARMS_DATA);
  const [batches, setBatches] = useState<Batch[]>(MOCK_BATCHES_DATA);
  
  const [activeSector, setActiveSector] = useState<Sector>('Layer');
  const [selectedScope, setSelectedScope] = useState("Ibadan Farm - Layer Batch 2");

  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'system';
  });

  useEffect(() => {
    // Simulate checking for a session token
    const sessionToken = localStorage.getItem('sessionToken');
    if (sessionToken) {
        setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.classList.toggle('dark', isDark);
    localStorage.setItem('theme', theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        root.classList.toggle('dark', mediaQuery.matches);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const handleLogin = () => {
    // In a real app, you'd get a token from a server
    localStorage.setItem('sessionToken', 'fake-token');
    setIsLoggedIn(true);
    setIsFirstTimeUser(false); // Not a first-time user
  };
  
  const handleSignup = () => {
    localStorage.setItem('sessionToken', 'fake-token');
    setIsLoggedIn(true);
    setIsFirstTimeUser(true); // This is a new user
  };
  
  const handleLogout = () => {
    localStorage.removeItem('sessionToken');
    setIsLoggedIn(false);
    setCurrentScreen('dashboard'); // Reset to default screen on logout
  };

  const selectedBatch = useMemo(() => {
    if (selectedScope === "All Farms (Summary)" || !selectedScope.includes(' - ')) return null;
    const [farmName, batchName] = selectedScope.split(' - ');
    const batch = batches.find(b => b.farm === farmName && b.name === batchName);
    return batch?.sector === activeSector ? batch : null;
  }, [selectedScope, batches, activeSector]);

  const selectedFarm = useMemo(() => {
    if (selectedScope.startsWith('All')) return null;
    const farmName = selectedScope.split(' - ')[0];
    return farms.find(f => f.name === farmName) || null;
  }, [selectedScope, farms]);


  const handleSaveFarm = (farmData: Farm | Omit<Farm, 'id'>) => {
    setFarms(prev => {
        if ('id' in farmData) {
            return prev.map(f => f.id === farmData.id ? { ...f, ...farmData } : f);
        } else {
            const newFarm = { ...farmData, id: Date.now() };
            return [newFarm, ...prev];
        }
    });
  };

  const handleDeleteFarm = (farmId: number) => {
    const farmToDelete = farms.find(f => f.id === farmId);
    if (!farmToDelete) return;
    setFarms(prev => prev.filter(f => f.id !== farmId));
    setBatches(prev => prev.filter(b => b.farm !== farmToDelete.name));
  };
  
  const handleSaveBatch = (batchData: Batch | Omit<Batch, 'id'>) => {
    setBatches(prev => {
        if ('id' in batchData) {
            return prev.map(b => b.id === batchData.id ? { ...b, ...batchData } : b);
        } else {
            const newBatch: Batch = { ...batchData, id: Date.now() };
            return [newBatch, ...prev];
        }
    });
  };

  const handleDeleteBatch = (batchId: number) => {
    setBatches(prev => prev.filter(b => b.id !== batchId));
  };

  const navigateTo = useCallback((screen: Screen) => {
    setCurrentScreen(screen);
  }, []);

  // Context-aware FAB Logic
  const handleFabClick = () => {
    switch (currentScreen) {
        case 'batches':
            // If on Batch Management, open the "New Batch" modal
            setIsNewBatchModalOpen(true);
            break;
        case 'sales':
            // If on Sales screen, open the "New Sale" modal
            setIsSalesModalOpen(true);
            break;
        case 'dashboard':
        case 'analytics':
        case 'business':
        case 'settings':
        default:
            // For Dashboard and other main screens, navigate to Daily Log
            navigateTo('log');
            break;
    }
  };

  const renderScreen = () => {
    switch(currentScreen) {
        case 'dashboard':
            return <DashboardScreen 
                        onNavigate={navigateTo} 
                        farms={farms} 
                        batches={batches} 
                        selectedScope={selectedScope} 
                        onScopeChange={setSelectedScope} 
                        activeSector={activeSector}
                        onSectorChange={setActiveSector}
                        theme={theme}
                    />;
        case 'log':
            switch(activeSector) {
                case 'Broiler':
                    return <BroilerLogScreen onNavigate={navigateTo} farm={selectedFarm} batch={selectedBatch} />;
                case 'Fish':
                    return <FishLogScreen onNavigate={navigateTo} farm={selectedFarm} batch={selectedBatch} />;
                case 'Layer':
                default:
                    return <DailyLogScreen onNavigate={navigateTo} farm={selectedFarm} batch={selectedBatch} />;
            }
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
                        onSaveBatch={handleSaveBatch} 
                        onDeleteBatch={handleDeleteBatch} 
                        activeSector={activeSector}
                    />;
        case 'settings':
            return <SettingsScreen onNavigate={navigateTo} onLogout={handleLogout} currentTheme={theme} onThemeChange={setTheme} />;
        case 'team':
            return <TeamManagementScreen onNavigate={navigateTo} />;
        case 'farms':
            return <FarmManagementScreen onNavigate={navigateTo} farms={farms} batches={batches} onSaveFarm={handleSaveFarm} onDeleteFarm={handleDeleteFarm} />;
        case 'health_schedules':
            return <HealthScheduleScreen onNavigate={navigateTo} />;
        default:
             return <DashboardScreen 
                        onNavigate={navigateTo} 
                        farms={farms} 
                        batches={batches} 
                        selectedScope={selectedScope} 
                        onScopeChange={setSelectedScope} 
                        activeSector={activeSector}
                        onSectorChange={setActiveSector}
                        theme={theme}
                    />;
    }
  }

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} onSignup={handleSignup} />;
  }

  // Define screens where FAB should NOT be visible.
  const screensWithoutFab: Screen[] = ['team', 'farms', 'log', 'inventory', 'health_schedules'];
  const showFab = !screensWithoutFab.includes(currentScreen);

  // Determine label for accessibility
  const getFabLabel = () => {
      if (currentScreen === 'sales') return "Record a new sale";
      if (currentScreen === 'batches') return "Start a New Batch";
      return `Add Daily ${activeSector} Log`;
  };

  return (
    <div className="antialiased font-sans text-text-primary">
      <div className="lg:max-w-screen-xl lg:mx-auto lg:my-4 lg:shadow-2xl lg:shadow-slate-300/20 dark:lg:shadow-black/20 lg:rounded-3xl lg:overflow-hidden lg:border lg:border-border">
        <div className="lg:flex min-h-screen lg:min-h-0 bg-background">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:flex lg:flex-col lg:w-60 xl:w-64 bg-card p-4 border-r border-border flex-shrink-0">
            <div className="text-3xl font-bold text-primary mb-10 px-2">HomeFarm</div>
            <nav className="flex-grow space-y-2">
              <SidebarNavItem icon={GridIcon} label="Dashboard" screen="dashboard" currentScreen={currentScreen} onNavigate={navigateTo} />
              {/* Batches removed from main nav, now in Settings */}
              <SidebarNavItem icon={ClipboardListIcon} label="Logs" screen="log" currentScreen={currentScreen} onNavigate={navigateTo} />
              <SidebarNavItem icon={AnalyticsIcon} label="Analytics" screen="analytics" currentScreen={currentScreen} onNavigate={navigateTo} />
              <SidebarNavItem icon={WalletIcon} label="Business" screen="business" currentScreen={currentScreen} onNavigate={navigateTo} />
              <SidebarNavItem icon={SettingsIcon} label="Settings" screen="settings" currentScreen={currentScreen} onNavigate={navigateTo} />
            </nav>
            <div className="mt-auto">
              <button
                onClick={handleLogout}
                className="w-full text-left p-3 rounded-lg text-sm text-text-secondary hover:bg-muted hover:text-text-primary"
              >
                Log Out
              </button>
            </div>
          </aside>
          
          {/* Main Content Area */}
          <div className="flex-grow relative">
            {isFirstTimeUser && <WelcomeGuide onClose={() => setIsFirstTimeUser(false)} />}
            <main className="pb-24 lg:pb-4">
              {renderScreen()}
            </main>

            {showFab && (
              <button
                  onClick={handleFabClick}
                  className="fixed bottom-24 right-6 bg-primary text-white w-16 h-16 rounded-2xl shadow-lg flex items-center justify-center transform hover:scale-105 transition-transform z-20 lg:hidden"
                  aria-label={getFabLabel()}
              >
                  <PlusIcon className="w-8 h-8" />
              </button>
            )}
            
            {/* Mobile Bottom Nav */}
            <footer className="fixed bottom-0 left-0 right-0 bg-card shadow-t border-t border-border z-20 lg:hidden">
              <div className="flex justify-around">
                <BottomNavItem icon={GridIcon} label="Home" screen="dashboard" currentScreen={currentScreen} onNavigate={navigateTo} />
                {/* Batches removed from main nav, now in Settings */}
                <BottomNavItem icon={ClipboardListIcon} label="Logs" screen="log" currentScreen={currentScreen} onNavigate={navigateTo} />
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

interface NavItemProps {
  icon: React.FC<{ className?: string; isActive?: boolean }>;
  label: string;
  screen: Screen;
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

const BottomNavItem: React.FC<NavItemProps> = ({ icon: Icon, label, screen, currentScreen, onNavigate }) => {
  // Active state includes nested screens
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
