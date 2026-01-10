import React from 'react';
import Svg, { Rect, Line, Circle, G, Defs, LinearGradient, Stop, Pattern, Path } from 'react-native-svg';
import { useAppContext } from '../context/AppContext';

interface FootballFieldProps {
    width: number;
    height: number;
}

export const FootballField: React.FC<FootballFieldProps> = ({ width, height }) => {
    const { fieldType } = useAppContext();

    // Theme configurations
    const getTheme = () => {
        switch (fieldType) {
            case 'dark':
                return {
                    stroke: 'rgba(255, 255, 255, 0.4)',
                    strokeWidth: 2,
                    bgGradient: ['#0D1117', '#0D1117', '#0D1117'],
                    gridColor: 'rgba(255,255,255,0.05)',
                    grass: false,
                };
            case 'tactical':
                return {
                    stroke: '#FFFFFF',
                    strokeWidth: 2,
                    bgGradient: ['#2563eb', '#1d4ed8', '#2563eb'],
                    gridColor: 'rgba(255,255,255,0.1)',
                    grass: false,
                };
            case 'neon':
                return {
                    stroke: '#00ffcc',
                    strokeWidth: 2,
                    bgGradient: ['#0f172a', '#020617', '#0f172a'],
                    gridColor: 'rgba(0, 255, 204, 0.1)',
                    grass: false,
                };
            case 'bw':
                return {
                    stroke: '#000000',
                    strokeWidth: 2,
                    bgGradient: ['#FFFFFF', '#FFFFFF', '#FFFFFF'],
                    gridColor: 'rgba(0,0,0,0.05)',
                    grass: false,
                };
            case 'basketball':
                return {
                    stroke: '#FFF',
                    strokeWidth: 2,
                    bgGradient: ['#FFB74D', '#FB8C00', '#EF6C00'], // Orange Wood
                    gridColor: 'rgba(255,255,255,0.1)',
                    grass: false,
                };
            case 'volleyball':
                return {
                    stroke: '#FFF',
                    strokeWidth: 2,
                    bgGradient: ['#4FC3F7', '#29B6F6', '#039BE5'], // Blue Free Zone
                    gridColor: 'rgba(255,255,255,0.2)',
                    grass: false,
                };
            case 'classic':
            default:
                return {
                    stroke: 'rgba(255, 255, 255, 0.7)',
                    strokeWidth: 2,
                    bgGradient: ['#1a472a', '#2e7d32', '#1a472a'],
                    gridColor: 'rgba(0,0,0,0.05)',
                    grass: true,
                };
        }
    };

    const theme = getTheme();
    const strokeColor = theme.stroke;
    const strokeWidth = theme.strokeWidth;

    // Scaled dimensions
    const padding = 10;
    const fieldWidth = width - padding * 2;
    const fieldHeight = height - padding * 2;

    // Render Logic based on Field Type
    const renderFieldContent = () => {
        if (fieldType === 'basketball') {
            // Updated to FIBA 2010 Standards (Rectangular Key) based on latest diagram
            // Diagram: 28m x 15m.

            // NOTE: We map the 15m Width to the component's 'width' (X axis)
            // and 28m Length to component's 'height' (Y axis).

            const scaleX = fieldWidth / 15;
            const scaleY = fieldHeight / 28;
            const sx = (val: number) => val * scaleX;
            const sy = (val: number) => val * scaleY;

            const centerX = width / 2;
            const centerY = height / 2;

            // Dimensions (Meters)
            const KEY_WIDTH = 4.9;
            const KEY_LENGTH = 5.8;
            const THREE_POINT_RADIUS = 6.75;
            const CENTER_CIRCLE_RADIUS = 1.8;
            const HOOP_CENTER_OFFSET = 1.575;
            const BACKBOARD_OFFSET = 1.2;
            const NO_CHARGE_RADIUS = 1.25;
            const CORNER_THREE_DIST = 0.9;
            const HOOP_RADIUS = 0.225; // 45cm diameter

            // Key Coordinates
            const keyHalfWidthPx = sx(KEY_WIDTH / 2);
            const keyTopLeftX = centerX - keyHalfWidthPx;
            const keyTopRightX = centerX + keyHalfWidthPx;

            // Y positions (Top)
            const topBaselineY = padding;
            const topFreeThrowY = padding + sy(KEY_LENGTH);
            const topBackboardY = padding + sy(BACKBOARD_OFFSET);
            const topHoopY = padding + sy(HOOP_CENTER_OFFSET);

            // Y positions (Bottom)
            const bottomBaselineY = height - padding;
            const bottomFreeThrowY = height - padding - sy(KEY_LENGTH);
            const bottomBackboardY = height - padding - sy(BACKBOARD_OFFSET);
            const bottomHoopY = height - padding - sy(HOOP_CENTER_OFFSET);

            // 3-Point Line Intersection Calculation
            // Line x = 0.9m from sideline.
            // Circle center = (7.5, 1.575). Radius = 6.75.
            // x_dist from center = 7.5 - 0.9 = 6.6m.
            // y_dist = sqrt(6.75^2 - 6.6^2) ~ 1.415m.
            // Intersection Y = 1.575 + 1.415 = 2.99m.
            const threePointStraightLength = 2.99;
            const topArcStartY = padding + sy(threePointStraightLength);
            const bottomArcStartY = height - padding - sy(threePointStraightLength);

            const tpLeftX = padding + sx(CORNER_THREE_DIST);
            const tpRightX = width - padding - sx(CORNER_THREE_DIST);
            const threePointRx = sx(THREE_POINT_RADIUS);
            const threePointRy = sy(THREE_POINT_RADIUS);


            return (
                <G>
                    {/* Outline */}
                    <Rect x={padding} y={padding} width={fieldWidth} height={fieldHeight} stroke={strokeColor} strokeWidth={strokeWidth} fill="transparent" />

                    {/* Center Line */}
                    <Line x1={padding} y1={centerY} x2={width - padding} y2={centerY} stroke={strokeColor} strokeWidth={strokeWidth} />

                    {/* Center Circle */}
                    <Circle cx={centerX} cy={centerY} r={sx(CENTER_CIRCLE_RADIUS)} stroke={strokeColor} strokeWidth={strokeWidth} fill="transparent" />

                    {/* --- TOP HALF --- */}

                    {/* Key (Rectangle) */}
                    <Rect x={keyTopLeftX} y={topBaselineY} width={sx(KEY_WIDTH)} height={sy(KEY_LENGTH)} stroke={strokeColor} strokeWidth={strokeWidth} fill="rgba(156, 39, 176, 0.5)" />

                    {/* Free Throw Circle (Top) */}
                    {/* Upper half solid, Lower half dashed */}
                    <Path
                        d={`M ${keyTopLeftX} ${topFreeThrowY} A ${sx(1.8)} ${sy(1.8)} 0 1 1 ${keyTopRightX} ${topFreeThrowY}`} // Top half (away from basket)
                        stroke={strokeColor} strokeWidth={strokeWidth} fill="transparent"
                    />
                    <Path
                        d={`M ${keyTopLeftX} ${topFreeThrowY} A ${sx(1.8)} ${sy(1.8)} 0 1 0 ${keyTopRightX} ${topFreeThrowY}`} // Bottom half (towards basket)
                        stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray="4,4" fill="transparent"
                    />

                    {/* 3-Point Line (Top) */}
                    <Line x1={tpLeftX} y1={topBaselineY} x2={tpLeftX} y2={topArcStartY} stroke={strokeColor} strokeWidth={strokeWidth} />
                    <Line x1={tpRightX} y1={topBaselineY} x2={tpRightX} y2={topArcStartY} stroke={strokeColor} strokeWidth={strokeWidth} />
                    <Path
                        d={`M ${tpLeftX} ${topArcStartY} A ${threePointRx} ${threePointRy} 0 0 0 ${tpRightX} ${topArcStartY}`}
                        stroke={strokeColor} strokeWidth={strokeWidth} fill="transparent"
                    />

                    {/* Hoop Area (Top) */}
                    {/* Backboard */}
                    <Line x1={centerX - sx(0.9)} y1={topBackboardY} x2={centerX + sx(0.9)} y2={topBackboardY} stroke={strokeColor} strokeWidth={strokeWidth} />
                    {/* Hoop */}
                    <Circle cx={centerX} cy={topHoopY} r={sx(HOOP_RADIUS)} stroke="#F44336" strokeWidth={1.5} fill="transparent" />
                    {/* Stem */}
                    <Line x1={centerX} y1={topBackboardY} x2={centerX} y2={topHoopY} stroke={strokeColor} strokeWidth={1} />

                    {/* No Charge Zone */}
                    <Path
                        d={`M ${centerX - sx(NO_CHARGE_RADIUS)} ${topBackboardY} A ${sx(NO_CHARGE_RADIUS)} ${sy(NO_CHARGE_RADIUS)} 0 0 0 ${centerX + sx(NO_CHARGE_RADIUS)} ${topBackboardY}`}
                        stroke={strokeColor} strokeWidth={1} fill="transparent"
                    />

                    {/* Restricted Area Blocks (Small ticks) */}
                    <Line x1={keyTopLeftX - 3} y1={padding + sy(1.75)} x2={keyTopLeftX} y2={padding + sy(1.75)} stroke={strokeColor} strokeWidth={2} />
                    <Line x1={keyTopRightX} y1={padding + sy(1.75)} x2={keyTopRightX + 3} y2={padding + sy(1.75)} stroke={strokeColor} strokeWidth={2} />
                    <Line x1={keyTopLeftX - 3} y1={padding + sy(2.6)} x2={keyTopLeftX} y2={padding + sy(2.6)} stroke={strokeColor} strokeWidth={2} />
                    <Line x1={keyTopRightX} y1={padding + sy(2.6)} x2={keyTopRightX + 3} y2={padding + sy(2.6)} stroke={strokeColor} strokeWidth={2} />


                    {/* --- BOTTOM HALF --- */}

                    {/* Key */}
                    <Rect x={keyTopLeftX} y={bottomFreeThrowY} width={sx(KEY_WIDTH)} height={sy(KEY_LENGTH)} stroke={strokeColor} strokeWidth={strokeWidth} fill="rgba(156, 39, 176, 0.5)" />

                    {/* Free Throw Circle */}
                    <Path
                        d={`M ${keyTopLeftX} ${bottomFreeThrowY} A ${sx(1.8)} ${sy(1.8)} 0 1 0 ${keyTopRightX} ${bottomFreeThrowY}`} // Bottom half (away from basket)
                        stroke={strokeColor} strokeWidth={strokeWidth} fill="transparent"
                    />
                    <Path
                        d={`M ${keyTopLeftX} ${bottomFreeThrowY} A ${sx(1.8)} ${sy(1.8)} 0 1 1 ${keyTopRightX} ${bottomFreeThrowY}`} // Top half (towards basket)
                        stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray="4,4" fill="transparent"
                    />

                    {/* 3-Point Line */}
                    <Line x1={tpLeftX} y1={bottomBaselineY} x2={tpLeftX} y2={bottomArcStartY} stroke={strokeColor} strokeWidth={strokeWidth} />
                    <Line x1={tpRightX} y1={bottomBaselineY} x2={tpRightX} y2={bottomArcStartY} stroke={strokeColor} strokeWidth={strokeWidth} />
                    <Path
                        d={`M ${tpLeftX} ${bottomArcStartY} A ${threePointRx} ${threePointRy} 0 0 1 ${tpRightX} ${bottomArcStartY}`}
                        stroke={strokeColor} strokeWidth={strokeWidth} fill="transparent"
                    />

                    {/* Hoop Area */}
                    <Line x1={centerX - sx(0.9)} y1={bottomBackboardY} x2={centerX + sx(0.9)} y2={bottomBackboardY} stroke={strokeColor} strokeWidth={strokeWidth} />
                    <Circle cx={centerX} cy={bottomHoopY} r={sx(HOOP_RADIUS)} stroke="#F44336" strokeWidth={1.5} fill="transparent" />
                    <Line x1={centerX} y1={bottomBackboardY} x2={centerX} y2={bottomHoopY} stroke={strokeColor} strokeWidth={1} />

                    {/* No Charge Zone */}
                    <Path
                        d={`M ${centerX - sx(NO_CHARGE_RADIUS)} ${bottomBackboardY} A ${sx(NO_CHARGE_RADIUS)} ${sy(NO_CHARGE_RADIUS)} 0 0 1 ${centerX + sx(NO_CHARGE_RADIUS)} ${bottomBackboardY}`}
                        stroke={strokeColor} strokeWidth={1} fill="transparent"
                    />

                    {/* Restricted Area Blocks */}
                    <Line x1={keyTopLeftX - 3} y1={height - padding - sy(1.75)} x2={keyTopLeftX} y2={height - padding - sy(1.75)} stroke={strokeColor} strokeWidth={2} />
                    <Line x1={keyTopRightX} y1={height - padding - sy(1.75)} x2={keyTopRightX + 3} y2={height - padding - sy(1.75)} stroke={strokeColor} strokeWidth={2} />

                </G>
            );
        } else if (fieldType === 'volleyball') {
            const attackLineOffset = fieldHeight / 6;
            return (
                <G>
                    <Rect x={padding} y={padding} width={fieldWidth} height={fieldHeight} fill="#FFAB91" />
                    <Rect x={padding} y={padding} width={fieldWidth} height={fieldHeight} stroke={strokeColor} strokeWidth={strokeWidth} fill="transparent" />
                    <Line x1={padding - 5} y1={height / 2} x2={width - padding + 5} y2={height / 2} stroke={strokeColor} strokeWidth={strokeWidth + 2} />
                    <Line x1={padding} y1={height / 2 - attackLineOffset} x2={width - padding} y2={height / 2 - attackLineOffset} stroke={strokeColor} strokeWidth={strokeWidth} />
                    <Line x1={padding} y1={height / 2 + attackLineOffset} x2={width - padding} y2={height / 2 + attackLineOffset} stroke={strokeColor} strokeWidth={strokeWidth} />
                    <Line x1={width - padding} y1={padding} x2={width - padding + 5} y2={padding} stroke={strokeColor} strokeWidth={strokeWidth} />
                    <Line x1={width - padding} y1={height - padding} x2={width - padding + 5} y2={height - padding} stroke={strokeColor} strokeWidth={strokeWidth} />
                </G>
            );
        } else {
            // Football Field
            const penaltyWidth = fieldWidth * 0.44;
            const penaltyHeight = fieldHeight * 0.16;
            const goalAreaWidth = fieldWidth * 0.2;
            const goalAreaHeight = fieldHeight * 0.06;
            const centerCircleRadius = fieldWidth * 0.12;

            return (
                <G>
                    <Rect x={padding} y={padding} width={fieldWidth} height={fieldHeight} stroke={strokeColor} strokeWidth={strokeWidth} fill="transparent" />
                    <Line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke={strokeColor} strokeWidth={strokeWidth} />
                    <Circle cx={width / 2} cy={height / 2} r={centerCircleRadius} stroke={strokeColor} strokeWidth={strokeWidth} fill="transparent" />
                    <Circle cx={width / 2} cy={height / 2} r={4} fill={strokeColor} />
                    <Rect x={(width - penaltyWidth) / 2} y={padding} width={penaltyWidth} height={penaltyHeight} stroke={strokeColor} strokeWidth={strokeWidth} fill="transparent" />
                    <Rect x={(width - goalAreaWidth) / 2} y={padding} width={goalAreaWidth} height={goalAreaHeight} stroke={strokeColor} strokeWidth={strokeWidth} fill="transparent" />
                    <Circle cx={width / 2} cy={padding + penaltyHeight * 0.7} r={3} fill={strokeColor} />
                    <Path
                        d={`M ${(width - penaltyWidth) / 2 + penaltyWidth / 2 - centerCircleRadius * 0.6} ${padding + penaltyHeight} 
                          A ${centerCircleRadius * 0.6} ${centerCircleRadius * 0.3} 0 0 0 ${(width - penaltyWidth) / 2 + penaltyWidth / 2 + centerCircleRadius * 0.6} ${padding + penaltyHeight}`}
                        stroke={strokeColor} strokeWidth={strokeWidth} fill="transparent"
                    />
                    <Rect x={(width - penaltyWidth) / 2} y={height - padding - penaltyHeight} width={penaltyWidth} height={penaltyHeight} stroke={strokeColor} strokeWidth={strokeWidth} fill="transparent" />
                    <Rect x={(width - goalAreaWidth) / 2} y={height - padding - goalAreaHeight} width={goalAreaWidth} height={goalAreaHeight} stroke={strokeColor} strokeWidth={strokeWidth} fill="transparent" />
                    <Circle cx={width / 2} cy={height - padding - penaltyHeight * 0.7} r={3} fill={strokeColor} />
                    <Path
                        d={`M ${(width - penaltyWidth) / 2 + penaltyWidth / 2 - centerCircleRadius * 0.6} ${height - padding - penaltyHeight} 
                          A ${centerCircleRadius * 0.6} ${centerCircleRadius * 0.3} 0 0 1 ${(width - penaltyWidth) / 2 + penaltyWidth / 2 + centerCircleRadius * 0.6} ${height - padding - penaltyHeight}`}
                        stroke={strokeColor} strokeWidth={strokeWidth} fill="transparent"
                    />
                    <Path d={`M ${padding + 10} ${padding} A 10 10 0 0 1 ${padding} ${padding + 10}`} stroke={strokeColor} strokeWidth={strokeWidth} fill="transparent" />
                    <Path d={`M ${width - padding - 10} ${padding} A 10 10 0 0 0 ${width - padding} ${padding + 10}`} stroke={strokeColor} strokeWidth={strokeWidth} fill="transparent" />
                    <Path d={`M ${padding + 10} ${height - padding} A 10 10 0 0 0 ${padding} ${height - padding - 10}`} stroke={strokeColor} strokeWidth={strokeWidth} fill="transparent" />
                    <Path d={`M ${width - padding - 10} ${height - padding} A 10 10 0 0 1 ${width - padding} ${height - padding - 10}`} stroke={strokeColor} strokeWidth={strokeWidth} fill="transparent" />
                </G>
            );
        }
    };

    const renderPattern = () => {
        if (fieldType === 'basketball') {
            return (
                <G>
                    <Line x1="0" y1="0" x2="0" y2="40" stroke="rgba(0,0,0,0.03)" strokeWidth="2" />
                    <Line x1="0" y1="20" x2="40" y2="20" stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
                </G>
            );
        }
        if (theme.grass) {
            return <Rect x="0" y="0" width="100%" height={fieldHeight / 20} fill={theme.gridColor} />;
        }
        return (
            <G>
                <Line x1="0" y1="0" x2="40" y2="0" stroke={theme.gridColor} strokeWidth="1" />
                <Line x1="0" y1="0" x2="0" y2="40" stroke={theme.gridColor} strokeWidth="1" />
            </G>
        );
    };

    return (
        <Svg width={width} height={height}>
            <Defs>
                <LinearGradient id="fieldGradient" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor={theme.bgGradient[0]} stopOpacity="1" />
                    <Stop offset="0.5" stopColor={theme.bgGradient[1]} stopOpacity="1" />
                    <Stop offset="1" stopColor={theme.bgGradient[2]} stopOpacity="1" />
                </LinearGradient>

                <Pattern
                    id="fieldPattern"
                    x="0"
                    y="0"
                    width={fieldType === 'basketball' ? 40 : (theme.grass ? "100%" : 40)}
                    height={fieldType === 'basketball' ? 40 : (theme.grass ? fieldHeight / 10 : 40)}
                    patternUnits="userSpaceOnUse"
                >
                    {renderPattern()}
                </Pattern>
            </Defs>

            {/* Field Background */}
            <Rect x={0} y={0} width={width} height={height} fill="url(#fieldGradient)" />

            {/* Pattern Overlay */}
            {(theme.grass || fieldType === 'basketball') && (
                <Rect x={padding} y={padding} width={fieldWidth} height={fieldHeight} fill="url(#fieldPattern)" />
            )}

            {/* Field Lines */}
            {renderFieldContent()}
        </Svg>
    );
};
