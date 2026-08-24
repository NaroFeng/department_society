/**
 * AvatarRenderer.js — Q版動漫向量渲染引擎 (v2.3 - 淚痣版位微調版)
 *
 * [升級內容]
 * 1. 座標校準：將 mole (淚痣) 往左下角偏移，貼近眼尾與臉頰邊界，增強視覺氛圍感。
 */

(function (global) {
  'use strict';

  const ColorEngine = {
    hexToHSL(hex) {
      if (!hex || typeof hex !== 'string' || hex[0] !== '#') return [0, 0, 0];
      let c = hex.substring(1);
      if (c.length === 3) c = c.split('').map(x => x + x).join('');
      if (c.length !== 6) return [0, 0, 0];
      let r = parseInt(c.slice(0, 2), 16) / 255, g = parseInt(c.slice(2, 4), 16) / 255, b = parseInt(c.slice(4, 6), 16) / 255;
      let max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;
      if (max !== min) {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }
      return [h * 360, s * 100, l * 100];
    },
    hslToHex(h, s, l) {
      l /= 100;
      const a = s * Math.min(l, 1 - l) / 100;
      const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
      };
      return `#${f(0)}${f(8)}${f(4)}`;
    },
    getShadow(hex) {
      if (!hex || hex === 'none') return hex;
      let [h, s, l] = this.hexToHSL(hex);
      return this.hslToHex((h + 10) % 360, Math.min(s * 1.2, 100), Math.max(l * 0.75, 0));
    },
    getHighlight(hex) {
      if (!hex || hex === 'none') return hex;
      let [h, s, l] = this.hexToHSL(hex);
      return this.hslToHex((h - 8 + 360) % 360, s * 0.8, Math.min(l * 1.3, 100));
    },
    getLineArt(hex) { 
      if (!hex || hex === 'none' || hex === '#ffffff') return '#9fa6b2'; 
      let [h, s, l] = this.hexToHSL(hex);
      return this.hslToHex((h + 5) % 360, Math.min(s * 1.2, 100), Math.max(l * 0.45, 0));
    }
  };

  const ANCHORS = {
    FACE_CENTER: { x: 100, y: 115 }, 
    EYE_L:     { x: -22, y: 8 },   
    EYE_R:     { x: 22,  y: 8 },
    EYEBROW_L: { x: -22, y: -10 },
    EYEBROW_R: { x: 22,  y: -10 },
    MOUTH:     { x: 0,   y: 26 },  
    BLUSH_L:   { x: -28, y: 18 },
    BLUSH_R:   { x: 28,  y: 18 },
    HAIRPIN:   { x: -32, y: -45 }
  };

  const EYES = {
    round: { name: '圓眼', icon: '⚫', paths: [
      { type: 'circle', cx: 0, cy: 0, r: 11, fill: '#ffffff' },
      { type: 'circle', cx: 0, cy: 0, r: 9, fill: 'VAR_EYE_DARK' },
      { type: 'circle', cx: -3, cy: -3, r: 3.5, fill: '#ffffff', stroke: 'none' },
      { type: 'path', d: 'M -14 -3 Q 0 -12 14 -3', stroke: 'VAR_HAIR_DARK', fill: 'none', strokeWidth: 2.5 }
    ]},
    closed: { name: '瞇眼', icon: '⌒', paths: [
      { type: 'path', d: 'M -12 2 Q 0 -6 12 2', stroke: 'VAR_HAIR_DARK', fill: 'none', strokeWidth: 3.5 }
    ]},
    gem: { name: '星空寶石', icon: '✨', paths: [
      { type: 'ellipse', cx: 0, cy: 0, rx: 14, ry: 12, fill: '#ffffff' },
      { type: 'ellipse', cx: 0, cy: 1, rx: 11, ry: 10, fill: 'VAR_EYE' },
      { type: 'path', d: 'M -9 4 A 10 9 0 0 0 9 4 A 7 7 0 0 1 -9 4', fill: 'VAR_EYE_LIGHT', stroke: 'none' },
      { type: 'ellipse', cx: 0, cy: 0, rx: 5, ry: 7, fill: 'VAR_EYE_DARK' },
      { type: 'circle', cx: -4, cy: -3, r: 3.5, fill: '#ffffff', stroke: 'none' },
      { type: 'circle', cx: 5, cy: 4, r: 1.5, fill: '#ffffff', stroke: 'none', opacity: 0.8 },
      { type: 'path', d: 'M -15 -3 Q 0 -15 15 -3', stroke: 'VAR_HAIR_DARK', fill: 'none', strokeWidth: 3 }
    ]},
    drooping: { name: '無辜下垂', icon: '🥺', 
      left: [
        { type: 'ellipse', cx: 0, cy: 0, rx: 14, ry: 11, fill: '#ffffff' }, 
        { type: 'ellipse', cx: 0, cy: 1, rx: 10, ry: 9, fill: 'VAR_EYE' }, 
        { type: 'ellipse', cx: 0, cy: 1, rx: 5, ry: 6, fill: 'VAR_EYE_DARK' }, 
        { type: 'circle', cx: -4, cy: -2, r: 3.5, fill: '#ffffff', stroke: 'none' },
        { type: 'path', d: 'M -15 3 Q 0 -10 15 -2', stroke: 'VAR_HAIR_DARK', fill: 'none', strokeWidth: 3 }
      ],
      right: [
        { type: 'ellipse', cx: 0, cy: 0, rx: 14, ry: 11, fill: '#ffffff' }, 
        { type: 'ellipse', cx: 0, cy: 1, rx: 10, ry: 9, fill: 'VAR_EYE' }, 
        { type: 'ellipse', cx: 0, cy: 1, rx: 5, ry: 6, fill: 'VAR_EYE_DARK' }, 
        { type: 'circle', cx: -4, cy: -2, r: 3.5, fill: '#ffffff', stroke: 'none' },
        { type: 'path', d: 'M -15 -2 Q 0 -10 15 3', stroke: 'VAR_HAIR_DARK', fill: 'none', strokeWidth: 3 }
      ]
    },
    star: { name: '閃耀星星', icon: '⭐', paths: [
      { type: 'ellipse', cx: 0, cy: 0, rx: 14, ry: 12, fill: '#ffffff' },
      { type: 'ellipse', cx: 0, cy: 1, rx: 11, ry: 10, fill: 'VAR_EYE' },
      { type: 'path', d: 'M -5 -6 L 0 -1 L 5 -6 L 2 2 L 7 5 L 0 3 L -7 5 L -2 2 Z', fill: '#ffd54a', stroke: 'none' }, 
      { type: 'path', d: 'M -15 -3 Q 0 -15 15 -3', stroke: 'VAR_HAIR_DARK', fill: 'none', strokeWidth: 3 }
    ]},
    wink: { name: '寶石眨眼', icon: '😉', left: [
      { type: 'ellipse', cx: 0, cy: 0, rx: 14, ry: 12, fill: '#ffffff' },
      { type: 'ellipse', cx: 0, cy: 1, rx: 11, ry: 10, fill: 'VAR_EYE' },
      { type: 'ellipse', cx: 0, cy: 0, rx: 5, ry: 7, fill: 'VAR_EYE_DARK' },
      { type: 'circle', cx: -4, cy: -3, r: 3.5, fill: '#ffffff', stroke: 'none' },
      { type: 'path', d: 'M -15 -3 Q 0 -15 15 -3', stroke: 'VAR_HAIR_DARK', fill: 'none', strokeWidth: 3 }
    ], right: [
      { type: 'path', d: 'M -12 2 Q 0 -6 12 2', stroke: 'VAR_HAIR_DARK', fill: 'none', strokeWidth: 3.5 }
    ]},
    sharp: { name: '銳利', icon: '😠', 
      left: [
        { type: 'ellipse', cx: 0, cy: 1, rx: 12, ry: 6, fill: '#ffffff' },
        { type: 'ellipse', cx: 0, cy: 1, rx: 6, ry: 5, fill: 'VAR_EYE' },
        { type: 'ellipse', cx: 0, cy: 1, rx: 3, ry: 3, fill: 'VAR_EYE_DARK' },
        { type: 'circle', cx: -2, cy: -1, r: 1.5, fill: '#ffffff', stroke: 'none' },
        { type: 'path', d: 'M -14 -2 Q 0 -6 14 2', stroke: 'VAR_HAIR_DARK', fill: 'none', strokeWidth: 3.5 }
      ],
      right: [
        { type: 'ellipse', cx: 0, cy: 1, rx: 12, ry: 6, fill: '#ffffff' },
        { type: 'ellipse', cx: 0, cy: 1, rx: 6, ry: 5, fill: 'VAR_EYE' },
        { type: 'ellipse', cx: 0, cy: 1, rx: 3, ry: 3, fill: 'VAR_EYE_DARK' },
        { type: 'circle', cx: -2, cy: -1, r: 1.5, fill: '#ffffff', stroke: 'none' },
        { type: 'path', d: 'M -14 2 Q 0 -6 14 -2', stroke: 'VAR_HAIR_DARK', fill: 'none', strokeWidth: 3.5 }
      ]
    },
    deadpan: { name: '死魚眼', icon: '😑', paths: [
      { type: 'path', d: 'M -12 -1 L 12 -1 Q 12 7 0 7 Q -12 7 -12 -1 Z', fill: '#ffffff', stroke: 'none' },
      { type: 'circle', cx: 0, cy: 2, r: 4.5, fill: 'VAR_EYE' },
      { type: 'circle', cx: 0, cy: 2, r: 2, fill: 'VAR_EYE_DARK' },
      { type: 'path', d: 'M -14 -1 L 14 -1', stroke: 'VAR_HAIR_DARK', fill: 'none', strokeWidth: 3 }
    ]},
    // ---- 以下為新增的男性化眼型 ----
    // [重製] 自信：眼尾微挑，眼眶放大，瞳孔微側，帶有不羈感
    smug: { name: '自信', icon: '😏',
      left: [
        // 內眼角(13, 1)，外眼角(-13, -2) -> 眼尾上揚
        { type: 'path', d: 'M -13 -2 Q 0 -6 13 1 Q 0 4 -13 -2 Z', fill: '#ffffff', stroke: 'none' },
        { type: 'circle', cx: 2, cy: -0.5, r: 4.5, fill: 'VAR_EYE' },
        { type: 'circle', cx: 2, cy: -0.5, r: 2, fill: 'VAR_EYE_DARK' },
        { type: 'circle', cx: 0.5, cy: -2, r: 1.2, fill: '#ffffff', stroke: 'none' },
        { type: 'path', d: 'M -15 -3 Q 0 -8 14 0', stroke: 'VAR_HAIR_DARK', fill: 'none', strokeWidth: 3.5 }
      ],
      right: [
        // 內眼角(-13, 1)，外眼角(13, -2)
        { type: 'path', d: 'M 13 -2 Q 0 -6 -13 1 Q 0 4 13 -2 Z', fill: '#ffffff', stroke: 'none' },
        { type: 'circle', cx: -2, cy: -0.5, r: 4.5, fill: 'VAR_EYE' },
        { type: 'circle', cx: -2, cy: -0.5, r: 2, fill: 'VAR_EYE_DARK' },
        { type: 'circle', cx: -0.5, cy: -2, r: 1.2, fill: '#ffffff', stroke: 'none' },
        { type: 'path', d: 'M 15 -3 Q 0 -8 -14 0', stroke: 'VAR_HAIR_DARK', fill: 'none', strokeWidth: 3.5 }
      ]
    },
    // [重製] 冷酷：極致銳利的狹長眼型，加上淡淡的下眼瞼輪廓增加立體感
    piercing: { name: '冷酷', icon: '🗡️',
      left: [
        { type: 'path', d: 'M -14 -2 Q 0 -3 13 0 Q 0 3 -14 -2 Z', fill: '#ffffff', stroke: 'none' },
        { type: 'circle', cx: 0, cy: -0.5, r: 4, fill: 'VAR_EYE' },
        { type: 'circle', cx: 0, cy: -0.5, r: 1.5, fill: 'VAR_EYE_DARK' },
        { type: 'circle', cx: -1, cy: -1.5, r: 1, fill: '#ffffff', stroke: 'none' },
        { type: 'path', d: 'M -16 -2 Q 0 -4 14 0', stroke: 'VAR_HAIR_DARK', fill: 'none', strokeWidth: 4 }, // 粗黑平直上眼線
        { type: 'path', d: 'M -10 3 Q 0 4 10 1', stroke: 'VAR_HAIR_DARK', fill: 'none', strokeWidth: 1.5, opacity: 0.5 } // 下眼線輪廓
      ],
      right: [
        { type: 'path', d: 'M 14 -2 Q 0 -3 -13 0 Q 0 3 14 -2 Z', fill: '#ffffff', stroke: 'none' },
        { type: 'circle', cx: 0, cy: -0.5, r: 4, fill: 'VAR_EYE' },
        { type: 'circle', cx: 0, cy: -0.5, r: 1.5, fill: 'VAR_EYE_DARK' },
        { type: 'circle', cx: 1, cy: -1.5, r: 1, fill: '#ffffff', stroke: 'none' },
        { type: 'path', d: 'M 16 -2 Q 0 -4 -14 0', stroke: 'VAR_HAIR_DARK', fill: 'none', strokeWidth: 4 },
        { type: 'path', d: 'M 10 3 Q 0 4 -10 1', stroke: 'VAR_HAIR_DARK', fill: 'none', strokeWidth: 1.5, opacity: 0.5 }
      ]
    },
    // [重製] 狐狸：眼角大幅度上揚，眼眶加大，帶有斯文敗類的氣質
    fox: { name: '狐狸', icon: '🦊',
      left: [
        // 外眼角高(-15, -4)，內眼角低(14, 2)
        { type: 'path', d: 'M -15 -4 Q -2 -8 14 2 Q 2 4 -15 -4 Z', fill: '#ffffff', stroke: 'none' },
        { type: 'circle', cx: 0, cy: -1, r: 4.5, fill: 'VAR_EYE' },
        { type: 'circle', cx: 0, cy: -1, r: 2, fill: 'VAR_EYE_DARK' },
        { type: 'circle', cx: -1.5, cy: -2.5, r: 1.2, fill: '#ffffff', stroke: 'none' },
        { type: 'path', d: 'M -17 -4 Q -2 -10 15 2', stroke: 'VAR_HAIR_DARK', fill: 'none', strokeWidth: 3.5 } // 延伸眼尾
      ],
      right: [
        { type: 'path', d: 'M 15 -4 Q 2 -8 -14 2 Q -2 4 15 -4 Z', fill: '#ffffff', stroke: 'none' },
        { type: 'circle', cx: 0, cy: -1, r: 4.5, fill: 'VAR_EYE' },
        { type: 'circle', cx: 0, cy: -1, r: 2, fill: 'VAR_EYE_DARK' },
        { type: 'circle', cx: 1.5, cy: -2.5, r: 1.2, fill: '#ffffff', stroke: 'none' },
        { type: 'path', d: 'M 17 -4 Q 2 -10 -15 2', stroke: 'VAR_HAIR_DARK', fill: 'none', strokeWidth: 3.5 }
      ]
    },
    tired: { name: '疲憊', icon: '😮‍💨', paths: [
      { type: 'path', d: 'M -13 0 Q 0 -2 13 0 Q 0 6 -13 0 Z', fill: '#ffffff', stroke: 'none' },
      { type: 'circle', cx: 0, cy: 1, r: 3.5, fill: 'VAR_EYE' }, // 極小瞳孔
      { type: 'circle', cx: 0, cy: 1, r: 1.5, fill: 'VAR_EYE_DARK' },
      { type: 'circle', cx: -1, cy: 0, r: 0.8, fill: '#ffffff', stroke: 'none' },
      { type: 'path', d: 'M -14 -1 Q 0 -3 14 -1', stroke: 'VAR_HAIR_DARK', fill: 'none', strokeWidth: 3.5 }, // 平直無力的上眼皮
      { type: 'path', d: 'M -10 7 Q 0 11 10 7', stroke: '#a29bfe', fill: 'none', strokeWidth: 1.5, opacity: 0.6 } // 黑眼圈/臥蠶
    ]},
  };

  const MOUTHS = {
    flat:     { name: '平板', icon: '😐', paths: [ { type: 'path', d: 'M -5 0 L 5 0', stroke: '#c44569', fill: 'none', strokeWidth: 2.5 } ] },
    smile:    { name: '微笑', icon: '😊', paths: [ { type: 'path', d: 'M -6 0 Q 0 6 6 0', stroke: '#c44569', fill: 'none', strokeWidth: 2.5 } ] },
    cat:      { name: '貓嘴', icon: '😸', paths: [ { type: 'path', d: 'M -6 0 Q -3 4 0 0 Q 3 4 6 0', stroke: '#c44569', fill: 'none', strokeWidth: 2 } ] }, 
    triangle: { name: '傲嬌', icon: '撇', paths: [ { type: 'path', d: 'M -3 3 L 0 0 L 3 3 Z', stroke: '#c44569', fill: 'none', strokeWidth: 1.5, strokeLinejoin: 'round' } ] },
    pout:     { name: '嘟嘴', icon: '😗', paths: [ { type: 'circle', cx: 0, cy: 1, r: 2.5, stroke: '#c44569', fill: 'none', strokeWidth: 2 } ] },
    open:     { name: '張嘴', icon: '😆', paths: [ 
      { type: 'path', d: 'M -6 0 Q -6 8 0 8 Q 6 8 6 0 Z', fill: '#c44569', stroke: '#8b2742', strokeWidth: 1.5 },
      { type: 'path', d: 'M -4 4 Q 0 2 4 4', stroke: '#ff9999', fill: 'none', strokeWidth: 1.5 } 
    ] },
    smirk:    { name: '歪嘴笑', icon: '😏', paths: [ { type: 'path', d: 'M -6 2 Q 0 4 6 -3', stroke: '#c44569', fill: 'none', strokeWidth: 2.5 } ] },
    straight: { name: '抿嘴', icon: '抿', paths: [ { type: 'path', d: 'M -7 2 L 7 2', stroke: '#c44569', fill: 'none', strokeWidth: 2 } ] }
  };

  const EYEBROWS = {
    thick: { name: '粗眉', icon: '🟰', paths: [ { type: 'path', d: 'M -10 2 Q 0 -4 10 2', stroke: 'VAR_HAIR', fill: 'none', strokeWidth: 4 } ] },
    flat:  { name: '平眉', icon: '—', paths: [ { type: 'path', d: 'M -9 0 L 9 0', stroke: 'VAR_HAIR', fill: 'none', strokeWidth: 2 } ] },
    none:  { name: '無眉', icon: '🚫', paths: [] },
    thin:  { name: '標準', icon: '➖', paths: [ { type: 'path', d: 'M -8 2 Q 0 -2 8 2', stroke: 'VAR_HAIR', fill: 'none', strokeWidth: 2 } ] },
    dot:   { name: '麻呂', icon: '圓', paths: [ { type: 'circle', cx: 0, cy: -2, r: 3, fill: 'VAR_HAIR' } ] }, 
    
    arch:  { name: '挑眉', icon: '⤴', 
      left:  [ { type: 'path', d: 'M -9 3 Q 0 -4 9 0', stroke: 'VAR_HAIR', fill: 'none', strokeWidth: 2 } ],
      right: [ { type: 'path', d: 'M -9 0 Q 0 -4 9 3', stroke: 'VAR_HAIR', fill: 'none', strokeWidth: 2 } ]
    },
    sad:   { name: '困擾', icon: '八', 
      left:  [ { type: 'path', d: 'M -8 4 Q 0 -2 8 -3', stroke: 'VAR_HAIR', fill: 'none', strokeWidth: 2 } ],
      right: [ { type: 'path', d: 'M -8 -3 Q 0 -2 8 4', stroke: 'VAR_HAIR', fill: 'none', strokeWidth: 2 } ]
    },
    angry: { name: '生氣', icon: '怒', 
      left:  [ { type: 'path', d: 'M -8 -3 Q 0 -2 8 4', stroke: 'VAR_HAIR', fill: 'none', strokeWidth: 2 } ],
      right: [ { type: 'path', d: 'M -8 4 Q 0 -2 8 -3', stroke: 'VAR_HAIR', fill: 'none', strokeWidth: 2 } ]
    }
  };

  const HAIR_STYLES = {
    pony: { name: '馬尾', icon: '🎀',
      back:  [ { type: 'path', d: 'M -40 -10 C -80 -20 -90 70 -40 80 C -50 30 -20 10 -40 -10 Z', fill: 'VAR_HAIR' } ],
      bangs: [ { type: 'path', d: 'M -45 -10 C -45 -80 45 -80 45 -10 Q 20 15 -15 -5 Q -25 10 -45 -10 Z', fill: 'VAR_HAIR' } ]
    },
    bun: { name: '包頭', icon: '⚪', 
      back:  [ { type: 'circle', cx: 0, cy: -70, r: 22, fill: 'VAR_HAIR' } ],
      bangs: [ { type: 'path', d: 'M -45 -10 C -45 -80 45 -80 45 -10 Q 20 15 -15 -5 Q -25 10 -45 -10 Z', fill: 'VAR_HAIR' } ]
    },
    bald: { name: '光頭', icon: '🥚', 
      back:  [ ],
      bangs: [ { type: 'ellipse', cx: 15, cy: -45, rx: 8, ry: 4, fill: '#ffffff', opacity: 0.5, stroke: 'none' } ] 
    },
    short: { name: '短髮', icon: '💇',
      back:  [ { type: 'path', d: 'M -45 0 C -55 -60 55 -60 45 0 C 55 30 40 45 20 40 C 0 45 -20 45 -40 40 C -55 35 -50 20 -45 0 Z', fill: 'VAR_HAIR' } ],
      bangs: [ { type: 'path', d: 'M -45 -10 C -45 -80 45 -80 45 -10 C 35 15 25 10 15 -5 C 5 15 -5 15 -15 -5 C -25 10 -35 15 -45 -10 Z', fill: 'VAR_HAIR' } ]
    },
    // [重構] 長髮：導入經典「公主切 + 空氣瀏海」，兩側鬢角修飾臉型，前額乾淨俐落
    long: { name: '長髮', icon: '👩',
      back:  [ { type: 'path', d: 'M -45 0 C -55 -50 55 -50 45 0 C 60 70 50 110 30 110 C 10 110 0 90 0 90 C 0 90 -10 110 -30 110 C -50 110 -60 70 -45 0 Z', fill: 'VAR_HAIR' } ],
      bangs: [ 
        { 
          type: 'path', 
          d: 'M -45 -10 C -45 -80 45 -80 45 -10 Q 45 10 38 25 Q 35 5 28 -18 Q 15 -10 5 -22 Q 0 -15 -5 -22 Q -15 -10 -28 -18 Q -35 5 -38 25 Q -45 10 -45 -10 Z', 
          fill: 'VAR_HAIR', 
          strokeLinejoin: 'round' 
        } 
      ]
    },
    twintails: { name: '雙馬尾', icon: '👧',
      back: [
        { type: 'path', d: 'M -40 -30 C -80 -40 -90 60 -50 90 C -60 40 -30 0 -40 -30 Z', fill: 'VAR_HAIR' }, 
        { type: 'path', d: 'M 40 -30 C 80 -40 90 60 50 90 C 60 40 30 0 40 -30 Z', fill: 'VAR_HAIR' }    
      ],
      bangs: [ { type: 'path', d: 'M -45 -10 C -45 -80 45 -80 45 -10 C 35 15 25 10 15 -5 C 5 15 -5 15 -15 -5 C -25 10 -35 15 -45 -10 Z', fill: 'VAR_HAIR' } ]
    },
    // [修正] 微捲 (長)：瀏海下緣整體上提 15 單位，露出眉毛與眼睛
    messy: { name: '微捲(長)', icon: '🌀',
      back: [ { type: 'path', d: 'M -45 0 C -60 -50 60 -50 45 0 C 50 20 45 35 30 30 C 40 10 30 -10 20 0 C 10 20 -10 20 -20 0 C -30 -10 -40 10 -30 30 C -45 35 -50 20 -45 0 Z', fill: 'VAR_HAIR' } ],
      bangs: [ 
        { type: 'path', d: 'M -45 -10 C -45 -85 45 -85 45 -10 C 35 -20 25 -10 15 -25 C 5 -10 -5 -10 -15 -25 C -25 -10 -35 -20 -45 -10 Z', fill: 'VAR_HAIR' } 
      ]
    },
    // [新增] 男生微捲：俐落短後髮，搭配縮短後的微捲瀏海
    messy_boy: { name: '男生微捲', icon: '🧑‍🦱',
      back: [ { type: 'path', d: 'M -45 0 C -55 -60 55 -60 45 0 C 45 15 35 20 0 20 C -35 20 -45 15 -45 0 Z', fill: 'VAR_HAIR' } ],
      bangs: [ 
        { type: 'path', d: 'M -45 -10 C -45 -85 45 -85 45 -10 C 35 -20 25 -10 15 -25 C 5 -10 -5 -10 -15 -25 C -25 -10 -35 -20 -45 -10 Z', fill: 'VAR_HAIR' } 
      ]
    },
    spiky: { name: '刺蝟頭', icon: '⚡',
      back: [ { type: 'path', d: 'M -45 -5 L -55 -25 L -35 -40 L -45 -65 L -15 -55 L 0 -75 L 15 -55 L 45 -65 L 35 -40 L 55 -25 L 45 -5 Z', fill: 'VAR_HAIR', strokeLinejoin: 'miter' } ],
      bangs: [ { type: 'path', d: 'M -45 -10 C -45 -80 45 -80 45 -10 L 35 -25 L 20 -5 L 5 -30 L -10 -5 L -25 -30 L -45 -10 Z', fill: 'VAR_HAIR', strokeLinejoin: 'miter' } ]
    },
    undercut: { name: '削邊頭', icon: '🔥',
      back: [ { type: 'path', d: 'M -38 -5 C -38 -50 38 -50 38 -5 Z', fill: 'VAR_HAIR' } ],
      bangs: [ { type: 'path', d: 'M -45 -10 C -45 -80 45 -80 45 -10 Q 25 -35 5 -40 Q -15 -35 -45 -10 Z', fill: 'VAR_HAIR' } ]
    },
    // [重製] 韓系中分 (長髮版)：雙片式八字垂墜，平滑修飾額頭
    middle_part: { name: '中分(長)', icon: '✂',
      back: [ { type: 'path', d: 'M -45 0 C -55 -60 55 -60 45 0 C 55 30 40 45 20 40 C 0 45 -20 45 -40 40 C -55 35 -50 20 -45 0 Z', fill: 'VAR_HAIR' } ],
      bangs: [ 
        { type: 'path', d: 'M -45 -10 C -45 -80 5 -80 5 -45 C -10 -40 -20 -20 -45 -10 Z', fill: 'VAR_HAIR' }, // 左半垂墜
        { type: 'path', d: 'M 45 -10 C 45 -80 -5 -80 -5 -45 C 10 -40 20 -20 45 -10 Z', fill: 'VAR_HAIR' }  // 右半垂墜
      ]
    },
    // [重製] 逗號瀏海 (長髮版)：右側後梳，左側呈現完美 C 字內彎
    comma: { name: '逗號(長)', icon: '🌙',
      back: [ { type: 'path', d: 'M -45 0 C -55 -60 55 -60 45 0 C 55 30 40 45 20 40 C 0 45 -20 45 -40 40 C -55 35 -50 20 -45 0 Z', fill: 'VAR_HAIR' } ],
      bangs: [ 
        { type: 'path', d: 'M 45 -10 C 45 -80 10 -80 5 -45 C 15 -35 25 -20 45 -10 Z', fill: 'VAR_HAIR' }, // 右側後梳
        { type: 'path', d: 'M -45 -10 C -45 -80 20 -80 15 -45 C 5 -45 -5 -30 -5 -15 C -5 -10 0 -10 5 -15 C -10 -5 -25 -10 -45 -10 Z', fill: 'VAR_HAIR' } // 左側完美逗號
      ]
    },
    // [新增] 男生中分：搭配耳際長度 (Y=20) 的俐落短後髮
    middle_part_boy: { name: '男生中分', icon: '👦',
      back: [ { type: 'path', d: 'M -45 0 C -55 -60 55 -60 45 0 C 45 15 35 20 0 20 C -35 20 -45 15 -45 0 Z', fill: 'VAR_HAIR' } ],
      bangs: [ 
        { type: 'path', d: 'M -45 -10 C -45 -80 5 -80 5 -45 C -10 -40 -20 -20 -45 -10 Z', fill: 'VAR_HAIR' }, 
        { type: 'path', d: 'M 45 -10 C 45 -80 -5 -80 -5 -45 C 10 -40 20 -20 45 -10 Z', fill: 'VAR_HAIR' }  
      ]
    },
    // [新增] 男生逗號：完美 C 字內彎 + 俐落短後髮
    comma_boy: { name: '男生逗號', icon: '😎',
      back: [ { type: 'path', d: 'M -45 0 C -55 -60 55 -60 45 0 C 45 15 35 20 0 20 C -35 20 -45 15 -45 0 Z', fill: 'VAR_HAIR' } ],
      bangs: [ 
        { type: 'path', d: 'M 45 -10 C 45 -80 10 -80 5 -45 C 15 -35 25 -20 45 -10 Z', fill: 'VAR_HAIR' }, 
        { type: 'path', d: 'M -45 -10 C -45 -80 20 -80 15 -45 C 5 -45 -5 -30 -5 -15 C -5 -10 0 -10 5 -15 C -10 -5 -25 -10 -45 -10 Z', fill: 'VAR_HAIR' } 
      ]
    }
  };

  const ACCESSORIES = {
    none:      { name: '無', icon: '🚫', paths: [] },
    glasses:   { name: '圓框眼鏡', icon: '👓', paths: [
      { type: 'circle', cx: -22, cy: 8, r: 16, stroke: '#ffd54a', fill: 'none', strokeWidth: 2.5 },
      { type: 'circle', cx: 22, cy: 8, r: 16, stroke: '#ffd54a', fill: 'none', strokeWidth: 2.5 },
      { type: 'path', d: 'M -6 6 Q 0 3 6 6', stroke: '#ffd54a', fill: 'none', strokeWidth: 2 }
    ]},
    hairpin:   { name: '星型髮夾', icon: '⭐', paths: [
      { type: 'path', d: 'M 0 -12 L 3.75 -3.75 L 12.75 -3.75 L 5.25 1.5 L 8.25 10.5 L 0 5.25 L -8.25 10.5 L -5.25 1.5 L -12.75 -3.75 L -3.75 -3.75 Z', fill: '#ffd54a', stroke: '#e1b12c', strokeWidth: 2 }
    ]},
    heart_pin: { name: '愛心髮夾', icon: '💖', paths: [
      { type: 'path', d: 'M 0 4 C -8 -4 -10 -12 0 -12 C 10 -12 8 -4 0 4 Z', fill: '#ff9999', stroke: '#e84393', strokeWidth: 2 }
    ]},
    cross_pin: { name: '十字髮夾', icon: '✖', paths: [
      { type: 'path', d: 'M -6 -6 L 6 6 M 6 -6 L -6 6', stroke: '#a29bfe', fill: 'none', strokeWidth: 4 }
    ]},
    cap:       { name: '鴨舌帽', icon: '🧢', paths: [
      { type: 'path', d: 'M -45 -30 C -45 -100 45 -100 45 -30 Z', fill: '#34495e' },
      { type: 'path', d: 'M -48 -30 Q 10 -40 65 -15', stroke: '#2c3e50', fill: 'none', strokeWidth: 6 }
    ]},
    headband:  { name: '運動頭帶', icon: '🥷', paths: [
      { type: 'path', d: 'M -44 -20 Q 0 -27 44 -20 L 45 -30 Q 0 -37 -45 -30 Z', fill: '#e74c3c', stroke: '#c0392b' }
    ]},
    mole:      { name: '淚痣', icon: '點', paths: [
      { type: 'circle', cx: -26, cy: 22, r: 1.5, fill: '#1a1a1a', stroke: 'none' } 
    ]},
    bandaid:   { name: 'OK繃', icon: '🩹', paths: [
      { type: 'rect', x: -12, y: 12, width: 24, height: 7, rx: 2, fill: '#f5cdb9', stroke: 'none' }, 
      { type: 'rect', x: -4, y: 12, width: 8, height: 7, fill: '#e6b7a1', stroke: 'none' }
    ]},
    mask:      { name: '口罩', icon: '😷', paths: [
      { type: 'path', d: 'M -26 15 Q 0 10 26 15 L 20 38 Q 0 45 -20 38 Z', fill: '#ffffff', stroke: '#bdc3c7', strokeWidth: 1.5 },
      { type: 'path', d: 'M -38 5 L -26 15 M 38 5 L 26 15', stroke: '#bdc3c7', fill: 'none', strokeWidth: 2 } 
    ]},
    necklace:  { name: '寶石項鍊', icon: '📿', paths: [
      { type: 'path', d: 'M -16 45 Q 0 65 16 45', stroke: '#bdc3c7', fill: 'none', strokeWidth: 2 }, 
      { type: 'path', d: 'M 0 54 L 3 60 L 0 66 L -3 60 Z', fill: '#3498db', stroke: '#2980b9', strokeWidth: 1 } 
    ]},
    // ---- 以下為新增的男性專屬配件 ----
    skull_necklace: { name: '骷髏項鍊', icon: '💀', paths: [
      { type: 'path', d: 'M -16 45 Q 0 65 16 45', stroke: '#95a5a6', fill: 'none', strokeWidth: 2 }, // 灰銀色鏈條
      { type: 'path', d: 'M -4 56 C -4 52 4 52 4 56 L 3 63 L -3 63 Z', fill: '#ecf0f1', stroke: '#7f8c8d', strokeWidth: 1.5 }, // 骷髏頭骨
      { type: 'circle', cx: -1.5, cy: 57, r: 1.2, fill: '#2c3e50', stroke: 'none' }, // 左眼洞
      { type: 'circle', cx: 1.5, cy: 57, r: 1.2, fill: '#2c3e50', stroke: 'none' }   // 右眼洞
    ]},
    chain: { name: '粗金鍊', icon: '⛓️', paths: [
      { type: 'path', d: 'M -18 43 Q 0 68 18 43', stroke: '#f1c40f', fill: 'none', strokeWidth: 4.5, strokeDasharray: '4 2' }, // 利用虛線模擬鏈條節點
      { type: 'path', d: 'M -18 43 Q 0 68 18 43', stroke: '#d4ac0d', fill: 'none', strokeWidth: 1.5 } // 金屬內層立體感
    ]},
    beanie: { name: '毛帽', icon: '🥶', paths: [
      { type: 'path', d: 'M -44 -25 C -44 -105 44 -105 44 -25 Z', fill: '#2c3e50' }, // 帽體
      { type: 'path', d: 'M -46 -25 Q 0 -15 46 -25 L 46 -35 Q 0 -25 -46 -35 Z', fill: '#34495e', stroke: '#1a252f', strokeWidth: 1.5 } // 底部反折邊緣
    ]},
    bucket_hat: { name: '漁夫帽', icon: '🎣', paths: [
      { type: 'path', d: 'M -35 -40 C -35 -100 35 -100 35 -40 Z', fill: '#bdc3c7' }, // 平頂帽體
      { type: 'path', d: 'M -55 -15 Q 0 -45 55 -15 L 45 -40 Q 0 -60 -45 -40 Z', fill: '#ecf0f1', stroke: '#95a5a6', strokeWidth: 1.5 } // 下垂的環狀寬帽沿
    ]},
    earring: { name: '十字耳環', icon: '✨', paths: [
      { type: 'circle', cx: -43, cy: 22, r: 2, fill: 'none', stroke: '#bdc3c7', strokeWidth: 1.5 }, // 左耳銀圈
      { type: 'path', d: 'M -43 24 L -43 32 M -46 27 L -40 27', stroke: '#bdc3c7', fill: 'none', strokeWidth: 1.5 } // 垂墜十字架
    ]}
  };

  const DEFAULT = {
    hairstyle: 'middle_part', hairColor: '#2c3e50', skinColor: '#fff0e6', clothesColor: '#a29bfe',
    eyeColor: '#74b9ff', accessory: 'none', eyebrow: 'thick', eyes: 'sharp', mouth: 'smirk'
  };

  // ============ IV. 渲染器邏輯 ============
  class AvatarRenderer {
    constructor(target, opts = {}) {
      this.target = typeof target === 'string' ? document.querySelector(target) : target;
      if (!this.target) throw new Error('AvatarRenderer: target not found');
      this.size = opts.size || 200;
      this.avatar = { ...DEFAULT, ...opts.avatar };
      this.svgNS = 'http://www.w3.org/2000/svg';
      this.render();
    }

    setAvatar(avatar) {
      this.avatar = { ...DEFAULT, ...avatar };
      this.render();
    }
    toJSON() { return { ...this.avatar }; }

    _createElement(def, cMap) {
      const el = document.createElementNS(this.svgNS, def.type);
      for (const [key, val] of Object.entries(def)) {
        if (key === 'type') continue;
        const attrName = key.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
        let finalVal = val;

        if (typeof val === 'string' && val.startsWith('VAR_')) {
          if (val === 'VAR_HAIR') finalVal = cMap.hair;
          if (val === 'VAR_HAIR_DARK') finalVal = ColorEngine.getLineArt(cMap.hair);
          if (val === 'VAR_SKIN') finalVal = cMap.skin;
          if (val === 'VAR_EYE') finalVal = cMap.eye;
          if (val === 'VAR_EYE_LIGHT') finalVal = ColorEngine.getHighlight(cMap.eye);
          if (val === 'VAR_EYE_DARK') finalVal = ColorEngine.getShadow(cMap.eye);
        }

        if (attrName === 'fill' && finalVal !== 'none' && def.stroke === undefined) {
          if(!def.strokeLinejoin) el.setAttribute('stroke-linejoin', 'round');
          el.setAttribute('stroke', ColorEngine.getLineArt(finalVal));
          el.setAttribute('stroke-width', '1.8'); 
        }

        if (attrName === 'stroke' && def.fill === 'none') {
          el.setAttribute('stroke-linecap', 'round');
          if(!def.strokeLinejoin) el.setAttribute('stroke-linejoin', 'round');
        }

        el.setAttribute(attrName, finalVal);
      }
      return el;
    }

    _mountGroup(assets, anchor, cMap) {
      const g = document.createElementNS(this.svgNS, 'g');
      if (!assets || assets.length === 0) return g; 
      g.setAttribute('transform', `translate(${anchor.x}, ${anchor.y})`);
      assets.forEach(def => g.appendChild(this._createElement(def, cMap)));
      return g;
    }

    render() {
      this.target.innerHTML = '';
      const a = this.avatar;
      const cMap = { hair: a.hairColor, skin: a.skinColor, eye: a.eyeColor };
      const FC = ANCHORS.FACE_CENTER;

      const svg = document.createElementNS(this.svgNS, 'svg');
      svg.setAttribute('viewBox', '0 0 200 240');
      svg.setAttribute('width', this.size);
      svg.setAttribute('height', this.size);
      svg.setAttribute('class', 'avatar-svg');
      svg.style.display = 'block';

      const hairDef = HAIR_STYLES[a.hairstyle] || HAIR_STYLES.short;

      // L1: 後髮
      if (hairDef.back) svg.appendChild(this._mountGroup(hairDef.back, FC, cMap));

      // L2: 身體
      const bodyY = FC.y + 45; 
      svg.appendChild(this._createElement({ 
        type: 'path', 
        d: `M 80 ${bodyY} C 70 ${bodyY+10} 60 ${bodyY+40} 65 240 L 135 240 C 140 ${bodyY+40} 130 ${bodyY+10} 120 ${bodyY} Z`, 
        fill: a.clothesColor 
      }, cMap));

      // L3: 脖子 
      svg.appendChild(this._createElement({ type: 'rect', x: 92, y: bodyY - 10, width: 16, height: 20, rx: 4, fill: ColorEngine.getShadow(a.skinColor) }, cMap));

      // L4: 臉部基底 
      const faceDef = [
        { type: 'path', d: 'M -42 -20 C -42 25 -30 38 0 38 C 30 38 42 25 42 -20 C 42 -50 25 -60 0 -60 C -25 -60 -42 -50 -42 -20 Z', fill: 'VAR_SKIN' }
      ];
      svg.appendChild(this._mountGroup(faceDef, FC, cMap));

      // L5 & L6: 眼睛與眉毛
      const browDef = EYEBROWS[a.eyebrow] || EYEBROWS.thin;
      if (browDef.paths) {
        svg.appendChild(this._mountGroup(browDef.paths, { x: FC.x + ANCHORS.EYEBROW_L.x, y: FC.y + ANCHORS.EYEBROW_L.y }, cMap));
        svg.appendChild(this._mountGroup(browDef.paths, { x: FC.x + ANCHORS.EYEBROW_R.x, y: FC.y + ANCHORS.EYEBROW_R.y }, cMap));
      } else {
        svg.appendChild(this._mountGroup(browDef.left, { x: FC.x + ANCHORS.EYEBROW_L.x, y: FC.y + ANCHORS.EYEBROW_L.y }, cMap));
        svg.appendChild(this._mountGroup(browDef.right, { x: FC.x + ANCHORS.EYEBROW_R.x, y: FC.y + ANCHORS.EYEBROW_R.y }, cMap));
      }

      const eyeDef = EYES[a.eyes] || EYES.gem;
      if (eyeDef.paths) {
        svg.appendChild(this._mountGroup(eyeDef.paths, { x: FC.x + ANCHORS.EYE_L.x, y: FC.y + ANCHORS.EYE_L.y }, cMap));
        svg.appendChild(this._mountGroup(eyeDef.paths, { x: FC.x + ANCHORS.EYE_R.x, y: FC.y + ANCHORS.EYE_R.y }, cMap));
      } else {
        svg.appendChild(this._mountGroup(eyeDef.left, { x: FC.x + ANCHORS.EYE_L.x, y: FC.y + ANCHORS.EYE_L.y }, cMap));
        svg.appendChild(this._mountGroup(eyeDef.right, { x: FC.x + ANCHORS.EYE_R.x, y: FC.y + ANCHORS.EYE_R.y }, cMap));
      }

      // L7: 腮紅
      svg.appendChild(this._createElement({ type: 'ellipse', cx: FC.x + ANCHORS.BLUSH_L.x, cy: FC.y + ANCHORS.BLUSH_L.y, rx: 8, ry: 5, fill: '#ff9999', opacity: 0.6, stroke: 'none' }, cMap));
      svg.appendChild(this._createElement({ type: 'ellipse', cx: FC.x + ANCHORS.BLUSH_R.x, cy: FC.y + ANCHORS.BLUSH_R.y, rx: 8, ry: 5, fill: '#ff9999', opacity: 0.6, stroke: 'none' }, cMap));

      // L8: 嘴巴
      const mouthDef = MOUTHS[a.mouth] || MOUTHS.cat;
      svg.appendChild(this._mountGroup(mouthDef.paths, { x: FC.x + ANCHORS.MOUTH.x, y: FC.y + ANCHORS.MOUTH.y }, cMap));

      // L9: 前髮覆蓋
      if (hairDef.bangs) svg.appendChild(this._mountGroup(hairDef.bangs, FC, cMap));

      // L10: 配件
      const accDef = ACCESSORIES[a.accessory];
      if (accDef && accDef.paths && accDef.paths.length > 0) {
        const isPin = ['hairpin', 'heart_pin', 'cross_pin'].includes(a.accessory);
        const anchor = isPin ? { x: FC.x + ANCHORS.HAIRPIN.x, y: FC.y + ANCHORS.HAIRPIN.y } : FC;
        svg.appendChild(this._mountGroup(accDef.paths, anchor, cMap));
      }

      this.target.appendChild(svg);
    }
  }

  AvatarRenderer.HAIR_STYLES = HAIR_STYLES;
  AvatarRenderer.EYEBROWS    = EYEBROWS;
  AvatarRenderer.EYES        = EYES;
  AvatarRenderer.MOUTHS      = MOUTHS;
  AvatarRenderer.ACCESSORIES = ACCESSORIES;
  AvatarRenderer.DEFAULT     = DEFAULT;

  global.AvatarRenderer = AvatarRenderer;
})(window);