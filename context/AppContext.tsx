import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FieldPlayer, DrawingPath, Player, DrawingType, FieldType, DrawingSettings, Formation, FieldIcon, IconType } from '../types';
import playersData from '../data/players.json';

interface AppContextType {
    fieldPlayers: FieldPlayer[];
    setFieldPlayers: React.Dispatch<React.SetStateAction<FieldPlayer[]>>;
    icons: FieldIcon[];
    setIcons: React.Dispatch<React.SetStateAction<FieldIcon[]>>;
    addIcon: (type: IconType, x: number, y: number) => void;
    updateIconPosition: (id: string, x: number, y: number) => void;
    updateIconColor: (id: string, color: string) => void;
    updateIconLabel: (id: string, label: string) => void;
    updateIconSize: (id: string, size: number) => void;
    removeIcon: (id: string) => void;
    drawings: DrawingPath[];
    setDrawings: (updater: React.SetStateAction<DrawingPath[]>) => void;
    saveHistory: () => void;
    isDrawingMode: boolean;
    setIsDrawingMode: React.Dispatch<React.SetStateAction<boolean>>;
    drawingType: DrawingType;
    setDrawingType: React.Dispatch<React.SetStateAction<DrawingType>>;
    drawingSettings: DrawingSettings;
    setDrawingSettings: React.Dispatch<React.SetStateAction<DrawingSettings>>;
    fieldType: FieldType;
    setFieldType: React.Dispatch<React.SetStateAction<FieldType>>;
    fieldTilt: number;
    setFieldTilt: React.Dispatch<React.SetStateAction<number>>;
    globalPlayerSize: number;
    setGlobalPlayerSize: React.Dispatch<React.SetStateAction<number>>;
    availablePlayers: Player[];
    addPlayerToField: (player: Player, x: number, y: number) => void;
    updatePlayerPosition: (playerId: string, x: number, y: number) => void;
    updatePlayerColor: (playerId: string, color: string) => void;
    updatePlayerName: (playerId: string, name: string) => void;
    updatePlayerNumber: (playerId: string, number: number) => void;
    updatePlayerSize: (playerId: string, size: number) => void;
    updateAllPlayersColor: (color: string) => void;
    removePlayerFromField: (playerId: string) => void;
    clearDrawings: () => void;
    undoDrawing: () => void;
    applyFormation: (formation: Formation) => void;
    selectedFormation: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [fieldPlayers, setFieldPlayers] = useState<FieldPlayer[]>([]);
    const [icons, setIcons] = useState<FieldIcon[]>([]); // New icons state
    const [drawings, setDrawingsInternal] = useState<DrawingPath[]>([]);
    const [drawingsHistory, setDrawingsHistory] = useState<DrawingPath[][]>([]);
    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const [drawingType, setDrawingType] = useState<DrawingType>('free');
    const [drawingSettings, setDrawingSettings] = useState<DrawingSettings>({
        color: '#FFEB3B',
        strokeWidth: 4,
        opacity: 1,
        isDashed: false,
        isHighlighter: false,
    });
    const [fieldType, setFieldType] = useState<FieldType>('classic');
    const [fieldTilt, setFieldTilt] = useState(0);
    const [globalPlayerSize, setGlobalPlayerSize] = useState(44);
    const [selectedFormation, setSelectedFormation] = useState<string | null>(null);
    const [availablePlayers] = useState<Player[]>(playersData as Player[]);

    const addPlayerToField = (player: Player, x: number, y: number) => {
        const newPlayer: FieldPlayer = {
            ...player,
            id: player.id || `custom_${Date.now()}`,
            x,
            y,
            color: player.color || '#2196F3'
        };
        setFieldPlayers((prev) => [...prev, newPlayer]);
    };

    const updatePlayerPosition = (playerId: string, x: number, y: number) => {
        setFieldPlayers((prev) =>
            prev.map((p) => (p.id === playerId ? { ...p, x, y } : p))
        );
    };

    const updatePlayerColor = (playerId: string, color: string) => {
        setFieldPlayers((prev) =>
            prev.map((p) => (p.id === playerId ? { ...p, color } : p))
        );
    };

    const updatePlayerName = (playerId: string, name: string) => {
        setFieldPlayers((prev) =>
            prev.map((p) => (p.id === playerId ? { ...p, name } : p))
        );
    };

    const updatePlayerNumber = (playerId: string, number: number) => {
        setFieldPlayers((prev) =>
            prev.map((p) => (p.id === playerId ? { ...p, number } : p))
        );
    };

    const updatePlayerSize = (playerId: string, size: number) => {
        setFieldPlayers((prev) =>
            prev.map((p) => (p.id === playerId ? { ...p, size } : p))
        );
    };

    const updateAllPlayersColor = (color: string) => {
        setFieldPlayers((prev) =>
            prev.map((p) => ({ ...p, color }))
        );
    };

    const removePlayerFromField = (playerId: string) => {
        setFieldPlayers((prev) => prev.filter((p) => p.id !== playerId));
    };

    // --- ICON MANAGEMENT ---
    const addIcon = (type: IconType, x: number, y: number) => {
        const newIcon: FieldIcon = {
            id: `icon_${Date.now()}`,
            type,
            x,
            y,
            color: '#FFFFFF',
            size: 32 // Default size
        };
        setIcons(prev => [...prev, newIcon]);
    };

    const updateIconPosition = (id: string, x: number, y: number) => {
        setIcons(prev => prev.map(icon => icon.id === id ? { ...icon, x, y } : icon));
    };

    const updateIconColor = (id: string, color: string) => {
        setIcons(prev => prev.map(icon => icon.id === id ? { ...icon, color } : icon));
    };

    const updateIconSize = (id: string, size: number) => {
        setIcons(prev => prev.map(icon => icon.id === id ? { ...icon, size } : icon));
    };

    const updateIconLabel = (id: string, label: string) => {
        setIcons(prev => prev.map(icon => icon.id === id ? { ...icon, label } : icon));
    };

    const removeIcon = (id: string) => {
        setIcons(prev => prev.filter(icon => icon.id !== id));
    };

    // Explicitly save current state to history
    const saveHistory = () => {
        setDrawingsHistory((hist) => {
            const newHist = [...hist, drawings];
            return newHist.slice(-20);
        });
    };

    const setDrawings = (updater: React.SetStateAction<DrawingPath[]>) => {
        setDrawingsInternal(updater);
    };

    const clearDrawings = () => {
        saveHistory();
        setDrawingsInternal([]);
    };

    const undoDrawing = () => {
        setDrawingsHistory((hist) => {
            if (hist.length === 0) return hist;

            const previousState = hist[hist.length - 1];
            const newHist = hist.slice(0, -1);

            setDrawingsInternal(previousState);
            return newHist;
        });
    };

    const STANDARD_POSITIONS = [
        'GK', 'LB', 'LCB', 'CB', 'RCB', 'RB', 'LWB', 'RWB',
        'CDM', 'LDM', 'RDM', 'LCM', 'CM', 'RCM', 'CAM', 'LAM', 'RAM',
        'LM', 'RM', 'LW', 'RW', 'LS', 'ST', 'RS', 'CF', 'LF', 'RF'
    ];

    const applyFormation = (formation: Formation) => {
        setSelectedFormation(formation.name);
        setFieldPlayers(prevPlayers => {
            let newPlayers = [...prevPlayers];

            const targetSize = formation.positions.length; // 11 for football, 5 for basketball
            if (newPlayers.length < targetSize) {
                const missingCount = targetSize - newPlayers.length;
                for (let i = 0; i < missingCount; i++) {
                    newPlayers.push({
                        id: `auto_${Date.now()}_${i}`,
                        name: '',
                        position: 'MF',
                        number: newPlayers.length + 1 + i,
                        color: '#2196F3',
                        x: 50, y: 50
                    });
                }
            }

            return newPlayers.map((player, index) => {
                if (index < formation.positions.length) {
                    const targetPos = formation.positions[index];
                    let newName = player.name;
                    if (!player.name || STANDARD_POSITIONS.includes(player.name)) {
                        newName = targetPos.label;
                    }

                    return {
                        ...player,
                        x: targetPos.x,
                        y: targetPos.y,
                        name: newName
                    };
                }
                return player;
            });
        });
    };

    return (
        <AppContext.Provider
            value={{
                fieldPlayers,
                setFieldPlayers,
                icons, // Export icons
                setIcons, // Export setIcons
                addIcon,
                updateIconPosition,
                updateIconColor,
                updateIconLabel,
                updateIconSize,
                removeIcon,
                drawings,
                setDrawings,
                saveHistory, // Export saveHistory
                isDrawingMode,
                setIsDrawingMode,
                drawingType,
                setDrawingType,
                drawingSettings,
                setDrawingSettings,
                fieldType,
                setFieldType,
                fieldTilt,
                setFieldTilt,
                globalPlayerSize,
                setGlobalPlayerSize,
                availablePlayers,
                addPlayerToField,
                updatePlayerPosition,
                updatePlayerColor,
                updatePlayerName,
                updatePlayerNumber,
                updatePlayerSize,
                updateAllPlayersColor,
                removePlayerFromField,
                clearDrawings,
                undoDrawing,
                applyFormation,
                selectedFormation,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within AppProvider');
    }
    return context;
};
