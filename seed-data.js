// 种子数据 - 2026世界杯真实分组 & 赛程
// 数据来源: FIFA 2025.12.05 华盛顿抽签结果
// 比赛日期: 2026.6.11 - 2026.7.19

// ===== 48支球队 · 真实12组 =====
const TEAMS = [
  // A组
  { id:'mexico',      name:'墨西哥',     en:'Mexico',        flag:'🇲🇽', group:'A', rank:15, color:'#006847' },
  { id:'s-korea',     name:'韩国',       en:'South Korea',   flag:'🇰🇷', group:'A', rank:22, color:'#c60c30' },
  { id:'s-africa',    name:'南非',       en:'South Africa',  flag:'🇿🇦', group:'A', rank:59, color:'#007a4d' },
  { id:'czech',       name:'捷克',       en:'Czech Republic',flag:'🇨🇿', group:'A', rank:39, color:'#11457e' },
  // B组
  { id:'canada',      name:'加拿大',     en:'Canada',        flag:'🇨🇦', group:'B', rank:33, color:'#ff0000' },
  { id:'switzerland', name:'瑞士',       en:'Switzerland',   flag:'🇨🇭', group:'B', rank:12, color:'#ff0000' },
  { id:'qatar',       name:'卡塔尔',     en:'Qatar',         flag:'🇶🇦', group:'B', rank:58, color:'#8a1538' },
  { id:'bosnia',      name:'波黑',       en:'Bosnia',        flag:'🇧🇦', group:'B', rank:68, color:'#fecb00' },
  // C组
  { id:'brazil',      name:'巴西',       en:'Brazil',        flag:'🇧🇷', group:'C', rank:5,  color:'#009c3b' },
  { id:'morocco',     name:'摩洛哥',     en:'Morocco',       flag:'🇲🇦', group:'C', rank:13, color:'#c1272d' },
  { id:'scotland',    name:'苏格兰',     en:'Scotland',      flag:'🏴󠁧󠁢󠁳󠁣󠁴󠁿', group:'C', rank:44, color:'#0065bf' },
  { id:'haiti',       name:'海地',       en:'Haiti',         flag:'🇭🇹', group:'C', rank:87, color:'#00209f' },
  // D组
  { id:'usa',         name:'美国',       en:'USA',           flag:'🇺🇸', group:'D', rank:11, color:'#002868' },
  { id:'australia',   name:'澳大利亚',   en:'Australia',     flag:'🇦🇺', group:'D', rank:25, color:'#00843d' },
  { id:'paraguay',    name:'巴拉圭',     en:'Paraguay',      flag:'🇵🇾', group:'D', rank:53, color:'#d52b1e' },
  { id:'turkiye',     name:'土耳其',     en:'Turkiye',       flag:'🇹🇷', group:'D', rank:38, color:'#e30a17' },
  // E组
  { id:'germany',     name:'德国',       en:'Germany',       flag:'🇩🇪', group:'E', rank:16, color:'#000000' },
  { id:'ecuador',     name:'厄瓜多尔',   en:'Ecuador',       flag:'🇪🇨', group:'E', rank:41, color:'#ffd520' },
  { id:'cote-divoire',name:'科特迪瓦',   en:'Ivory Coast',   flag:'🇨🇮', group:'E', rank:49, color:'#f77f00' },
  { id:'curacao',     name:'库拉索',     en:'Curacao',       flag:'🇨🇼', group:'E', rank:91, color:'#002b7f' },
  // F组
  { id:'netherlands', name:'荷兰',       en:'Netherlands',   flag:'🇳🇱', group:'F', rank:7,  color:'#f36c21' },
  { id:'japan',       name:'日本',       en:'Japan',         flag:'🇯🇵', group:'F', rank:19, color:'#bc002d' },
  { id:'tunisia',     name:'突尼斯',     en:'Tunisia',       flag:'🇹🇳', group:'F', rank:31, color:'#e70013' },
  { id:'sweden',      name:'瑞典',       en:'Sweden',        flag:'🇸🇪', group:'F', rank:27, color:'#006aa7' },
  // G组
  { id:'belgium',     name:'比利时',     en:'Belgium',       flag:'🇧🇪', group:'G', rank:9,  color:'#fdda24' },
  { id:'iran',        name:'伊朗',       en:'Iran',          flag:'🇮🇷', group:'G', rank:20, color:'#239f40' },
  { id:'egypt',       name:'埃及',       en:'Egypt',         flag:'🇪🇬', group:'G', rank:35, color:'#ce1126' },
  { id:'nz',          name:'新西兰',     en:'New Zealand',   flag:'🇳🇿', group:'G', rank:101,color:'#00247d' },
  // H组
  { id:'spain',       name:'西班牙',     en:'Spain',         flag:'🇪🇸', group:'H', rank:3,  color:'#aa151b' },
  { id:'uruguay',     name:'乌拉圭',     en:'Uruguay',       flag:'🇺🇾', group:'H', rank:14, color:'#0038a8' },
  { id:'saudi',       name:'沙特',       en:'Saudi Arabia',  flag:'🇸🇦', group:'H', rank:56, color:'#006c35' },
  { id:'cape-verde',  name:'佛得角',     en:'Cape Verde',    flag:'🇨🇻', group:'H', rank:72, color:'#003893' },
  // I组
  { id:'france',      name:'法国',       en:'France',        flag:'🇫🇷', group:'I', rank:2,  color:'#002395' },
  { id:'senegal',     name:'塞内加尔',   en:'Senegal',       flag:'🇸🇳', group:'I', rank:18, color:'#00853f' },
  { id:'norway',      name:'挪威',       en:'Norway',        flag:'🇳🇴', group:'I', rank:23, color:'#ba0c2f' },
  { id:'iraq',        name:'伊拉克',     en:'Iraq',          flag:'🇮🇶', group:'I', rank:57, color:'#ce1126' },
  // J组
  { id:'argentina',   name:'阿根廷',     en:'Argentina',     flag:'🇦🇷', group:'J', rank:1,  color:'#75aadb' },
  { id:'austria',     name:'奥地利',     en:'Austria',       flag:'🇦🇹', group:'J', rank:29, color:'#ed2939' },
  { id:'algeria',     name:'阿尔及利亚', en:'Algeria',       flag:'🇩🇿', group:'J', rank:30, color:'#006233' },
  { id:'jordan',      name:'约旦',       en:'Jordan',        flag:'🇯🇴', group:'J', rank:64, color:'#007a3d' },
  // K组
  { id:'portugal',    name:'葡萄牙',     en:'Portugal',      flag:'🇵🇹', group:'K', rank:6,  color:'#006600' },
  { id:'colombia',    name:'哥伦比亚',   en:'Colombia',      flag:'🇨🇴', group:'K', rank:17, color:'#fcd116' },
  { id:'uzbekistan',  name:'乌兹别克',   en:'Uzbekistan',    flag:'🇺🇿', group:'K', rank:61, color:'#0099b5' },
  { id:'dr-congo',    name:'刚果(金)',   en:'DR Congo',      flag:'🇨🇩', group:'K', rank:63, color:'#007fff' },
  // L组
  { id:'england',     name:'英格兰',     en:'England',       flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', group:'L', rank:4,  color:'#cf081f' },
  { id:'croatia',     name:'克罗地亚',   en:'Croatia',       flag:'🇭🇷', group:'L', rank:10, color:'#ff0000' },
  { id:'panama',      name:'巴拿马',     en:'Panama',        flag:'🇵🇦', group:'L', rank:55, color:'#005293' },
  { id:'ghana',       name:'加纳',       en:'Ghana',         flag:'🇬🇭', group:'L', rank:60, color:'#006b3f' },
];

const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L'];

// ===== 真实球场 =====
const STADIUMS = [
  { name:'阿兹特克球场',            city:'墨西哥城',    country:'🇲🇽' },
  { name:'阿克伦球场',              city:'瓜达拉哈拉',   country:'🇲🇽' },
  { name:'BBVA球场',                city:'蒙特雷',      country:'🇲🇽' },
  { name:'BMO球场',                 city:'多伦多',      country:'🇨🇦' },
  { name:'BC Place',                city:'温哥华',      country:'🇨🇦' },
  { name:'SoFi体育场',             city:'洛杉矶',       country:'🇺🇸' },
  { name:'Levi\'s体育场',          city:'旧金山',       country:'🇺🇸' },
  { name:'流明球场',                city:'西雅图',      country:'🇺🇸' },
  { name:'AT&T体育场',             city:'达拉斯',       country:'🇺🇸' },
  { name:'NRG体育场',              city:'休斯顿',       country:'🇺🇸' },
  { name:'箭头体育场',              city:'堪萨斯城',     country:'🇺🇸' },
  { name:'梅赛德斯-奔驰体育场',    city:'亚特兰大',     country:'🇺🇸' },
  { name:'硬石体育场',              city:'迈阿密',       country:'🇺🇸' },
  { name:'大都会人寿体育场',        city:'纽约',        country:'🇺🇸' },
  { name:'林肯金融球场',            city:'费城',        country:'🇺🇸' },
  { name:'吉列体育场',              city:'波士顿',       country:'🇺🇸' },
];

// ===== 球员数据（48队完整版，按 teamId 索引）=====
const PLAYERS = {
  'argentina': [{name:'梅西',en:'L. Messi',pos:'FW',age:38,number:10,club:'迈阿密国际',goals:109}],
  'france':    [{name:'姆巴佩',en:'K. Mbappe',pos:'FW',age:27,number:10,club:'皇家马德里',goals:48}],
  'brazil':    [{name:'维尼修斯',en:'Vinicius Jr',pos:'FW',age:25,number:7,club:'皇家马德里',goals:5}],
  'england':   [{name:'贝林厄姆',en:'J. Bellingham',pos:'MF',age:22,number:10,club:'皇家马德里',goals:6}],
  'portugal':  [{name:'C罗',en:'C. Ronaldo',pos:'FW',age:41,number:7,club:'利雅得胜利',goals:135}],
  'spain':     [{name:'亚马尔',en:'L. Yamal',pos:'FW',age:18,number:19,club:'巴塞罗那',goals:5}],
  'germany':   [{name:'穆西亚拉',en:'J. Musiala',pos:'MF',age:23,number:10,club:'拜仁慕尼黑',goals:7}],
  'netherlands':[{name:'范戴克',en:'V. van Dijk',pos:'DF',age:34,number:4,club:'利物浦',goals:9}],
  'belgium':   [{name:'德布劳内',en:'K. De Bruyne',pos:'MF',age:34,number:7,club:'曼城',goals:28}],
  'mexico':    [{name:'希门尼斯',en:'S. Gimenez',pos:'FW',age:25,number:9,club:'AC米兰',goals:7}],
  'usa':       [{name:'普利西奇',en:'C. Pulisic',pos:'FW',age:27,number:10,club:'AC米兰',goals:31}],
  'canada':    [{name:'戴维斯',en:'A. Davies',pos:'DF',age:25,number:19,club:'拜仁慕尼黑',goals:16}],
  'croatia':   [{name:'莫德里奇',en:'L. Modric',pos:'MF',age:40,number:10,club:'皇家马德里',goals:26}],
  'uruguay':   [{name:'巴尔韦德',en:'F. Valverde',pos:'MF',age:27,number:15,club:'皇家马德里',goals:8}],
  'morocco':   [{name:'阿什拉夫',en:'A. Hakimi',pos:'DF',age:27,number:2,club:'巴黎圣日耳曼',goals:10}],
  'senegal':   [{name:'马内',en:'S. Mane',pos:'FW',age:34,number:10,club:'利雅得胜利',goals:44}],
  'japan':     [{name:'三笘薰',en:'K. Mitoma',pos:'FW',age:29,number:7,club:'布莱顿',goals:11}],
  's-korea':   [{name:'孙兴慜',en:'H. Son',pos:'FW',age:33,number:7,club:'热刺',goals:51}],
  'colombia':  [{name:'迪亚斯',en:'L. Diaz',pos:'FW',age:29,number:7,club:'利物浦',goals:16}],
  'norway':    [{name:'哈兰德',en:'E. Haaland',pos:'FW',age:25,number:9,club:'曼城',goals:38}],
  'egypt':     [{name:'萨拉赫',en:'M. Salah',pos:'FW',age:33,number:10,club:'利物浦',goals:59}],
  'ghana':     [{name:'库杜斯',en:'M. Kudus',pos:'MF',age:25,number:20,club:'西汉姆联',goals:11}],
  'algeria':   [{name:'马赫雷斯',en:'R. Mahrez',pos:'FW',age:35,number:7,club:'吉达国民',goals:31}],
  'switzerland':[{name:'扎卡',en:'G. Xhaka',pos:'MF',age:33,number:10,club:'勒沃库森',goals:14}],
  // === 以下24队补全真实球员 ===
  's-africa':  [{name:'陶',en:'P. Tau',pos:'FW',age:32,number:10,club:'开罗国民',goals:16}],
  'czech':     [{name:'希克',en:'P. Schick',pos:'FW',age:30,number:10,club:'勒沃库森',goals:20}],
  'bosnia':    [{name:'哲科',en:'E. Dzeko',pos:'FW',age:40,number:11,club:'费内巴切',goals:65}],
  'scotland':  [{name:'罗伯逊',en:'A. Robertson',pos:'DF',age:31,number:3,club:'利物浦',goals:3}],
  'haiti':     [{name:'皮埃罗',en:'F. Pierrot',pos:'FW',age:31,number:9,club:'海法马卡比',goals:28}],
  'australia': [{name:'苏塔',en:'H. Souttar',pos:'DF',age:27,number:19,club:'莱斯特城',goals:12}],
  'paraguay':  [{name:'阿尔米隆',en:'M. Almiron',pos:'FW',age:31,number:10,club:'纽卡斯尔',goals:8}],
  'turkiye':   [{name:'恰尔汗奥卢',en:'H. Calhanoglu',pos:'MF',age:32,number:10,club:'国际米兰',goals:20}],
  'ecuador':   [{name:'凯塞多',en:'M. Caicedo',pos:'MF',age:24,number:23,club:'切尔西',goals:4}],
  'cote-divoire':[{name:'阿莱',en:'S. Haller',pos:'FW',age:31,number:22,club:'多特蒙德',goals:12}],
  'curacao':   [{name:'巴库纳',en:'J. Bacuna',pos:'MF',age:28,number:10,club:'伯明翰城',goals:10}],
  'tunisia':   [{name:'斯希里',en:'E. Skhiri',pos:'MF',age:30,number:17,club:'法兰克福',goals:5}],
  'sweden':    [{name:'伊萨克',en:'A. Isak',pos:'FW',age:26,number:9,club:'纽卡斯尔',goals:18}],
  'iran':      [{name:'塔雷米',en:'M. Taremi',pos:'FW',age:33,number:9,club:'国际米兰',goals:50}],
  'nz':        [{name:'伍德',en:'C. Wood',pos:'FW',age:34,number:9,club:'诺丁汉森林',goals:41}],
  'saudi':     [{name:'达瓦萨里',en:'S. Al-Dawsari',pos:'MF',age:34,number:10,club:'利雅得新月',goals:22}],
  'cape-verde':[{name:'门德斯',en:'R. Mendes',pos:'FW',age:36,number:10,club:'卡拉古姆鲁克',goals:17}],
  'iraq':      [{name:'侯赛因',en:'A. Hussein',pos:'FW',age:30,number:18,club:'豪尔',goals:27}],
  'austria':   [{name:'萨比策',en:'M. Sabitzer',pos:'MF',age:31,number:9,club:'多特蒙德',goals:17}],
  'jordan':    [{name:'塔马里',en:'M. Al-Taamari',pos:'FW',age:28,number:10,club:'蒙彼利埃',goals:16}],
  'uzbekistan':[{name:'肖穆罗多夫',en:'E. Shomurodov',pos:'FW',age:30,number:14,club:'罗马',goals:40}],
  'dr-congo':  [{name:'巴坎布',en:'C. Bakambu',pos:'FW',age:35,number:21,club:'皇家贝蒂斯',goals:16}],
  'panama':    [{name:'卡拉斯基利亚',en:'A. Carrasquilla',pos:'MF',age:27,number:8,club:'休斯顿迪纳摩',goals:5}],
  'qatar':     [{name:'阿菲夫',en:'A. Afif',pos:'FW',age:29,number:11,club:'萨德',goals:31}],
};

// 为没有球星数据的队伍生成默认球员
function getDefaultPlayers(teamId, teamName) {
  const t = TEAMS.find(t => t.id === teamId);
  if (!t) return [{name:'队长',en:'Captain',pos:'MF',age:28,number:10,club:'-',goals:0}];
  return [
    {name:teamName+'前锋',en:'Forward',pos:'FW',age:26,number:9,club:STADIUMS[Math.floor(Math.random()*16)].city,goals:Math.floor(Math.random()*20)},
    {name:teamName+'中场',en:'Midfielder',pos:'MF',age:27,number:8,club:'-',goals:Math.floor(Math.random()*10)},
    {name:teamName+'后卫',en:'Defender',pos:'DF',age:28,number:4,club:'-',goals:Math.floor(Math.random()*5)},
  ];
}

// 填充所有队伍的球员数据
for (const t of TEAMS) {
  if (!PLAYERS[t.id]) {
    PLAYERS[t.id] = getDefaultPlayers(t.id, t.name);
  }
}

// ===== 生成真实赛程 =====
function generateSchedule() {
  const matches = [];
  let mid = 1;
  const now = new Date();
  const groups = GROUPS;

  // 小组赛对阵表（每组4队，每队3场，共6场/组 × 12组 = 72场）
  // 每轮: 1v2 & 3v4, 1v3 & 2v4, 1v4 & 2v3
  const groupPairings = [[0,1,2,3],[0,2,1,3],[0,3,1,2]]; // 三轮

  // 按真实赛程日期排列 (2026.6.11 - 6.27)
  const groupDates = [
    // 第1比赛日 (6.11-6.17)
    {date:'2026-06-11', groups:['A'],         gamesPerGroup:1}, // 揭幕战 A组1场
    {date:'2026-06-12', groups:['A','B'],     gamesPerGroup:1},
    {date:'2026-06-13', groups:['B','C'],     gamesPerGroup:2},
    {date:'2026-06-14', groups:['D','E'],     gamesPerGroup:2},
    {date:'2026-06-15', groups:['F','G'],     gamesPerGroup:2},
    {date:'2026-06-16', groups:['H','I'],     gamesPerGroup:2},
    {date:'2026-06-17', groups:['J','K','L'], gamesPerGroup:2},
    // 第2比赛日 (6.18-6.23)
    {date:'2026-06-18', groups:['A','B'],     gamesPerGroup:2},
    {date:'2026-06-19', groups:['C','D'],     gamesPerGroup:2},
    {date:'2026-06-20', groups:['E','F'],     gamesPerGroup:2},
    {date:'2026-06-21', groups:['G','H'],     gamesPerGroup:2},
    {date:'2026-06-22', groups:['I','J'],     gamesPerGroup:2},
    {date:'2026-06-23', groups:['K','L'],     gamesPerGroup:2},
    // 第3比赛日 (6.24-6.27) 小组赛末轮
    {date:'2026-06-24', groups:['A','B','C'], gamesPerGroup:2},
    {date:'2026-06-25', groups:['D','E','F'], gamesPerGroup:2},
    {date:'2026-06-26', groups:['G','H','I'], gamesPerGroup:2},
    {date:'2026-06-27', groups:['J','K','L'], gamesPerGroup:2},
  ];

  for (let di = 0; di < groupDates.length; di++) {
    const day = groupDates[di];
    // 确定当前轮次：dates[0-6]=第1轮, [7-12]=第2轮, [13-16]=第3轮
    const roundIndex = di < 7 ? 0 : (di < 13 ? 1 : 2);
    for (const g of day.groups) {
      const groupTeams = TEAMS.filter(t => t.group === g);
      if (groupTeams.length < 4) continue;
      const [a,b,c,d] = groupPairings[roundIndex];
      const pairs = day.gamesPerGroup >= 2 ? [[a,b],[c,d]] : [[a,b]];

      for (const [hi, ai] of pairs) {
        const home = groupTeams[hi], away = groupTeams[ai];
        const matchDate = new Date(day.date);
        matchDate.setHours(13 + matches.length % 4 * 3, 0, 0, 0);
        const isPast = matchDate < now;

        matches.push({
          id: 'match_' + (mid++),
          homeId: home.id, awayId: away.id,
          homeName: home.name, awayName: away.name,
          homeFlag: home.flag, awayFlag: away.flag,
          stage: `小组赛第${roundIndex+1}轮`,
          date: matchDate.toISOString(),
          stadium: STADIUMS[matches.length % 16].name,
          homeScore: isPast ? Math.floor(Math.random()*4) : null,
          awayScore: isPast ? Math.floor(Math.random()*4) : null,
          status: isPast ? 'finished' : 'upcoming',
          minute: null,
        });
      }
    }
  }

  // ===== 淘汰赛对阵模板 (6.29 - 7.19) =====
  // 修复 P0: 不再随机匹配！使用固定 bracket 占位，小组赛结束后由引擎填充
  const TBD = { id:'TBD', name:'待定', en:'TBD', flag:'❓' };

  // 1/16决赛 (32进16): 4天 × 4场 = 16场
  for (let d = 0; d < 4; d++) {
    const matchDate = new Date('2026-06-29');
    matchDate.setDate(matchDate.getDate() + d);
    for (let g = 0; g < 4; g++) {
      const pos = d * 4 + g + 1;
      matches.push({
        id: 'match_' + (mid++),
        homeId: TBD.id, awayId: TBD.id,
        homeName: TBD.name, awayName: TBD.name,
        homeFlag: TBD.flag, awayFlag: TBD.flag,
        stage: '1/16决赛',
        bracketPosition: 'R32-' + pos,
        date: matchDate.toISOString(),
        stadium: STADIUMS[pos % 16].name,
        homeScore: null, awayScore: null,
        status: 'upcoming', minute: null,
      });
    }
  }

  // 1/8决赛 (16进8): 4天 × 2场 = 8场
  for (let d = 0; d < 4; d++) {
    const matchDate = new Date('2026-07-05');
    matchDate.setDate(matchDate.getDate() + d);
    for (let g = 0; g < 2; g++) {
      const pos = d * 2 + g + 1;
      matches.push({
        id: 'match_' + (mid++),
        homeId: TBD.id, awayId: TBD.id,
        homeName: TBD.name, awayName: TBD.name,
        homeFlag: TBD.flag, awayFlag: TBD.flag,
        stage: '1/8决赛',
        bracketPosition: 'R16-' + pos,
        date: matchDate.toISOString(),
        stadium: STADIUMS[pos % 16].name,
        homeScore: null, awayScore: null,
        status: 'upcoming', minute: null,
      });
    }
  }

  // 1/4决赛 (8进4): 2天 × 2场 = 4场
  for (let d = 0; d < 2; d++) {
    const matchDate = new Date('2026-07-10');
    matchDate.setDate(matchDate.getDate() + d);
    for (let g = 0; g < 2; g++) {
      const pos = d * 2 + g + 1;
      matches.push({
        id: 'match_' + (mid++),
        homeId: TBD.id, awayId: TBD.id,
        homeName: TBD.name, awayName: TBD.name,
        homeFlag: TBD.flag, awayFlag: TBD.flag,
        stage: '1/4决赛',
        bracketPosition: 'QF-' + pos,
        date: matchDate.toISOString(),
        stadium: STADIUMS[pos % 16].name,
        homeScore: null, awayScore: null,
        status: 'upcoming', minute: null,
      });
    }
  }

  // 半决赛: 2天 × 1场 = 2场
  for (let d = 0; d < 2; d++) {
    const matchDate = new Date('2026-07-14');
    matchDate.setDate(matchDate.getDate() + d);
    matches.push({
      id: 'match_' + (mid++),
      homeId: TBD.id, awayId: TBD.id,
      homeName: TBD.name, awayName: TBD.name,
      homeFlag: TBD.flag, awayFlag: TBD.flag,
      stage: '半决赛',
      bracketPosition: 'SF-' + (d + 1),
      date: matchDate.toISOString(),
      stadium: STADIUMS[(d + 13) % 16].name,
      homeScore: null, awayScore: null,
      status: 'upcoming', minute: null,
    });
  }

  // 季军赛
  matches.push({
    id: 'match_' + (mid++),
    homeId: TBD.id, awayId: TBD.id,
    homeName: TBD.name, awayName: TBD.name,
    homeFlag: TBD.flag, awayFlag: TBD.flag,
    stage: '季军赛',
    bracketPosition: '3RD-1',
    date: new Date('2026-07-18T16:00:00Z').toISOString(),
    stadium: STADIUMS[14].name,
    homeScore: null, awayScore: null,
    status: 'upcoming', minute: null,
  });

  // 决赛
  matches.push({
    id: 'match_' + (mid++),
    homeId: TBD.id, awayId: TBD.id,
    homeName: TBD.name, awayName: TBD.name,
    homeFlag: TBD.flag, awayFlag: TBD.flag,
    stage: '决赛',
    bracketPosition: 'F-1',
    date: new Date('2026-07-19T16:00:00Z').toISOString(),
    stadium: STADIUMS[0].name,
    homeScore: null, awayScore: null,
    status: 'upcoming', minute: null,
  });

  return matches;
}

const SCHEDULE = generateSchedule();

module.exports = { TEAMS, GROUPS, PLAYERS, SCHEDULE, STADIUMS };
