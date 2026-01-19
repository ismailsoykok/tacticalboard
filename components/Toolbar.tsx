import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Alert, ScrollView } from 'react-native';
// import { BlurView } from 'expo-blur';
import { MaterialIcons, MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import Slider from '@react-native-community/slider';
import { DrawingType } from '../types';
import { FOOTBALL_FORMATIONS, BASKETBALL_FORMATIONS } from '../data/formations';

interface ToolbarProps {
    onSave: () => void;
}

const PALETTE = ['#FFEB3B', '#FF5252', '#448AFF', '#69F0AE', '#E040FB', '#FFFFFF', '#000000'];

const SHAPE_ICONS: { [key in DrawingType]: any } = {
    'free': { name: 'edit', lib: MaterialIcons },
    'arrow': { name: 'arrow-top-right', lib: MaterialCommunityIcons },
    'rect': { name: 'square', lib: Ionicons },
    'circle': { name: 'radio-button-unchecked', lib: MaterialIcons },
    'triangle': { name: 'triangle', lib: Ionicons },
    'eraser': { name: 'eraser', lib: MaterialCommunityIcons },
};

export const Toolbar: React.FC<ToolbarProps> = ({ onSave }) => {
    const {
        isDrawingMode,
        setIsDrawingMode,
        clearDrawings,
        setFieldPlayers,
        fieldPlayers,
        drawingType,
        setDrawingType,
        undoDrawing,
        drawingSettings,
        setDrawingSettings,
        applyFormation,
        fieldTilt,
        setFieldTilt,
        globalPlayerSize,
        setGlobalPlayerSize,
        updateAllPlayersColor,
        icons,
        setIcons,
        fieldType
    } = useAppContext();

    // Settings Panel Visibility
    const [showSettings, setShowSettings] = useState(false);
    const [showFormations, setShowFormations] = useState(false);
    const [showTilt, setShowTilt] = useState(false);
    const [showSize, setShowSize] = useState(false);
    const [showGlobalColor, setShowGlobalColor] = useState(false);

    const COLORS = ['#2196F3', '#F44336', '#4CAF50', '#FFC107', '#9C27B0', '#212121', '#FFFFFF', '#FF5722'];

    const handleClearAll = () => {
        Alert.alert(
            'Temizle',
            'Tüm oyuncuları ve çizimleri silmek istiyor musunuz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Temizle',
                    style: 'destructive',
                    onPress: () => {
                        setFieldPlayers([]);
                        setIcons([]);
                        clearDrawings();
                    },
                },
            ]
        );
    };

    const toggleDrawingMode = () => {
        const newMode = !isDrawingMode;
        setIsDrawingMode(newMode);
        if (newMode) {
            setShowSettings(true);
            setShowFormations(false);
            setShowTilt(false);
            setShowSize(false);
        } else {
            setShowSettings(false);
        }
    };

    const selectShape = (type: DrawingType) => {
        setDrawingType(type);
        // Set default values: width ~50% (5), opacity 100% (1.0)
        if (type !== 'eraser') {
            updateSetting('strokeWidth', 5);
            updateSetting('opacity', 1.0); // Full opacity by default
        } else {
            // [NEW] Eraser defaults
            updateSetting('strokeWidth', 6); // Default eraser size (Medium)
        }
    };

    const updateSetting = (key: keyof typeof drawingSettings, value: any) => {
        setDrawingSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleApplyFormation = (formation: any) => {
        applyFormation(formation);
        setShowFormations(false);
    };

    const renderIcon = (type: DrawingType, color: string, size: number = 24) => {
        const config = SHAPE_ICONS[type] || SHAPE_ICONS['free'];
        const IconLib = config.lib;
        return <IconLib name={config.name} size={size} color={color} />;
    };

    const closeAllPanels = () => {
        setShowSettings(false);
        setShowFormations(false);
        setShowTilt(false);
        setShowSize(false);
        setShowGlobalColor(false);
    };

    return (
        <View style={styles.wrapper}>

            {/* Settings Panel */}
            {showSettings && isDrawingMode && (
                <View style={[styles.settingsPanel, { backgroundColor: 'rgba(30,30,30,0.95)' }]}>
                    <View style={styles.settingsHeader}>
                        <Text style={styles.settingsTitle}>Ayar</Text>
                        <TouchableOpacity onPress={() => setShowSettings(false)}>
                            <Ionicons name="close-circle" size={24} color="#8E8E93" />
                        </TouchableOpacity>
                    </View>

                    {/* SHAPES */}
                    <View style={styles.shapesRow}>
                        {(['free', 'arrow', 'rect', 'circle', 'triangle', 'eraser'] as DrawingType[]).map((type) => (
                            <TouchableOpacity
                                key={type}
                                style={[styles.shapeBtn, drawingType === type && styles.activeShapeBtn]}
                                onPress={() => selectShape(type)}
                            >
                                {renderIcon(type, drawingType === type ? '#fff' : '#8E8E93', 20)}
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* New Toggles: Dashed & Highlighter - Reduced padding to prevent overlap */}
                    <View style={[styles.shapesRow, { gap: 4 }]}>
                        <TouchableOpacity
                            style={[styles.shapeBtn, drawingSettings.isDashed && styles.activeShapeBtn, { flex: 1, paddingVertical: 4, paddingHorizontal: 2 }]}
                            onPress={() => updateSetting('isDashed', !drawingSettings.isDashed)}
                        >
                            <MaterialCommunityIcons name="border-bottom-variant" size={18} color={drawingSettings.isDashed ? '#fff' : '#8E8E93'} />
                            <Text style={{ color: drawingSettings.isDashed ? '#fff' : '#8E8E93', fontSize: 9, marginTop: 2 }}>Kesik</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.shapeBtn, drawingSettings.isHighlighter && styles.activeShapeBtn, { flex: 1, paddingVertical: 4, paddingHorizontal: 2 }]}
                            onPress={() => {
                                const newVal = !drawingSettings.isHighlighter;
                                setDrawingSettings(prev => ({
                                    ...prev,
                                    isHighlighter: newVal,
                                    opacity: newVal ? 0.5 : 1.0, // Fosfor: 0.5, Normal: 1.0
                                    strokeWidth: newVal ? 12 : 5 // Reduced fosfor width
                                }));
                            }}
                        >
                            <MaterialIcons name="highlight" size={18} color={drawingSettings.isHighlighter ? '#fff' : '#8E8E93'} />
                            <Text style={{ color: drawingSettings.isHighlighter ? '#fff' : '#8E8E93', fontSize: 9, marginTop: 2 }}>Fosfor</Text>
                        </TouchableOpacity>
                    </View>

                    {/* COLORS & SLIDERS */}
                    <View style={styles.colorsRow}>
                        {PALETTE.map(color => (
                            <TouchableOpacity
                                key={color}
                                style={[
                                    styles.colorCircle,
                                    { backgroundColor: color },
                                    drawingSettings.color === color && styles.selectedColor
                                ]}
                                onPress={() => updateSetting('color', color)}
                            />
                        ))}
                    </View>
                    <View style={styles.sliderRow} onStartShouldSetResponder={() => true}>
                        <Text style={styles.label}>Genişlik</Text>
                        <Slider
                            style={{ flex: 1, height: 40 }}
                            minimumValue={2}
                            maximumValue={10}
                            step={1}
                            value={drawingSettings.strokeWidth}
                            onValueChange={(val) => updateSetting('strokeWidth', val)}
                            minimumTrackTintColor="#2962FF"
                            maximumTrackTintColor="#555"
                            thumbTintColor="#2962FF"
                            tapToSeek={true}
                        />
                    </View>
                    <View style={styles.sliderRow} onStartShouldSetResponder={() => true}>
                        <Text style={styles.label}>Opaklık</Text>
                        <Slider
                            style={{ flex: 1, height: 40 }}
                            minimumValue={0.1}
                            maximumValue={1}
                            step={0.1}
                            value={drawingSettings.opacity}
                            onValueChange={(val) => updateSetting('opacity', val)}
                            minimumTrackTintColor="#2962FF"
                            maximumTrackTintColor="#555"
                            thumbTintColor="#2962FF"
                            tapToSeek={true}
                        />
                    </View>
                </View>
            )}

            {/* Formations List Panel */}
            {showFormations && (
                <View style={[styles.formationsPanel, { backgroundColor: 'rgba(30,30,30,0.95)' }]}>
                    <View style={styles.settingsHeader}>
                        <Text style={styles.settingsTitle}>Diziliş Seç</Text>
                        <TouchableOpacity onPress={() => setShowFormations(false)}>
                            <Ionicons name="close-circle" size={24} color="#8E8E93" />
                        </TouchableOpacity>
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.formationsScroll}
                        scrollEnabled={true}
                        nestedScrollEnabled={true}
                        removeClippedSubviews={false}
                    >
                        {(fieldType === 'basketball' ? BASKETBALL_FORMATIONS : FOOTBALL_FORMATIONS).map((fmt) => (
                            <TouchableOpacity
                                key={fmt.name}
                                style={styles.formationBtn}
                                onPress={() => handleApplyFormation(fmt)}
                            >
                                <MaterialCommunityIcons name={fieldType === 'basketball' ? "basketball" : "soccer-field"} size={24} color="#FFF" style={{ marginBottom: 4 }} />
                                <Text style={styles.formationText}>{fmt.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Global Color Panel */}
            {showGlobalColor && (
                <View style={[styles.settingsPanel, { backgroundColor: 'rgba(30,30,30,0.95)' }]}>
                    <View style={styles.settingsHeader}>
                        <Text style={styles.settingsTitle}>Takım Rengi (Tümü)</Text>
                        <TouchableOpacity onPress={() => setShowGlobalColor(false)}>
                            <Ionicons name="close-circle" size={24} color="#8E8E93" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.colorsRow}>
                        {COLORS.map((color) => (
                            <TouchableOpacity
                                key={color}
                                style={[styles.colorCircle, { backgroundColor: color }]}
                                onPress={() => {
                                    updateAllPlayersColor(color);
                                }}
                            />
                        ))}
                    </View>
                </View>
            )}

            {/* Tilt Check Panel */}
            {showTilt && (
                <View style={[styles.settingsPanel, { backgroundColor: 'rgba(30,30,30,0.95)' }]}>
                    <View style={styles.settingsHeader}>
                        <Text style={styles.settingsTitle}>Saha Eğimi</Text>
                        <TouchableOpacity onPress={() => setShowTilt(false)}>
                            <Ionicons name="close-circle" size={24} color="#8E8E93" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.sliderRow} onStartShouldSetResponder={() => true}>
                        <MaterialCommunityIcons name="axis-z-rotate-clockwise" size={20} color="#CCC" style={{ marginRight: 10 }} />
                        <Slider
                            style={{ flex: 1, height: 40 }}
                            minimumValue={0}
                            maximumValue={60}
                            step={1}
                            value={fieldTilt}
                            onValueChange={setFieldTilt}
                            minimumTrackTintColor="#4CAF50"
                            maximumTrackTintColor="#555"
                            thumbTintColor="#4CAF50"
                            tapToSeek={true}
                        />
                        <Text style={{ color: '#FFF', width: 30, textAlign: 'right' }}>{fieldTilt}°</Text>
                    </View>
                </View>
            )}

            {/* Player Size Panel */}
            {showSize && (
                <View style={[styles.settingsPanel, { backgroundColor: 'rgba(30,30,30,0.95)' }]}>
                    <View style={styles.settingsHeader}>
                        <Text style={styles.settingsTitle}>Oyuncu Boyutu (Genel)</Text>
                        <TouchableOpacity onPress={() => setShowSize(false)}>
                            <Ionicons name="close-circle" size={24} color="#8E8E93" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.sliderRow} onStartShouldSetResponder={() => true}>
                        <Ionicons name="resize" size={20} color="#CCC" style={{ marginRight: 10 }} />
                        <Slider
                            style={{ flex: 1, height: 40 }}
                            minimumValue={20}
                            maximumValue={50}
                            step={2}
                            value={globalPlayerSize}
                            onValueChange={(val) => {
                                // Clear all individual sizes, set global
                                setFieldPlayers(prev => prev.map(p => ({ ...p, size: undefined })));
                                setGlobalPlayerSize(val);
                            }}
                            minimumTrackTintColor="#FFC107"
                            maximumTrackTintColor="#555"
                            thumbTintColor="#FFC107"
                            tapToSeek={true}
                        />
                        <Text style={{ color: '#FFF', width: 30, textAlign: 'right' }}>{globalPlayerSize}</Text>
                    </View>
                </View>
            )}


            {/* Main Toolbar */}
            <View style={[styles.container, { backgroundColor: 'rgba(30,30,30,0.95)' }]}>

                {/* Undo */}
                <TouchableOpacity style={styles.item} onPress={undoDrawing}>
                    <View style={styles.iconContainer}>
                        <MaterialIcons name="undo" size={22} color="#FFF" />
                    </View>
                </TouchableOpacity>

                <View style={styles.divider} />

                {/* Drawing Toggle */}
                <TouchableOpacity
                    style={styles.item}
                    onPress={toggleDrawingMode}
                >
                    <View style={[styles.iconContainer, isDrawingMode && styles.activeIcon]}>
                        {renderIcon(drawingType, isDrawingMode ? '#2962FF' : '#8E8E93')}
                    </View>
                </TouchableOpacity>

                {isDrawingMode && !showSettings && (
                    <TouchableOpacity
                        style={styles.item}
                        onPress={() => setShowSettings(true)}
                    >
                        <View style={styles.iconContainer}>
                            <Ionicons name="options" size={22} color="#FFF" />
                        </View>
                    </TouchableOpacity>
                )}

                <View style={styles.divider} />

                {/* Formations Button */}
                <TouchableOpacity
                    style={styles.item}
                    onPress={() => {
                        if (isDrawingMode) setIsDrawingMode(false);
                        closeAllPanels();
                        setShowFormations(!showFormations);
                    }}
                >
                    <View style={[styles.iconContainer, showFormations && styles.activeIcon]}>
                        <Ionicons name="clipboard-outline" size={22} color={showFormations ? "#2962FF" : "#FFF"} />
                    </View>
                </TouchableOpacity>

                {/* Takım Rengi Button */}
                <TouchableOpacity
                    style={styles.item}
                    onPress={() => {
                        if (isDrawingMode) setIsDrawingMode(false);
                        closeAllPanels();
                        setShowGlobalColor(!showGlobalColor);
                    }}
                >
                    <View style={[styles.iconContainer, showGlobalColor && styles.activeIcon]}>
                        <Ionicons name="color-palette" size={22} color={showGlobalColor ? "#FFC107" : "#FFF"} />
                    </View>
                </TouchableOpacity>

                {/* TILT Button */}
                <TouchableOpacity
                    style={styles.item}
                    onPress={() => {
                        if (isDrawingMode) setIsDrawingMode(false);
                        closeAllPanels();
                        setShowTilt(!showTilt);
                    }}
                >
                    <View style={[styles.iconContainer, showTilt && styles.activeIcon]}>
                        <MaterialCommunityIcons name="perspective-less" size={22} color={showTilt ? "#4CAF50" : "#FFF"} />
                    </View>
                </TouchableOpacity>

                {/* SIZE Button - NEW */}
                <TouchableOpacity
                    style={styles.item}
                    onPress={() => {
                        if (isDrawingMode) setIsDrawingMode(false);
                        closeAllPanels();
                        setShowSize(!showSize);
                    }}
                >
                    <View style={[styles.iconContainer, showSize && styles.activeIcon]}>
                        <Ionicons name="resize" size={22} color={showSize ? "#FFC107" : "#FFF"} />
                    </View>
                </TouchableOpacity>


                <View style={styles.divider} />

                {/* Actions */}
                <View style={styles.group}>
                    <TouchableOpacity style={styles.item} onPress={handleClearAll}>
                        <View style={styles.iconContainer}>
                            <MaterialIcons name="delete-sweep" size={22} color="#E53935" />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.item} onPress={onSave}>
                        <View style={styles.iconContainer}>
                            <MaterialIcons name="save-alt" size={22} color="#4CAF50" />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 40,
        zIndex: 2000,
        elevation: 100, // [FIX] Android touch issue
        pointerEvents: 'box-none', // Allow touches to pass through wrapper
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 10, // Reduced from 16
        borderRadius: 30,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)', // More subtle border
        maxWidth: '94%', // Prevent touching screen edges
        elevation: 100, // [FIX] Android touch issue
    },
    group: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
    },
    divider: {
        width: 1,
        height: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginHorizontal: 6, // Reduced from 10
    },
    item: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        padding: 8,
        borderRadius: 12,
    },
    activeIcon: {
        backgroundColor: 'rgba(41, 98, 255, 0.2)',
    },
    settingsPanel: {
        position: 'absolute',
        bottom: 90, // Adjusted relative to wrapper padding
        width: 320,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        zIndex: 2001,
        elevation: 8,
        pointerEvents: 'auto', // [FIX] Ensure panel captures touches
    },
    formationsPanel: {
        position: 'absolute',
        bottom: 90, // Adjusted relative to wrapper padding
        width: '90%',
        maxWidth: 400,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        zIndex: 2001,
        elevation: 8,
        pointerEvents: 'auto', // [FIX] Ensure panel captures touches
    },
    formationsScroll: {
        flexDirection: 'row',
        gap: 12,
        paddingVertical: 10,
    },
    formationBtn: {
        width: 80,
        height: 70,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    formationText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    settingsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    settingsTitle: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 12,
    },
    shapesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 6,
        borderRadius: 12,
    },
    shapeBtn: {
        padding: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    activeShapeBtn: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    colorsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    colorCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedColor: {
        borderColor: '#FFF',
        transform: [{ scale: 1.1 }],
    },
    sliderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    label: {
        color: '#CCC',
        fontSize: 11,
        width: 60,
        fontWeight: 'bold'
    }
});
