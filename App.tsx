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
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';

import { AppProvider, useAppContext } from './context/AppContext';
import { FootballField } from './components/FootballField';
import { Player } from './components/Player';
import { IconObject } from './components/IconObject';
import { DrawingCanvas } from './components/DrawingCanvas';
import { Toolbar } from './components/Toolbar';
import { FieldType, IconType } from './types';

const FIELD_ASPECT_RATIO = 1.6;
const COLORS = ['#2196F3', '#F44336', '#4CAF50', '#FFC107', '#9C27B0', '#212121', '#FFFFFF', '#FF5722'];

function TacticsBoard() {
  const viewShotRef = useRef<ViewShot>(null);

  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [showEditPlayer, setShowEditPlayer] = useState(false);
  const [showFieldPicker, setShowFieldPicker] = useState(false);
  const [showAddIcon, setShowAddIcon] = useState(false);
  const [showEditIcon, setShowEditIcon] = useState(false);

  // New Player Form
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerNumber, setNewPlayerNumber] = useState('');

  // Edit Player Form
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editNumber, setEditNumber] = useState('');
  const [editSize, setEditSize] = useState(44);

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
  } = useAppContext();

  // Sync editSize when editing a different player
  useEffect(() => {
    if (editingPlayerId) {
      const player = fieldPlayers.find(p => p.id === editingPlayerId);
      if (player) {
        setEditSize(player.size ?? globalPlayerSize);
      }
    }
  }, [editingPlayerId, fieldPlayers, globalPlayerSize]);

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

    addPlayerToField({
      id: `custom_${Date.now()}`,
      name: newPlayerName,
      number: parseInt(newPlayerNumber) || 0,
      position: 'MF',
      color: '#2196F3'
    }, 50, 50);

    setNewPlayerName('');
    setNewPlayerNumber('');
    setShowAddPlayer(false);
  };

  const handlePlayerPress = (playerId: string) => {
    if (isDrawingMode) return;

    const player = fieldPlayers.find(p => p.id === playerId);
    if (player) {
      setEditingPlayerId(playerId);
      setEditName(player.name);
      setEditNumber(player.number.toString());
      setEditSize(player.size ?? globalPlayerSize); // Show player's current size
      setShowEditPlayer(true);
    }
  };

  const handleSaveEdit = () => {
    if (editingPlayerId) {
      if (editName) updatePlayerName(editingPlayerId, editName);
      if (editNumber) updatePlayerNumber(editingPlayerId, parseInt(editNumber) || 0);
      // Size updates only THIS player
      updatePlayerSize(editingPlayerId, editSize);

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
      const { status } = await MediaLibrary.requestPermissionsAsync();
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
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setShowFieldPicker(true)}
        >
          <MaterialCommunityIcons name="soccer-field" size={24} color="#FFF" />
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity
            style={styles.addPlayerButton}
            onPress={() => setShowAddIcon(true)}
          >
            <MaterialCommunityIcons name="bag-personal" size={20} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.addPlayerButtonText}>İkon Ekle</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addPlayerButton}
            onPress={() => setShowAddPlayer(true)}
          >
            <MaterialIcons name="person-add" size={20} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.addPlayerButtonText}>Oyuncu Ekle</Text>
          </TouchableOpacity>
        </View>
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
                transform: [
                  { perspective: 1000 },
                  { rotateX: `${fieldTilt}deg` },
                  { scale: 1 - (fieldTilt * 0.005) }
                ]
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

      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 9999 }}>
        <Toolbar onSave={handleSave} />
      </View>

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
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleSaveEdit}
                >
                  <Text style={styles.modalButtonText}>Kaydet</Text>
                </TouchableOpacity>
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
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AppProvider>
      <TacticsBoard />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Changed to space-between for icon on left
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
    marginTop: 10,
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
