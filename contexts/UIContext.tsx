import React, { createContext, useContext, useState } from 'react';

interface UIContextType {
    isBottomNavVisible: boolean;
    setBottomNavVisible: (visible: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isBottomNavVisible, setBottomNavVisible] = useState(true);

    return (
        <UIContext.Provider value={{ isBottomNavVisible, setBottomNavVisible }}>
            {children}
        </UIContext.Provider>
    );
};

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
};
