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
            path += ` L ${points[i].x} ${points[i].y}`;
        }
        return path;
    };

    // Helper: Distance from point P to segment VW
    const distanceToSegment = (p: { x: number; y: number }, v: { x: number; y: number }, w: { x: number; y: number }) => {
        const l2 = Math.pow(v.x - w.x, 2) + Math.pow(v.y - w.y, 2);
        if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
        let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
        t = Math.max(0, Math.min(1, t));
        return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
    };

    // Helper: Calculate intersection between Circle and Line Segment
    const getCircleLineIntersection = (
        p1: { x: number; y: number },
        p2: { x: number; y: number },
        center: { x: number; y: number },
        radius: number
    ) => {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const A = dx * dx + dy * dy;
        const B = 2 * (dx * (p1.x - center.x) + dy * (p1.y - center.y));
        const C = (p1.x - center.x) ** 2 + (p1.y - center.y) ** 2 - radius * radius;

        const det = B * B - 4 * A * C;
        const tValues: number[] = [];

        if (A > 0.0000001 && det >= 0) {
            if (det === 0) {
                tValues.push(-B / (2 * A));
            } else {
                tValues.push((-B + Math.sqrt(det)) / (2 * A));
                tValues.push((-B - Math.sqrt(det)) / (2 * A));
            }
        }

        const intersections: { x: number; y: number, t: number }[] = [];
        tValues.forEach(t => {
            if (t >= 0 && t <= 1) {
                intersections.push({
                    x: p1.x + t * dx,
                    y: p1.y + t * dy,
                    t
                });
            }
        });

        return intersections.sort((a, b) => a.t - b.t);
    };

    // Helper: Check if point is inside circle
    const isPointInCircle = (p: { x: number; y: number }, center: { x: number; y: number }, radius: number) => {
        return (p.x - center.x) ** 2 + (p.y - center.y) ** 2 <= radius * radius;
    };

    const eraseAtPoint = (x: number, y: number) => {
        // [NEW] Dynamic Radius based on Width Slider
        // Adjusted for better precision based on user feedback (2->6px radius, 10->30px radius)
        const ERASER_RADIUS = Math.max(5, drawingSettings.strokeWidth * 3);
        const ERASER_STRENGTH = drawingSettings.opacity;

        setDrawings((prevDrawings) => {
            const nextDrawings: DrawingPath[] = [];
            let hasChanges = false;

            for (const drawing of prevDrawings) {
                // 1. SHAPES (Rect, Arrow, etc.): Always Delete on Touch (User Requirement)
                if (drawing.type !== 'free') {
                    let isTouched = false;

                    if (drawing.points.length >= 2) {
                        const start = drawing.points[0];
                        const end = drawing.points[drawing.points.length - 1];

                        if (drawing.type === 'arrow') {
                            if (distanceToSegment({ x, y }, start, end) < ERASER_RADIUS) {
                                isTouched = true;
                            }
                        }
                        else {
                            if (drawing.points.some(p => Math.hypot(p.x - x, p.y - y) < ERASER_RADIUS + 20)) isTouched = true;
                            const centerX = (start.x + end.x) / 2;
                            const centerY = (start.y + end.y) / 2;
                            if (Math.hypot(centerX - x, centerY - y) < ERASER_RADIUS + 20) isTouched = true;
                        }
                    }

                    if (isTouched) {
                        hasChanges = true;
                        // Effectively deleted
                    } else {
                        nextDrawings.push(drawing);
                    }
                    continue;
                }

                // 2. FREEHAND: Soft Erase Logic
                const originalPoints = drawing.points;
                const currentOpacity = drawing.settings.opacity ?? 1.0;

                if (originalPoints.length < 2) {
                    if (isPointInCircle(originalPoints[0], { x, y }, ERASER_RADIUS)) {
                        hasChanges = true;
                        const newOp = currentOpacity - ERASER_STRENGTH;
                        if (newOp > 0.05) {
                            nextDrawings.push({ ...drawing, settings: { ...drawing.settings, opacity: newOp } });
                        }
                    } else {
                        nextDrawings.push(drawing);
                    }
                    continue;
                }

                // Chunking Loop for soft erase
                // We split the path into segments based on whether they are INSIDE or OUTSIDE the eraser.
                // INSIDE segments -> reduced opacity. OUTSIDE -> original opacity.

                const newPaths: { points: { x: number; y: number }[], isInside: boolean }[] = [];
                let currentSegment: { x: number; y: number }[] = [];
                let currentlyInside = isPointInCircle(originalPoints[0], { x, y }, ERASER_RADIUS);
                currentSegment.push(originalPoints[0]);

                let isModifiedStrand = false;

                for (let i = 0; i < originalPoints.length - 1; i++) {
                    const p1 = originalPoints[i];
                    const p2 = originalPoints[i + 1];
                    const intersections = getCircleLineIntersection(p1, p2, { x, y }, ERASER_RADIUS);

                    if (intersections.length === 0) {
                        currentSegment.push(p2);
                        if (currentlyInside) {
                            isModifiedStrand = true;
                            hasChanges = true;
                        }
                    } else {
                        hasChanges = true;
                        isModifiedStrand = true;

                        intersections.forEach(inters => {
                            currentSegment.push({ x: inters.x, y: inters.y });

                            if (currentSegment.length > 1 || (currentSegment.length === 1 && originalPoints.length === 1)) {
                                newPaths.push({ points: currentSegment, isInside: currentlyInside });
                            }

                            currentSegment = [{ x: inters.x, y: inters.y }];
                            currentlyInside = !currentlyInside;
                        });

                        currentSegment.push(p2);
                    }
                }

                if (currentSegment.length > 0) {
                    if (currentSegment.length > 1 || (currentSegment.length === 1 && originalPoints.length === 1)) {
                        newPaths.push({ points: currentSegment, isInside: currentlyInside });
                    }
                }

                if (!isModifiedStrand) {
                    nextDrawings.push(drawing);
                } else {
                    newPaths.forEach((pathObj, idx) => {
                        // Apply eraser strength only to INSIDE parts
                        const newOp = pathObj.isInside ? (currentOpacity - ERASER_STRENGTH) : currentOpacity;

                        if (newOp > 0.05) {
                            nextDrawings.push({
                                ...drawing,
                                id: `${drawing.id}_${pathObj.isInside ? 'fade' : 'keep'}_${Date.now()}_${idx}`,
                                points: pathObj.points,
                                settings: { ...drawing.settings, opacity: newOp }
                            });
                        }
                    });
                }
            }

            return hasChanges ? nextDrawings : prevDrawings;
        });
    };

    const panResponder = useMemo(() =>
        PanResponder.create({
            onStartShouldSetPanResponder: () => isDrawingMode,
            onMoveShouldSetPanResponder: () => isDrawingMode,
            onStartShouldSetPanResponderCapture: () => isDrawingMode,
            onMoveShouldSetPanResponderCapture: () => isDrawingMode,

            onPanResponderGrant: (event) => {
                const { locationX, locationY } = event.nativeEvent;
                const clampedX = Math.max(0, Math.min(width, locationX));
                const clampedY = Math.max(0, Math.min(height, locationY));

                saveHistory();

                if (drawingType === 'eraser') {
                    eraseAtPoint(clampedX, clampedY);
                    return;
                }

                currentPath.current = [{ x: clampedX, y: clampedY }];
            },
            onPanResponderMove: (event) => {
                const { locationX, locationY } = event.nativeEvent;
                const clampedX = Math.max(0, Math.min(width, locationX));
                const clampedY = Math.max(0, Math.min(height, locationY));

                if (drawingType === 'eraser') {
                    eraseAtPoint(clampedX, clampedY);
                    return;
                }

                if (drawingType === 'free') {
                    currentPath.current.push({ x: clampedX, y: clampedY });
                } else {
                    if (currentPath.current.length > 1) {
                        currentPath.current[1] = { x: clampedX, y: clampedY };
                    } else {
                        currentPath.current.push({ x: clampedX, y: clampedY });
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
            style={[styles.container, { width, height, zIndex: isDrawingMode ? 999 : 0, elevation: isDrawingMode ? 20 : 0 }]}
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
    },
});
