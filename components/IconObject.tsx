import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, Text, PanResponder, Animated } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { FieldIcon } from '../types';
import { useAppContext } from '../context/AppContext';

interface IconObjectProps {
    icon: FieldIcon;
    fieldWidth: number;
    fieldHeight: number;
    onPositionChange: (id: string, x: number, y: number) => void;
    onPress: (id: string) => void;
    disabled?: boolean;
}

export const IconObject: React.FC<IconObjectProps> = ({
    icon,
    fieldWidth,
    fieldHeight,
    onPositionChange,
    onPress,
    disabled = false,
}) => {
    // Determine size: use icon.size if exists, default to 32
    const iconSize = icon.size ?? 32;
    const startX = (icon.x / 100) * fieldWidth - iconSize / 2;
    const startY = (icon.y / 100) * fieldHeight - iconSize / 2;

    const pan = useRef(new Animated.ValueXY({ x: startX, y: startY })).current;
    const [scale] = useState(new Animated.Value(1));
    const isDragging = useRef(false);

    // Use refs to avoid stale closure issues in panResponder
    const onPressRef = useRef(onPress);
    const onPositionChangeRef = useRef(onPositionChange);
    const iconIdRef = useRef(icon.id);
    const iconSizeRef = useRef(iconSize);
    const fieldWidthRef = useRef(fieldWidth);
    const fieldHeightRef = useRef(fieldHeight);

    // Update refs when props change
    useEffect(() => {
        onPressRef.current = onPress;
        onPositionChangeRef.current = onPositionChange;
        iconIdRef.current = icon.id;
        iconSizeRef.current = iconSize;
        fieldWidthRef.current = fieldWidth;
        fieldHeightRef.current = fieldHeight;
    }, [onPress, onPositionChange, icon.id, iconSize, fieldWidth, fieldHeight]);

    // Update position when external props change
    React.useEffect(() => {
        pan.setValue({ x: startX, y: startY });
    }, [icon.x, icon.y, fieldWidth, fieldHeight]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => !disabled,
            onMoveShouldSetPanResponder: () => !disabled,

            onPanResponderGrant: () => {
                isDragging.current = false;
                pan.setOffset({
                    x: (pan.x as any)._value,
                    y: (pan.y as any)._value,
                });
                pan.setValue({ x: 0, y: 0 });

                Animated.spring(scale, {
                    toValue: 1.1,
                    useNativeDriver: true,
                }).start();
            },

            onPanResponderMove: (_, gesture) => {
                if (!isDragging.current && (Math.abs(gesture.dx) > 10 || Math.abs(gesture.dy) > 10)) {
                    isDragging.current = true;
                }

                Animated.event([null, { dx: pan.x, dy: pan.y }], {
                    useNativeDriver: false,
                })(_, gesture);
            },

            onPanResponderRelease: (_, gesture) => {
                pan.flattenOffset();

                Animated.spring(scale, {
                    toValue: 1,
                    useNativeDriver: true,
                }).start();

                if (!isDragging.current) {
                    onPressRef.current(iconIdRef.current);
                } else {
                    const currentSize = iconSizeRef.current;
                    const newX = (pan.x as any)._value + currentSize / 2;
                    const newY = (pan.y as any)._value + currentSize / 2;

                    const percentX = Math.max(0, Math.min(100, (newX / fieldWidthRef.current) * 100));
                    const percentY = Math.max(0, Math.min(100, (newY / fieldHeightRef.current) * 100));
                    onPositionChangeRef.current(iconIdRef.current, percentX, percentY);
                }

                isDragging.current = false;
            },
        })
    ).current;

    const renderIcon = () => {
        switch (icon.type) {
            case 'ball':
                return <MaterialCommunityIcons name="soccer" size={iconSize} color={icon.color} />;
            case 'vest':
                return <MaterialCommunityIcons name="tshirt-crew" size={iconSize} color={icon.color} />;
            case 'cone':
                return <MaterialCommunityIcons name="cone" size={iconSize} color={icon.color} />;
            case 'ladder':
                return <MaterialCommunityIcons name="ladder" size={iconSize} color={icon.color} />;
            case 'whistle':
                return <MaterialCommunityIcons name="whistle" size={iconSize} color={icon.color} />;
            default:
                return <MaterialCommunityIcons name="circle" size={iconSize} color={icon.color} />;
        }
    };

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
            {/* Icon container with panHandlers - matches Player structure */}
            <Animated.View
                {...panResponder.panHandlers}
                style={[
                    styles.iconContainer,
                    {
                        width: iconSize,
                        height: iconSize,
                        transform: [{ scale: scale }],
                    },
                ]}
            >
                {renderIcon()}
            </Animated.View>

            {/* Label - completely separate from icon */}
            {icon.label ? (
                <View style={styles.labelContainer}>
                    <Text style={styles.labelText}>{icon.label}</Text>
                </View>
            ) : null}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        alignItems: 'center',
        zIndex: 15,
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 3,
        elevation: 6,
    },
    labelContainer: {
        marginTop: 4,
        backgroundColor: 'rgba(0,0,0,0.75)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    labelText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '700',
    }
});
