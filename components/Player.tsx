import React, { useRef, useState } from 'react';
import { StyleSheet, View, Text, PanResponder, Animated } from 'react-native';
import { FieldPlayer } from '../types';
import { useAppContext } from '../context/AppContext';

interface PlayerProps {
    player: FieldPlayer;
    fieldWidth: number;
    fieldHeight: number;
    onPositionChange: (id: string, x: number, y: number) => void;
    onPress: (id: string) => void;
    onLongPress?: (id: string) => void;
    disabled?: boolean;
}

export const Player: React.FC<PlayerProps> = ({
    player,
    fieldWidth,
    fieldHeight,
    onPositionChange,
    onPress,
    onLongPress,
    disabled = false,
}) => {
    const { globalPlayerSize } = useAppContext();
    const playerSize = player.size ?? globalPlayerSize; // Individual size if set, else global
    const startX = (player.x / 100) * fieldWidth - playerSize / 2;
    const startY = (player.y / 100) * fieldHeight - playerSize / 2;

    const pan = useRef(new Animated.ValueXY({ x: startX, y: startY })).current;
    const [scale] = useState(new Animated.Value(1));
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    const isDragging = useRef(false);

    React.useEffect(() => {
        pan.setValue({ x: startX, y: startY });
    }, [player.x, player.y, fieldWidth, fieldHeight]);

    // Fix for Stale Closure: Keep track of latest props
    const latestProps = useRef({ onPress, onLongPress, onPositionChange, player, disabled });

    // Update ref on every render
    React.useEffect(() => {
        latestProps.current = { onPress, onLongPress, onPositionChange, player, disabled };
    });

    const hasLongPressed = useRef(false);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => !latestProps.current.disabled,
            onMoveShouldSetPanResponder: () => !latestProps.current.disabled,

            onPanResponderGrant: () => {
                isDragging.current = false;
                hasLongPressed.current = false;
                pan.setOffset({
                    x: (pan.x as any)._value,
                    y: (pan.y as any)._value,
                });
                pan.setValue({ x: 0, y: 0 });

                Animated.spring(scale, {
                    toValue: 1.1,
                    useNativeDriver: true,
                }).start();

                if (latestProps.current.onLongPress) {
                    longPressTimer.current = setTimeout(() => {
                        if (!isDragging.current) {
                            hasLongPressed.current = true;
                            latestProps.current.onLongPress!(latestProps.current.player.id);
                        }
                    }, 600);
                }
            },

            onPanResponderMove: (_, gesture) => {
                if (!isDragging.current && (Math.abs(gesture.dx) > 10 || Math.abs(gesture.dy) > 10)) {
                    isDragging.current = true;
                    if (longPressTimer.current) {
                        clearTimeout(longPressTimer.current);
                        longPressTimer.current = null;
                    }
                }

                Animated.event([null, { dx: pan.x, dy: pan.y }], {
                    useNativeDriver: false,
                })(_, gesture);
            },

            onPanResponderRelease: (_, gesture) => {
                if (longPressTimer.current) {
                    clearTimeout(longPressTimer.current);
                    longPressTimer.current = null;
                }

                pan.flattenOffset();

                Animated.spring(scale, {
                    toValue: 1,
                    useNativeDriver: true,
                }).start();

                // Only trigger onPress if NOT dragging AND NOT long-pressed
                if (!isDragging.current && !hasLongPressed.current && latestProps.current.onPress) {
                    latestProps.current.onPress(latestProps.current.player.id);
                } else if (isDragging.current) {
                    const newX = (pan.x as any)._value + playerSize / 2;
                    const newY = (pan.y as any)._value + playerSize / 2;

                    const percentX = Math.max(0, Math.min(100, (newX / fieldWidth) * 100));
                    const percentY = Math.max(0, Math.min(100, (newY / fieldHeight) * 100));
                    latestProps.current.onPositionChange(latestProps.current.player.id, percentX, percentY);
                }

                isDragging.current = false;
                hasLongPressed.current = false;
            },
        })
    ).current;

    const isLight = (player.color || '#2196F3') === '#FFFFFF' || (player.color || '#2196F3') === '#FFC107';
    const textColor = isLight ? '#000' : '#FFF';

    return (
        <Animated.View
            style={[
                styles.wrapper,
                {
                    transform: [
                        { translateX: pan.x },
                        { translateY: pan.y },
                    ],
                },
            ]}
        >
            {/* Circle with number */}
            <Animated.View
                {...panResponder.panHandlers}
                style={[
                    styles.circle,
                    {
                        width: playerSize,
                        height: playerSize,
                        borderRadius: playerSize / 2,
                        backgroundColor: player.color || '#2196F3',
                        transform: [{ scale: scale }],
                        borderColor: isLight ? '#EEE' : '#111',
                    },
                ]}
            >
                <Text style={[styles.number, { color: textColor }]}>{player.number}</Text>
            </Animated.View>

            {/* Name label - completely separate from circle */}
            <View style={styles.nameWrapper}>
                <Text style={styles.name}>{player.name}</Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        alignItems: 'center',
        zIndex: 10,
    },
    circle: {
        // dynamic width/height set in style prop
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 3,
        shadowRadius: 3,
        elevation: 10,
    },
    number: {
        fontSize: 16,
        fontWeight: '900',
    },
    nameWrapper: {
        marginTop: 4,
        backgroundColor: 'rgba(0,0,0,0.75)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    name: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '700',
    },
});
