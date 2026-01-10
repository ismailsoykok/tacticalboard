import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { Player, Position } from '../types';
import { useAppContext } from '../context/AppContext';

const positions: (Position | 'ALL')[] = ['ALL', 'GK', 'DF', 'MF', 'FW'];

const getPositionColor = (position: Position): string => {
    switch (position) {
        case 'GK':
            return '#FFC107';
        case 'DF':
            return '#2196F3';
        case 'MF':
            return '#4CAF50';
        case 'FW':
            return '#F44336';
        default:
            return '#9E9E9E';
    }
};

interface PlayerPoolProps {
    onPlayerSelect: (player: Player) => void;
}

export const PlayerPool: React.FC<PlayerPoolProps> = ({ onPlayerSelect }) => {
    const { availablePlayers, fieldPlayers } = useAppContext();
    const [selectedPosition, setSelectedPosition] = useState<Position | 'ALL'>('ALL');

    const filteredPlayers = availablePlayers.filter((player) => {
        if (selectedPosition === 'ALL') return true;
        return player.position === selectedPosition;
    });

    const isOnField = (playerId: string) => {
        return fieldPlayers.some((p) => p.id === playerId);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Oyuncu Havuzu</Text>

            {/* Position Filter */}
            <View style={styles.filterContainer}>
                {positions.map((pos) => (
                    <TouchableOpacity
                        key={pos}
                        style={[
                            styles.filterButton,
                            selectedPosition === pos && styles.filterButtonActive,
                        ]}
                        onPress={() => setSelectedPosition(pos)}
                    >
                        <Text
                            style={[
                                styles.filterText,
                                selectedPosition === pos && styles.filterTextActive,
                            ]}
                        >
                            {pos}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Player List */}
            <ScrollView style={styles.playerList} showsVerticalScrollIndicator={false}>
                {filteredPlayers.map((player) => {
                    const onField = isOnField(player.id);
                    return (
                        <TouchableOpacity
                            key={player.id}
                            style={[styles.playerItem, onField && styles.playerItemDisabled]}
                            onPress={() => !onField && onPlayerSelect(player)}
                            disabled={onField}
                        >
                            <View
                                style={[
                                    styles.playerBadge,
                                    { backgroundColor: getPositionColor(player.position) },
                                ]}
                            >
                                <Text style={styles.playerNumber}>{player.number}</Text>
                            </View>
                            <View style={styles.playerInfo}>
                                <Text style={[styles.playerName, onField && styles.textDisabled]}>
                                    {player.name}
                                </Text>
                                <Text style={[styles.playerPosition, onField && styles.textDisabled]}>
                                    {player.position}
                                </Text>
                            </View>
                            {onField && (
                                <View style={styles.onFieldBadge}>
                                    <Text style={styles.onFieldText}>Sahada</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        padding: 12,
    },
    title: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 12,
    },
    filterButton: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#2a2a4e',
    },
    filterButtonActive: {
        backgroundColor: '#4CAF50',
    },
    filterText: {
        color: '#AAA',
        fontSize: 12,
        fontWeight: '600',
    },
    filterTextActive: {
        color: '#FFF',
    },
    playerList: {
        flex: 1,
    },
    playerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2a2a4e',
        borderRadius: 8,
        padding: 10,
        marginBottom: 8,
    },
    playerItemDisabled: {
        opacity: 0.5,
    },
    playerBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playerNumber: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    playerInfo: {
        marginLeft: 12,
        flex: 1,
    },
    playerName: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    playerPosition: {
        color: '#AAA',
        fontSize: 12,
    },
    textDisabled: {
        color: '#666',
    },
    onFieldBadge: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    onFieldText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
});
