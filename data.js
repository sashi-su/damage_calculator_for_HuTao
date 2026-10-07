/* damage_formula.md の数値。ゲーム更新時はこの表を更新する。 */
(function (root) {
  const DATA = {
    levels: {
      90: { hp: 15552.31, atk: 106.43 },
      95: { hp: 16104.39, atk: 118.41 },
      100: { hp: 16657.69, atk: 130.38 }
    },
    talents: {
      10: { skill: 0.0626, blood: 1.152, burst: 6.1744 },
      13: { skill: 0.0715, blood: 1.36, burst: 7.0597 }
    },
    normal: 0.8365,
    charged: 2.4256,
    weaponAtk: 608.0745972,
    furinaLevels: { 90: 15307.39, 95: 15850.78, 100: 16395.36 },
    xilonenLevels: { 90: 929.95, 95: 962.96, 100: 996.05 },
    xilonenWeapon: { def: [8, 10, 12, 14, 16], rate: [8, 10, 12, 14, 16], cap: [25.6, 32, 38.4, 44.8, 51.2] },
    homa: [
      { hp: 20, atk: 0.018 },
      { hp: 25, atk: 0.022 },
      { hp: 30, atk: 0.026 },
      { hp: 35, atk: 0.03 },
      { hp: 40, atk: 0.034 }
    ],
    homaAbove50: [0.008, 0.01, 0.012, 0.014, 0.016],
    elegy: { em: [100, 125, 150, 175, 200], atk: [20, 25, 30, 35, 40] },
    star: [28, 35, 42, 49, 56],
    key: [0.002, 0.0025, 0.003, 0.0035, 0.004],
    nicoWeapon: { rate: [10, 13, 16, 19, 22], cap: [26, 34, 42, 50, 58] },
    furinaRate: { 8: 0.21, 10: 0.25, 13: 0.31 }
  };
  root.HUTAO_DATA = DATA;
  if (typeof module !== 'undefined') module.exports = DATA;
})(globalThis);
