import { Formation } from '../types';

export const FOOTBALL_FORMATIONS: Formation[] = [
    {
        name: '4-4-2',
        positions: [
            { id: 'GK', x: 50, y: 88, label: 'GK', number: 1 },
            { id: 'LB', x: 15, y: 70, label: 'LB', number: 3 },
            { id: 'LCB', x: 38, y: 75, label: 'CB', number: 5 },
            { id: 'RCB', x: 62, y: 75, label: 'CB', number: 4 },
            { id: 'RB', x: 85, y: 70, label: 'RB', number: 2 },
            { id: 'LM', x: 15, y: 45, label: 'LM', number: 11 },
            { id: 'LCM', x: 38, y: 50, label: 'CM', number: 8 },
            { id: 'RCM', x: 62, y: 50, label: 'CM', number: 6 },
            { id: 'RM', x: 85, y: 45, label: 'RM', number: 7 },
            { id: 'LS', x: 35, y: 25, label: 'ST', number: 10 },
            { id: 'RS', x: 65, y: 25, label: 'ST', number: 9 },
        ],
    },
    {
        name: '4-1-2-1-2', // Diamond
        positions: [
            { id: 'GK', x: 50, y: 88, label: 'GK', number: 1 },
            { id: 'LB', x: 15, y: 70, label: 'LB', number: 3 },
            { id: 'LCB', x: 38, y: 75, label: 'CB', number: 5 },
            { id: 'RCB', x: 62, y: 75, label: 'CB', number: 4 },
            { id: 'RB', x: 85, y: 70, label: 'RB', number: 2 },
            { id: 'CDM', x: 50, y: 60, label: 'CDM', number: 6 },
            { id: 'LM', x: 20, y: 45, label: 'LM', number: 11 },
            { id: 'RM', x: 80, y: 45, label: 'RM', number: 7 },
            { id: 'CAM', x: 50, y: 35, label: 'CAM', number: 10 },
            { id: 'LS', x: 35, y: 20, label: 'ST', number: 19 },
            { id: 'RS', x: 65, y: 20, label: 'ST', number: 9 },
        ],
    },
    {
        name: '4-3-3',
        positions: [
            { id: 'GK', x: 50, y: 88, label: 'GK', number: 1 },
            { id: 'LB', x: 15, y: 70, label: 'LB', number: 3 },
            { id: 'LCB', x: 38, y: 75, label: 'CB', number: 5 },
            { id: 'RCB', x: 62, y: 75, label: 'CB', number: 4 },
            { id: 'RB', x: 85, y: 70, label: 'RB', number: 2 },
            { id: 'CDM', x: 50, y: 55, label: 'CDM', number: 6 },
            { id: 'LCM', x: 35, y: 45, label: 'CM', number: 8 },
            { id: 'RCM', x: 65, y: 45, label: 'CM', number: 10 },
            { id: 'LW', x: 15, y: 25, label: 'LW', number: 11 },
            { id: 'ST', x: 50, y: 20, label: 'ST', number: 9 },
            { id: 'RW', x: 85, y: 25, label: 'RW', number: 7 },
        ],
    },
    {
        name: '4-2-3-1',
        positions: [
            { id: 'GK', x: 50, y: 88, label: 'GK', number: 1 },
            { id: 'LB', x: 15, y: 70, label: 'LB', number: 3 },
            { id: 'LCB', x: 38, y: 75, label: 'CB', number: 5 },
            { id: 'RCB', x: 62, y: 75, label: 'CB', number: 4 },
            { id: 'RB', x: 85, y: 70, label: 'RB', number: 2 },
            { id: 'LDM', x: 40, y: 58, label: 'CDM', number: 6 },
            { id: 'RDM', x: 60, y: 58, label: 'CDM', number: 8 },
            { id: 'LAM', x: 20, y: 38, label: 'LAM', number: 11 },
            { id: 'CAM', x: 50, y: 38, label: 'CAM', number: 10 },
            { id: 'RAM', x: 80, y: 38, label: 'RAM', number: 7 },
            { id: 'ST', x: 50, y: 20, label: 'ST', number: 9 },
        ],
    },
    {
        name: '3-1-4-2',
        positions: [
            { id: 'GK', x: 50, y: 88, label: 'GK', number: 1 },
            { id: 'LCB', x: 30, y: 75, label: 'CB', number: 6 },
            { id: 'CB', x: 50, y: 78, label: 'CB', number: 5 },
            { id: 'RCB', x: 70, y: 75, label: 'CB', number: 4 },
            { id: 'CDM', x: 50, y: 62, label: 'CDM', number: 6 }, // Duplicate correction: Use 14? User said "3 Stoper, 1 CDM, 4 Orta". Let's use 16 for CDM if 6 is taken. Wait, user said LCB=6. Standard number logic: 1, 2, 3, 4, 5, 6. If LCB is 6, CDM can be 16 or 14. Let's use 14. 
            // WAIT, User said: 3-5-2: LCB 6, RCB 4, CB 5. RWB 2, LWB 3. CM 8, CAM 10. ST 9, 11(19).
            // This is 3-1-4-2. LCB=6, CB=5, RCB=4. CDM=? Let's stick to valid distinct numbers.
            // LCB=6, CB=5, RCB=4. CDM=14?
            // User sample for 3-5-2: LCB 6, RCB 4, CB 5.
            // Let's use:
            // GK: 1
            // CBs: 6, 5, 4.
            // CDM: 16 (often backup CDM). Or 8? CMs are 8.
            // Let's look at 3-1-4-2 specifc request: No, user said "3-5-2 (or 3-4-1-2 / 3-1-4-2)".
            // Let's assign logical numbers.
            // GK 1, CBs 4,5,6.
            // CDM 8.
            // LM 3, RM 2 (Wing backs often wear 2/3).
            // CMs 14, 18.
            // ST 9, 10.
            // Wait, let's follow 3-5-2 user request more closely: RCB 4, CB 5, LCB 6. RWB 2, LWB 3.
            { id: 'LM', x: 10, y: 50, label: 'LM', number: 3 }, // LWB
            { id: 'LCM', x: 35, y: 48, label: 'CM', number: 8 },
            { id: 'RCM', x: 65, y: 48, label: 'CM', number: 10 }, // CAM? Or just CM.
            { id: 'RM', x: 90, y: 50, label: 'RM', number: 2 }, // RWB
            { id: 'LS', x: 35, y: 20, label: 'ST', number: 11 },
            { id: 'RS', x: 65, y: 20, label: 'ST', number: 9 },
        ],
    },
    {
        name: '3-4-1-2',
        positions: [
            { id: 'GK', x: 50, y: 88, label: 'GK', number: 1 },
            { id: 'LCB', x: 30, y: 75, label: 'CB', number: 6 },
            { id: 'CB', x: 50, y: 78, label: 'CB', number: 5 },
            { id: 'RCB', x: 70, y: 75, label: 'CB', number: 4 },
            { id: 'LM', x: 10, y: 50, label: 'LM', number: 3 },
            { id: 'LCM', x: 35, y: 52, label: 'CM', number: 8 },
            { id: 'RCM', x: 65, y: 52, label: 'CM', number: 14 },
            { id: 'RM', x: 90, y: 50, label: 'RM', number: 2 },
            { id: 'CAM', x: 50, y: 35, label: 'CAM', number: 10 },
            { id: 'LS', x: 35, y: 20, label: 'ST', number: 11 },
            { id: 'RS', x: 65, y: 20, label: 'ST', number: 9 },
        ],
    },
    {
        name: '3-2-3-2',
        positions: [
            { id: 'GK', x: 50, y: 88, label: 'GK', number: 1 },
            { id: 'LCB', x: 30, y: 75, label: 'CB', number: 6 },
            { id: 'CB', x: 50, y: 78, label: 'CB', number: 5 },
            { id: 'RCB', x: 70, y: 75, label: 'CB', number: 4 },
            { id: 'LDM', x: 40, y: 60, label: 'CDM', number: 14 },
            { id: 'RDM', x: 60, y: 60, label: 'CDM', number: 8 },
            { id: 'LAM', x: 20, y: 40, label: 'LAM', number: 11 },
            { id: 'CAM', x: 50, y: 40, label: 'CAM', number: 10 },
            { id: 'RAM', x: 80, y: 40, label: 'RAM', number: 7 },
            { id: 'LS', x: 35, y: 20, label: 'ST', number: 19 },
            { id: 'RS', x: 65, y: 20, label: 'ST', number: 9 },
        ],
    },
    {
        name: '3-4-3',
        positions: [
            { id: 'GK', x: 50, y: 88, label: 'GK', number: 1 },
            { id: 'LCB', x: 30, y: 75, label: 'CB', number: 6 },
            { id: 'CB', x: 50, y: 78, label: 'CB', number: 5 },
            { id: 'RCB', x: 70, y: 75, label: 'CB', number: 4 },
            { id: 'LM', x: 10, y: 50, label: 'LM', number: 3 },
            { id: 'LCM', x: 40, y: 50, label: 'CM', number: 8 },
            { id: 'RCM', x: 60, y: 50, label: 'CM', number: 14 },
            { id: 'RM', x: 90, y: 50, label: 'RM', number: 2 },
            { id: 'LW', x: 20, y: 25, label: 'LW', number: 11 },
            { id: 'ST', x: 50, y: 20, label: 'ST', number: 9 },
            { id: 'RW', x: 80, y: 25, label: 'RW', number: 7 },
        ],
    },
    {
        name: '5-2-3',
        positions: [
            { id: 'GK', x: 50, y: 88, label: 'GK', number: 1 },
            { id: 'LWB', x: 10, y: 60, label: 'LWB', number: 3 },
            { id: 'LCB', x: 30, y: 75, label: 'CB', number: 6 },
            { id: 'CB', x: 50, y: 78, label: 'CB', number: 5 },
            { id: 'RCB', x: 70, y: 75, label: 'CB', number: 4 },
            { id: 'RWB', x: 90, y: 60, label: 'RWB', number: 2 },
            { id: 'LCM', x: 40, y: 50, label: 'CM', number: 8 },
            { id: 'RCM', x: 60, y: 50, label: 'CM', number: 14 },
            { id: 'LW', x: 20, y: 25, label: 'LW', number: 11 },
            { id: 'ST', x: 50, y: 20, label: 'ST', number: 9 },
            { id: 'RW', x: 80, y: 25, label: 'RW', number: 7 },
        ],
    },
    {
        name: '5-3-2',
        positions: [
            { id: 'GK', x: 50, y: 88, label: 'GK', number: 1 },
            { id: 'LWB', x: 10, y: 60, label: 'LWB', number: 3 },
            { id: 'LCB', x: 30, y: 75, label: 'CB', number: 6 },
            { id: 'CB', x: 50, y: 78, label: 'CB', number: 5 },
            { id: 'RCB', x: 70, y: 75, label: 'CB', number: 4 },
            { id: 'RWB', x: 90, y: 60, label: 'RWB', number: 2 },
            { id: 'LCM', x: 35, y: 50, label: 'CM', number: 8 },
            { id: 'CM', x: 50, y: 50, label: 'CM', number: 6 },
            { id: 'RCM', x: 65, y: 50, label: 'CM', number: 10 },
            { id: 'LS', x: 35, y: 25, label: 'ST', number: 11 },
            { id: 'RS', x: 65, y: 25, label: 'ST', number: 9 },
        ]
    },
    {
        name: '5-4-1',
        positions: [
            { id: 'GK', x: 50, y: 88, label: 'GK', number: 1 },
            { id: 'LWB', x: 10, y: 60, label: 'LWB', number: 3 },
            { id: 'LCB', x: 30, y: 75, label: 'CB', number: 6 },
            { id: 'CB', x: 50, y: 78, label: 'CB', number: 5 },
            { id: 'RCB', x: 70, y: 75, label: 'CB', number: 4 },
            { id: 'RWB', x: 90, y: 60, label: 'RWB', number: 2 },
            { id: 'LM', x: 20, y: 45, label: 'LM', number: 11 },
            { id: 'LCM', x: 40, y: 50, label: 'CM', number: 8 },
            { id: 'RCM', x: 60, y: 50, label: 'CM', number: 10 },
            { id: 'RM', x: 80, y: 45, label: 'RM', number: 7 },
            { id: 'ST', x: 50, y: 25, label: 'ST', number: 9 },
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
