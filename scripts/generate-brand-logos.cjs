const fs = require('fs');
const path = require('path');

const brands = [
  {
    slug: 'aspor',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <defs>
        <linearGradient id="asporGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#E11D48"/>
          <stop offset="100%" stop-color="#7C3AED"/>
        </linearGradient>
      </defs>
      <rect x="12" y="14" width="32" height="32" rx="8" fill="url(#asporGrad)"/>
      <path d="M28 20 L21 34 L27 34 L26 40 L35 27 L29 27 Z" fill="#ffffff"/>
      <text x="54" y="38" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="900" font-style="italic" fill="#0F172A" letter-spacing="1">ASPOR</text>
    </svg>`
  },
  {
    slug: 'jc-comm',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <circle cx="28" cy="30" r="16" fill="#0284C7"/>
      <path d="M20 30 Q28 18 36 30 Q28 42 20 30" fill="none" stroke="#ffffff" stroke-width="3"/>
      <circle cx="28" cy="30" r="3.5" fill="#ffffff"/>
      <text x="52" y="37" font-family="Arial, sans-serif" font-size="21" font-weight="900" fill="#0F172A">JC COMM</text>
    </svg>`
  },
  {
    slug: 'remax',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <rect x="10" y="12" width="180" height="36" rx="6" fill="#E60012"/>
      <text x="100" y="37" font-family="'Impact', 'Arial Black', sans-serif" font-size="28" font-weight="900" font-style="italic" fill="#FFFFFF" text-anchor="middle" letter-spacing="2">REMAX</text>
    </svg>`
  },
  {
    slug: 'tandg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <circle cx="30" cy="30" r="16" fill="#18181B"/>
      <path d="M22 25 Q30 18 38 25 M24 30 Q30 25 36 30 M26 35 Q30 32 34 35" fill="none" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round"/>
      <text x="56" y="38" font-family="Arial Black, Impact, sans-serif" font-size="24" font-weight="900" fill="#18181B">T&amp;G</text>
    </svg>`
  },
  {
    slug: 'jedel',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <path d="M15 15 L32 15 L38 30 L32 45 L15 45 Z" fill="#DC2626"/>
      <text x="24" y="35" font-family="Arial, sans-serif" font-size="14" font-weight="900" fill="#FFFFFF">J</text>
      <text x="48" y="38" font-family="Arial Black, Impact, sans-serif" font-size="23" font-weight="900" fill="#0F172A" letter-spacing="1.5">JEDEL</text>
    </svg>`
  },
  {
    slug: 'lenovo',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <rect x="8" y="14" width="184" height="32" rx="4" fill="#E2231A"/>
      <text x="100" y="37" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">lenovo</text>
    </svg>`
  },
  {
    slug: 'qkz',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <circle cx="28" cy="30" r="16" fill="#D97706"/>
      <path d="M22 30 A6 6 0 1 1 34 30 A6 6 0 1 1 22 30 M31 33 L36 38" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
      <text x="54" y="39" font-family="Arial Black, sans-serif" font-size="26" font-weight="900" fill="#0F172A" letter-spacing="2">QKZ</text>
    </svg>`
  },
  {
    slug: 'celebrat',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <circle cx="26" cy="30" r="15" fill="#0284C7"/>
      <circle cx="26" cy="30" r="7" fill="#FFFFFF"/>
      <circle cx="26" cy="30" r="3" fill="#0284C7"/>
      <text x="50" y="38" font-family="Arial, Helvetica, sans-serif" font-size="23" font-weight="800" fill="#0284C7" letter-spacing="0.5">Celebrat</text>
    </svg>`
  },
  {
    slug: 'bwoo',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <rect x="12" y="14" width="32" height="32" rx="16" fill="#DC2626"/>
      <text x="28" y="36" font-family="Arial, sans-serif" font-size="16" font-weight="900" fill="#FFFFFF" text-anchor="middle">B</text>
      <text x="54" y="38" font-family="Arial Black, Impact, sans-serif" font-size="24" font-weight="900" fill="#DC2626" letter-spacing="2">BWOO</text>
    </svg>`
  },
  {
    slug: 'jbl',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <rect x="45" y="6" width="110" height="48" rx="8" fill="#FF3300"/>
      <text x="96" y="40" font-family="Arial Black, Impact, sans-serif" font-size="34" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">JBL</text>
      <rect x="135" y="18" width="5" height="14" fill="#FFFFFF"/>
      <rect x="135" y="35" width="5" height="5" fill="#FFFFFF"/>
    </svg>`
  },
  {
    slug: 'meetion',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <polygon points="15,16 33,16 41,30 33,44 15,44 23,30" fill="#EA580C"/>
      <text x="50" y="38" font-family="Arial Black, sans-serif" font-size="23" font-weight="900" fill="#EA580C" letter-spacing="1">MEETION</text>
    </svg>`
  },
  {
    slug: 'vdenmenv',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <rect x="12" y="15" width="30" height="30" rx="6" fill="#2563EB"/>
      <path d="M20 22 L27 38 L34 22" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
      <text x="50" y="37" font-family="Arial Black, sans-serif" font-size="18" font-weight="900" fill="#0F172A" letter-spacing="0.5">VDENMENV</text>
    </svg>`
  },
  {
    slug: 'foneng',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <rect x="14" y="15" width="30" height="30" rx="6" fill="#F97316"/>
      <path d="M22 22 L36 22 M22 29 L32 29 M22 36 L28 36" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
      <text x="52" y="38" font-family="Arial Black, sans-serif" font-size="22" font-weight="900" fill="#F97316" letter-spacing="1">FONENG</text>
    </svg>`
  },
  {
    slug: 'brodu',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <circle cx="28" cy="30" r="16" fill="#4F46E5"/>
      <path d="M20 33 L24 25 L28 35 L32 22 L36 30" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
      <text x="52" y="38" font-family="Arial Black, sans-serif" font-size="23" font-weight="900" fill="#1E1B4B" letter-spacing="1">BRODU</text>
    </svg>`
  },
  {
    slug: 'plokama',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <circle cx="26" cy="30" r="15" fill="#0F172A"/>
      <circle cx="26" cy="30" r="9" fill="none" stroke="#38BDF8" stroke-width="3"/>
      <circle cx="26" cy="30" r="4" fill="#38BDF8"/>
      <text x="50" y="38" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="900" fill="#0F172A" letter-spacing="1">PLOKAMA</text>
    </svg>`
  },
  {
    slug: 'anker',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <path d="M15 42 L25 18 L33 18 L23 42 Z" fill="#00A3E0"/>
      <path d="M28 42 L38 18 L46 18 L36 42 Z" fill="#00A3E0"/>
      <path d="M21 33 L40 33" stroke="#FFFFFF" stroke-width="3"/>
      <text x="54" y="38" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="900" fill="#00A3E0" letter-spacing="1">ANKER</text>
    </svg>`
  },
  {
    slug: 'joyroom',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <text x="100" y="39" font-family="'Arial Black', Impact, sans-serif" font-size="27" font-weight="900" fill="#0052FF" text-anchor="middle" letter-spacing="2">JOYROOM</text>
    </svg>`
  },
  {
    slug: 'vgr',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <rect x="12" y="14" width="32" height="32" rx="4" fill="#000000"/>
      <text x="28" y="37" font-family="Arial Black, sans-serif" font-size="18" font-weight="900" fill="#EAB308" text-anchor="middle">V</text>
      <text x="54" y="38" font-family="Arial Black, Impact, sans-serif" font-size="26" font-weight="900" fill="#0F172A" letter-spacing="2">VGR</text>
    </svg>`
  },
  {
    slug: 'yesido',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <rect x="12" y="16" width="28" height="28" rx="8" fill="#0066FF"/>
      <path d="M19 30 L25 36 L34 22" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="48" y="38" font-family="Arial Black, sans-serif" font-size="24" font-weight="900" fill="#0066FF" letter-spacing="1">yesido</text>
    </svg>`
  },
  {
    slug: 'tplink',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <circle cx="28" cy="30" r="14" fill="#00A9E0"/>
      <path d="M22 30 Q28 20 34 30" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
      <circle cx="28" cy="27" r="2.5" fill="#FFFFFF"/>
      <text x="50" y="37" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="#00A9E0">tp-link</text>
    </svg>`
  },
  {
    slug: 'hikvision-ezviz-hikvision',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <text x="100" y="37" font-family="Arial Black, sans-serif" font-size="22" font-weight="900" fill="#E60012" text-anchor="middle" letter-spacing="1">HIKVISION</text>
    </svg>`
  },
  {
    slug: 'ldnio',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <rect x="10" y="14" width="34" height="32" rx="6" fill="#DC2626"/>
      <path d="M26 18 L20 31 L26 31 L24 41 L34 27 L28 27 Z" fill="#FFFFFF"/>
      <text x="52" y="38" font-family="Arial Black, Impact, sans-serif" font-size="26" font-weight="900" fill="#DC2626" letter-spacing="1.5">LDNIO</text>
    </svg>`
  },
  {
    slug: 'baseus',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <text x="90" y="39" font-family="Arial Black, Impact, sans-serif" font-size="30" font-weight="900" fill="#000000" text-anchor="middle" letter-spacing="1">Baseus</text>
      <circle cx="152" cy="18" r="4.5" fill="#FACC15"/>
    </svg>`
  },
  {
    slug: 'ndr',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <rect x="15" y="15" width="30" height="30" rx="8" fill="#18181B"/>
      <path d="M22 35 L26 25 L30 35 L34 22" fill="none" stroke="#22C55E" stroke-width="3" stroke-linecap="round"/>
      <text x="54" y="39" font-family="Arial Black, sans-serif" font-size="26" font-weight="900" fill="#18181B" letter-spacing="2">NDR</text>
    </svg>`
  },
  {
    slug: 'mi',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <rect x="75" y="5" width="50" height="50" rx="14" fill="#FF6700"/>
      <text x="100" y="40" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="900" fill="#FFFFFF" text-anchor="middle">mi</text>
    </svg>`
  },
  {
    slug: 'kts',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <circle cx="28" cy="30" r="16" fill="#2563EB"/>
      <text x="28" y="36" font-family="Arial, sans-serif" font-size="14" font-weight="900" fill="#FFFFFF" text-anchor="middle">♪</text>
      <text x="52" y="38" font-family="Arial Black, sans-serif" font-size="26" font-weight="900" fill="#1E293B" letter-spacing="1.5">KTS</text>
    </svg>`
  },
  {
    slug: 'lb-link',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <circle cx="26" cy="30" r="14" fill="#0D9488"/>
      <path d="M19 25 A10 10 0 0 1 33 25 M22 29 A6 6 0 0 1 30 29 M26 34 A1 1 0 1 1 26 33" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
      <text x="48" y="37" font-family="Arial Black, sans-serif" font-size="21" font-weight="900" fill="#0F172A">LB-LINK</text>
    </svg>`
  },
  {
    slug: 'haylou',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <circle cx="26" cy="30" r="14" fill="#06B6D4"/>
      <circle cx="26" cy="30" r="6" fill="#FFFFFF"/>
      <text x="48" y="38" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="900" fill="#0891B2" letter-spacing="2">HAYLOU</text>
    </svg>`
  },
  {
    slug: 'keqiwear',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <rect x="15" y="16" width="28" height="28" rx="8" fill="#3B82F6"/>
      <circle cx="29" cy="30" r="7" fill="none" stroke="#FFFFFF" stroke-width="2.5"/>
      <text x="50" y="38" font-family="Arial Black, sans-serif" font-size="20" font-weight="900" fill="#0F172A" letter-spacing="1">KEQIWEAR</text>
    </svg>`
  },
  {
    slug: 'goop',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <circle cx="26" cy="30" r="15" fill="#84CC16"/>
      <path d="M26 20 L20 32 L26 32 L25 40 L33 28 L27 28 Z" fill="#FFFFFF"/>
      <text x="48" y="38" font-family="Arial Black, sans-serif" font-size="24" font-weight="900" fill="#1F2937" letter-spacing="1">GOOP</text>
    </svg>`
  },
  {
    slug: 'jio',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <circle cx="100" cy="30" r="24" fill="#0A2885"/>
      <text x="100" y="39" font-family="Arial Black, sans-serif" font-size="24" font-weight="900" fill="#FFFFFF" text-anchor="middle">Jio</text>
    </svg>`
  },
  {
    slug: 'uiisii',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <circle cx="24" cy="30" r="14" fill="#EF4444"/>
      <text x="24" y="36" font-family="Arial, sans-serif" font-size="16" font-weight="900" fill="#FFFFFF" text-anchor="middle">U</text>
      <text x="46" y="38" font-family="Arial, sans-serif" font-size="25" font-weight="900" fill="#EF4444" letter-spacing="1">UiiSii</text>
    </svg>`
  },
  {
    slug: 'tiandy',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <rect x="14" y="16" width="28" height="28" rx="6" fill="#DC2626"/>
      <circle cx="28" cy="30" r="6" fill="#FFFFFF"/>
      <text x="50" y="38" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="900" fill="#DC2626" letter-spacing="0.5">Tiandy</text>
    </svg>`
  },
  {
    slug: 'aibimy',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <circle cx="26" cy="30" r="15" fill="#8B5CF6"/>
      <path d="M21 30 Q26 22 31 30" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
      <text x="48" y="38" font-family="Arial Black, sans-serif" font-size="23" font-weight="900" fill="#6D28D9" letter-spacing="1">aibimy</text>
    </svg>`
  },
  {
    slug: 'lito',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <path d="M28 14 L40 20 L40 32 Q40 42 28 46 Q16 42 16 32 L16 20 Z" fill="#F97316"/>
      <text x="28" y="34" font-family="Arial, sans-serif" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle">9H</text>
      <text x="48" y="38" font-family="Arial Black, sans-serif" font-size="25" font-weight="900" fill="#F97316" letter-spacing="1">LITO</text>
    </svg>`
  },
  {
    slug: 'ven-dens',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <rect x="12" y="16" width="30" height="28" rx="6" fill="#0F172A"/>
      <text x="27" y="35" font-family="Arial Black, sans-serif" font-size="14" font-weight="900" fill="#38BDF8" text-anchor="middle">VD</text>
      <text x="50" y="37" font-family="Arial Black, sans-serif" font-size="20" font-weight="900" fill="#0F172A" letter-spacing="1">VEN-DENS</text>
    </svg>`
  },
  {
    slug: 'kingston',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <path d="M15 45 L15 15 L32 24 L27 33 L35 37 L30 45 Z" fill="#E11D48"/>
      <text x="42" y="38" font-family="Arial Black, sans-serif" font-size="24" font-weight="900" fill="#0F172A" letter-spacing="0.5">Kingston</text>
    </svg>`
  },
  {
    slug: 'kisonli',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <circle cx="26" cy="30" r="14" fill="#0284C7"/>
      <path d="M22 26 L31 30 L22 34 Z" fill="#FFFFFF"/>
      <text x="48" y="38" font-family="Arial, Helvetica, sans-serif" font-size="23" font-weight="800" fill="#0284C7">Kisonli</text>
    </svg>`
  },
  {
    slug: 'sandisk',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <text x="100" y="38" font-family="Arial, Helvetica, sans-serif" font-size="27" font-weight="900" fill="#ED1C24" text-anchor="middle" letter-spacing="1">SanDisk</text>
    </svg>`
  },
  {
    slug: 'vstarcam',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <circle cx="26" cy="30" r="15" fill="#0284C7"/>
      <circle cx="26" cy="30" r="6" fill="#FFFFFF"/>
      <text x="48" y="38" font-family="Arial Black, sans-serif" font-size="20" font-weight="900" fill="#0369A1" letter-spacing="0.5">VSTARCAM</text>
    </svg>`
  },
  {
    slug: 'soundpeats',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <rect x="14" y="15" width="30" height="30" rx="8" fill="#18181B"/>
      <text x="29" y="36" font-family="Arial, sans-serif" font-size="18" font-weight="900" fill="#EAB308" text-anchor="middle">S</text>
      <text x="50" y="38" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="900" fill="#18181B">SOUNDPEATS</text>
    </svg>`
  },
  {
    slug: 'sky-mobile',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <circle cx="26" cy="30" r="14" fill="#0EA5E9"/>
      <path d="M20 33 Q26 23 32 33" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
      <text x="48" y="37" font-family="Arial Black, sans-serif" font-size="20" font-weight="900" fill="#0369A1">SKY MOBILE</text>
    </svg>`
  },
  {
    slug: 'ugreen',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <text x="100" y="39" font-family="Arial Black, Impact, sans-serif" font-size="29" font-weight="900" fill="#00B259" text-anchor="middle" letter-spacing="2">UGREEN</text>
    </svg>`
  },
  {
    slug: 'sony',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <text x="100" y="41" font-family="'Times New Roman', Georgia, serif" font-size="36" font-weight="900" fill="#000000" text-anchor="middle" letter-spacing="6">SONY</text>
    </svg>`
  },
  {
    slug: 'pluzz',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <rect x="14" y="15" width="30" height="30" rx="8" fill="#E11D48"/>
      <path d="M29 20 L29 40 M19 30 L39 30" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/>
      <text x="52" y="38" font-family="Arial Black, sans-serif" font-size="24" font-weight="900" fill="#0F172A" letter-spacing="1.5">PLUZZ</text>
    </svg>`
  },
  {
    slug: 'nokia',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <text x="100" y="40" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="900" fill="#124191" text-anchor="middle" letter-spacing="4">NOKIA</text>
    </svg>`
  },
  {
    slug: 'hmd',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <rect x="15" y="15" width="170" height="30" rx="6" fill="#0F172A"/>
      <text x="100" y="37" font-family="Arial Black, sans-serif" font-size="20" font-weight="900" fill="#22C55E" text-anchor="middle" letter-spacing="3">HMD</text>
    </svg>`
  },
  {
    slug: 'softlogic',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <circle cx="25" cy="30" r="14" fill="#0284C7"/>
      <text x="46" y="38" font-family="Arial, Helvetica, sans-serif" font-size="23" font-weight="800" fill="#0F172A">softlogic</text>
    </svg>`
  },
  {
    slug: 'hono',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <text x="100" y="39" font-family="Arial Black, sans-serif" font-size="28" font-weight="900" fill="#0284C7" text-anchor="middle" letter-spacing="3">HONOR</text>
    </svg>`
  },
  {
    slug: 'greentel',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <circle cx="26" cy="30" r="14" fill="#16A34A"/>
      <path d="M22 30 Q26 20 30 30" fill="none" stroke="#FFFFFF" stroke-width="2.5"/>
      <text x="48" y="38" font-family="Arial, Helvetica, sans-serif" font-size="23" font-weight="800" fill="#16A34A">Greentel</text>
    </svg>`
  },
  {
    slug: 'samsung',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <ellipse cx="100" cy="30" rx="90" ry="24" fill="#034EA2"/>
      <text x="100" y="38" font-family="Arial, Helvetica, sans-serif" font-size="21" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">SAMSUNG</text>
    </svg>`
  },
  {
    slug: 'microlab',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <circle cx="26" cy="30" r="14" fill="#DC2626"/>
      <path d="M21 34 L21 26 L26 31 L31 26 L31 34" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
      <text x="48" y="38" font-family="Arial, Helvetica, sans-serif" font-size="23" font-weight="800" fill="#0F172A">microlab</text>
    </svg>`
  },
  {
    slug: 'hoioto',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <rect x="14" y="16" width="28" height="28" rx="6" fill="#2563EB"/>
      <text x="28" y="35" font-family="Arial, sans-serif" font-size="14" font-weight="900" fill="#FFFFFF" text-anchor="middle">H</text>
      <text x="48" y="38" font-family="Arial Black, sans-serif" font-size="24" font-weight="900" fill="#0F172A" letter-spacing="1">HOIOTO</text>
    </svg>`
  },
  {
    slug: 'aoc',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <text x="100" y="42" font-family="Arial Black, Impact, sans-serif" font-size="38" font-weight="900" fill="#DC2626" text-anchor="middle" letter-spacing="4">ЛОС</text>
    </svg>`
  },
  {
    slug: 'hiksemi',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <rect x="12" y="15" width="30" height="30" rx="6" fill="#0284C7"/>
      <rect x="18" y="21" width="18" height="18" fill="none" stroke="#FFFFFF" stroke-width="2.5"/>
      <text x="48" y="38" font-family="Arial Black, sans-serif" font-size="22" font-weight="900" fill="#0284C7" letter-spacing="1">HIKSEMI</text>
    </svg>`
  },
  {
    slug: 'mikorean',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
      <circle cx="26" cy="30" r="14" fill="#EF4444"/>
      <text x="26" y="36" font-family="Arial, sans-serif" font-size="14" font-weight="900" fill="#FFFFFF" text-anchor="middle">M</text>
      <text x="48" y="38" font-family="Arial, Helvetica, sans-serif" font-size="23" font-weight="800" fill="#0F172A">Mikorean</text>
    </svg>`
  }
];

// Target directories
const targetDirs = [
  path.join(process.cwd(), 'apps', 'storefront', 'public', 'media', 'brands'),
  path.join(process.cwd(), 'public', 'media', 'brands'),
];

for (const dir of targetDirs) {
  if (fs.existsSync(path.dirname(dir))) {
    fs.mkdirSync(dir, { recursive: true });
    for (const b of brands) {
      const filePath = path.join(dir, `${b.slug}-logo.svg`);
      fs.writeFileSync(filePath, b.svg.trim(), 'utf-8');
    }
  }
}

console.log(`Generated ${brands.length} brand SVGs in media/brands/`);
