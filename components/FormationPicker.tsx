import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { FOOTBALL_FORMATIONS, BASKETBALL_FORMATIONS } from '../data/formations';
import { useAppContext } from '../context/AppContext';

export const FormationPicker: React.FC = () => {
    const { selectedFormation, applyFormation, fieldType } = useAppContext();

    let activeFormations = FOOTBALL_FORMATIONS;
    if (fieldType === 'basketball') {
        activeFormations = BASKETBALL_FORMATIONS;
    } else if (fieldType === 'volleyball') {
        // Future: Add Volleyball formations
        activeFormations = [];
    }

    if (activeFormations.length === 0) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Diziliş</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.scrollView}
                contentContainerStyle={styles.buttonContainer}
            >
                {activeFormations.map((formation) => (
                    <TouchableOpacity
                        key={formation.name}
                        style={[
                            styles.button,
                            selectedFormation === formation.name && styles.buttonActive,
                        ]}
                        onPress={() => applyFormation(formation)}
                    >
                        <Text
                            style={[
                                styles.buttonText,
                                selectedFormation === formation.name && styles.buttonTextActive,
                            ]}
                        >
                            {formation.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        marginBottom: 10,
    },
    title: {
        color: '#AAA',
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'left',
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 4,
        borderWidth: 1,
        borderColor: '#333',
    },
    button: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 2,
    },
    buttonActive: {
        backgroundColor: '#2962FF',
        shadowColor: '#2962FF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 3,
    },
    buttonText: {
        color: '#888',
        fontSize: 13,
        fontWeight: '600',
    },
    buttonTextActive: {
        color: '#FFF',
        fontWeight: '700',
    },
});
