// Mnemos Mock Data
// Time range: 1700-2000
// Upper region: Historical events (collective memory) - silver/cool
// Lower region: Personal events (individual memory) - gold/warm

export const TIME_RANGE = {
  start: 1700,
  end: 2000
};

// Historical events - collective memory (weight: visual importance 0.2-1.0)
export const historicalEvents = {
  // 1700: 3 historical events
  1700: [
    { id: 'h1700-1', title: '大北方战争爆发', intensity: 0.9, weight: 0.9 },
    { id: 'h1700-2', title: '普鲁士王国成立', intensity: 0.8, weight: 0.75 },
    { id: 'h1700-3', title: '西班牙王位继承战争', intensity: 0.85, weight: 0.8 }
  ],
  
  // 1800-1850: 10 historical events (some years mixed, some empty)
  1800: [
    { id: 'h1800-1', title: '拿破仑成为第一执政', intensity: 0.95, weight: 1.0 }
  ],
  1804: [
    { id: 'h1804-1', title: '拿破仑加冕称帝', intensity: 1.0, weight: 1.0 }
  ],
  1805: [
    { id: 'h1805-1', title: '特拉法加海战', intensity: 0.9, weight: 0.85 }
  ],
  1812: [
    { id: 'h1812-1', title: '拿破仑入侵俄国', intensity: 0.95, weight: 0.95 }
  ],
  1815: [
    { id: 'h1815-1', title: '滑铁卢战役', intensity: 1.0, weight: 1.0 },
    { id: 'h1815-2', title: '维也纳会议', intensity: 0.85, weight: 0.8 }
  ],
  1825: [
    { id: 'h1825-1', title: '第一条铁路在英国开通', intensity: 0.8, weight: 0.75 }
  ],
  1830: [
    { id: 'h1830-1', title: '七月革命', intensity: 0.85, weight: 0.8 }
  ],
  1839: [
    { id: 'h1839-1', title: '第一次鸦片战争', intensity: 0.9, weight: 0.85 }
  ],
  1848: [
    { id: 'h1848-1', title: '《共产党宣言》发表', intensity: 0.95, weight: 0.9 }
  ],
  
  // 1850-1900: 5 historical events
  1853: [
    { id: 'h1853-1', title: '克里米亚战争', intensity: 0.85, weight: 0.8 }
  ],
  1861: [
    { id: 'h1861-1', title: '美国内战爆发', intensity: 0.95, weight: 0.9 }
  ],
  1870: [
    { id: 'h1870-1', title: '普法战争', intensity: 0.9, weight: 0.85 }
  ],
  1880: [
    { id: 'h1880-1', title: '爱迪生发明白炽灯', intensity: 0.9, weight: 0.9 }
  ],
  1894: [
    { id: 'h1894-1', title: '甲午战争爆发', intensity: 0.9, weight: 0.9 }
  ],
  
  // 1900-2000: 3 historical events
  1914: [
    { id: 'h1914-1', title: '第一次世界大战爆发', intensity: 1.0, weight: 1.0 }
  ],
  1945: [
    { id: 'h1945-1', title: '第二次世界大战结束', intensity: 1.0, weight: 1.0 }
  ],
  1969: [
    { id: 'h1969-1', title: '人类首次登月', intensity: 0.95, weight: 0.95 }
  ]
};

// Personal events - individual memory (weight: visual importance 0.2-1.0)
export const personalEvents = {
  // 1700: 2 personal events
  1700: [
    { id: 'p1700-1', person: 'Bach', action: '开始创作管风琴作品', intensity: 0.8, weight: 0.75 },
    { id: 'p1700-2', person: 'Newton', action: '发表《光学》', intensity: 0.85, weight: 0.8 }
  ],
  
  // 1800-1850: 10 personal events (some years mixed, some empty)
  1805: [
    { id: 'p1805-1', person: 'Beethoven', action: '创作《第三交响曲》', intensity: 0.9, weight: 0.85 }
  ],
  1809: [
    { id: 'p1809-1', person: 'Darwin', action: '出生于什鲁斯伯里', intensity: 0.8, weight: 0.75 },
    { id: 'p1809-2', person: 'Lincoln', action: '出生于肯塔基', intensity: 0.75, weight: 0.7 }
  ],
  1810: [
    { id: 'p1810-1', person: 'Chopin', action: '出生于波兰', intensity: 0.8, weight: 0.75 }
  ],
  1812: [
    { id: 'p1812-1', person: 'Dickens', action: '出生于朴茨茅斯', intensity: 0.75, weight: 0.7 }
  ],
  1818: [
    { id: 'p1818-1', person: 'Marx', action: '出生于特里尔', intensity: 0.85, weight: 0.8 }
  ],
  1828: [
    { id: 'p1828-1', person: 'Tolstoy', action: '出生于图拉', intensity: 0.8, weight: 0.75 }
  ],
  1830: [
    { id: 'p1830-1', person: 'Van Gogh', action: '出生于荷兰', intensity: 0.75, weight: 0.7 }
  ],
  1835: [
    { id: 'p1835-1', person: 'Twain', action: '出生于密苏里', intensity: 0.7, weight: 0.65 }
  ],
  1844: [
    { id: 'p1844-1', person: 'Nietzsche', action: '出生于普鲁士', intensity: 0.85, weight: 0.8 }
  ],
  
  // 1850-1900: 5 personal events
  1856: [
    { id: 'p1856-1', person: 'Freud', action: '出生于摩拉维亚', intensity: 0.8, weight: 0.75 }
  ],
  1859: [
    { id: 'p1859-1', person: 'Darwin', action: '发表《物种起源》', intensity: 0.95, weight: 0.9 }
  ],
  1879: [
    { id: 'p1879-1', person: 'Einstein', action: '出生于德国', intensity: 0.9, weight: 0.85 }
  ],
  1888: [
    { id: 'p1888-1', person: 'Van Gogh', action: '割下左耳', intensity: 0.95, weight: 1.0 }
  ],
  1890: [
    { id: 'p1890-1', person: 'Van Gogh', action: '饮弹自尽', intensity: 1.0, weight: 1.0 }
  ],
  
  // 1900-2000: 2 personal events
  1905: [
    { id: 'p1905-1', person: 'Einstein', action: '发表狭义相对论', intensity: 0.95, weight: 0.95 }
  ],
  1920: [
    { id: 'p1920-1', person: 'Fitzgerald', action: '出版《了不起的盖茨比》', intensity: 0.85, weight: 0.8 }
  ]
};
