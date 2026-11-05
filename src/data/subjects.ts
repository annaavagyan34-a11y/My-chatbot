import { ChatSession, SubjectConfig, SubjectType } from '../types';

export const SUBJECTS: SubjectConfig[] = [
  {
    id: 'all',
    name: 'Բոլոր առարկաները',
    shortName: 'Բոլորը',
    icon: 'Sparkles',
    description: 'Համակողմանի դպրոցական գիտելիքներ',
    badgeColorLight: 'text-violet-700 bg-violet-50 border-violet-200',
    badgeColorDark: 'text-violet-300 bg-violet-950/60 border-violet-800/40',
    accentColor: 'violet',
    promptPlaceholder: 'Տուր քո հարցը ցանկացած դպրոցական առարկայից...',
  },
  {
    id: 'math',
    name: 'Մաթեմատիկա և Հանրահաշիվ',
    shortName: 'Մաթեմատիկա',
    icon: 'Calculator',
    description: 'Հավասարումներ, երկրաչափություն, թվաբանություն',
    badgeColorLight: 'text-blue-700 bg-blue-50 border-blue-200',
    badgeColorDark: 'text-blue-300 bg-blue-950/60 border-blue-800/40',
    accentColor: 'blue',
    promptPlaceholder: 'Գրիր մաթեմատիկական խնդիրը կամ հավասարումը...',
  },
  {
    id: 'armenian',
    name: 'Հայոց լեզու և Գրականություն',
    shortName: 'Հայոց լեզու',
    icon: 'BookOpen',
    description: 'Քերականություն, շարահյուսություն, վերլուծություն',
    badgeColorLight: 'text-purple-700 bg-purple-50 border-purple-200',
    badgeColorDark: 'text-purple-300 bg-purple-950/60 border-purple-800/40',
    accentColor: 'purple',
    promptPlaceholder: 'Հարցրու քերականական կանոն, շարահյուսություն կամ գրականություն...',
  },
  {
    id: 'history',
    name: 'Հայոց պատմություն և Համաշխարհային',
    shortName: 'Պատմություն',
    icon: 'Landmark',
    description: 'Տարեթվեր, ճակատամարտեր, թագավորներ, փաստեր',
    badgeColorLight: 'text-amber-800 bg-amber-50 border-amber-200',
    badgeColorDark: 'text-amber-300 bg-amber-950/60 border-amber-800/40',
    accentColor: 'amber',
    promptPlaceholder: 'Հարցրու պատմական դեպքերի, թագավորների կամ տարեթվերի մասին...',
  },
  {
    id: 'physics',
    name: 'Ֆիզիկա և Աստղագիտություն',
    shortName: 'Ֆիզիկա',
    icon: 'Atom',
    description: 'Օրենքներ, բանաձևեր, մեխանիկա, երևույթներ',
    badgeColorLight: 'text-cyan-800 bg-cyan-50 border-cyan-200',
    badgeColorDark: 'text-cyan-300 bg-cyan-950/60 border-cyan-800/40',
    accentColor: 'cyan',
    promptPlaceholder: 'Գրիր ֆիզիկայի խնդիրը կամ օրենքը, որը ցանկանում ես հասկանալ...',
  },
  {
    id: 'chemistry',
    name: 'Քիմիա',
    shortName: 'Քիմիա',
    icon: 'FlaskConical',
    description: 'Ռեակցիաներ, տարրեր, հավասարումներ, մոլեկուլներ',
    badgeColorLight: 'text-emerald-800 bg-emerald-50 border-emerald-200',
    badgeColorDark: 'text-emerald-300 bg-emerald-950/60 border-emerald-800/40',
    accentColor: 'emerald',
    promptPlaceholder: 'Գրիր ռեակցիայի հավասարումը կամ քիմիայի հարցը...',
  },
  {
    id: 'biology',
    name: 'Կենսաբանություն և Բնագիտություն',
    shortName: 'Կենսաբանություն',
    icon: 'Dna',
    description: 'Բջիջ, մարդու օրգանիզմ, կենդանիներ, բույսեր',
    badgeColorLight: 'text-rose-700 bg-rose-50 border-rose-200',
    badgeColorDark: 'text-rose-300 bg-rose-950/60 border-rose-800/40',
    accentColor: 'rose',
    promptPlaceholder: 'Հարցրու բջջի կառուցվածքի, մարդու օրգանիզմի կամ բնության մասին...',
  },
  {
    id: 'geography',
    name: 'Աշխարհագրություն',
    shortName: 'Աշխարհագրություն',
    icon: 'Globe2',
    description: 'Մայրցամաքներ, օվկիանոսներ, կլիմա, երկրներ',
    badgeColorLight: 'text-teal-800 bg-teal-50 border-teal-200',
    badgeColorDark: 'text-teal-300 bg-teal-950/60 border-teal-800/40',
    accentColor: 'teal',
    promptPlaceholder: 'Հարցրու աշխարհագրական դիրքի, կլիմայի կամ երկրների մասին...',
  },
  {
    id: 'cs',
    name: 'Ինֆորմատիկա և Ծրագրավորում',
    shortName: 'Ինֆորմատիկա',
    icon: 'Code2',
    description: 'Ալգորիթմներ, Python, համակարգիչներ, կոդ',
    badgeColorLight: 'text-sky-800 bg-sky-50 border-sky-200',
    badgeColorDark: 'text-sky-300 bg-sky-950/60 border-sky-800/40',
    accentColor: 'sky',
    promptPlaceholder: 'Հարցրու ալգորիթմների, Python կոդի կամ համակարգչի մասին...',
  },
  {
    id: 'english',
    name: 'Օտար լեզուներ (Անգլերեն)',
    shortName: 'Անգլերեն',
    icon: 'Languages',
    description: 'Քերականություն, ժամանակաձևեր, բառապաշար',
    badgeColorLight: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    badgeColorDark: 'text-indigo-300 bg-indigo-950/60 border-indigo-800/40',
    accentColor: 'indigo',
    promptPlaceholder: 'Հարցրու անգլերենի քերականության կամ թարգմանության մասին...',
  },
];

export interface SuggestedPrompt {
  id: string;
  subject: string;
  subjectId: string;
  title: string;
  prompt: string;
  tag: string;
}

export const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  {
    id: 'math-1',
    subject: 'Մաթեմատիկա',
    subjectId: 'math',
    title: 'Քառակուսային հավասարում',
    prompt: 'Բացատրիր 2x² - 4x - 6 = 0 քառակուսային հավասարման լուծումը քայլ առ քայլ՝ դիսկրիմինանտի միջոցով։',
    tag: 'Հանրահաշիվ',
  },
  {
    id: 'armenian-1',
    subject: 'Հայոց լեզու',
    subjectId: 'armenian',
    title: 'Ենթակա և Ստորոգյալ',
    prompt: 'Ի՞նչ է ենթական և ստորոգյալը նախադասության մեջ։ Բացատրիր տարբերությունը և բեր 3 պարզ օրինակ։',
    tag: 'Քերականություն',
  },
  {
    id: 'history-1',
    subject: 'Պատմություն',
    subjectId: 'history',
    title: 'Ավարայրի ճակատամարտ',
    prompt: 'Ե՞րբ է տեղի ունեցել Ավարայրի ճակատամարտը (451 թ.), ովքե՞ր էին գլխավոր առաջնորդները և ի՞նչ նշանակություն ունեցավ։',
    tag: 'Հայոց Պատմություն',
  },
  {
    id: 'physics-1',
    subject: 'Ֆիզիկա',
    subjectId: 'physics',
    title: 'Արքիմեդի օրենքը',
    prompt: 'Ի՞նչ է Արքիմեդի օրենքը (դուրս մղող ուժը)։ Բացատրիր պարզ կյանքի օրինակով՝ ինչո՞ւ են նավերը լողում ջրի վրա։',
    tag: 'Հիդրոստատիկա',
  },
  {
    id: 'chemistry-1',
    subject: 'Քիմիա',
    subjectId: 'chemistry',
    title: 'Քիմիական ռեակցիաների տեսակները',
    prompt: 'Որո՞նք են քիմիական ռեակցիաների հիմնական 4 տեսակները (միացման, քայքայման, տեղակալման, փոխանակման)։ Բեր օրինակներ։',
    tag: 'Ռեակցիաներ',
  },
  {
    id: 'biology-1',
    subject: 'Կենսաբանություն',
    subjectId: 'biology',
    title: 'Ֆոտոսինթեզի գաղտնիքը',
    prompt: 'Ի՞նչ է ֆոտոսինթեզը, ինչպե՞ս են բույսերը արևի լույսից ստանում սնունդ և թթվածին արտադրում։ Բացատրիր դպրոցականին։',
    tag: 'Բուսաբանություն',
  },
  {
    id: 'geography-1',
    subject: 'Աշխարհագրություն',
    subjectId: 'geography',
    title: 'Երկրի ներքին կառուցվածքը',
    prompt: 'Ի՞նչ շերտերից է կազմված Երկիր մոլորակը (կեղև, մանթիա, միջուկ) և ինչպե՞ս են առաջանում երկրաշարժերը։',
    tag: 'Երկրաբանություն',
  },
  {
    id: 'english-1',
    subject: 'Անգլերեն',
    subjectId: 'english',
    title: 'Present Perfect vs Past Simple',
    prompt: 'Ինչո՞վ են տարբերվում Present Perfect և Past Simple ժամանակաձևերը։ Բացատրիր հայերենով և բեր զույգ օրինակներ։',
    tag: 'Քերականություն',
  },
];

export const createFreshSession = (subject: SubjectType = 'all'): ChatSession => ({
  id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  title: 'Նոր զրույց',
  subject,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  messages: [],
});

export const INITIAL_EMPTY_CHAT: ChatSession = {
  id: 'chat-initial-empty',
  title: 'Նոր զրույց',
  subject: 'all',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  messages: [],
};

export const INITIAL_SAMPLE_CHAT = {
  id: 'sample-math-1',
  title: 'Քառակուսային հավասարման քայլ առ քայլ լուծում',
  subject: 'math' as const,
  createdAt: Date.now() - 3600000,
  updatedAt: Date.now() - 3600000,

  messages: [
    {
      id: 'msg-1',
      role: 'user' as const,
      content: 'Բարև, խնդրում եմ քայլ առ քայլ բացատրիր, թե ինչպես լուծել 2x² - 4x - 6 = 0 հավասարումը։',
      timestamp: Date.now() - 3500000,
      subject: 'math' as const,
    },
    {
      id: 'msg-2',
      role: 'assistant' as const,
      content: `Ողջո՛ւյն: Սիրով օգնեմ քեզ քայլ առ քայլ լուծել այս քառակուսային հավասարումը: 📐

Մեր հավասարումն է.
\`2x² - 4x - 6 = 0\`

---

### 📌 Քայլ 1. Գտնենք հավասարման գործակիցները
Քառակուսային հավասարման ընդհանուր տեսքն է\` \`ax² + bx + c = 0\`
Մեր դեպքում.
- **a = 2**
- **b = -4**
- **c = -6**

> 💡 *Հուշում.* Քանի որ բոլոր գործակիցները (2, -4, -6) զույգ են, կարող ենք հավասարման երկու կողմը բաժանել 2-ի\` \`x² - 2x - 3 = 0\`: Սակայն եկ լուծենք նաև դասական դիսկրիմինանտի (D) բանաձևով, որպեսզի միշտ իմանաս ընդհանուր մեթոդը:

---

### 🔢 Քայլ 2. Հաշվենք դիսկրիմինանտը (D)
Բանաձևը.
\`D = b² - 4ac\`

Տեղադրենք թվերը.
\`D = (-4)² - 4 · 2 · (-6)\`
\`D = 16 - (-48)\`
\`D = 16 + 48 = 64\`

Քանի որ **D > 0**, հավասարումն ունի **երկու իրարից տարբեր արմատներ**:
Իսկ \`√D = √64 = 8\`:

---

### 🎯 Քայլ 3. Գտնենք արմատները (x₁ և x₂)
Արմատների բանաձևը.
\`x = (-b ± √D) / (2a)\`

Քանի որ \`b = -4\`, ապա \`-b = 4\`:

1. **Առաջին արմատ (x₁)**.
   \`x₁ = (4 + 8) / (2 · 2) = 12 / 4 = 3\`

2. **Երկրորդ արմատ (x₂)**.
   \`x₂ = (4 - 8) / (2 · 2) = -4 / 4 = -1\`

---

### ✅ Ստուգում
Տեղադրենք ստացված x = 3 արժեքը սկզբնական հավասարման մեջ.
\`2 · (3)² - 4 · (3) - 6 = 2 · 9 - 12 - 6 = 18 - 18 = 0\` ✔️

---

### 🏆 Վերջնական պատասխան
Հավասարման արմատներն են\` **x₁ = 3**, **x₂ = -1**:

✨ *Ամրապնդելու համար փորձի՛ր ինքնուրույն լուծել \`x² - 5x + 6 = 0\` հավասարումը: Եթե հարց լինի, գրի՛ր, միասին կստուգենք:*`,
      timestamp: Date.now() - 3400000,
      subject: 'math' as const,
    },
  ],
};
