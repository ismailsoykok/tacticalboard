import { Formation } from '../types';

export const FOOTBALL_FORMATIONS: Formation[] = [
    {
        name: '4-4-2',
        positions: [
            { id: 'GK', x: 50, y: 88, label: 'GK' },
            { id: 'LB', x: 15, y: 70, label: 'LB' },
            { id: 'LCB', x: 38, y: 75, label: 'CB' },
            { id: 'RCB', x: 62, y: 75, label: 'CB' },
            { id: 'RB', x: 85, y: 70, label: 'RB' },
            { id: 'LM', x: 15, y: 45, label: 'LM' },
            { id: 'LCM', x: 38, y: 50, label: 'CM' },
            { id: 'RCM', x: 62, y: 50, label: 'CM' },
            { id: 'RM', x: 85, y: 45, label: 'RM' },
            { id: 'LS', x: 35, y: 25, label: 'ST' },
            { id: 'RS', x: 65, y: 25, label: 'ST' },
        ],
    },
    {
        name: '4-3-3',
        positions: [
            { id: 'GK', x: 50, y: 88, label: 'GK' },
            { id: 'LB', x: 15, y: 70, label: 'LB' },
            { id: 'LCB', x: 38, y: 75, label: 'CB' },
            { id: 'RCB', x: 62, y: 75, label: 'CB' },
            { id: 'RB', x: 85, y: 70, label: 'RB' },
            { id: 'CDM', x: 50, y: 55, label: 'CDM' },
            { id: 'LCM', x: 35, y: 45, label: 'CM' },
            { id: 'RCM', x: 65, y: 45, label: 'CM' },
            { id: 'LW', x: 15, y: 25, label: 'LW' },
            { id: 'ST', x: 50, y: 20, label: 'ST' },
            { id: 'RW', x: 85, y: 25, label: 'RW' },
        ],
    },
    {
        name: '4-2-3-1',
        positions: [
            { id: 'GK', x: 50, y: 88, label: 'GK' },
            { id: 'LB', x: 15, y: 70, label: 'LB' },
            { id: 'LCB', x: 38, y: 75, label: 'CB' },
            { id: 'RCB', x: 62, y: 75, label: 'CB' },
            { id: 'RB', x: 85, y: 70, label: 'RB' },
            { id: 'LDM', x: 40, y: 55, label: 'CDM' },
            { id: 'RDM', x: 60, y: 55, label: 'CDM' },
            { id: 'LAM', x: 20, y: 35, label: 'LAM' },
            { id: 'CAM', x: 50, y: 35, label: 'CAM' },
            { id: 'RAM', x: 80, y: 35, label: 'RAM' },
            { id: 'ST', x: 50, y: 20, label: 'ST' },
        ],
    },
    {
        name: '3-5-2',
        positions: [
            { id: 'GK', x: 50, y: 88, label: 'GK' },
            { id: 'LCB', x: 30, y: 75, label: 'CB' },
            { id: 'CB', x: 50, y: 78, label: 'CB' },
            { id: 'RCB', x: 70, y: 75, label: 'CB' },
            { id: 'LWB', x: 10, y: 50, label: 'LWB' },
            { id: 'LDM', x: 40, y: 60, label: 'CDM' },
            { id: 'RDM', x: 60, y: 60, label: 'CDM' },
            { id: 'RWB', x: 90, y: 50, label: 'RWB' },
            { id: 'CAM', x: 50, y: 40, label: 'CAM' },
            { id: 'LS', x: 35, y: 20, label: 'ST' },
            { id: 'RS', x: 65, y: 20, label: 'ST' },
        ],
    },
    {
        name: '5-3-2',
        positions: [
            { id: 'GK', x: 50, y: 88, label: 'GK' },
            { id: 'LWB', x: 10, y: 60, label: 'LWB' },
            { id: 'LCB', x: 30, y: 75, label: 'CB' },
            { id: 'CB', x: 50, y: 78, label: 'CB' },
            { id: 'RCB', x: 70, y: 75, label: 'CB' },
            { id: 'RWB', x: 90, y: 60, label: 'RWB' },
            { id: 'LCM', x: 35, y: 50, label: 'CM' },
            { id: 'CM', x: 50, y: 50, label: 'CM' },
            { id: 'RCM', x: 65, y: 50, label: 'CM' },
            { id: 'LS', x: 35, y: 25, label: 'ST' },
            { id: 'RS', x: 65, y: 25, label: 'ST' },
        ]
    }
];

export const BASKETBALL_FORMATIONS: Formation[] = [
    {
        name: '2-1-2', // Zone / Balanced
        positions: [
            { id: 'PG', x: 35, y: 70, label: 'PG' },
            { id: 'SG', x: 65, y: 70, label: 'SG' },
            { id: 'C', x: 50, y: 80, label: 'C' },
            { id: 'SF', x: 20, y: 85, label: 'SF' },
            { id: 'PF', x: 80, y: 85, label: 'PF' },
        ],
    },
    {
        name: '1-3-1', // High Pressure Zone
        positions: [
            { id: 'PG', x: 50, y: 65, label: 'PG' },
            { id: 'SG', x: 20, y: 75, label: 'SG' },
            { id: 'C', x: 50, y: 80, label: 'C' },
            { id: 'PF', x: 80, y: 75, label: 'PF' },
            { id: 'SF', x: 50, y: 92, label: 'SF' },
        ],
    },
    {
        name: '3-2', // Perimeter Defense
        positions: [
            { id: 'PG', x: 50, y: 65, label: 'PG' },
            { id: 'SG', x: 20, y: 70, label: 'SG' },
            { id: 'SF', x: 80, y: 70, label: 'SF' },
            { id: 'PF', x: 30, y: 85, label: 'PF' },
            { id: 'C', x: 70, y: 85, label: 'C' },
        ],
    },
    {
        name: '1-2-2', // Matchup Zone
        positions: [
            { id: 'PG', x: 50, y: 65, label: 'PG' },
            { id: 'SG', x: 30, y: 75, label: 'SG' },
            { id: 'SF', x: 70, y: 75, label: 'SF' },
            { id: 'PF', x: 20, y: 90, label: 'PF' },
            { id: 'C', x: 80, y: 90, label: 'C' },
        ],
    },
];

export const FORMATIONS = FOOTBALL_FORMATIONS; // Backwards compatibility if needed, but we should import specific ones.
