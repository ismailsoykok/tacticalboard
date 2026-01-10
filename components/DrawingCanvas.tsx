import React, { useRef, useMemo } from 'react';
import { StyleSheet, View, PanResponder } from 'react-native';
import Svg, { Path, Rect, Circle, Polygon, Line, G, Polyline } from 'react-native-svg';
import { DrawingPath } from '../types';
import { useAppContext } from '../context/AppContext';

interface DrawingCanvasProps {
    width: number;
    height: number;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ width, height }) => {
    const { drawings, setDrawings, isDrawingMode, drawingType, drawingSettings, saveHistory } = useAppContext();
    const currentPath = useRef<{ x: number; y: number }[]>([]);

    const generatePathString = (points: { x: number; y: number }[]): string => {
        if (points.length === 0) return '';
        let path = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            // Smooth freehand drawing slightly? Maybe later. For now straight lines are reliable.
            path += ` L ${points[i].x} ${points[i].y}`;
        }
        return path;
    };

    const panResponder = useMemo(() =>
        PanResponder.create({
            onStartShouldSetPanResponder: () => isDrawingMode,
            onMoveShouldSetPanResponder: () => isDrawingMode,
            onStartShouldSetPanResponderCapture: () => isDrawingMode,
            onMoveShouldSetPanResponderCapture: () => isDrawingMode,

            onPanResponderGrant: (event) => {
                const { locationX, locationY } = event.nativeEvent;
                // Save history at the start of any gesture (drawing or erasing)
                saveHistory();

                currentPath.current = [{ x: locationX, y: locationY }];

                // Start erasing immediately on touch
                if (drawingType === 'eraser') {
                    setDrawings((prev) => {
                        return prev.filter((d) => {
                            return !d.points.some(p =>
                                Math.abs(p.x - locationX) < 50 &&
                                Math.abs(p.y - locationY) < 50
                            );
                        });
                    });
                }
            },
            onPanResponderMove: (event) => {
                const { locationX, locationY } = event.nativeEvent;

                if (drawingType === 'eraser') {
                    setDrawings((prev) => {
                        return prev.filter((d) => {
                            // Expanded radius for better detection (50 pixels)
                            return !d.points.some(p =>
                                Math.abs(p.x - locationX) < 50 &&
                                Math.abs(p.y - locationY) < 50
                            );
                        });
                    });
                    return;
                }

                if (drawingType === 'free') {
                    currentPath.current.push({ x: locationX, y: locationY });
                } else {
                    if (currentPath.current.length > 1) {
                        currentPath.current[1] = { x: locationX, y: locationY };
                    } else {
                        currentPath.current.push({ x: locationX, y: locationY });
                    }
                }

                const newPath: DrawingPath = {
                    id: 'temp',
                    points: [...currentPath.current],
                    type: drawingType,
                    settings: { ...drawingSettings }
                };

                setDrawings((prev) => {
                    const filtered = prev.filter((d) => d.id !== 'temp');
                    return [...filtered, newPath];
                });
            },
            onPanResponderRelease: () => {
                if (drawingType === 'eraser') {
                    currentPath.current = [];
                    return;
                }
                if (currentPath.current.length > 1) {
                    const newPath: DrawingPath = {
                        id: Date.now().toString(),
                        points: [...currentPath.current],
                        type: drawingType,
                        settings: { ...drawingSettings }
                    };
                    setDrawings((prev) => {
                        const filtered = prev.filter((d) => d.id !== 'temp');
                        return [...filtered, newPath];
                    });
                }
                currentPath.current = [];
            },
        }), [isDrawingMode, drawingType, drawingSettings, setDrawings]
    );

    const renderShape = (drawing: DrawingPath) => {
        const { color, strokeWidth, opacity, isDashed } = drawing.settings;
        const start = drawing.points[0];
        const end = drawing.points[drawing.points.length - 1];

        if (!start || !end || drawing.type === 'eraser') return null;

        const dashArray = isDashed ? [10, 5] : undefined;

        switch (drawing.type) {
            case 'arrow': {
                const angle = Math.atan2(end.y - start.y, end.x - start.x);
                const headLen = Math.max(15, strokeWidth * 4);

                const x1 = end.x - headLen * Math.cos(angle - Math.PI / 6);
                const y1 = end.y - headLen * Math.sin(angle - Math.PI / 6);
                const x2 = end.x - headLen * Math.cos(angle + Math.PI / 6);
                const y2 = end.y - headLen * Math.sin(angle + Math.PI / 6);

                return (
                    <G key={drawing.id}>
                        <Line
                            x1={start.x}
                            y1={start.y}
                            x2={end.x}
                            y2={end.y}
                            stroke={color}
                            strokeWidth={strokeWidth}
                            strokeOpacity={opacity}
                            strokeDasharray={dashArray}
                        />
                        <Polyline
                            points={`${x1},${y1} ${end.x},${end.y} ${x2},${y2}`}
                            fill="none"
                            stroke={color}
                            strokeWidth={strokeWidth}
                            strokeOpacity={opacity}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </G>
                );
            }
            case 'rect': {
                const x = Math.min(start.x, end.x);
                const y = Math.min(start.y, end.y);
                const w = Math.abs(end.x - start.x);
                const h = Math.abs(end.y - start.y);
                return (
                    <Rect
                        key={drawing.id}
                        x={x}
                        y={y}
                        width={w}
                        height={h}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeOpacity={opacity}
                        strokeDasharray={dashArray}
                        fill="transparent"
                    />
                );
            }
            case 'circle': {
                const cx = (start.x + end.x) / 2;
                const cy = (start.y + end.y) / 2;
                const r = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)) / 2;

                return (
                    <Circle
                        key={drawing.id}
                        cx={cx}
                        cy={cy}
                        r={r}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeOpacity={opacity}
                        strokeDasharray={dashArray}
                        fill="transparent"
                    />
                );
            }
            case 'triangle': {
                const minX = Math.min(start.x, end.x);
                const minY = Math.min(start.y, end.y);
                const maxX = Math.max(start.x, end.x);
                const maxY = Math.max(start.y, end.y);

                const topX = (minX + maxX) / 2;
                const topY = minY;
                const botLeftX = minX;
                const botLeftY = maxY;
                const botRightX = maxX;
                const botRightY = maxY;

                return (
                    <Polygon
                        key={drawing.id}
                        points={`${topX},${topY} ${botLeftX},${botLeftY} ${botRightX},${botRightY}`}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeOpacity={opacity}
                        strokeDasharray={dashArray}
                        fill="transparent"
                    />
                );
            }
            case 'free':
            default: {
                return (
                    <Path
                        key={drawing.id}
                        d={generatePathString(drawing.points)}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeOpacity={opacity}
                        strokeDasharray={dashArray}
                        fill="transparent"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                );
            }
        }
    };

    return (
        <View
            style={[styles.container, { width, height, zIndex: isDrawingMode ? 999 : 0 }]}
            pointerEvents={isDrawingMode ? 'auto' : 'none'}
            {...panResponder.panHandlers}
        >
            <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
                {drawings.map((drawing) => renderShape(drawing))}
            </Svg>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        elevation: 20,
    },
});
