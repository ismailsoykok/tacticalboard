export type Position = 'GK' | 'DF' | 'MF' | 'FW';

export interface Player {
    id: string;
    name: string;
    position: Position;
    number: number;
    color?: string;
    size?: number; // Added optional size
    salary?: number;
    purchasePrice?: number;
    salePrice?: number;
}

export interface FieldPlayer extends Player {
    x: number;
    y: number;
}

export type IconType = 'ball' | 'vest' | 'cone' | 'ladder' | 'whistle';

export interface FieldIcon {
    id: string;
    type: IconType;
    x: number;
    y: number;
    color: string;
    label?: string;
    size?: number;
}

export type DrawingType = 'free' | 'arrow' | 'rect' | 'circle' | 'triangle' | 'eraser';
export type FieldType = 'classic' | 'dark' | 'tactical' | 'neon' | 'bw' | 'basketball' | 'volleyball';

export interface DrawingSettings {
    color: string;
    strokeWidth: number;
    opacity: number;
    isDashed?: boolean;
    isHighlighter?: boolean;
}

export interface DrawingPath {
    id: string;
    points: { x: number; y: number }[];
    type: DrawingType;
    settings: DrawingSettings;
}

export interface FormationPosition {
    id: string;
    x: number;
    y: number;
    label: string;
}

export interface Formation {
    name: string;
    positions: FormationPosition[];
}
