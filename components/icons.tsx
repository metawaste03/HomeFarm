import React from 'react';

export const EggCrateIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 13.5c-1 0-1.5-1.5-1.5-2.5 0-2 1-3 2-3s2 1 2 3c0 1-.5 2.5-1.5 2.5Z"/>
    <path d="M15.5 13.5c-1 0-1.5-1.5-1.5-2.5 0-2 1-3 2-3s2 1 2 3c0 1-.5 2.5-1.5 2.5Z"/>
    <path d="M2 11h20"/>
    <path d="M12 11v-1"/>
    <path d="M12 18v-5"/>
    <path d="M20 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2Z"/>
  </svg>
);

export const EggIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C8.686 2 6 6.477 6 12s2.686 10 6 10 6-4.477 6-10S15.314 2 12 2z"/>
  </svg>
);

export const FeedBagIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 18a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2"/>
    <path d="M12 2v12"/>
    <path d="M18 6H6a4 4 0 0 0-4 4v2a4 4 0 0 0 4 4h12a4 4 0 0 0 4-4v-2a4 4 0 0 0-4-4Z"/>
    <path d="M12 14v-2"/>
  </svg>
);

export const MortalityIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 7l-1.5 2-1.5-2"/>
    <path d="M16 12h3"/>
    <path d="M13 12h-1"/>
    <path d="M22 8.7c0 1.7-1 4.7-2.3 6.3-1.4 1.7-3.4 2-4.7 2H8.3c-1.3 0-3.3-.3-4.7-2C2 13.4 1 10.4 1 8.7 1 5 4.3 2 8.3 2h7.4c4 0 7.3 3 7.3 6.7Z"/>
    <path d="M5.5 7.5c-1 0-1.5 1-1.5 2s.5 2 1.5 2"/>
    <path d="M17.5 12c.3 0 .5-.2.5-.5v-3c0-.3-.2-.5-.5-.5h-2c-.3 0-.5.2-.5.5v3c0 .3.2.5.5.5Z"/>
  </svg>
);

export const ChickenIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18.035 15.337A6.002 6.002 0 0 0 19 12c0-3.314-2.686-6-6-6s-6 2.686-6 6c0 1.58.613 3.023 1.62 4.113" />
        <path d="M3 20h18" />
        <path d="M10.84 15.341a3 3 0 0 0-2.68-1.341 3 3 0 0 0-3 3V20h6v-2.162" />
        <path d="M16.84 15.341a3 3 0 0 0-2.68-1.341 3 3 0 0 0-3 3V20h6v-2.162" />
        <path d="M7 6c0-1.657 1.343-3 3-3s3 1.343 3 3" />
        <path d="m15 7-2-2" />
    </svg>
);

export const ClipboardListIcon: React.FC<{ className?: string; isActive?: boolean }> = ({ className, isActive }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <path d="M12 11h4"/><path d="M12 16h4"/>
    <path d="M8 11h.01"/><path d="M8 16h.01"/>
  </svg>
);

export const MinusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export const CalendarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

export const GridIcon: React.FC<{ className?: string; isActive?: boolean }> = ({ className, isActive }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/>
    </svg>
);

export const WalletIcon: React.FC<{ className?: string; isActive?: boolean }> = ({ className, isActive }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12V8H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/>
      <path d="M4 6v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V12H4z"/>
      <path d="M16 16h2"/>
    </svg>
);

export const BatchIcon: React.FC<{ className?: string; isActive?: boolean }> = ({ className, isActive }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
        <polyline points="2 17 12 22 22 17"></polyline>
        <polyline points="2 12 12 17 22 12"></polyline>
    </svg>
);

export const ChartPieIcon: React.FC<{ className?: string; isActive?: boolean }> = ({ className, isActive }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
        <path d="M22 12A10 10 0 0 0 12 2v10z"/>
    </svg>
);

export const FishIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} version="1.0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024.000000 1024.000000" preserveAspectRatio="xMidYMid meet">
        <g transform="translate(0.000000,1024.000000) scale(0.100000,-0.100000)" fill="currentColor" stroke="none">
            <path d="M4595 6604 c-96 -16 -270 -83 -390 -150 -208 -116 -383 -253 -615 -479 l-145 -142 -87 -7 c-575 -43 -1318 -267 -1948 -587 -96 -49 -220 -118 -275 -154 -55 -35 -110 -65 -122 -65 -20 0 -23 -5 -23 -37 0 -34 -4 -40 -40 -56 -75 -35 -102 -148 -52 -216 10 -14 35 -37 55 -50 32 -21 37 -30 37 -62 0 -73 36 -128 117 -176 l42 -25 -34 -68 c-42 -83 -71 -185 -79 -277 l-7 -68 44 91 c45 92 101 181 154 242 28 32 28 33 71 20 l44 -13 3 -130 c2 -96 8 -149 24 -203 22 -74 88 -218 97 -209 2 2 -2 28 -10 58 -7 30 -17 90 -21 134 -10 122 23 324 52 318 6 -1 36 -6 67 -11 42 -7 61 -15 76 -35 11 -14 55 -54 98 -90 268 -223 594 -369 922 -413 98 -13 279 -19 269 -10 -3 3 -40 12 -84 21 -269 54 -666 247 -855 414 -45 40 -45 40 -17 41 15 0 153 -20 305 -44 1055 -170 1671 -207 2385 -145 l129 11 56 -54 c197 -191 513 -348 702 -348 102 0 167 64 190 189 15 79 12 218 -5 286 -16 61 -12 74 25 75 23 0 432 96 538 126 l93 27 72 -35 c304 -148 769 -308 897 -308 92 0 144 56 200 210 18 51 52 121 75 155 60 88 75 119 75 159 0 47 -39 91 -101 113 -27 10 -49 22 -49 27 0 13 204 -1 276 -19 101 -26 212 -89 390 -222 306 -230 480 -332 674 -397 169 -56 356 -69 432 -30 33 17 61 100 79 231 31 232 -29 444 -177 628 -135 168 -136 246 -4 391 135 145 196 251 219 366 7 32 11 114 9 190 -3 134 -3 134 25 171 56 74 69 134 42 187 -26 49 -67 64 -180 63 -120 0 -237 -23 -365 -70 -171 -64 -271 -119 -600 -332 -260 -167 -388 -238 -515 -280 -101 -34 -243 -61 -317 -61 -45 0 -48 1 -38 19 16 31 11 122 -9 166 -34 75 -121 134 -227 155 -99 19 -164 6 -519 -105 -238 -75 -316 -89 -440 -82 -107 7 -524 48 -980 98 -154 16 -308 33 -343 36 -34 3 -65 9 -67 13 -3 4 20 27 49 50 113 87 131 171 56 265 -24 30 -30 47 -30 87 0 65 -22 109 -75 152 -36 30 -44 43 -49 83 -11 72 -51 148 -93 174 -50 31 -97 37 -178 23z m117 -142 c10 -8 20 -31 23 -51 13 -82 28 -116 75 -165 44 -47 48 -55 52 -112 3 -49 10 -70 36 -104 18 -24 32 -51 32 -61 0 -14 -42 -48 -211 -168 -17 -12 -45 -11 -197 3 -97 10 -179 20 -182 23 -8 8 144 147 235 215 44 33 108 76 143 95 35 19 61 38 58 40 -8 8 -182 -63 -266 -109 -97 -52 -191 -119 -260 -184 l-55 -51 -117 6 c-64 4 -120 10 -123 13 -10 10 124 156 235 256 116 104 253 210 345 267 77 47 37 36 -90 -26 -201 -97 -420 -259 -568 -420 l-73 -80 -73 3 -73 3 98 97 c264 261 604 473 838 523 65 14 91 11 118 -13z m4678 -381 c0 -5 -16 -35 -35 -67 -41 -67 -39 -55 -39 -249 -1 -148 -1 -151 -33 -218 -36 -75 -64 -114 -166 -227 -97 -108 -122 -163 -122 -270 1 -105 16 -141 115 -270 129 -171 164 -265 164 -450 0 -63 -6 -141 -13 -172 -11 -53 -15 -58 -44 -63 -49 -9 -197 12 -284 41 -96 32 -248 107 -347 171 -87 57 -415 296 -416 303 0 3 15 14 33 23 48 26 122 99 164 163 89 135 98 364 17 501 l-24 42 112 105 c210 196 428 354 635 461 58 30 101 55 94 55 -24 0 -209 -74 -305 -122 -178 -89 -369 -218 -535 -361 l-64 -54 -51 38 c-28 22 -61 42 -73 45 -32 8 -29 18 12 37 20 9 113 67 208 129 444 288 599 365 804 402 90 16 193 20 193 7z m-5295 -371 c190 -10 439 -33 760 -70 401 -46 846 -92 1210 -125 376 -35 506 -53 995 -141 199 -35 473 -44 621 -19 106 17 227 51 311 87 l47 20 48 -28 c180 -105 262 -303 204 -492 -25 -83 -93 -165 -175 -213 -62 -35 -73 -36 -152 -4 -125 50 -272 68 -449 55 -164 -12 -293 -43 -539 -126 -446 -151 -848 -264 -1204 -338 l-173 -36 -37 19 c-65 33 -153 52 -276 58 -103 5 -125 9 -154 30 -56 38 -135 30 -209 -20 -44 -30 -41 -38 7 -21 23 8 53 11 68 8 34 -8 62 -32 56 -48 -3 -9 27 -16 108 -24 212 -23 333 -59 391 -117 42 -43 60 -120 55 -239 -3 -70 -10 -112 -22 -135 l-18 -34 -62 6 c-34 3 -100 20 -147 37 -169 61 -330 169 -496 335 -103 102 -113 106 -113 49 0 -13 -6 -24 -12 -24 -7 -1 -60 -5 -118 -11 -327 -31 -947 -27 -1345 11 -206 19 -564 65 -572 74 -3 3 10 12 29 22 75 38 116 83 159 172 22 48 66 118 98 157 128 158 154 207 154 285 0 96 -59 179 -192 270 -69 46 -226 123 -241 118 -6 -2 28 -36 75 -77 137 -119 232 -224 246 -271 11 -36 10 -46 -8 -84 -12 -23 -59 -89 -105 -147 -49 -62 -95 -132 -111 -170 -44 -102 -50 -111 -94 -145 -51 -39 -135 -72 -219 -87 -55 -10 -88 -6 -320 31 -143 23 -293 47 -334 53 -70 10 -78 14 -108 49 l-32 38 35 21 c104 61 2 200 -170 232 -72 13 -105 -2 -43 -20 84 -25 193 -111 186 -147 -2 -10 -15 -23 -29 -28 -23 -8 -34 -3 -90 43 -72 58 -98 67 -53 19 17 -18 62 -73 99 -123 155 -201 348 -375 543 -485 50 -29 92 -54 92 -56 0 -15 -212 95 -315 163 -142 94 -234 173 -386 333 -78 83 -144 148 -147 146 -2 -3 13 -34 33 -70 27 -49 33 -66 22 -66 -17 0 -51 -80 -73 -175 l-14 -60 5 90 c2 50 7 108 10 130 l7 40 -90 28 c-103 32 -195 83 -200 111 -3 15 0 17 14 12 46 -19 211 -56 234 -54 22 3 15 10 -53 60 -43 31 -132 84 -198 118 -122 62 -139 81 -103 111 13 11 35 6 137 -28 129 -44 130 -42 10 39 -62 41 -70 52 -55 74 19 29 218 146 407 240 265 131 467 214 748 308 463 156 812 225 1307 259 107 8 349 6 525 -3z m3213 -50 c35 -21 58 -43 69 -65 16 -34 16 -36 -3 -62 -11 -15 -37 -35 -58 -46 -36 -19 -41 -19 -134 -4 -256 44 -435 76 -439 81 -5 5 231 82 337 110 30 8 82 15 115 15 49 1 69 -5 113 -29z m90 -1101 c81 -22 152 -46 159 -52 9 -9 0 -30 -42 -91 -30 -44 -71 -122 -91 -173 -44 -113 -58 -125 -133 -113 -70 12 -211 54 -341 102 -138 51 -381 150 -377 154 2 2 70 24 152 49 83 25 227 72 320 105 94 32 178 59 188 59 10 1 84 -17 165 -40z m-6190 -186 c-8 -20 -72 -102 -76 -99 -8 9 53 106 66 106 8 0 12 -3 10 -7z"/>
            <path d="M3534 5319 c-39 -5 -91 -16 -115 -23 l-44 -14 82 -1 c219 -3 502 -39 836 -107 735 -150 987 -186 1432 -206 311 -14 711 3 1243 53 180 17 453 41 607 54 l280 24 -330 -5 c-181 -3 -476 -9 -655 -14 -997 -29 -1440 0 -2248 144 -445 80 -585 97 -817 101 -110 2 -232 -1 -271 -6z"/>
            <path d="M1822 5030 c-65 -40 -92 -132 -57 -199 27 -54 71 -81 129 -81 95 0 162 69 153 159 -12 109 -135 176 -225 121z m139 -59 c62 -62 20 -171 -66 -171 -47 0 -71 13 -90 50 -19 37 -19 54 1 95 29 61 106 74 155 26z"/>
            <path d="M1855 4925 c-14 -13 -25 -31 -25 -40 0 -20 44 -65 63 -65 26 0 67 41 67 66 0 29 -33 64 -60 64 -12 0 -32 -11 -45 -25z"/>
            <path d="M2871 4924 c-2 -69 -45 -138 -173 -270 -82 -85 -118 -130 -118 -146 0 -49 13 -128 21 -128 5 0 16 25 24 55 14 45 34 75 110 160 111 125 155 205 154 279 -1 65 -17 110 -18 50z"/>
            <path d="M1456 4909 c-19 -15 -26 -29 -24 -48 3 -22 8 -26 40 -29 46 -4 81 26 76 66 -4 36 -52 42 -92 11z m68 -24 c-6 -14 -35 -35 -48 -35 -14 0 -5 30 12 39 25 15 42 13 36 -4z"/>
            <path d="M3175 4731 c-3 -5 3 -12 12 -15 10 -4 28 -14 41 -24 l23 -18 -73 -37 c-71 -34 -136 -87 -109 -87 8 0 86 7 175 16 204 21 459 14 631 -16 127 -21 315 -70 315 -81 0 -10 -92 -84 -155 -124 -131 -84 -319 -114 -500 -81 -105 20 -253 68 -390 126 -54 23 -99 39 -102 37 -6 -7 85 -78 155 -121 77 -46 201 -99 283 -120 317 -79 565 -12 792 214 42 43 77 83 77 89 0 19 -86 68 -179 101 -222 82 -552 120 -760 90 -59 -8 -66 -7 -95 14 -51 38 -127 58 -141 37z"/>
            <path d="M4987 4261 l-28 -18 83 -41 c135 -65 476 -183 462 -160 -7 11 -467 238 -482 238 -4 0 -20 -8 -35 -19z"/>
            <path d="M4908 4214 c-16 -8 -28 -19 -28 -24 0 -28 237 -183 405 -266 185 -90 213 -91 75 -2 -133 85 -234 159 -338 246 -41 34 -77 62 -80 62 -3 -1 -18 -8 -33 -16z"/>
        </g>
    </svg>
);

export const SettingsIcon: React.FC<{ className?: string; isActive?: boolean }> = ({ className, isActive }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
        <circle cx="12" cy="12" r="3"/>
    </svg>
);

export const UserPlusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
);

export const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 9 6 6 6-6" />
    </svg>
);

export const PencilIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
);

export const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
);

export const EllipsisIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
        <circle cx="5" cy="12" r="1" />
    </svg>
);

export const ChevronLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m15 18-6-6 6-6" />
    </svg>
);

export const ChevronRightIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m9 18 6-6-6-6" />
    </svg>
);

export const HomeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

export const UsersIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);


export const WarningIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

export const ScaleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 16.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z" />
        <path d="M3 12h18" />
        <path d="M12 3v9" />
        <path d="M8 7.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
    </svg>
);

export const DropletIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
    </svg>
);

export const ArrowTrendingUpIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
    </svg>
);
{/* FIX: Add missing AnalyticsIcon */}
export const AnalyticsIcon: React.FC<{ className?: string; isActive?: boolean }> = ({ className, isActive }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
        <path d="M22 12A10 10 0 0 0 12 2v10z"/>
    </svg>
);


export const NairaIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 18h12" />
        <path d="M6 12h12" />
        <path d="M19 6 5 18" />
        <path d="M5 6 19 18" />
    </svg>
);
{/* FIX: Add missing NotepadIcon */}
export const NotepadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M12 11h4" />
    <path d="M12 16h4" />
    <path d="M8 11h.01" />
    <path d="M8 16h.01" />
  </svg>
);


export const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

export const GoogleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);

export const StethoscopeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.8 2.3A.3.3 0 0 1 5 2h14a.3.3 0 0 1 .2.3v3.4a.3.3 0 0 1-.3.3H4.5a.3.3 0 0 1-.3-.3V2.3z" />
        <path d="M6 5v11a5 5 0 0 0 10 0V5" />
        <path d="M11 22a1 1 0 0 1-1-1v-5" />
    </svg>
);

export const PillIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
        <path d="m8.5 8.5 7 7" />
    </svg>
);

export const CameraIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
        <circle cx="12" cy="13" r="3" />
    </svg>
);

export const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);
{/* FIX: Add missing DashboardIcon */}
export const DashboardIcon: React.FC<{ className?: string; isActive?: boolean }> = ({ className, isActive }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/>
    </svg>
);


// Note: BriefcaseIcon is no longer used for main nav, but kept for potential other uses
export const BriefcaseIcon: React.FC<{ className?: string; isActive?: boolean }> = ({ className, isActive }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
);

export const BoxIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
    </svg>
);

export const TrendingDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
        <polyline points="16 17 22 17 22 11" />
    </svg>
);

export const BellIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
);

export const TaskIcon: React.FC<{ className?: string; isActive?: boolean }> = ({ className, isActive }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m9 11 3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
);

export const LayerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} version="1.0" xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1024.000000 1024.000000"
    preserveAspectRatio="xMidYMid meet">
        <g transform="translate(0.000000,1024.000000) scale(0.100000,-0.100000)"
        fill="currentColor" stroke="none">
            <path d="M3340 8188 c-29 -30 -68 -108 -95 -188 l-22 -65 -16 37 c-19 45 -54 65 -86 49 -26 -14 -47 -53 -61 -117 -19 -78 -18 -78 -35 -64 -21 18 -66 8 -86 -20 -11 -14 -22 -47 -25 -75 -5 -37 -15 -59 -39 -85 -70 -75 -96 -184 -60 -254 15 -29 15 -29 -45 -83 -60 -55 -121 -157 -135 -228 l-6 -30 153 3 c84 1 159 -2 167 -7 18 -12 9 -37 -48 -123 -69 -106 -85 -154 -79 -235 11 -151 103 -249 267 -284 29 -6 51 -14 49 -18 -2 -3 -40 -81 -85 -171 -176 -356 -268 -655 -309 -1010 -20 -177 -15 -505 10 -645 62 -345 205 -634 432 -874 37 -39 65 -73 62 -76 -2 -2 -35 1 -73 7 -103 15 -323 5 -420 -21 -412 -108 -558 -447 -348 -808 147 -254 441 -479 723 -554 67 -18 112 -23 215 -24 144 0 228 19 333 75 l53 29 37 -41 c118 -132 346 -214 524 -189 155 22 268 80 375 195 l69 73 52 -48 c135 -124 277 -212 422 -260 78 -26 116 -33 211 -37 214 -9 355 43 493 180 l80 79 55 -25 c267 -120 605 -70 909 134 296 198 459 468 423 700 -15 104 -64 200 -140 274 l-60 59 82 88 c261 279 357 627 292 1069 -5 34 -3 36 51 70 116 72 234 235 234 323 0 30 -4 40 -20 44 -11 3 -20 7 -20 9 0 2 18 20 40 40 130 118 233 330 233 481 0 66 -12 81 -49 64 -15 -6 -29 -10 -31 -7 -3 2 14 37 36 78 85 155 128 346 101 443 -12 41 -41 77 -73 88 -8 2 -2 23 16 65 61 135 71 287 27 390 -26 60 -45 79 -97 97 -31 11 -37 18 -35 37 2 13 4 64 5 114 2 84 0 94 -26 133 -38 57 -99 85 -174 79 -55 -5 -55 -5 -48 21 12 48 17 140 11 175 -14 76 -87 129 -176 129 -146 -2 -326 -135 -506 -376 -110 -147 -188 -275 -307 -505 -75 -145 -114 -209 -148 -244 -115 -115 -471 -240 -844 -294 -163 -24 -461 -24 -565 -1 -163 36 -290 128 -359 256 -18 35 -61 145 -96 245 -34 99 -77 217 -96 261 -157 376 -377 653 -645 811 -43 25 -81 48 -83 50 -2 2 12 21 31 43 19 23 40 58 46 80 38 124 -22 301 -101 301 -14 0 -50 -13 -81 -29 l-56 -30 0 47 c0 64 -17 120 -40 132 -51 28 -93 3 -176 -106 l-59 -77 -9 44 c-24 123 -38 149 -81 149 -13 0 -34 -10 -45 -22z m64 -128 c12 -96 34 -128 76 -115 9 3 46 42 82 88 86 108 106 126 118 107 6 -8 10 -49 10 -90 0 -110 24 -124 115 -70 28 16 60 30 72 30 31 0 54 -49 61 -126 6 -78 -21 -142 -74 -175 l-35 -21 -82 23 c-117 32 -247 32 -346 0 -93 -31 -218 -113 -334 -221 -93 -85 -127 -105 -164 -95 -30 7 -45 37 -45 90 0 50 20 91 67 143 24 28 36 53 44 96 6 33 13 61 15 64 3 2 18 -6 34 -18 16 -12 38 -20 48 -18 19 3 22 9 48 123 9 38 21 74 26 79 5 5 18 -10 30 -38 22 -46 52 -65 85 -53 8 4 24 39 36 79 24 80 63 174 81 196 15 18 23 0 32 -78z m306 -400 c218 -52 459 -224 623 -445 145 -196 246 -407 358 -747 79 -244 165 -361 321 -437 127 -62 198 -75 438 -75 215 -1 301 8 510 51 330 67 610 184 705 295 19 23 58 87 86 142 224 437 401 696 573 834 90 73 154 104 222 110 60 5 88 -7 114 -51 43 -70 23 -152 -101 -399 -49 -98 -87 -178 -85 -178 7 0 127 156 174 226 28 42 51 65 73 73 78 27 150 3 179 -61 40 -88 19 -170 -106 -416 l-85 -167 56 60 c30 33 78 94 105 135 85 128 72 117 113 98 83 -40 106 -193 53 -353 -31 -91 -85 -189 -198 -357 -43 -65 -78 -120 -78 -123 0 -17 139 119 196 192 56 46 72 83 79 83 28 0 40 -33 39 -109 -1 -145 -87 -337 -254 -571 l-79 -111 42 25 c23 14 84 55 134 91 51 36 94 65 97 65 10 0 -29 -140 -54 -197 -56 -124 -130 -212 -240 -286 -70 -48 -73 -52 -50 -58 14 -4 38 -7 53 -8 16 -1 37 -6 48 -11 18 -10 18 -13 -11 -70 -39 -78 -132 -175 -215 -225 -62 -38 -66 -42 -60 -70 35 -179 32 -433 -9 -590 -47 -183 -158 -375 -294 -508 l-59 -59 -51 26 c-219 111 -588 124 -862 31 -143 -49 -319 -163 -386 -250 -14 -19 -30 -35 -33 -35 -4 0 -39 25 -77 55 -132 106 -293 188 -464 236 -74 20 -107 24 -245 23 -141 0 -168 -2 -224 -22 -35 -13 -67 -20 -71 -15 -3 4 -27 37 -52 73 -100 143 -246 247 -379 270 -196 34 -408 -91 -549 -323 l-53 -87 -31 21 c-17 11 -74 41 -126 66 -52 24 -105 49 -118 55 -32 16 -229 221 -289 302 -157 212 -252 442 -300 722 -25 150 -25 510 1 674 51 335 144 621 306 942 l76 152 57 -3 c88 -4 151 22 218 88 63 64 87 118 96 223 6 66 6 67 27 53 101 -72 297 123 313 311 3 44 1 85 -8 114 -7 25 -12 73 -10 108 l3 62 -43 20 c-52 23 -107 25 -153 6 -61 -25 -54 -37 16 -30 108 11 150 -26 116 -101 -6 -14 -32 -39 -58 -55 -104 -67 -198 -199 -215 -302 l-7 -41 -16 32 c-23 49 -95 114 -186 170 -68 42 -83 56 -83 75 0 37 -46 108 -97 150 -56 46 -125 86 -148 86 -10 0 -18 5 -18 10 0 6 4 10 9 10 5 0 51 39 103 86 229 212 379 266 598 214z m-754 -360 c80 -35 121 -57 150 -79 19 -15 11 -16 -105 -17 -122 0 -167 -8 -265 -49 -17 -8 -17 -7 0 26 27 54 56 89 98 120 22 16 43 29 47 29 3 0 37 -14 75 -30z m150 -148 c-14 -24 -84 -34 -172 -25 l-89 9 45 11 c53 13 223 17 216 5z m742 -87 c-7 -82 -44 -159 -104 -219 -86 -84 -142 -84 -130 1 12 87 86 201 165 253 68 45 75 42 69 -35z m-664 10 c9 -14 68 -59 131 -100 127 -82 166 -126 185 -206 43 -177 -88 -352 -250 -337 -78 8 -138 50 -177 127 -45 87 -45 145 3 294 24 72 37 133 38 171 1 49 4 60 21 67 30 11 31 11 49 -16z m-136 -59 c2 -24 -10 -79 -33 -150 -33 -99 -37 -119 -33 -191 3 -52 12 -97 26 -127 11 -27 18 -48 14 -48 -4 0 -24 11 -44 25 -70 47 -111 156 -94 247 3 19 31 73 60 120 30 46 60 103 67 127 15 50 33 49 37 -3z m1217 -3227 c113 -21 223 -93 312 -204 87 -109 87 -101 -1 -187 -86 -85 -118 -145 -143 -265 -38 -183 36 -420 195 -632 71 -95 72 -87 -12 -174 -124 -128 -289 -187 -464 -165 -198 24 -361 147 -456 342 -65 134 -81 212 -80 386 1 169 20 271 82 430 53 135 110 228 193 315 90 95 187 146 310 164 3 1 32 -4 64 -10z m-1005 -234 c125 -28 268 -89 378 -163 11 -7 6 -30 -21 -113 -52 -158 -62 -224 -61 -409 1 -150 3 -173 28 -255 15 -49 45 -123 67 -163 21 -41 39 -75 39 -76 0 -12 -155 -70 -222 -83 -268 -50 -597 80 -847 336 -161 164 -245 336 -245 502 0 80 3 93 37 162 71 143 209 231 430 273 91 17 314 11 417 -11z m3510 -50 c261 -39 432 -140 511 -301 29 -59 34 -81 37 -156 7 -162 -52 -290 -203 -443 -130 -133 -248 -214 -405 -278 -224 -92 -474 -96 -641 -11 l-48 24 18 42 c30 72 44 148 43 244 -1 177 -68 342 -205 506 l-39 47 41 49 c176 211 554 329 891 277z m-1589 -35 c334 -68 644 -297 773 -571 55 -115 69 -186 64 -309 -8 -156 -50 -252 -161 -360 -164 -161 -436 -196 -693 -89 -225 94 -474 332 -592 565 -68 135 -99 289 -82 402 15 93 50 163 115 231 128 135 331 181 576 131z"/>
            <path d="M3352 7445 c-36 -30 -45 -69 -27 -112 14 -33 59 -63 95 -63 29 0 77 27 90 49 5 11 10 36 10 56 0 83 -102 126 -168 70z m99 -46 c18 -18 19 -23 6 -42 -17 -26 -43 -33 -62 -17 -20 17 -19 57 3 69 24 15 29 14 53 -10z"/>
            <path d="M6133 5138 c168 -199 217 -272 217 -322 0 -47 -73 -60 -180 -31 -30 8 -57 15 -59 15 -2 0 32 -37 75 -82 85 -88 110 -132 100 -173 -14 -54 -118 -76 -251 -52 -44 8 -81 14 -83 12 -1 -1 16 -22 38 -46 42 -45 80 -113 80 -141 0 -28 -50 -77 -88 -88 -20 -5 -59 -10 -87 -10 -44 0 -191 26 -257 45 -17 5 -8 -9 35 -51 94 -93 108 -142 50 -176 -68 -40 -198 -29 -379 32 -49 16 -91 30 -92 30 -2 0 17 -24 44 -52 26 -29 53 -68 61 -87 13 -31 13 -36 -5 -60 -26 -36 -73 -50 -173 -50 -164 -2 -339 47 -527 144 -424 220 -649 572 -641 1000 l2 100 -32 3 -31 3 0 -124 c0 -68 7 -162 15 -208 68 -391 348 -708 785 -889 155 -65 456 -127 715 -150 155 -65 456 -127 715 -150 157 -13 582 -13 721 1 234 22 448 68 558 118 81 37 106 59 115 101 6 32 10 35 61 45 92 19 160 46 196 77 30 26 34 36 34 77 l0 47 54 11 c147 31 161 109 40 222 -39 37 -64 68 -64 81 0 80 -185 231 -510 417 -125 72 -622 333 -633 333 -5 0 39 -55 96 -122z m331 -170 c405 -217 674 -408 652 -463 -4 -12 -24 -15 -90 -15 -103 0 -253 28 -401 75 -60 19 -113 31 -116 27 -4 -4 -10 -16 -13 -28 -6 -19 4 -24 111 -57 202 -63 400 -94 487 -78 42 8 50 6 85 -19 46 -34 84 -84 79 -107 -13 -69 -439 -68 -793 1 -66 13 -120 23 -121 22 -1 0 -4 -13 -8 -28 -7 -33 -14 -30 174 -62 172 -30 339 -46 472 -46 96 0 98 0 104 -25 3 -14 4 -31 1 -38 -12 -32 -130 -69 -284 -88 -127 -15 -456 -15 -601 0 -63 7 -115 11 -117 9 -2 -2 -6 -15 -10 -29 -6 -24 -3 -27 27 -33 18 -4 182 -9 363 -12 182 -3 331 -9 333 -13 4 -13 -44 -44 -106 -69 -71 -29 -250 -68 -402 -88 -169 -22 -569 -30 -756 -15 -194 15 -189 14 -148 55 30 30 34 40 34 86 0 52 0 52 28 46 187 -41 315 -20 358 59 16 31 16 79 0 116 -6 15 0 16 56 12 187 -15 300 79 255 212 l-16 45 39 0 c22 0 62 5 90 11 114 24 153 132 85 233 -30 45 -30 46 -5 46 35 0 77 28 90 60 25 61 1 128 -86 243 -20 26 -32 47 -28 47 4 0 85 -41 178 -92z"/>
        </g>
    </svg>
);

export const BroilerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} version="1.0" xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1024.000000 1024.000000"
    preserveAspectRatio="xMidYMid meet">
        <g transform="translate(0.000000,1024.000000) scale(0.100000,-0.100000)"
        fill="currentColor" stroke="none">
            <path d="M7710 7461 c-88 -19 -141 -64 -230 -194 -149 -219 -412 -270 -955 -186 -503 77 -886 21 -1200 -176 l-82 -52 -149 -7 c-809 -38 -1608 -339 -2209 -831 -219 -180 -354 -326 -490 -530 -89 -133 -151 -255 -244 -479 -85 -204 -148 -318 -276 -495 -145 -202 -196 -326 -211 -513 -6 -85 17 -352 37 -433 53 -201 295 -356 608 -390 54 -6 75 -15 130 -53 36 -25 94 -58 129 -74 34 -15 84 -45 110 -65 159 -122 440 -186 1147 -262 516 -55 786 -74 882 -61 161 21 284 81 398 195 l70 70 105 -6 c645 -43 1140 -48 1385 -15 546 73 950 223 1287 477 171 129 384 367 496 553 148 246 172 509 67 722 -65 132 -144 201 -310 271 -86 36 -95 42 -225 173 -153 153 -244 220 -424 306 l-117 56 7 32 c12 57 75 220 110 283 75 136 188 252 322 330 24 14 104 50 179 79 147 58 198 88 238 140 53 69 71 186 41 258 -20 47 -72 103 -125 133 -25 15 -47 27 -49 29 -2 1 8 18 22 39 45 65 58 155 35 226 -17 51 -67 112 -126 155 -45 33 -53 44 -64 88 -13 59 -36 100 -76 138 -56 54 -167 85 -243 69z m162 -116 c43 -29 71 -81 83 -152 5 -35 13 -47 43 -65 53 -32 111 -87 128 -119 21 -41 18 -118 -7 -158 l-20 -34 -21 42 c-63 127 -238 177 -377 107 -71 -36 -106 -77 -161 -185 -66 -132 -99 -173 -167 -212 -90 -51 -174 -113 -249 -184 -37 -36 -78 -68 -91 -71 -18 -5 -41 10 -110 69 -156 132 -313 219 -538 297 -265 91 -472 130 -895 169 l-85 8 80 37 c102 48 201 81 323 108 82 19 129 22 312 22 192 0 237 -3 425 -31 116 -18 255 -35 310 -39 207 -14 423 34 555 121 69 46 103 83 179 192 63 91 108 116 195 108 30 -3 64 -14 88 -30z m41 -449 c47 -20 84 -65 110 -132 22 -57 25 -60 97 -96 86 -43 124 -80 141 -138 16 -51 0 -106 -43 -156 -36 -41 -68 -58 -196 -108 -347 -134 -524 -326 -641 -695 -172 -545 -192 -597 -331 -876 -59 -116 -94 -200 -101 -236 -22 -127 38 -250 160 -328 43 -28 161 -76 161 -66 0 2 -24 20 -54 40 -72 48 -132 115 -163 181 -21 47 -25 67 -21 127 3 77 -1 66 120 297 36 69 90 184 119 257 l52 131 22 -63 c68 -192 213 -333 391 -379 79 -21 215 -20 307 0 40 9 77 19 84 23 6 3 -45 6 -115 6 -145 0 -205 12 -312 63 -154 72 -262 222 -302 422 -20 97 -20 100 -1 155 l18 56 102 -50 c166 -81 237 -133 386 -283 l138 -140 134 -63 c103 -49 146 -75 181 -111 119 -123 165 -331 114 -528 -52 -202 -263 -499 -494 -693 -396 -333 -908 -506 -1613 -544 -191 -11 -208 -10 -308 10 -579 117 -1029 492 -1216 1016 -21 56 -27 68 -23 40 15 -100 99 -310 169 -424 15 -24 24 -42 19 -39 -5 2 -43 20 -84 41 -172 85 -359 111 -790 112 -179 0 -364 -3 -412 -8 l-87 -7 74 110 c270 398 368 930 264 1429 -10 52 -21 96 -24 99 -8 8 -100 -66 -171 -140 -98 -101 -180 -231 -331 -523 -129 -249 -212 -394 -306 -534 l-50 -74 -17 54 c-9 30 -22 65 -30 79 -15 30 -101 160 -106 160 -6 0 -227 -424 -269 -519 -58 -131 -102 -260 -121 -358 -18 -95 -18 -236 0 -296 8 -26 12 -47 8 -47 -3 0 -28 18 -56 39 -100 77 -166 191 -213 367 -24 91 -26 115 -27 294 0 198 0 196 49 410 9 42 -35 -60 -61 -140 -82 -250 -66 -564 41 -788 l35 -74 -43 7 c-139 21 -280 77 -366 145 -101 80 -129 147 -152 372 -29 279 13 439 176 663 149 206 210 315 310 559 138 339 271 543 498 768 404 401 1008 728 1627 881 312 78 583 110 920 110 589 -1 1118 -127 1449 -347 72 -48 171 -132 171 -145 0 -9 -181 -65 -335 -106 -356 -93 -648 -203 -880 -332 -458 -255 -780 -603 -884 -958 -27 -94 -51 -236 -50 -299 l1 -51 14 60 c105 441 364 787 801 1076 266 175 551 292 1038 425 132 36 283 82 335 101 302 112 512 276 631 494 24 43 56 101 71 128 47 84 171 126 261 87z m-4003 -1818 c18 -146 8 -444 -20 -583 -12 -60 -26 -115 -31 -121 -5 -6 -28 -17 -51 -25 l-43 -14 43 -3 c49 -4 49 8 0 -129 -16 -45 -35 -86 -41 -91 -7 -5 -34 -15 -62 -23 l-50 -14 48 -5 48 -5 -32 -63 c-46 -88 -68 -109 -123 -117 -54 -8 -62 -25 -11 -25 19 0 35 -4 35 -9 0 -20 -102 -135 -162 -183 -35 -27 -70 -57 -78 -65 -13 -13 -13 -15 5 -10 28 8 343 39 354 35 5 -1 -2 -30 -15 -62 -13 -33 -23 -61 -21 -62 2 -2 27 28 56 66 l53 70 89 0 c49 0 89 -4 89 -9 0 -5 -7 -28 -15 -51 -24 -68 -18 -67 35 4 l51 66 84 0 c48 0 85 -4 85 -10 0 -5 -9 -33 -20 -61 -12 -28 -19 -53 -17 -55 2 -2 23 23 47 56 l43 60 76 0 c104 0 108 -4 82 -74 -11 -31 -21 -60 -21 -63 0 -4 20 20 44 54 25 34 49 63 53 66 10 6 150 -16 159 -26 4 -4 -3 -32 -14 -64 -12 -31 -20 -59 -18 -60 2 -2 22 24 45 57 47 67 39 66 144 28 33 -12 61 -26 63 -32 3 -7 -4 -38 -15 -71 l-20 -60 22 29 c12 16 32 41 43 55 l22 25 40 -26 c50 -34 105 -100 134 -164 18 -39 23 -67 23 -139 0 -82 -3 -97 -32 -156 -80 -162 -287 -278 -496 -279 -74 0 -474 34 -777 66 -637 67 -939 131 -1085 229 -75 51 -111 107 -132 211 -13 67 -14 92 -4 167 22 164 112 395 267 685 52 97 58 104 71 86 26 -36 53 -147 60 -246 7 -120 -13 -136 177 147 144 214 228 359 351 605 42 85 94 184 115 220 80 138 217 302 231 278 4 -7 13 -57 19 -110z m1534 -1929 c75 -51 171 -101 296 -157 l25 -11 -25 0 c-34 -1 -523 28 -526 32 -1 1 5 36 14 77 15 74 9 168 -14 225 -4 11 24 -8 67 -44 41 -34 114 -89 163 -122z"/>
            <path d="M5260 6543 c-184 -13 -366 -49 -531 -104 -111 -37 -210 -78 -154 -65 237 59 798 123 1110 127 l90 1 -65 14 c-36 7 -128 18 -205 23 -137 11 -154 11 -245 4z"/>
        </g>
    </svg>
);

export const LightbulbIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18h6" />
        <path d="M10 22h4" />
        <path d="M12 2a7 7 0 0 0-7 7c0 3 2 5 2 7h10c0-2 2-4 2-7a7 7 0 0 0-7-7z" />
    </svg>
);

export const InfoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
);

export const FilterIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
);
{/* FIX: Add missing SalesIcon */}
export const SalesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
);
