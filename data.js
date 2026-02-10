// Mnemos Mock Data
// Time range: 1880-1900
// Upper region: Historical events (collective memory) - silver/cool
// Lower region: Personal events (individual memory) - gold/warm

export const TIME_RANGE = {
  start: 1880,
  end: 1900
};

// Historical events - collective memory
export const historicalEvents = {
  1880: [
    { id: 'h1880-1', title: '爱迪生发明白炽灯', intensity: 0.9 }
  ],
  1881: [
    { id: 'h1881-1', title: '巴拿马运河动工', intensity: 0.7 }
  ],
  1882: [
    { id: 'h1882-1', title: '三国同盟成立', intensity: 0.8 },
    { id: 'h1882-2', title: '科赫发现结核杆菌', intensity: 0.6 }
  ],
  1883: [
    { id: 'h1883-1', title: '喀拉喀托火山爆发', intensity: 0.95 }
  ],
  1884: [
    { id: 'h1884-1', title: '柏林会议瓜分非洲', intensity: 0.85 }
  ],
  1885: [
    { id: 'h1885-1', title: '巴斯德狂犬病疫苗', intensity: 0.8 }
  ],
  1886: [
    { id: 'h1886-1', title: '自由女神像落成', intensity: 0.9 },
    { id: 'h1886-2', title: '可口可乐诞生', intensity: 0.5 }
  ],
  1887: [
    { id: 'h1887-1', title: '黄河决口', intensity: 0.85 }
  ],
  1888: [
    { id: 'h1888-1', title: '开膛手杰克案件', intensity: 0.7 }
  ],
  1889: [
    { id: 'h1889-1', title: '埃菲尔铁塔建成', intensity: 0.95 },
    { id: 'h1889-2', title: '第二国际成立', intensity: 0.6 }
  ],
  1890: [
    { id: 'h1890-1', title: '俾斯麦下台', intensity: 0.8 }
  ],
  1891: [
    { id: 'h1891-1', title: '西伯利亚铁路动工', intensity: 0.75 }
  ],
  1892: [
    { id: 'h1892-1', title: '埃利斯岛移民站开放', intensity: 0.7 }
  ],
  1893: [
    { id: 'h1893-1', title: '新西兰女性获投票权', intensity: 0.85 },
    { id: 'h1893-2', title: '芝加哥世博会', intensity: 0.7 }
  ],
  1894: [
    { id: 'h1894-1', title: '甲午战争爆发', intensity: 0.9 },
    { id: 'h1894-2', title: '德雷福斯案件', intensity: 0.65 }
  ],
  1895: [
    { id: 'h1895-1', title: '马关条约签订', intensity: 0.85 },
    { id: 'h1895-2', title: '伦琴发现X射线', intensity: 0.9 }
  ],
  1896: [
    { id: 'h1896-1', title: '首届现代奥运会', intensity: 0.95 },
    { id: 'h1896-2', title: '居里夫人发现放射性', intensity: 0.85 }
  ],
  1897: [
    { id: 'h1897-1', title: '德国占领胶州湾', intensity: 0.7 }
  ],
  1898: [
    { id: 'h1898-1', title: '戊戌变法', intensity: 0.9 },
    { id: 'h1898-2', title: '美西战争', intensity: 0.8 }
  ],
  1899: [
    { id: 'h1899-1', title: '海牙和平会议', intensity: 0.6 },
    { id: 'h1899-2', title: '义和团运动兴起', intensity: 0.85 }
  ],
  1900: [
    { id: 'h1900-1', title: '八国联军侵华', intensity: 0.95 },
    { id: 'h1900-2', title: '普朗克量子论', intensity: 0.9 }
  ]
};

// Personal events - individual memory
export const personalEvents = {
  1880: [
    { id: 'p1880-1', person: 'Van Gogh', action: '开始学习绘画', intensity: 0.6 }
  ],
  1881: [
    { id: 'p1881-1', person: 'Picasso', action: '出生于马拉加', intensity: 0.8 }
  ],
  1882: [
    { id: 'p1882-1', person: 'Van Gogh', action: '与妓女西恩同居', intensity: 0.7 },
    { id: 'p1882-2', person: 'Virginia Woolf', action: '出生于伦敦', intensity: 0.75 }
  ],
  1883: [
    { id: 'p1883-1', person: 'Kafka', action: '出生于布拉格', intensity: 0.8 }
  ],
  1884: [
    { id: 'p1884-1', person: 'Van Gogh', action: '创作《织布工》系列', intensity: 0.7 }
  ],
  1885: [
    { id: 'p1885-1', person: 'Van Gogh', action: '创作《吃土豆的人》', intensity: 0.9 }
  ],
  1886: [
    { id: 'p1886-1', person: 'Van Gogh', action: '抵达巴黎', intensity: 0.85 },
    { id: 'p1886-2', person: 'Emily Dickinson', action: '逝世', intensity: 0.9 }
  ],
  1887: [
    { id: 'p1887-1', person: 'Van Gogh', action: '创作《唐吉老爹》', intensity: 0.75 }
  ],
  1888: [
    { id: 'p1888-1', person: 'Van Gogh', action: '抵达阿尔勒', intensity: 0.85 },
    { id: 'p1888-2', person: 'Van Gogh', action: '割下左耳', intensity: 0.95 },
    { id: 'p1888-3', person: 'T.S. Eliot', action: '出生于圣路易斯', intensity: 0.7 }
  ],
  1889: [
    { id: 'p1889-1', person: 'Van Gogh', action: '创作《星夜》', intensity: 1.0 },
    { id: 'p1889-2', person: 'Wittgenstein', action: '出生于维也纳', intensity: 0.75 },
    { id: 'p1889-3', person: 'Hitler', action: '出生于奥地利', intensity: 0.6 }
  ],
  1890: [
    { id: 'p1890-1', person: 'Van Gogh', action: '饮弹自尽', intensity: 1.0 },
    { id: 'p1890-2', person: 'Eisenhower', action: '出生于德克萨斯', intensity: 0.5 }
  ],
  1891: [
    { id: 'p1891-1', person: 'Rimbaud', action: '逝世于马赛', intensity: 0.85 }
  ],
  1892: [
    { id: 'p1892-1', person: 'Tolkien', action: '出生于南非', intensity: 0.7 }
  ],
  1893: [
    { id: 'p1893-1', person: 'Mao Zedong', action: '出生于湖南', intensity: 0.8 },
    { id: 'p1893-2', person: 'Tchaikovsky', action: '逝世', intensity: 0.85 }
  ],
  1894: [
    { id: 'p1894-1', person: 'Huxley', action: '出生于英国', intensity: 0.6 }
  ],
  1895: [
    { id: 'p1895-1', person: 'Freud', action: '出版《癔症研究》', intensity: 0.85 }
  ],
  1896: [
    { id: 'p1896-1', person: 'Fitzgerald', action: '出生于明尼苏达', intensity: 0.7 }
  ],
  1897: [
    { id: 'p1897-1', person: 'Brahms', action: '逝世于维也纳', intensity: 0.8 },
    { id: 'p1897-2', person: 'Faulkner', action: '出生于密西西比', intensity: 0.65 }
  ],
  1898: [
    { id: 'p1898-1', person: 'Mallarmé', action: '逝世', intensity: 0.75 },
    { id: 'p1898-2', person: 'Hemingway', action: '出生于伊利诺伊', intensity: 0.7 }
  ],
  1899: [
    { id: 'p1899-1', person: 'Borges', action: '出生于布宜诺斯艾利斯', intensity: 0.8 },
    { id: 'p1899-2', person: 'Nabokov', action: '出生于圣彼得堡', intensity: 0.75 }
  ],
  1900: [
    { id: 'p1900-1', person: 'Nietzsche', action: '逝世于魏玛', intensity: 0.95 },
    { id: 'p1900-2', person: 'Oscar Wilde', action: '逝世于巴黎', intensity: 0.9 }
  ]
};
