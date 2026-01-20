import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    SafeAreaView,
    StatusBar,
    Modal,
    TouchableOpacity,
    Alert,
    TouchableWithoutFeedback,
    Keyboard,
    Image,
    ScrollView,
    TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppProvider, useAppContext } from './context/AppContext';
import { FootballField } from './components/FootballField';
import { Player } from './components/Player';
import { IconObject } from './components/IconObject';
import { DrawingCanvas } from './components/DrawingCanvas';
import { Toolbar } from './components/Toolbar';
import { FieldType, IconType } from './types';

const FIELD_ASPECT_RATIO = 1.6;
const COLORS = ['#2196F3', '#F44336', '#4CAF50', '#FFC107', '#9C27B0', '#212121', '#FFFFFF', '#FF5722'];

function TacticsBoard({ route, navigation }: { route: any, navigation: any }) {
    const viewShotRef = useRef<ViewShot>(null);

    const [showAddPlayer, setShowAddPlayer] = useState(false);
    const [showEditPlayer, setShowEditPlayer] = useState(false);
    const [showFieldPicker, setShowFieldPicker] = useState(false);
    const [showAddIcon, setShowAddIcon] = useState(false);
    const [showEditIcon, setShowEditIcon] = useState(false);
    const [showSaveNameModal, setShowSaveNameModal] = useState(false);

    // REBUILD MODE STATE
    const [rebuildMode, setRebuildMode] = useState(false);
    const [rebuildPhase, setRebuildPhase] = useState<'setup' | 'active'>('setup');
    const [balance, setBalance] = useState(0);
    const [totalSalary, setTotalSalary] = useState(0);
    const [showTransferModal, setShowTransferModal] = useState(false); // To prompt sale price
    const [transferSalePrice, setTransferSalePrice] = useState('');

    // For transfer chain: Sell Old -> Buy New
    const [pendingTransferId, setPendingTransferId] = useState<string | null>(null);

    const [currentSquadId, setCurrentSquadId] = useState<string | null>(null);
    const [squadName, setSquadName] = useState('');

    // New Player Form
    const [newPlayerName, setNewPlayerName] = useState('');
    const [newPlayerNumber, setNewPlayerNumber] = useState('');
    const [newPlayerSalary, setNewPlayerSalary] = useState('');
    const [newPlayerCost, setNewPlayerCost] = useState(''); // Purchase price

    // Edit Player Form
    const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editNumber, setEditNumber] = useState('');
    const [editSize, setEditSize] = useState(44);
    const [editSalary, setEditSalary] = useState('');

    // Edit Icon Form
    const [editingIconId, setEditingIconId] = useState<string | null>(null);
    const [editIconLabel, setEditIconLabel] = useState('');
    const [editIconColor, setEditIconColor] = useState('#FFFFFF');
    const [editIconSize, setEditIconSize] = useState(32);

    const [fieldDimensions, setFieldDimensions] = useState({ width: 0, height: 0 });

    const {
        fieldPlayers,
        updatePlayerPosition,
        updatePlayerColor,
        updatePlayerName,
        updatePlayerNumber,
        updatePlayerSize,
        addPlayerToField,
        removePlayerFromField,
        isDrawingMode,
        setFieldType,
        fieldType,
        fieldTilt,
        globalPlayerSize,
        setGlobalPlayerSize,
        icons,
        addIcon,
        updateIconPosition,
        updateIconColor,
        updateIconLabel,
        updateIconSize,
        removeIcon,
        setFieldPlayers,
        setIcons,
    } = useAppContext();

    // Sync editSize when editing a different player
    // Sync editSize ONLY when opening the modal for a new player
    useEffect(() => {
        if (editingPlayerId) {
            const player = fieldPlayers.find(p => p.id === editingPlayerId);
            if (player) {
                setEditSize(player.size ?? globalPlayerSize);
            }
        }
    }, [editingPlayerId]); // Removed fieldPlayers and globalPlayerSize to prevent reset on updates

    useEffect(() => {
        if (route.params?.mode === 'rebuild') {
            setRebuildMode(true);
            setRebuildPhase('setup');
        }

        if (route.params?.squadData) {
            const { squadData } = route.params;
            if (squadData.fieldPlayers) setFieldPlayers(squadData.fieldPlayers);
            if (squadData.icons) setIcons(squadData.icons);
            if (squadData.id) setCurrentSquadId(squadData.id);
            if (squadData.name) setSquadName(squadData.name);
        }
    }, [route.params]);

    // Calculate Total Salary
    useEffect(() => {
        if (rebuildMode) {
            const total = fieldPlayers.reduce((sum, p) => sum + (p.salary || 0), 0);
            setTotalSalary(total);
        }
    }, [fieldPlayers, rebuildMode]);

    const handleSavePress = () => {
        if (currentSquadId) {
            // SCENARIO B: Update existing squad
            saveSquadToStorage(currentSquadId, squadName);
        } else {
            // SCENARIO A: New Squad -> Ask for name
            setShowSaveNameModal(true);
        }
    };

    const handleConfirmSaveNew = () => {
        if (!squadName.trim()) {
            Alert.alert('Hata', 'Lütfen bir kadro ismi giriniz.');
            return;
        }
        const newId = `squad_${Date.now()}`;
        saveSquadToStorage(newId, squadName);
        setShowSaveNameModal(false);
    };

    const saveSquadToStorage = async (id: string, name: string) => {
        try {
            const squadData = {
                id,
                name,
                fieldPlayers,
                icons,
                timestamp: Date.now(),
            };
            await AsyncStorage.setItem(id, JSON.stringify(squadData));
            setCurrentSquadId(id); // Set as current so next save updates it
            Alert.alert('Başarılı', 'Kadro kaydedildi!');
        } catch (error) {
            console.error('Save error:', error);
            Alert.alert('Hata', 'Kadro kaydedilemedi.');
        }
    };

    const onFieldLayout = useCallback((event: any) => {
        const { width, height } = event.nativeEvent.layout;
        let fieldWidth = width;
        let fieldHeight = width * FIELD_ASPECT_RATIO;

        if (fieldHeight > height) {
            fieldHeight = height;
            fieldWidth = height / FIELD_ASPECT_RATIO;
        }

        setFieldDimensions({ width: fieldWidth, height: fieldHeight });
    }, []);

    const handleAddPlayer = () => {
        if (!newPlayerName || !newPlayerNumber) {
            Alert.alert('Eksik Bilgi', 'Lütfen isim ve numara giriniz.');
            return;
        }

        // Validate Salary in Rebuild Mode
        if (rebuildMode) {
            if (!newPlayerSalary) {
                Alert.alert('Eksik Bilgi', 'Rebuild modunda maaş girilmesi zorunludur.');
                return;
            }
            if (rebuildPhase === 'active' && !newPlayerCost) {
                Alert.alert('Eksik Bilgi', 'Transfer için alış bedeli girilmesi zorunludur.');
                return;
            }
        }

        const newPlayer = {
            id: `custom_${Date.now()}`,
            name: newPlayerName,
            number: parseInt(newPlayerNumber) || 0,
            position: 'MF' as any,
            color: '#2196F3',
            salary: rebuildMode ? (parseInt(newPlayerSalary) || 0) : undefined,
            purchasePrice: rebuildMode && rebuildPhase === 'active' ? (parseInt(newPlayerCost) || 0) : undefined,
        };

        if (rebuildPhase === 'active' && pendingTransferId) {
            // COMPLETE TRANSFER (SWAP)
            // 1. Remove old player (pendingTransferId)
            // 2. Add new player at SAME position if possible? Or logic handles it.
            // Actually, removePlayerFromField removes by ID. AddPlayer adds to center (50,50). 
            // Better UX: Plce new player at old player's position?
            const oldPlayer = fieldPlayers.find(p => p.id === pendingTransferId);
            const dropX = oldPlayer ? oldPlayer.x : 50;
            const dropY = oldPlayer ? oldPlayer.y : 50;

            removePlayerFromField(pendingTransferId);
            addPlayerToField(newPlayer, dropX, dropY);

            // Update Finance
            // Balance = Current + SalePrice - PurchasePrice
            const sale = parseInt(transferSalePrice) || 0;
            const purchase = parseInt(newPlayerCost) || 0;
            setBalance(prev => prev + sale - purchase);

            setPendingTransferId(null);
            setTransferSalePrice('');
        } else {
            // Normal Add (Setup Phase)
            addPlayerToField(newPlayer, 50, 50);
        }

        setNewPlayerName('');
        setNewPlayerNumber('');
        setNewPlayerSalary('');
        setNewPlayerCost('');
        setShowAddPlayer(false);
    };

    const handleStartRebuild = () => {
        if (fieldPlayers.length === 0) {
            Alert.alert('Uyarı', 'Sahada oyuncu olmadan Rebuild başlatılamaz.');
            return;
        }

        // Validation: All players must have salary
        const missingSalary = fieldPlayers.some(p => p.salary === undefined || p.salary === null);
        if (missingSalary) {
            Alert.alert('Hata', 'Tüm oyuncuların maaş bilgisi girilmelidir.');
            return;
        }

        Alert.alert(
            'Rebuild Başlat',
            'Rebuild modu aktif edilecek. Artık serbest oyuncu ekleyemezsiniz, sadece transfer yapabilirsiniz. Emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                { text: 'Başlat', onPress: () => setRebuildPhase('active') }
            ]
        );
    };

    const openTransferModal = () => {
        // Move from Edit Modal to Transfer (Sale Price) Modal
        if (!editingPlayerId) return;
        setPendingTransferId(editingPlayerId);
        setShowEditPlayer(false); // Close edit
        setShowTransferModal(true); // Open sale price prompt
    };

    const handleConfirmTransferSale = () => {
        if (!transferSalePrice) {
            Alert.alert('Hata', 'Lütfen satış bedeli giriniz.');
            return;
        }
        setShowTransferModal(false);
        // Open Add Player Modal for the incoming player
        // Setup fields for clarity
        setNewPlayerName('');
        setNewPlayerNumber('');
        setShowAddPlayer(true);
    };

    const handlePlayerPress = useCallback((playerId: string) => {
        if (isDrawingMode) return;

        const player = fieldPlayers.find(p => p.id === playerId);
        if (player) {
            setEditingPlayerId(playerId);
            setEditName(player.name);
            setEditNumber(player.number.toString());
            setEditSize(player.size ?? globalPlayerSize);
            setEditSalary(player.salary ? player.salary.toString() : '');
            setShowEditPlayer(true);
        }
    }, [isDrawingMode, fieldPlayers, globalPlayerSize]);

    const handleSaveEdit = () => {
        if (editingPlayerId) {
            if (editName) updatePlayerName(editingPlayerId, editName);
            if (editNumber) updatePlayerNumber(editingPlayerId, parseInt(editNumber) || 0);
            updatePlayerSize(editingPlayerId, editSize);

            // Should we allow salary update in active mode? Maybe only setup?
            // Let's allow it in Setup, but forbid in Active? Or allow always?
            // User request implied Active phase is "Swap", but didn't explicitly forbid editing existing.
            // But usually Rebuild implies fixed contracts. I'll allow editing in Setup, specific Transfer flow for Active.
            // Actually, for simplicity, I'll allow updating salary in Setup only.
            if (rebuildMode && rebuildPhase === 'setup' && editSalary) {
                // We need a updatePlayerSalary function in context? 
                // Context doesn't have it. I'll cheat and update via full list or add it to context?
                // Accessing setFieldPlayers from context to update manually
                setFieldPlayers(prev => prev.map(p =>
                    p.id === editingPlayerId ? { ...p, salary: parseInt(editSalary) || 0 } : p
                ));
            }

            setShowEditPlayer(false);
            setShowEditPlayer(false);
            setEditingPlayerId(null);
        }
    };

    const handleDeletePlayer = () => {
        if (editingPlayerId) {
            removePlayerFromField(editingPlayerId);
            setShowEditPlayer(false);
            setEditingPlayerId(null);
        }
    };

    const handleColorSelect = (color: string) => {
        if (editingPlayerId) {
            updatePlayerColor(editingPlayerId, color);
        }
    };

    const handlePlayerLongPress = (playerId: string) => {
        Alert.alert(
            'Oyuncu',
            'Bu oyuncuyu sahadan çıkarmak ister misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Çıkar',
                    style: 'destructive',
                    onPress: () => removePlayerFromField(playerId),
                },
            ]
        );
    };

    const handleAddIcon = (type: IconType) => {
        addIcon(type, 50, 50);
        setShowAddIcon(false);
    };

    const handleIconPress = (iconId: string) => {
        if (isDrawingMode) return;

        const icon = icons.find(i => i.id === iconId);
        if (icon) {
            setEditingIconId(iconId);
            setEditIconLabel(icon.label || '');
            setEditIconColor(icon.color);
            setEditIconSize(icon.size ?? 32);
            setShowEditIcon(true);
        }
    };

    const handleSaveIconEdit = () => {
        if (editingIconId) {
            if (editIconLabel) updateIconLabel(editingIconId, editIconLabel);
            updateIconColor(editingIconId, editIconColor);
            updateIconSize(editingIconId, editIconSize);
            setShowEditIcon(false);
            setEditingIconId(null);
        }
    };

    const handleDeleteIcon = () => {
        if (editingIconId) {
            removeIcon(editingIconId);
            setShowEditIcon(false);
            setEditingIconId(null);
        }
    };

    const handleSave = async () => {
        try {
            // [FIX] Request write-only permission to avoid 'audio' permission error and fix TS type error
            const { status } = await MediaLibrary.requestPermissionsAsync(true);
            if (status !== 'granted') {
                Alert.alert('İzin Gerekli', 'Görsel kaydetmek için galeri izni gerekli.');
                return;
            }

            if (viewShotRef.current && viewShotRef.current.capture) {
                setTimeout(async () => {
                    const uri = await viewShotRef.current!.capture!();
                    const asset = await MediaLibrary.createAssetAsync(uri);
                    await MediaLibrary.createAlbumAsync('Taktik Tahtası', asset, false);
                    Alert.alert('Başarılı', 'Taktik görseli galeriye kaydedildi!');
                }, 100);
            }
        } catch (error) {
            console.error('Save error:', error);
            Alert.alert('Hata', 'Görsel kaydedilemedi.');
        }
    };

    const fieldOptions: { type: FieldType; label: string; color: string }[] = [
        { type: 'classic', label: 'Klasik Çim', color: '#2e7d32' },
        { type: 'dark', label: 'Koyu (Slate)', color: '#1e293b' },
        { type: 'tactical', label: 'Taktik (Mavi)', color: '#2563eb' },
        { type: 'neon', label: 'Neon', color: '#0f172a' },
        { type: 'bw', label: 'Siyah Beyaz', color: '#ffffff' },
        { type: 'basketball', label: 'Basketbol', color: '#F57C00' },
        { type: 'volleyball', label: 'Voleybol', color: '#FF9800' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#121212" />

            {/* Header */}
            <View style={styles.header}>
                {rebuildMode && rebuildPhase === 'active' ? (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20, alignItems: 'center', gap: 15 }}
                    >
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => navigation.goBack()}
                        >
                            <MaterialIcons name="arrow-back" size={24} color="#FFF" />
                        </TouchableOpacity>

                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>Toplam Maaş</Text>
                            <Text style={styles.statValue}>€{totalSalary.toLocaleString()}</Text>
                        </View>

                        <View style={[styles.statBox, { borderColor: balance >= 0 ? '#4ade80' : '#FF3B30' }]}>
                            <Text style={styles.statLabel}>Bonservis</Text>
                            <Text style={[styles.statValue, { color: balance >= 0 ? '#4ade80' : '#FF3B30' }]}>
                                {balance >= 0 ? '+' : ''}€{balance.toLocaleString()}
                            </Text>
                        </View>
                    </ScrollView>
                ) : (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20, alignItems: 'center', gap: 10 }}
                    >
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => navigation.goBack()}
                        >
                            <MaterialIcons name="arrow-back" size={24} color="#FFF" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => setShowFieldPicker(true)}
                        >
                            <MaterialCommunityIcons name="soccer-field" size={24} color="#FFF" />
                        </TouchableOpacity>

                        {rebuildMode ? (
                            <TouchableOpacity
                                style={[styles.iconButton, { backgroundColor: '#e11d48', borderColor: '#e11d48', paddingHorizontal: 12 }]}
                                onPress={handleStartRebuild}
                            >
                                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>REBUILD BAŞLAT</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={[styles.iconButton, { backgroundColor: '#0A84FF', borderColor: '#0A84FF' }]}
                                onPress={handleSavePress}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                    <MaterialIcons name="save" size={20} color="#FFF" />
                                    <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 12 }}>Kaydet</Text>
                                </View>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={styles.addPlayerButton}
                            onPress={() => setShowAddIcon(true)}
                        >
                            <MaterialCommunityIcons name="bag-personal" size={20} color="#FFF" style={{ marginRight: 6 }} />
                            <Text style={styles.addPlayerButtonText}>İkon</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.addPlayerButton}
                            onPress={() => setShowAddPlayer(true)}
                        >
                            <MaterialIcons name="person-add" size={20} color="#FFF" style={{ marginRight: 6 }} />
                            <Text style={styles.addPlayerButtonText}>Oyuncu</Text>
                        </TouchableOpacity>
                    </ScrollView>
                )}
            </View>

            {/* Field Container */}
            <View style={styles.fieldContainer} onLayout={onFieldLayout}>
                {fieldDimensions.width > 0 && (
                    <ViewShot
                        ref={viewShotRef}
                        options={{ format: 'png', quality: 1 }}
                        style={[
                            styles.viewShot,
                            {
                                width: fieldDimensions.width,
                                height: fieldDimensions.height,
                                transform: fieldTilt > 0 ? [
                                    { perspective: 1000 },
                                    { rotateX: `${fieldTilt}deg` },
                                    { scale: 1 - (fieldTilt * 0.005) }
                                ] : []
                            },
                        ]}
                    >
                        {/* Layer 1: Football Field */}
                        <FootballField
                            width={fieldDimensions.width}
                            height={fieldDimensions.height}
                        />

                        {/* Layer 2: Players */}
                        <View style={StyleSheet.absoluteFill}>
                            {fieldPlayers.map((player) => (
                                <Player
                                    key={player.id}
                                    player={player}
                                    fieldWidth={fieldDimensions.width}
                                    fieldHeight={fieldDimensions.height}
                                    onPositionChange={updatePlayerPosition}
                                    onPress={handlePlayerPress}
                                    onLongPress={handlePlayerLongPress}
                                    disabled={isDrawingMode}
                                />
                            ))}
                            {icons.map((icon) => (
                                <IconObject
                                    key={icon.id}
                                    icon={icon}
                                    fieldWidth={fieldDimensions.width}
                                    fieldHeight={fieldDimensions.height}
                                    onPositionChange={updateIconPosition}
                                    onPress={handleIconPress}
                                    disabled={isDrawingMode}
                                />
                            ))}
                        </View>

                        {/* Layer 3: Drawing Canvas */}
                        <DrawingCanvas
                            width={fieldDimensions.width}
                            height={fieldDimensions.height}
                        />
                    </ViewShot>
                )}
            </View>

            <Toolbar onSave={handleSave} />

            {/* Modals */}

            {/* Field Picker Modal */}
            <Modal
                visible={showFieldPicker}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowFieldPicker(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowFieldPicker(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Saha Görünümü</Text>
                        <View style={styles.fieldOptionsContainer}>
                            {fieldOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.type}
                                    style={[
                                        styles.fieldOption,
                                        fieldType === option.type && styles.selectedFieldOption,
                                        { backgroundColor: option.color }
                                    ]}
                                    onPress={() => {
                                        setFieldType(option.type);
                                        setShowFieldPicker(false);
                                    }}
                                >
                                    <Text style={styles.fieldOptionText}>{option.label}</Text>
                                    {fieldType === option.type && (
                                        <View style={styles.checkmark}>
                                            <Ionicons name="checkmark" size={16} color="#FFF" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>


            {/* Add Player Modal */}
            <Modal
                visible={showAddPlayer}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowAddPlayer(false)}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Yeni Oyuncu</Text>

                            <TextInput
                                style={styles.input}
                                placeholder="İsim"
                                placeholderTextColor="#666"
                                value={newPlayerName}
                                onChangeText={setNewPlayerName}
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Numara"
                                placeholderTextColor="#666"
                                keyboardType="number-pad"
                                value={newPlayerNumber}
                                onChangeText={setNewPlayerNumber}
                                maxLength={2}
                            />

                            {rebuildMode && (
                                <>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Maaş (Milyon €)"
                                        placeholderTextColor="#666"
                                        keyboardType="number-pad"
                                        value={newPlayerSalary}
                                        onChangeText={setNewPlayerSalary}
                                    />
                                    {rebuildPhase === 'active' && (
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Alış Bedeli / Bonservis (Milyon €)"
                                            placeholderTextColor="#666"
                                            keyboardType="number-pad"
                                            value={newPlayerCost}
                                            onChangeText={setNewPlayerCost}
                                        />
                                    )}
                                </>
                            )}

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setShowAddPlayer(false)}
                                >
                                    <Text style={styles.modalButtonText}>İptal</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.modalButton, styles.confirmButton]}
                                    onPress={handleAddPlayer}
                                >
                                    <Text style={styles.modalButtonText}>Ekle</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Edit Player Modal */}
            <Modal
                visible={showEditPlayer}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowEditPlayer(false)}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <View style={{ width: 24 }} />
                                <Text style={[styles.modalTitle, { marginBottom: 0 }]}>Oyuncu Düzenle</Text>
                                <TouchableOpacity onPress={handleDeletePlayer} style={{ padding: 4 }}>
                                    <MaterialCommunityIcons name="trash-can-outline" size={24} color="#FF3B30" />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.inputLabel}>İsim</Text>
                            <TextInput
                                style={styles.input}
                                value={editName}
                                onChangeText={setEditName}
                                placeholder="Oyuncu İsmi"
                                placeholderTextColor="#666"
                            />

                            <Text style={styles.inputLabel}>Numara</Text>
                            <TextInput
                                style={styles.input}
                                value={editNumber}
                                onChangeText={setEditNumber}
                                keyboardType="number-pad"
                                placeholder="Numara"
                                placeholderTextColor="#666"
                                maxLength={2}
                            />

                            {/* SIZE SLIDER */}
                            <Text style={styles.inputLabel}>Boyut: {Math.round(editSize)}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                                <Ionicons name="resize" size={20} color="#8E8E93" style={{ marginRight: 10 }} />
                                <Slider
                                    style={{ flex: 1, height: 40 }}
                                    minimumValue={20}
                                    maximumValue={50}
                                    step={2}
                                    value={editSize}
                                    onValueChange={setEditSize}
                                    minimumTrackTintColor="#FFC107"
                                    thumbTintColor="#FFC107"
                                />
                            </View>

                            {/* REBUILD: Salary Input in Edit Mode */}
                            {rebuildMode && (
                                <>
                                    <Text style={styles.inputLabel}>Maaş</Text>
                                    <TextInput
                                        style={[styles.input, rebuildPhase === 'active' && { opacity: 0.5 }]}
                                        value={editSalary}
                                        onChangeText={setEditSalary}
                                        keyboardType="number-pad"
                                        placeholder="Maaş"
                                        placeholderTextColor="#666"
                                        editable={rebuildPhase === 'setup'} // Editable only in setup
                                    />
                                </>
                            )}

                            <Text style={styles.inputLabel}>Renk</Text>
                            <View style={styles.colorGrid}>
                                {COLORS.map((color) => (
                                    <TouchableOpacity
                                        key={color}
                                        style={[styles.colorOption, { backgroundColor: color }]}
                                        onPress={() => handleColorSelect(color)}
                                    />
                                ))}
                            </View>

                            <View style={styles.modalButtons}>
                                {rebuildMode && rebuildPhase === 'active' ? (
                                    <TouchableOpacity
                                        style={[styles.modalButton, { backgroundColor: '#8B5CF6', marginRight: 0 }]} // Purple for transfer
                                        onPress={openTransferModal}
                                    >
                                        <Text style={styles.modalButtonText}>Transfer Yap / Değiştir</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.confirmButton]}
                                        onPress={handleSaveEdit}
                                    >
                                        <Text style={styles.modalButtonText}>Kaydet</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Add Icon Modal */}
            <Modal
                visible={showAddIcon}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowAddIcon(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowAddIcon(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>İkon Seç</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 20 }}>
                            <TouchableOpacity style={styles.iconOption} onPress={() => handleAddIcon('ball')}>
                                <MaterialCommunityIcons name="soccer" size={32} color="#FFF" />
                                <Text style={styles.iconOptionText}>Top</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconOption} onPress={() => handleAddIcon('vest')}>
                                <MaterialCommunityIcons name="tshirt-crew" size={32} color="#FFF" />
                                <Text style={styles.iconOptionText}>Yelek</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconOption} onPress={() => handleAddIcon('cone')}>
                                <MaterialCommunityIcons name="cone" size={32} color="#FFF" />
                                <Text style={styles.iconOptionText}>Huni</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconOption} onPress={() => handleAddIcon('ladder')}>
                                <MaterialCommunityIcons name="ladder" size={32} color="#FFF" />
                                <Text style={styles.iconOptionText}>Merdiven</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconOption} onPress={() => handleAddIcon('whistle')}>
                                <MaterialCommunityIcons name="whistle" size={32} color="#FFF" />
                                <Text style={styles.iconOptionText}>Düdük</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Edit Icon Modal */}
            <Modal
                visible={showEditIcon}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowEditIcon(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <View style={{ width: 24 }} />
                            <Text style={[styles.modalTitle, { marginBottom: 0 }]}>İkon Düzenle</Text>
                            <TouchableOpacity onPress={handleDeleteIcon} style={{ padding: 4 }}>
                                <MaterialCommunityIcons name="trash-can-outline" size={24} color="#FF3B30" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.inputLabel}>Etiket (Opsiyonel)</Text>
                        <TextInput
                            style={styles.input}
                            value={editIconLabel}
                            onChangeText={setEditIconLabel}
                            placeholder="İsim veya Not"
                            placeholderTextColor="#666"
                        />

                        {/* SIZE SLIDER */}
                        <Text style={styles.inputLabel}>Boyut: {Math.round(editIconSize)}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                            <Ionicons name="resize" size={20} color="#8E8E93" style={{ marginRight: 10 }} />
                            <Slider
                                style={{ flex: 1, height: 40 }}
                                minimumValue={20}
                                maximumValue={80}
                                step={2}
                                value={editIconSize}
                                onValueChange={setEditIconSize}
                                minimumTrackTintColor="#FFC107"
                                thumbTintColor="#FFC107"
                            />
                        </View>

                        <Text style={styles.inputLabel}>Renk</Text>
                        <View style={styles.colorGrid}>
                            {COLORS.map((color) => (
                                <TouchableOpacity
                                    key={color}
                                    style={[styles.colorOption, { backgroundColor: color }, editIconColor === color && styles.selectedColorOption]}
                                    onPress={() => {
                                        setEditIconColor(color);
                                        if (editingIconId) updateIconColor(editingIconId, color);
                                    }}
                                />
                            ))}
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setShowEditIcon(false)}
                            >
                                <Text style={styles.modalButtonText}>İptal</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={handleSaveIconEdit}
                            >
                                <Text style={styles.modalButtonText}>Kaydet</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            {/* Save Name Modal */}
            <Modal
                visible={showSaveNameModal}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowSaveNameModal(false)}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Kadro İsmi</Text>
                            <Text style={styles.subtitle}>Kadronuzu kaydetmek için bir isim girin.</Text>

                            <TextInput
                                style={styles.input}
                                placeholder="Kadro İsmi (Örn: Derbi Kadrosu)"
                                placeholderTextColor="#666"
                                value={squadName}
                                onChangeText={setSquadName}
                                autoFocus
                            />

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setShowSaveNameModal(false)}
                                >
                                    <Text style={styles.modalButtonText}>İptal</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.modalButton, styles.confirmButton]}
                                    onPress={handleConfirmSaveNew}
                                >
                                    <Text style={styles.modalButtonText}>Kaydet</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
            {/* Transfer Sale Price Modal */}
            <Modal
                visible={showTransferModal}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowTransferModal(false)}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Oyuncu Satışı</Text>
                            <Text style={styles.subtitle}>Bu oyuncuyu ne kadara satıyorsunuz?</Text>

                            <TextInput
                                style={styles.input}
                                placeholder="Satış Bedeli (Milyon €)"
                                placeholderTextColor="#666"
                                keyboardType="number-pad"
                                value={transferSalePrice}
                                onChangeText={setTransferSalePrice}
                                autoFocus
                            />

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setShowTransferModal(false)}
                                >
                                    <Text style={styles.modalButtonText}>İptal</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.modalButton, { backgroundColor: '#8B5CF6' }]} // Purple
                                    onPress={handleConfirmTransferSale}
                                >
                                    <Text style={styles.modalButtonText}>Onayla & Yeni Seç</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </SafeAreaView >
    );
}

export default function BuilderScreen({ route, navigation }: { route: any, navigation: any }) {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <AppProvider>
                <TacticsBoard route={route} navigation={navigation} />
            </AppProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        paddingTop: 10,
    },
    header: {
        height: 60,
    },
    subtitle: {
        color: '#888',
        fontSize: 14,
        marginBottom: 16,
        textAlign: 'center',
    },
    iconButton: {
        padding: 8,
        backgroundColor: '#141416', // Deeeper black
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#2A2A2C', // Subtle border
    },
    addPlayerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#333',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#444',
    },
    addPlayerButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    statBox: {
        backgroundColor: '#1C1C1E',
        borderRadius: 12,
        padding: 10,
        borderWidth: 1,
        borderColor: '#333',
        minWidth: 100,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        color: '#888',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFF',
    },
    fieldContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 70,
    },
    viewShot: {
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#1a472a',
        borderWidth: 1,
        borderColor: '#222', // This border might be overridden by field view bg, but keeps edge clean
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#1C1C1E',
        width: '85%',
        padding: 24,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#333',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 25,
    },
    modalTitle: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    inputLabel: {
        color: '#8E8E93',
        fontSize: 12,
        marginBottom: 6,
        marginLeft: 4,
        fontWeight: '600',
    },
    input: {
        backgroundColor: '#1C1C1E',
        color: '#FFF',
        borderRadius: 12,
        padding: 14,
        marginBottom: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#2C2C2E',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    modalButton: {
        flex: 1,
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#1C1C1E',
        marginRight: 8,
    },
    confirmButton: {
        backgroundColor: '#0A84FF',
        marginLeft: 8,
    },
    modalButtonText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 16,
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 20,
    },
    colorOption: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#38383A',
    },
    // Field Picker Styles
    fieldOptionsContainer: {
        flexDirection: 'column',
        gap: 12,
    },
    fieldOption: {
        padding: 16,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    selectedFieldOption: {
        borderWidth: 2,
        borderColor: '#FFF',
    },
    fieldOptionText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    checkmark: {
        position: 'absolute',
        right: 16,
        top: 16,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 12,
        padding: 2,
    },
    // Icon Modal Styles
    iconOption: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 80,
        height: 80,
        backgroundColor: '#333',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#444',
    },
    iconOptionText: {
        color: '#FFF',
        marginTop: 8,
        fontSize: 12,
        fontWeight: '600',
    },
    selectedColorOption: {
        borderColor: '#FFF',
        borderWidth: 3,
    }
});
