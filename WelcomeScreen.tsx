import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen({ navigation }: { navigation: any }) {
    const handleNewSquad = () => {
        navigation.navigate('Builder');
    };

    const handleSavedSquads = () => {
        navigation.navigate('SavedSquads');
    };

    const handleRebuildMode = () => {
        navigation.navigate('Builder', { mode: 'rebuild' });
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#121212" />

            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <MaterialCommunityIcons name="soccer-field" size={80} color="#4ade80" />
                </View>

                <Text style={styles.title}>tacticalboard</Text>
                <Text style={styles.subtitle}>Hayalindeki takımı oluştur ve yönet</Text>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.primaryButton} onPress={handleNewSquad}>
                        <MaterialCommunityIcons name="plus" size={24} color="#000" style={styles.buttonIcon} />
                        <Text style={styles.primaryButtonText}>Yeni Kadro Kur</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.secondaryButton} onPress={handleSavedSquads}>
                        <MaterialCommunityIcons name="folder-outline" size={24} color="#FFF" style={styles.buttonIcon} />
                        <Text style={styles.secondaryButtonText}>Kayıtlı Kadrolar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.secondaryButton, { borderColor: '#e11d48', backgroundColor: 'rgba(225, 29, 72, 0.1)' }]}
                        onPress={handleRebuildMode}
                    >
                        <MaterialCommunityIcons name="finance" size={24} color="#e11d48" style={styles.buttonIcon} />
                        <Text style={[styles.secondaryButtonText, { color: '#e11d48' }]}>REBUILD MODU</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 24,
        padding: 20,
        backgroundColor: 'rgba(74, 222, 128, 0.1)',
        borderRadius: 40,
        borderWidth: 1,
        borderColor: 'rgba(74, 222, 128, 0.2)',
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFF',
        marginBottom: 8,
        textAlign: 'center',
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 16,
        color: '#888',
        marginBottom: 48,
        textAlign: 'center',
    },
    buttonContainer: {
        width: '100%',
        gap: 16,
    },
    primaryButton: {
        backgroundColor: '#4ade80',
        paddingVertical: 18,
        paddingHorizontal: 24,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#4ade80',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    primaryButtonText: {
        color: '#000',
        fontSize: 18,
        fontWeight: '700',
    },
    secondaryButton: {
        backgroundColor: '#2A2A2C',
        paddingVertical: 18,
        paddingHorizontal: 24,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },
    secondaryButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
    },
    buttonIcon: {
        marginRight: 10,
    }
});
