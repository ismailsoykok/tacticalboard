import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, StatusBar, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SavedSquad {
    id: string;
    name: string;
    timestamp: number;
}

export default function SavedSquadsScreen({ navigation }: { navigation: any }) {
    const [squads, setSquads] = useState<SavedSquad[]>([]);

    useEffect(() => {
        loadSquads();
    }, []);

    const loadSquads = async () => {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const squadKeys = keys.filter(key => key.startsWith('squad_'));
            const result = await AsyncStorage.multiGet(squadKeys);

            const parsedSquads: SavedSquad[] = result.map(([key, value]) => {
                if (!value) return null;
                const data = JSON.parse(value);
                return {
                    id: key,
                    name: data.name || 'İsimsiz Kadro',
                    timestamp: data.timestamp || 0,
                };
            }).filter((item): item is SavedSquad => item !== null)
                .sort((a, b) => b.timestamp - a.timestamp); // Newest first

            setSquads(parsedSquads);
        } catch (error) {
            console.error('Error loading squads:', error);
            Alert.alert('Hata', 'Kadrolar yüklenirken bir hata oluştu.');
        }
    };

    const handleSelectSquad = async (id: string) => {
        try {
            const savedData = await AsyncStorage.getItem(id);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                navigation.navigate('Builder', { squadData: { ...parsedData, id } });
            }
        } catch (error) {
            Alert.alert('Hata', 'Kadro verisi okunamadı.');
        }
    };

    const handleDeleteSquad = async (id: string) => {
        Alert.alert(
            'Sil',
            'Bu kadroyu silmek istediğinize emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: async () => {
                        await AsyncStorage.removeItem(id);
                        loadSquads(); // Refresh list
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: SavedSquad }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => handleSelectSquad(item.id)}
            activeOpacity={0.7}
        >
            <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="soccer-field" size={32} color="#4ade80" />
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardDate}>
                    {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString().slice(0, 5)}
                </Text>
            </View>
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteSquad(item.id)}
            >
                <MaterialCommunityIcons name="trash-can-outline" size={24} color="#FF3B30" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#121212" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Kayıtlı Kadrolar</Text>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={squads}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="folder-open-outline" size={64} color="#333" />
                        <Text style={styles.emptyText}>Henüz kayıtlı kadro yok.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
    },
    listContent: {
        padding: 20,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1C1C1E',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: 'rgba(74, 222, 128, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFF',
        marginBottom: 4,
    },
    cardDate: {
        fontSize: 12,
        color: '#888',
    },
    deleteButton: {
        padding: 10,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    }
});
