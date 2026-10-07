/*
 * サイト内に表示する文章の編集場所です。
 * page → navigation / sections の順に、画面の構造と同じ階層で整理しています。
 * cards・items・links などの繰り返し要素は配列へ項目を追加してください。
 */
(function (root) {
  const CONTENT = {
    page: {
      title: '胡桃用ダメージ計算機',
      description: '胡桃が1ローテーションで与えるダメージ期待値を、計算過程付きで確認できます',
      header: {
        seal: '蝶',
        brand: '往生計算室',
        subbrand: 'HU TAO LAB'
      },
      hero: {
        eyebrow: 'DAMAGE CALCULATOR FOR HU TAO',
        titleBeforeBreak: '【原神】',
        titleAfterBreak: '胡桃用ダメージ計算機',
        intro:
          '胡桃のステータスや前提条件を入力すると、胡桃が1ローテーションで与えるダメージ期待値を計算します',
        motif: '✿'
      },
      navigation: {
        ariaLabel: '計算機の設定画面',
        items: [
          {
            id: 'basic',
            label: '基本設定'
          },
          {
            id: 'hutao',
            label: '胡桃の設定'
          },
          {
            id: 'support',
            label: 'サポーターの設定'
          },
          {
            id: 'verification',
            label: '計算過程'
          },
          {
            id: 'analysis',
            label: 'ダメージ分析'
          },
          {
            id: 'other',
            label: 'その他'
          }
        ]
      },
      sections: {
        basic: {
          number: '01',
          title: '基本設定',
          rotation: {
            badge: 'ローテーション',
            formula:
              '<span class="rotation-term">（通常攻撃1段目 + 重撃）<b> × 10</b></span> <span class="rotation-term">＋ 血梅香 <b>× 2</b></span> <span class="rotation-term">＋ 元素爆発 <b>× 0.5</b></span>'
          },
          presets: [
            {
              label: '夜蘭・行秋・鐘離用',
              prob: '83.60',
              amp: '1.5'
            },
            {
              label: '夜蘭・ニコ・シトラリ用',
              prob: '74.86',
              amp: '1.701'
            },
            {
              label: '夜蘭・フリーナ・シトラリ用',
              prob: '75.86',
              amp: '1.744'
            }
          ],
          reactionHeading: '元素反応設定',
          reactionHelp: {
            title: '元素反応設定について',
            paragraphs: [
              '見かけの元素反応確率とは、胡桃の各攻撃が元素反応を起こす確率の「最終攻撃力×天賦倍率 + 実数ダメージ加算」による重みづけ平均値です。全ての攻撃が元素反応を起こさないと0%に、全ての攻撃が元素反応を起こすと100%になります。',
              '見かけの元素反応倍率とは、元素反応を起こす各攻撃について、元素反応倍率（蒸発なら1.5、溶解なら2）の「最終攻撃力×天賦倍率 + 実数ダメージ加算」による重みづけ平均値です。全ての元素反応が蒸発なら1.5に、溶解なら2になります。',
              '下のプリセットを選ぶと、対応するパーティで制作者が実測した値が自動で入力されます。この値はプレイスキルや凸状況によって変わることに留意してください。'
            ]
          },
          enemyHeading: '敵の設定',
          custom: {
            title: 'カスタムバフ',
            note: '幻境の祝福や指定していない武器の効果など、調整できないバフがあればここで指定してください。防御デバフや元素耐性デバフは、マイナスを付けた値を入力してください。',
            expand: '展開して入力',
            filledSuffix: '（値を入力済み）'
          }
        },
        hutao: {
          number: '02',
          title: '胡桃の設定',
          loadoutAria: '胡桃と装備武器',
          loadout: [
            {
              type: 'キャラクター',
              name: '胡桃',
              image: 'images/Hu_Tao.png'
            },
            {
              type: '武器',
              name: '護摩の杖',
              image: 'images/Staff_of_Homa.png'
            }
          ],
          referenceTitle: '参考値'
        },
        support: {
          number: '03',
          title: 'サポーターの設定'
        },
        verification: {
          number: '04',
          title: '計算過程',
          content: {
            error: '入力エラーを修正すると計算過程を表示します。',
            matrix: {
              title: '最終ステータスの計算',
              note: 'ダメージバフは小数第一位まで表示し、その他の項目は整数で表示します。',
              mobileFinalLabel: '最終値',
              firstColumn: '内訳',
              columns: {
                hp: 'HP',
                atk: '攻撃力',
                em: '元素熟知',
                cr: '会心率',
                cd: '会心ダメージ',
                bonus: 'ダメージバフ',
                reaction: '元素反応の加算効果',
                flat: '実数ダメージ加算',
                def: '防御デバフ',
                ignore: '防御無視',
                res: '敵の元素耐性'
              },
              rows: {
                hutao: '胡桃のステータス',
                custom: 'カスタムバフ',
                other: 'その他',
                final: '胡桃の最終ステータス'
              },
              times: '回'
            },
            attack: {
              title: '攻撃力の計算',
              inputType: '入力形式',
              inputTypes: {
                below50: '元素スキル前攻撃力（護摩のHP50%未満効果・共鳴を反映済み）',
                atLeast50: 'ビルドカード上攻撃力（護摩のHP50%以上効果を反映済み・共鳴は未反映）',
                legacy: '従来形式'
              },
              homa: '護摩による攻撃力補正',
              homaBelow50: '最終HP上限 × HP50%未満係数 − 入力に含まれる護摩効果',
              homaAtLeast50: '最終HP上限 × HP50%未満係数 − 基準HP上限 × HP50%以上係数',
              homaLegacy: '（最終HP上限 − 基準HP上限）× HP50%未満係数',
              skill: '元素スキルの加算値',
              beforeCap: '上限適用前 ＝ 最終HP上限 × スキル係数',
              cap: '加算上限 ＝ 基礎攻撃力 × 400%',
              hutao: '胡桃の攻撃力',
              hutaoFormula: '入力値 ＋ 護摩による攻撃力補正 ＋ 元素スキルの加算値',
              hutaoConvertedFormula: '換算値 ＋ 護摩による攻撃力補正 ＋ 元素スキルの加算値'
            },
            damage: {
              title: '合計ダメージ期待値の計算',
              finalAttack: '最終攻撃力',
              talent: '総天賦倍率',
              talentTable: {
                attackType: '攻撃種類',
                rate: '天賦倍率',
                count: '攻撃回数',
                normal: '通常攻撃1段目'
              },
              flat: '実数加算合計',
              buff: 'ダメージバフ補正',
              crit: '会心補正の期待値',
              criticalAttack: '会心の攻撃',
              normalAttack: '会心の攻撃でない',
              probability: '確率',
              critFactor: '会心補正',
              reaction: '元素反応補正の期待値',
              reactionCorrection: '元素反応補正',
              reactionBonus: '元素反応の加算効果',
              mastery: '元素熟知',
              reacted: '反応する分',
              unreacted: '反応しない分',
              reactionFactor: '元素反応の乗算因子',
              defense: '敵の防御補正',
              defenseCorrection: '敵の防御補正',
              defenseFormula:
                '(胡桃レベル＋100) ÷ ［(胡桃レベル＋100) ＋ (敵レベル＋100) × (1＋防御デバフ) × (1−防御無視)］',
              defenseNote: '防御デバフは、低下量を負数で扱います。',
              resistance: '敵の元素耐性補正',
              resistanceNote: '元素耐性デバフは、低下量を負の数で扱います。',
              resistanceCondition: '元素耐性の条件',
              resistanceExpression: '敵の元素耐性補正',
              resistanceCases: [
                {
                  condition: '~0%',
                  formula: '1 − 元素耐性 ÷ 2'
                },
                {
                  condition: '0%~75%',
                  formula: '1 − 元素耐性'
                },
                {
                  condition: '75%~',
                  formula: '1 ÷ (1 ＋ 4 × 元素耐性)'
                }
              ],
              current: '今回',
              currentCalculation: '敵の元素耐性補正',
              answerAria: '合計ダメージ期待値',
              answerFormula:
                '合計ダメージ期待値 ＝（最終攻撃力 × 総天賦倍率 ＋ 実数加算合計）× ダメージバフ補正 × 会心補正の期待値 × 元素反応補正の期待値 × 敵の防御補正 × 敵の元素耐性補正',
              answerNote: '1ローテーションで胡桃が敵1体に与えるダメージ期待値',
              roundingNote:
                '途中計算の数値は有効数字7桁まで表示しています。計算には丸め前の値を使用しています。'
            }
          }
        },
        analysis: {
          number: '05',
          title: 'ダメージ分析',
          content: {
            error: '入力エラーを修正するとダメージ分析を表示します。',
            metrics: {
              critRate: '会心率',
              critDamage: '会心ダメージ',
              hp: 'HP%',
              atk: '攻撃力%',
              em: '元素熟知'
            },
            memory: {
              title: '合計ダメージ期待値の記録・比較',
              description:
                '現在の結果を記録し、過去の結果と比較できます。記録された結果はこのブラウザーに保存されます。',
              current: '現在のダメージ',
              label: '現在のダメージのラベル',
              placeholder: '例：パーティ1',
              save: '現在のダメージを記録',
              saved: '記録しました',
              tableAria: '記録した合計ダメージ期待値の比較',
              columns: ['基準', 'ラベル', '合計ダメージ期待値', '増加幅', '増加率', '削除'],
              drag: 'をドラッグして並べ替え',
              dragTitle: 'ドラッグして並べ替え',
              savedLabelAria: '記録のラベル',
              remove: '削除',
              removeSuffix: 'を削除',
              empty: 'まだ記録したダメージはありません',
              chartAria: '記録したダメージの棒グラフ',
              chartTitle: '合計ダメージ期待値の比較',
              defaultRecord: '記録',
              unnamed: '名称未設定',
              resultFieldLabel: 'ラベル',
              resultFieldAria: '記録するダメージのラベル',
              resultNote: '記録したダメージはダメージ分析の合計ダメージ期待値の記録・比較で確認できます'
            },
            actual: {
              title: '実ダメージ確認',
              description: '現在のステータスと編成を使い、各攻撃が1回命中したときのダメージを確認できます。',
              attacks: {
                通常1段目: '通常1段目',
                重撃: '重撃',
                血梅香: '血梅香',
                元素爆発: '元素爆発'
              },
              critical: {
                label: '会心',
                options: {
                  critical: '会心の攻撃',
                  normal: '会心の攻撃でない'
                }
              },
              reaction: {
                label: '元素反応',
                options: {
                  none: '元素反応なし',
                  vaporize: '蒸発',
                  melt: '溶解'
                }
              },
              flat: {
                label: '実数ダメージ加算',
                options: {
                  include: '含める',
                  exclude: '含めない'
                }
              },
              yelan: '夜蘭の元素爆発によるダメージバフ',
              nico: {
                label: 'ニコのバフ',
                gift: '虚己の恵み',
                guidance: '聖祝の導き'
              },
              inactive: '未発動',
              secondsAfter: '秒後',
              help: {
                title: '数値が実際と異なる場合',
                items: [
                  'ダメージ計算の正確性には万全を期していますが、入力された数値の精度により僅かな誤差が生じることがあります',
                  '例えば、ゲーム内では会心ダメージは0.1%単位でしか確認できませんが、会心ダメージが0.01%異なるだけで数十ほどの計算誤差が生じます'
                ]
              }
            },
            gain: {
              title: 'ステータスの変化によるダメージ増加の計算',
              description:
                '各ステータスの上昇量を入力すると、現在の条件からその上昇量だけを増やした場合の合計ダメージ期待値を計算できます。',
              baseline: '現在の合計ダメージ期待値',
              tableAria: 'ステータス別のダメージ増加比較',
              columns: ['ステータス', '上昇量', 'ダメージ', '増加幅', '増加率'],
              increaseSuffix: 'の上昇量',
              note: '各項目は個別に比較しています。'
            },
            potential: {
              title: 'ステータス別の伸びしろ',
              description: '各ステータスのダメージの伸びやすさを比較します。',
              atkComparison: '、攻撃力% ×3',
              aria: 'ステータス別の伸びしろ',
              chartLabel: '伸びしろ',
              includeAtk: '攻撃力%を含める',
              help: {
                button: '伸びしろについて',
                title: '伸びしろとは',
                paragraphs: [
                  '各ステータスを僅かに増やしたとき、合計ダメージ期待値がどれだけ増加するかを表します。大きな割合を占めるステータスほど、同じ労力を費やした際に合計ダメージ期待値が大きく増加することを示します。',
                  'より正確には、ステータスの伸びしろとは、合計ダメージ期待値のそのステータスによる対数偏微分に聖遺物のステータスなどに現れる値の比を乗じたものです。'
                ]
              }
            },
            score: {
              title: '理想的なスコア計算式',
              description:
                '一般的に聖遺物のスコアは「スコア = 2×会心率 + 会心ダメージ + 攻撃力」などで定義されます。ここでは、入力された条件応じて合計ダメージ期待値に忠実なスコア計算式を提案します。',
              current: '現在の条件',
              note: 'Δr：会心率、Δd：会心ダメージ、Δh：HP%、Δe：元素熟知の変化量',
              formulaTitle: '理想的なスコア',
              help: {
                button: '理想的なスコア計算式について',
                title: '理想的なスコア計算式とは',
                paragraphs: [
                  '理想的なスコア計算式とは、「装備する聖遺物のスコアが高いほど合計ダメージ期待値が高い」という関係が近似的に成り立つような聖遺物スコアの計算式のことです。',
                  'より正確には、合計ダメージ期待値の各ステータスによる対数全微分において、∂/∂xを形式的にそのステータスに置き換えたものをいいます。'
                ]
              }
            },
            dps: {
              title: '簡易的なDPSの計算',
              description: '合計ダメージ期待値からパーティ全体のDPSを概算します。',
              ratio: 'パーティ全体のダメージのうち胡桃のダメージが占める割合',
              seconds: '1ローテーションに要する秒数',
              secondsUnit: '秒',
              result: 'DPS'
            }
          }
        },
        other: {
          number: '06',
          title: 'その他',
          hpCapTitle: '胡桃のHP上限について',
          statUpdate: {
            description:
              '装備の精錬ランクなどを変更したとき、確認済みの数値の更新を提案するか選べます。入力欄が初期値のままの場合は提案や通知を表示しません。',
            automaticDetailsTitle: '設定と更新を提案するステータス',
            automaticItems: [
              '護摩の杖の精錬ランクの変更 → 胡桃のHP上限と攻撃力の更新を提案',
              '祭星者の眺めの精錬ランクの変更 → シトラリの元素熟知の更新を提案',
              '聖顕の鍵の精錬ランクの変更 → フリーナのHP上限の更新を提案',
              '塵と光の七つの誓約の精錬ランクの変更 → ニコの攻撃力の更新を提案'
            ],
            reminderDetailsTitle: '設定と更新を促すステータス',
            reminderItems: [
              '胡桃のレベルの変更 → 胡桃のHP上限と攻撃力の更新を促す',
              'フリーナのレベルの変更 → フリーナのHP上限の更新を促す',
              'シロネンのレベルの変更 → シロネンの防御力の更新を促す',
              'シトラリの聖遺物の変更 → シトラリの元素熟知の更新を促す',
              'シロネンの聖遺物の変更 → シロネンの防御力の更新を促す',
              '祭星者の眺めの装備切替 → シトラリの元素熟知の更新を促す',
              '塵と光の七つの誓約の装備切替 → ニコの基礎攻撃力と攻撃力の更新を促す',
              '岩峰を巡る歌の装備切替 → シロネンの防御力の更新を促す'
            ]
          },
          creator: {
            title: '制作者について',
            description:
              'このWebページをHoYoLABの記事で紹介しています。このツールの誤りや不具合を発見された方は、記事で報告してくださると嬉しいです。',
            links: [
              {
                label: '準備中です！',
                url: 'https://example.com/'
              }
            ]
          },
          assumptions: {
            title: '計算の前提',
            items: [
              '護摩の杖のレベルは90で、火魔女4を装備しているとします',
              '血梅香ダメージを含む胡桃の攻撃中は、常にHP50%未満で元素スキルによる攻撃力上昇中とします',
              '胡桃の天賦レベルは全て最大（10または13）とします。ニコの元素スキルなど、胡桃のダメージに関係するサポーターの天賦レベルも全て最大（10または13）とします',
              'フリーナの元素爆発効果やシトラリ完凸効果は、胡桃の攻撃中常に最大効果が持続するとします',
              'フリーナの聖顕の鍵の効果は、フリーナ2凸効果の前に発動されるとします',
              '胡桃の攻撃中は、ニコの元素スキルによるバフが常に聖祝の導きに昇格しているとします',
              'ニコ1凸効果による攻撃は合計ダメージに含めません',
              '攻撃ごとに元素反応の発生を考えるのではなく、見かけの元素反応確率・倍率を用いて平均的に合計ダメージ期待値を算出しています',
              '聖遺物最適化では、★5でLv.20の聖遺物のみ分析できます',
              'ページ内のダメージ計算に関する文章表現は、参考文献の『原神Wiki ダメージ計算式』に倣いました'
            ]
          },
          references: {
            title: '参考文献など',
            heading: '参考文献',
            links: [
              {
                label: '原神Wiki ダメージ計算式',
                url: 'https://wikiwiki.jp/genshinwiki/%E3%83%80%E3%83%A1%E3%83%BC%E3%82%B8%E8%A8%88%E7%AE%97%E5%BC%8F'
              },
              {
                label: 'HoYoLAB「胡桃の与えるダメージが増加するか減少するか判定する方法について」',
                url: 'https://www.hoyolab.com/article/43115011'
              },
              {
                label: 'HoYoLAB「シトラリ入り胡桃編成における蒸発・溶解反応の発生頻度の測定およびその考察」',
                url: 'https://www.hoyolab.com/article/43897730'
              },
              {
                label:
                  'HoYoLAB「【聖遺物スコアは信用していいの？】理想的なスコア計算式の導出と従来式との比較」',
                url: 'https://www.hoyolab.com/article/25776163'
              }
            ]
          },
          numericSources: {
            title: '数値引用元',
            links: [
              {
                label: '原神Wiki 胡桃',
                url: 'https://wikiwiki.jp/genshinwiki/%E8%83%A1%E6%A1%83'
              },
              {
                label: '原神Wiki キャラクター一覧 >> 夜蘭、シトラリ、フリーナ、ニコ、シロネン',
                url: 'https://wikiwiki.jp/genshinwiki/%E3%82%AD%E3%83%A3%E3%83%A9%E3%82%AF%E3%82%BF%E3%83%BC%E4%B8%80%E8%A6%A7'
              },
              {
                label: '原神Wiki 武器 >> 片手剣、長柄武器、法器、弓',
                url: 'https://wikiwiki.jp/genshinwiki/%E6%AD%A6%E5%99%A8'
              },
              {
                label: 'Genshin Impact Wiki "Hu Tao"',
                url: 'https://genshin-impact.fandom.com/wiki/Hu_Tao'
              },
              {
                label: 'Genshin Impact Wiki "Furina"',
                url: 'https://genshin-impact.fandom.com/wiki/Furina'
              },
              {
                label: 'Genshin Impact Wiki "Xilonen"',
                url: 'https://genshin-impact.fandom.com/wiki/Xilonen'
              },
              {
                label: 'Genshin Impact Wiki "Weapon/Level Scaling"',
                url: 'https://genshin-impact.fandom.com/wiki/Weapon/Level_Scaling'
              }
            ]
          },
          imageSources: {
            title: '画像引用元',
            links: [
              {
                label: 'HoYoWiki',
                url: 'https://wiki.hoyolab.com/pc/genshin/home'
              }
            ]
          },
          history: {
            title: '更新履歴',
            items: [
              {
                date: '2026年10月7日',
                text: '聖遺物の最適化機能を追加。また、設定コードを短くしました。（以前の設定コードからでも復元できます）'
              },
              {
                date: '2026年9月29日',
                text: 'キャラクターにシロネンを追加。ステータス更新の提案機能や入力内容の保存機能を追加。その他、Webページのデザインを改善しました。'
              },
              {
                date: '2026年9月13日',
                text: 'Webページを公開。'
              }
            ]
          }
        }
      },
      referenceValues: {
        hutao: {
          hp: 'フィールド上HP上限',
          atk: '元素スキル後の攻撃力',
          baseHp: '基礎HP',
          baseAtk: '基礎攻撃力',
          homaAbove: '護摩の攻撃力バフ（HP50%以上）',
          homaBelow: '護摩の攻撃力バフ（HP50%未満）',
          skill: '元素スキルの攻撃力バフ',
          fixedBonus: '炎元素ダメージバフ',
          effectiveCrit: '実効会心率'
        },
        citlali: {
          em: '最終元素熟知',
          flat: 'シトラリ1凸効果1回分の実数ダメージ加算'
        },
        furina: {
          baseHp: '基礎HP',
          hp: '最終HP上限',
          emBuff: '聖顕の鍵による元素熟知バフ',
          weaponMissing: '武器未装備 ＝ 0'
        },
        nico: {
          atk: '元素スキル前攻撃力',
          finalAtk: '最終攻撃力',
          guidance: '導きの加護1回分の実数ダメージ加算',
          gift: '虚己の恵みの攻撃力バフ',
          capPrefix: '上限',
          buff: '聖祝の導きの攻撃力バフ'
        },
        xilonen: {
          def: '最終防御力',
          weaponBuff: '岩峰による胡桃へのダメージバフ',
          flat: 'シロネン4凸効果1回分の実数ダメージ加算'
        }
      },
      actions: {
        reset: '入力例に戻す',
        resetConfirmTitle: '入力例に戻しますか？',
        resetConfirm:
          '現在の入力内容や合計ダメージ期待値の記録などは消去されます。登録した聖遺物は消去されません。よろしいですか？',
        confirmAction: '実行する',
        cancelAction: 'キャンセル',
        transfer: {
          title: '入力内容の保存・復元',
          description:
            'このページの入力内容は、ローカルストレージに保存され、一度ページを閉じても自動的に復元されます。ただし、他のブラウザーで開いたときなどは入力内容は維持されません。',
          codeDescription:
            '下のボタンを押すと、現在の入力内容、登録済みの聖遺物、合計ダメージ期待値の記録、DPS設定を復元できる設定コードを発行できます。このコードを保存すると、他のブラウザで開いたときやローカルストレージが失われたときでも復元できます。',
          exportDescription: 'このコードをご自身のメモ帳などに貼り付けてください',
          label: '設定コード',
          placeholder: '保存した設定コードをここに貼り付けてください。',
          show: '設定コードを表示',
          copy: 'コピー',
          restore: '設定コードから復元',
          restoreAction: '復元する',
          restoreConfirmTitle: '入力内容を復元しますか？',
          restoreConfirm:
            '現在の入力内容、合計ダメージ期待値の記録、DPS設定を上書きします。この設定コードには聖遺物一覧が含まれないため、登録済みの聖遺物は維持します。よろしいですか？',
          restoreWithArtifactsConfirm:
            '現在の入力内容、登録済みの聖遺物、合計ダメージ期待値の記録、DPS設定を上書きします。聖遺物一覧はコードに保存された{artifacts}個に置き換わります。よろしいですか？',
          restoredWithArtifacts:
            '入力内容、聖遺物{artifacts}個、ダメージ比較記録{records}件、DPS設定を復元しました。',
          restoredLegacy:
            '入力内容、ダメージ比較記録{records}件、DPS設定を復元しました。登録済みの聖遺物は維持しました。',
          length: '設定コードは{length}文字です。',
          close: '閉じる'
        }
      },
      result: {
        title: '合計ダメージ期待値',
        description: '1ローテーションで胡桃が敵1体に与えるダメージ期待値'
      },
      footer: {
        text: '制作者：さしす',
        link: 'https://www.hoyolab.com/accountCenter/postList?id=103140761'
      }
    },
    forms: {
      interface: {
        timingSegments: {
          before: '発動前',
          after: '発動後',
          labels: {
            cAfterElegy: '終焉を嘆く詩の効果',
            cAfterKey: '聖顕の鍵の効果',
            fAfterYelan: '夜蘭4凸効果',
            fAfterXilonen: 'シロネン2凸効果',
            nAfterElegy: '終焉を嘆く詩の効果',
            nAfterXilonen: 'シロネン2凸効果'
          },
          groupHeadings: {
            citlali: 'シトラリ1凸効果発動タイミング',
            furina: '聖顕の鍵効果発動タイミング',
            nico: 'ニコの元素スキル発動タイミング'
          }
        },
        xDefHelp: { button: '防御力の入力について', title: '防御力の入力について' },
        duplicateArtifacts: {
          scroll: '英雄の絵巻4が複数のキャラクターに装備されています！',
          instructor: '教官4が複数のキャラクターに装備されています！'
        },
        groups: ['キャラクター設定', '武器・聖遺物', '効果の調整'],
        inputModes: {
          common: {
            observed: '確認した{stat}',
            converted: '{stat}の換算値',
            settings: '{stat}の設定',
            stateLabel: '{stat}を確認したときの状態',
            helpLabel: '{title}について',
            conditionNames: {
              hpHydroResonanceIncluded: '水共鳴',
              atkHydroResonanceIncluded: '水共鳴',
              atkPyroResonanceIncluded: '炎共鳴',
              atkHpCondition: 'HP',
              cEmConstellation2Included: '2凸効果',
              fHpHydroResonanceIncluded: '水共鳴',
              nAtkPyroResonanceIncluded: '炎共鳴'
            },
            present: 'あり',
            absent: 'なし',
            included: '含む',
            excluded: '含まない',
            water: '水共鳴',
            fire: '炎共鳴',
            lowHp: 'HP50%未満',
            highHp: 'HP50%以上',
            constellation: '2凸効果'
          },
          hutaoAtk: {
            title: '胡桃の攻撃力の入力方法',
            choices: [
              ['below50', 'フィールド上攻撃力'],
              ['atLeast50', 'ビルドカード上攻撃力']
            ],
            paragraphs: [
              '胡桃の攻撃力を入力し、その攻撃力には水共鳴・炎共鳴が含まれているか、HPは50%未満か否かを指定してください。攻撃力の換算値には、水共鳴と炎共鳴がなく、HP50%以上の場合の攻撃力を計算して表示します。',
              '聖遺物や護摩の杖の効果は含め、元素スキルやサポーターのバフは含めないでください。',
              'Enka.NetworkおよびArtifacter Webのビルドカードでは、水共鳴と炎共鳴がなく、HP50%以上の場合の攻撃力が表示されます。'
            ]
          },
          citlaliEm: {
            title: 'シトラリの元素熟知の入力方法',
            choices: [
              ['yes', 'フィールド上元素熟知'],
              ['no', 'ビルドカード上元素熟知']
            ],
            paragraphs: [
              'シトラリの元素熟知を入力し、その元素熟知にはシトラリ2凸効果が含まれているか否かを指定してください。元素熟知の換算値には、2凸効果を含まない数値を計算して表示します。',
              '武器の効果や聖遺物のステータス、教官2セットの効果は含め、教官4セットや他のサポーターのバフは含めないでください。',
              'Enka.NetworkおよびArtifacter Webのビルドカードでは、2凸効果を含まない元素熟知が表示されます。'
            ]
          },
          furinaHp: {
            title: 'フリーナのHP上限の入力方法',
            choices: [
              ['yes', 'フィールド上HP上限'],
              ['no', 'ビルドカード上HP上限']
            ],
            paragraphs: [
              'フリーナのHP上限を入力し、そのHP上限には水共鳴が含まれているかを指定してください。HP上限の換算値には、水共鳴がない場合の数値を計算して表示します。',
              '聖遺物や武器の効果は含め、フリーナ2凸効果や他のサポーターのバフは含めないでください。',
              'Enka.NetworkおよびArtifacter Webのビルドカードでは、水共鳴を含まないHP上限が表示されます。'
            ]
          },
          nicoAtk: {
            title: 'ニコの攻撃力の入力方法',
            choices: [
              ['yes', 'フィールド上攻撃力'],
              ['no', 'ビルドカード上攻撃力']
            ],
            paragraphs: [
              'ニコの攻撃力を入力し、その攻撃力には炎共鳴が含まれているかを指定してください。攻撃力の換算値には、炎共鳴がない場合の数値を計算して表示します。',
              '聖遺物や武器の効果は含め、他のサポーターのバフは含めないでください。',
              'Enka.NetworkおよびArtifacter Webのビルドカードでは、炎共鳴を含まない攻撃力が表示されます。'
            ]
          },
          hutaoHp: {
            title: '胡桃のHP上限の入力方法',
            choices: [
              ['yes', 'フィールド上HP上限'],
              ['no', 'ビルドカード上HP上限']
            ],
            paragraphs: [
              '胡桃のHP上限を入力し、そのHP上限には水共鳴効果が含まれているか否かを指定してください。HP上限の換算値には、水共鳴がない場合の数値を計算して表示します。',
              '聖遺物や護摩の杖の効果は含め、夜蘭4凸効果などサポーターのバフは含めないでください。',
              'Enka.NetworkおよびArtifacter Webのビルドカードでは、水共鳴を含まないHP上限が表示されます。'
            ]
          }
        },
        cCountHelp: {
          button: 'シトラリ1凸効果の発動回数について',
          title: 'シトラリ1凸効果の発動回数',
          items: [
            'シトラリを1凸すると、元素スキル使用時に「星の刃」を10層獲得します',
            'フィールド上のキャラクターが通常攻撃、重撃、落下攻撃、元素スキル、元素爆発でダメージを与えると星の刃を1層消費します',
            '溶解または凍結を起こすと、星の刃を追加で3層獲得します',
            '星の刃の追加獲得には8秒のクールダウンがあります',
            '星の刃の層数は全キャラクターで共有します'
          ]
        }
      },
      common: {
        referenceTitle: '参考値',
        teamOptions: [
          ['none', '未編成'],
          ['yelan', '夜蘭'],
          ['furina', 'フリーナ'],
          ['citlali', 'シトラリ'],
          ['nico', 'ニコ'],
          ['xilonen', 'シロネン']
        ]
      },
      hutao: {
        fields: [
          {
            id: 'level',
            label: 'キャラクターレベル',
            value: 90,
            options: [90, 95, 100]
          },
          {
            id: 'homa',
            label: '護摩の杖・精錬ランク',
            value: 1,
            options: [1, 2, 3, 4, 5]
          },
          {
            id: 'constellation',
            label: '命ノ星座',
            value: 1,
            options: [
              [0, '0凸'],
              [1, '1凸'],
              [2, '2凸'],
              [3, '3凸'],
              [4, '4凸'],
              [5, '5凸'],
              [6, '6凸']
            ]
          },
          {
            id: 'c6Rate',
            label: '6凸効果発動割合',
            value: 0,
            unit: '%',
            max: 100,
            hint: '6凸発動割合 + (1-6凸発動割合)×会心率 で実効会心率を計算'
          },
          {
            id: 'hp',
            label: 'HP上限',
            value: 30000,
            min: 1
          },
          {
            id: 'hpHydroResonanceIncluded',
            label: 'HP上限を確認したときの水共鳴',
            value: 'no',
            options: [
              ['yes', '水共鳴あり'],
              ['no', '水共鳴なし']
            ]
          },
          {
            id: 'atk',
            label: '攻撃力',
            value: 2000,
            min: 1
          },
          {
            id: 'atkHpCondition',
            label: '攻撃力を確認したときのHP',
            value: 'atLeast50',
            options: [
              ['below50', 'HP 50%未満'],
              ['atLeast50', 'HP 50%以上']
            ]
          },
          {
            id: 'atkHydroResonanceIncluded',
            label: '攻撃力を確認したときの水共鳴',
            value: 'no',
            options: [
              ['yes', '水共鳴あり'],
              ['no', '水共鳴なし']
            ]
          },
          {
            id: 'atkPyroResonanceIncluded',
            label: '攻撃力を確認したときの炎共鳴',
            value: 'no',
            options: [
              ['yes', '炎共鳴あり'],
              ['no', '炎共鳴なし']
            ]
          },
          {
            id: 'em',
            label: '元素熟知',
            value: 250
          },
          {
            id: 'cr',
            label: '会心率',
            value: 70,
            unit: '%',
            max: 300
          },
          {
            id: 'cd',
            label: '会心ダメージ',
            value: 240,
            unit: '%',
            max: 2000
          }
        ]
      },
      supporters: {
        yelan: {
          name: '夜蘭',
          fields: [
            {
              id: 'yC',
              label: '命ノ星座',
              value: 2,
              optionType: 'constellation'
            },
            {
              id: 'yBuff',
              label: '元素爆発によるダメージバフの平均値',
              value: 30,
              unit: '%',
              max: 50,
              hint: '0〜50%の値を入力'
            },
            {
              id: 'yWeapon',
              label: '終焉を嘆く詩・効果発動済み',
              value: true,
              check: true
            },
            {
              id: 'yR',
              label: '武器の精錬ランク',
              value: 1,
              optionType: 'refine'
            },
            {
              id: 'yStacks',
              label: '4凸効果の層数',
              value: 4,
              options: [
                [0, '0層（HP＋0%）'],
                [1, '1層（HP＋10%）'],
                [2, '2層（HP＋20%）'],
                [3, '3層（HP＋30%）'],
                [4, '4層（HP＋40%）']
              ],
              hint: ''
            }
          ]
        },
        citlali: {
          name: 'シトラリ',
          fields: [
            {
              id: 'cC',
              label: '命ノ星座',
              value: 2,
              optionType: 'constellation'
            },
            {
              id: 'cEm',
              label: '元素熟知',
              value: 1250
            },
            {
              id: 'cEmConstellation2Included',
              label: '確認した元素熟知に2凸効果',
              value: 'no',
              options: [
                ['yes', '2凸効果を含む'],
                ['no', '2凸効果を含まない']
              ]
            },
            {
              id: 'cCount',
              label: 'シトラリ1凸効果の発動回数',
              value: 10,
              step: 1,
              max: 16,
              hint: '1凸以上で有効。0〜16の整数'
            },
            {
              id: 'cSet',
              label: '聖遺物',
              value: 'scroll',
              options: [
                ['scroll', '英雄の絵巻4'],
                ['instructor', '教官4'],
                ['none', '効果なし']
              ],
              hint: '英雄の絵巻4はシトラリが溶解反応を起こし、炎元素ダメージバフ+40%を得られるものとして計算します。溶解反応を起こせない場合、「効果なし」を選択してください。異なるサポーターに同じセット効果の聖遺物を指定することはできますが、セット効果は重複しません。'
            },
            {
              id: 'cWeapon',
              label: '祭星者の眺め・効果発動済み',
              value: true,
              check: true
            },
            {
              id: 'cR',
              label: '武器の精錬ランク',
              value: 1,
              optionType: 'refine'
            },
            {
              id: 'cAfterElegy',
              label: '終焉を嘆く詩効果発動後にシトラリ1凸効果を発動',
              value: true,
              check: true
            },
            {
              id: 'cAfterKey',
              label: '聖顕の鍵効果発動後にシトラリ1凸効果を発動',
              value: true,
              check: true
            }
          ]
        },
        furina: {
          name: 'フリーナ',
          fields: [
            {
              id: 'fLevel',
              label: 'キャラクターレベル',
              value: 90,
              options: [90, 95, 100]
            },
            {
              id: 'fC',
              label: '命ノ星座',
              value: 2,
              optionType: 'constellation'
            },
            {
              id: 'fHp',
              label: 'HP上限',
              value: 50000,
              min: 1
            },
            {
              id: 'fHpHydroResonanceIncluded',
              label: 'HP上限を確認したときの水共鳴',
              value: 'no',
              options: [
                ['yes', '水共鳴あり'],
                ['no', '水共鳴なし']
              ]
            },
            {
              id: 'fR',
              label: '武器の精錬ランク',
              value: 1,
              optionType: 'refine'
            },
            {
              id: 'fWeapon',
              label: '聖顕の鍵・3層効果発動済み',
              value: true,
              check: true
            },
            {
              id: 'fAfterYelan',
              label: '夜蘭4凸効果発動後に聖顕の鍵効果を発動',
              value: true,
              check: true
            },
            {
              id: 'fAfterXilonen',
              label: '聖顕の鍵の発動タイミング（シロネン）',
              value: false,
              check: true
            }
          ]
        },
        nico: {
          name: 'ニコ',
          fields: [
            {
              id: 'nC',
              label: '命ノ星座',
              value: 2,
              optionType: 'constellation'
            },
            {
              id: 'nBaseAtk',
              label: '基礎攻撃力',
              value: 1083,
              min: 1
            },
            {
              id: 'nAtk',
              label: '攻撃力',
              value: 4000,
              min: 1
            },
            {
              id: 'nAtkPyroResonanceIncluded',
              label: '攻撃力を確認したときの炎共鳴',
              value: 'no',
              options: [
                ['yes', '炎共鳴あり'],
                ['no', '炎共鳴なし']
              ]
            },
            {
              id: 'nAfterElegy',
              label: '終焉を嘆く詩効果発動後に元素スキル効果を発動',
              value: false,
              check: true
            },
            {
              id: 'nAfterXilonen',
              label: 'ニコの元素スキルの発動タイミング（シロネン）',
              value: false,
              check: true
            },
            {
              id: 'nWeapon',
              label: '塵と光の七つの誓約・発動済み',
              value: true,
              check: true
            },
            {
              id: 'nR',
              label: '武器の精錬ランク',
              value: 1,
              optionType: 'refine'
            },
            {
              id: 'nSet',
              label: '聖遺物',
              value: true,
              check: true,
              hint: '贈り物は魔導・秘儀が有効でないとし、炎元素ダメージバフ+20%が得られるものとして計算します。'
            }
          ]
        },
        xilonen: {
          name: 'シロネン',
          visual: { weapon: '岩峰を巡る歌', shortWeapon: '岩峰' },
          effects: {
            shred: 'シロネン・炎音源の耐性低下',
            attack: 'シロネン2凸・炎音源',
            flat: 'シロネン4凸効果による実数ダメージ加算（6回）',
            weapon: '岩峰を巡る歌',
            scroll: '英雄の絵巻・炎を含む結晶反応',
            instructor: '教官4・胡桃の熟知'
          },
          fields: [
            { id: 'xLevel', label: 'キャラクターレベル', value: 90, options: [90, 95, 100] },
            { id: 'xC', label: '命ノ星座', value: 2, optionType: 'constellation' },
            {
              id: 'xDef',
              label: '防御力',
              value: 4000,
              min: 1,
              hint: '武器のサブステータス（防御力+82.7%）と聖遺物の効果を含め、武器効果（防御力16~32%）と固有天賦の防御力上昇は含めない数値を入力してください。Enka.NetworkおよびArtifacter Webのビルドカードでは、上で指定した値が表示されます。'
            },
            { id: 'xWeapon', label: '岩峰を巡る歌・2層発動済み', value: true, check: true },
            { id: 'xR', label: '武器の精錬ランク', value: 1, optionType: 'refine' },
            {
              id: 'xSet',
              label: '聖遺物',
              value: 'scroll',
              options: [
                ['scroll', '英雄の絵巻4'],
                ['instructor', '教官4'],
                ['none', '効果なし']
              ],
              hint: '英雄の絵巻4はシロネンが炎の結晶反応を起こし、炎元素ダメージバフ+40%を得られるものとして計算します。炎の結晶反応を起こせない場合、「効果なし」を選択してください。異なるサポーターに同じセット効果の聖遺物を指定することはできますが、セット効果は重複しません。'
            }
          ]
        }
      },
      enemy: {
        fields: [
          {
            id: 'prob',
            label: '見かけの元素反応確率',
            value: 74.86,
            unit: '%',
            max: 100,
            hint: '0%＝元素反応なし、100%＝全て元素反応'
          },
          {
            id: 'amp',
            label: '見かけの元素反応倍率',
            value: 1.701,
            min: 1.5,
            max: 2,
            hint: '1.5＝蒸発のみ、2＝溶解のみ'
          },
          {
            id: 'enemy',
            label: '敵レベル',
            value: 100,
            min: 1,
            max: 200,
            step: 1
          },
          {
            id: 'res',
            label: '敵の元素耐性',
            value: 10,
            unit: '%',
            min: -100,
            max: 1000
          }
        ]
      },
      extra: {
        fields: [
          {
            id: 'customHp',
            label: 'HP%',
            value: 0,
            unit: '%',
            max: 1000
          },
          {
            id: 'customHpTeam',
            label: 'チーム全員に有効',
            value: false,
            check: true
          },
          {
            id: 'customAtkFlat',
            label: '攻撃力',
            value: 0
          },
          {
            id: 'customAtkFlatTeam',
            label: 'チーム全員に有効',
            value: false,
            check: true
          },
          {
            id: 'customAtkPct',
            label: '攻撃力%',
            value: 0,
            unit: '%',
            max: 1000
          },
          {
            id: 'customAtkPctTeam',
            label: 'チーム全員に有効',
            value: false,
            check: true
          },
          {
            id: 'customEm',
            label: '元素熟知',
            value: 0
          },
          {
            id: 'customEmTeam',
            label: 'チーム全員に有効',
            value: false,
            check: true
          },
          {
            id: 'customCr',
            label: '会心率',
            value: 0,
            unit: '%',
            max: 1000
          },
          {
            id: 'customCd',
            label: '会心ダメージ',
            value: 0,
            unit: '%',
            max: 2000
          },
          {
            id: 'bonus',
            label: 'ダメージバフ',
            value: 0,
            unit: '%',
            max: 1000
          },
          {
            id: 'reactionBonus',
            label: '元素反応の加算効果',
            value: 0,
            unit: '%',
            max: 1000,
            hint: '蒸発と溶解で異なる加算効果を設定することはできません'
          },
          {
            id: 'otherFlat',
            label: '1回の実数ダメージ加算',
            value: 0
          },
          {
            id: 'otherCount',
            label: '実数ダメージ加算回数',
            value: 0,
            step: 1,
            max: 23
          },
          {
            id: 'def',
            label: '防御デバフ',
            value: 0,
            unit: '%',
            min: -100,
            max: 0,
            hint: '低下量をマイナスの値で入力'
          },
          {
            id: 'ignore',
            label: '防御無視',
            value: 0,
            unit: '%',
            max: 100
          },
          {
            id: 'shred',
            label: '元素耐性デバフ',
            value: 0,
            unit: '%',
            min: -1000,
            max: 0,
            hint: '低下量をマイナスの値で入力'
          }
        ]
      }
    }
  };

  // 聖遺物最適化の画面・操作・エラーに表示する文言。
  CONTENT.page.navigation.items.splice(
    CONTENT.page.navigation.items.findIndex((item) => item.id === 'other'),
    0,
    { id: 'optimizer', label: '聖遺物最適化' }
  );
  CONTENT.page.sections.other.number = '07';
  CONTENT.page.sections.optimizer = {
    number: '06',
    title: '聖遺物最適化',
    intro: '聖遺物のステータスを入力すると、合計ダメージ期待値が最も高い聖遺物の組み合わせを計算します。',
    restriction: '火魔女4セットが発動する組み合わせのみを計算対象とします。',
    registration: '聖遺物の登録',
    part: '部位',
    set: 'セット効果',
    main: 'メインステータス',
    mainValue: '',
    mainHint: '',
    subs: 'サブステータス',
    sub: '',
    subValue: 'サブステータス{n}の数値',
    optional: '胡桃のダメージに関係しないサブステータスを入力する必要はありません',
    choose: 'ー',
    otherMainDisplay: 'ー',
    mainValueAria: 'メインステータスの数値',
    add: '登録する',
    update: '更新する',
    cancel: '編集をキャンセル',
    editing: '聖遺物{id}を編集中',
    added: '登録しました',
    updated: '更新しました',
    lists: '登録済みの聖遺物',
    empty: '登録済みの聖遺物はありません',
    id: 'ID',
    actions: '',
    edit: '編集',
    remove: '削除',
    drag: '{id}を並べ替える（ドラッグ、または上下矢印キー）',
    dragSymbol: '⠿',
    dragTitle: 'ドラッグして並べ替え',
    mainOp: 'メインOP',
    subOp: 'サブOP{n}',
    statFormat: '{stat} +{value}{unit}',
    statDisplayNames: {
      hp: 'HP',
      hpPct: 'HP',
      atk: '攻撃力',
      atkPct: '攻撃力',
      defPct: '防御力',
      pyro: '炎バフ'
    },
    calculate: '最適聖遺物を計算',
    calculating: '計算中',
    renumber: '聖遺物のIDを振りなおす',
    removeAll: '全ての聖遺物を削除する',
    removeAllConfirmTitle: '聖遺物を削除しますか？',
    removeAllConfirm: '登録済みの全ての聖遺物を削除します。よろしいですか？',
    removeAllYes: 'はい',
    removeAllNo: 'いいえ',
    ranking: '聖遺物の最適化',
    rank: '{rank}位',
    damage: '合計ダメージ期待値',
    decrease: 'TOP1からの減少率',
    currentRatio: '現在のダメージとの比',
    equipped: '装備後ステータス',
    equippedNote: '胡桃6凸効果、元素共鳴、サポーターのバフ、カスタムバフを含まない数値を表示しています',
    apply: 'この聖遺物の組み合わせを設定に反映する',
    applied: '反映しました',
    more: '表示した候補以外にも、上位3位以内の聖遺物の組み合わせがあります。',
    missing: '{parts}の聖遺物を登録してください。',
    noSet: '火魔女4セットを満たす組み合わせがありません',
    conditionsError: '現在の設定に入力エラーがあります。設定欄のエラーを修正してください。',
    calculationError: '計算結果が数値の範囲を超えました。入力値を確認してください。',
    storageError: '聖遺物の自動保存を利用できません。',
    storageNote: '',
    limit: 'この部位は10個まで登録できます。既存の聖遺物を編集または削除してください。',
    dash: '—',
    percent: '%',
    separator: '・',
    parts: { flower: '花', plume: '羽', sand: '時計', goblet: '杯', circlet: '冠' },
    sets: { witch: '火魔女', other: 'その他' },
    stats: {
      hp: 'HP実数',
      atk: '攻撃力実数',
      hpPct: 'HP%',
      atkPct: '攻撃力%',
      defPct: '防御力%',
      em: '元素熟知',
      er: '元素チャージ効率',
      pyro: '炎元素ダメージバフ',
      hydro: '水元素ダメージバフ',
      cryo: '氷元素ダメージバフ',
      electro: '雷元素ダメージバフ',
      anemo: '風元素ダメージバフ',
      geo: '岩元素ダメージバフ',
      dendro: '草元素ダメージバフ',
      physical: '物理ダメージバフ',
      cr: '会心率',
      cd: '会心ダメージ',
      healing: '与える治療効果',
      other: 'その他'
    },
    equippedLabels: { hp: 'HP上限', em: '元素熟知', cr: '会心率', cd: '会心ダメージ' },
    errors: {
      part: '部位を指定してください。',
      set: 'セット効果を指定してください。',
      main: 'メインステータスを指定してください。',
      slots: 'サブステータスは4つまで指定できます。',
      incomplete: '種類と数値の両方を入力するか、両方を空欄にしてください。',
      sub: '選択肢にあるサブステータスを指定してください。',
      value: '0以上の有限な数値を入力してください。',
      sameMain: 'メインステータスと同じ種類は指定できません。',
      duplicate: '同じサブステータスを重複して指定できません。'
    }
  };
  CONTENT.forms.hutao.fixedArtifact = { label: '聖遺物', value: '火魔女4', hint: '' };
  CONTENT.forms.hutao.fields.push({
    id: 'gobletMain',
    label: '杯のメインステータス',
    value: 'pyro',
    options: [
      ['pyro', '炎元素ダメージバフ'],
      ['other', 'その他']
    ]
  });
  // Artifact substats accept any finite nonnegative value, including aggregate
  // values above the former manual-input caps.
  for (const field of CONTENT.forms.hutao.fields)
    if (['hp', 'atk', 'em', 'cr', 'cd'].includes(field.id)) field.max = Number.MAX_VALUE;
  CONTENT.forms.hutao.finiteError = '{stat}：{min}以上の有限な数値を入力してください。';
  const esc = (s) =>
    String(s).replace(/[&<>\"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const links = (items) =>
    `<ul>${items.map((x) => `<li><a class="text-external-link" href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">${esc(x.label)}</a></li>`).join('')}</ul>`;
  const sourceGroup = (title, items, note = '') =>
    `<div class="source-group"><h4>${title}</h4>${note ? `<p class="note text-meta">${note}</p>` : ''}${links(items)}</div>`;
  const sourceGroups = (other) =>
    `<section class="source-references"><h3>${other.references.title}</h3>${sourceGroup(other.references.heading, other.references.links, other.references.note)}${sourceGroup(other.numericSources.title, other.numericSources.links)}${sourceGroup(other.imageSources.title, other.imageSources.links)}</section>`;
  const heading = (s) =>
    `<div class="section-heading"><span class="number text-accent">${s.number}</span><h2>${s.title}</h2></div>`;
  function mount() {
    const p = CONTENT.page,
      s = p.sections,
      nav = p.navigation.items;
    document.title = p.title;
    document.getElementById('page-description').content = p.description;
    document.getElementById('app').innerHTML =
      `<main><div class="hero"><div><p class="eyebrow text-accent">${p.hero.eyebrow}</p><h1>${p.hero.titleBeforeBreak}<br class="mobile">${p.hero.titleAfterBreak}</h1><p class="intro text-standard">${p.hero.intro}</p></div><div class="motif" aria-hidden="true">${p.hero.motif}</div></div><nav class="view-tabs" role="tablist" aria-label="${p.navigation.ariaLabel}">${nav.map((x, i) => `<button type="button" role="tab" aria-selected="${i === 0}" aria-controls="view-${x.id}" data-view-button="${x.id}">${x.label}</button>`).join('')}</nav><div class="layout"><form id="calculator-form" novalidate>
 <div id="view-basic" role="tabpanel" data-view-panel="basic"><section class="panel">${heading(s.basic)}<div class="rotation"><span class="pill text-secondary-label">${s.basic.rotation.badge}</span><strong class="text-standard">${s.basic.rotation.formula}</strong></div><section class="basic-settings-group"><h3 class="heading-with-help"><span>${s.basic.reactionHeading}</span><button type="button" class="help-button" popovertarget="reaction-settings-help" aria-label="${s.basic.reactionHelp.title}">?</button></h3><div id="reaction-settings-help" class="help-popover" popover><strong class="text-primary-label">${s.basic.reactionHelp.title}</strong>${s.basic.reactionHelp.paragraphs.map((text) => `<p class="text-secondary">${text}</p>`).join('')}</div><div class="preset-buttons">${s.basic.presets.map((x) => `<button type="button" class="text-muted-action" data-prob="${x.prob}" data-amp="${x.amp}">${x.label}</button>`).join('')}</div><div id="reaction-fields" class="fields"></div></section><section class="basic-settings-group"><h3>${s.basic.enemyHeading}</h3><div id="enemy-fields" class="fields"></div></section><section class="basic-settings-group"><h3>${s.basic.custom.title}</h3><p class="note text-standard">${s.basic.custom.note}</p><details class="basic-custom-details"><summary>${s.basic.custom.expand}</summary><div id="extra-fields" class="fields"></div></details></section></section></div>
 <section class="panel" id="view-hutao" role="tabpanel" data-view-panel="hutao" hidden>${heading(s.hutao)}<div class="loadout-strip loadout-strip-featured" aria-label="${s.hutao.loadoutAria}">${s.hutao.loadout.map((x) => `<figure><img src="${x.image}" alt="${x.name}" width="256" height="256"><figcaption class="text-standard">${x.name}</figcaption></figure>`).join('')}</div><div id="hutao-fields" class="settings-groups"></div><div class="reference-values card-result"><h3>${s.hutao.referenceTitle}</h3><div id="reference-hutao" class="fields"></div></div></section>
 <section class="panel" id="view-support" role="tabpanel" data-view-panel="support" hidden>${heading(s.support)}<div id="team-fields" class="support-cards"></div><p id="team-resonance" class="callout text-standard"></p><p id="artifact-duplicate-warning" class="text-standard" role="status" hidden></p><div id="support-fields"></div></section><section class="panel verification" id="view-verification" role="tabpanel" data-view-panel="verification" hidden>${heading(s.verification)}<div id="verification-content"></div></section><section class="panel" id="view-analysis" role="tabpanel" data-view-panel="analysis" hidden>${heading(s.analysis)}<div id="analysis-content"></div></section>
<section class="panel references" id="view-other" role="tabpanel" data-view-panel="other" hidden>${heading(s.other)}<section class="hutao-hp-cap"><h3>${s.other.hpCapTitle}</h3><p id="hutao-hp-cap-status" class="callout text-standard"></p></section><section class="settings-transfer settings-subsection"><h3>${p.actions.transfer.title}</h3><p class="text-standard">${p.actions.transfer.description}</p><p class="text-standard">${p.actions.transfer.codeDescription}</p><div class="settings-transfer-actions"><button type="button" id="export-settings" class="text-muted-action">${p.actions.transfer.show}</button><button type="button" id="import-settings" class="text-muted-action">${p.actions.transfer.restore}</button></div><p id="settings-transfer-status" class="text-meta" role="status"></p></section><section class="stat-update-settings settings-subsection"><h3>ステータスの更新設定</h3><p class="text-standard">${s.other.statUpdate.description}</p><div class="field"><label class="label text-standard" for="stat-auto-preference">ステータス更新の提案</label><span class="input-wrap"><select id="stat-auto-preference"><option value="ask">毎回確認する</option><option value="apply">自動で更新する</option><option value="keep">更新しない</option></select></span></div><details class="stat-update-details"><summary class="text-secondary">${s.other.statUpdate.automaticDetailsTitle}</summary><ul class="text-secondary">${s.other.statUpdate.automaticItems.map((x) => `<li>${x}</li>`).join('')}</ul></details><div class="field"><label class="label text-standard" for="stat-reminder-preference">ステータス更新の促し</label><span class="input-wrap"><select id="stat-reminder-preference"><option value="show">毎回促す</option><option value="hide">表示しない</option></select></span></div><details class="stat-update-details"><summary class="text-secondary">${s.other.statUpdate.reminderDetailsTitle}</summary><ul class="text-secondary">${s.other.statUpdate.reminderItems.map((x) => `<li>${x}</li>`).join('')}</ul></details></section><section class="assumptions"><h3>${s.other.assumptions.title}</h3><ul class="text-standard">${s.other.assumptions.items.map((x) => `<li>${x}</li>`).join('')}</ul></section><section class="creator"><h3>${s.other.creator.title}</h3><p class="text-standard">${s.other.creator.description}</p>${links(s.other.creator.links)}</section>${sourceGroups(s.other)}<div class="history"><h3>${s.other.history.title}</h3>${s.other.history.items.map((x) => `<div class="history-entry text-standard"><span>${x.date}</span><span class="history-text">${x.text}</span></div>`).join('')}</div></section><div class="actions"><button type="button" id="reset-inputs" class="text-muted-action">${p.actions.reset}</button></div><p id="input-save-status" role="status" class="note text-meta"></p></form><aside><div class="result-card"><h2 class="text-on-red">${p.result.title}</h2><div id="rotation-total" class="total text-largest-result text-on-red" aria-live="polite"></div><p class="text-meta text-on-red-muted">${p.result.description}</p><div id="input-error" class="text-error" role="alert" hidden></div></div></aside></div><dialog id="export-settings-dialog" class="settings-dialog card-basic" aria-labelledby="export-settings-title"><h3 id="export-settings-title" tabindex="-1">${p.actions.transfer.show}</h3><label class="text-standard" for="export-settings-code">${p.actions.transfer.exportDescription}</label><textarea id="export-settings-code" rows="7" readonly spellcheck="false"></textarea><div class="settings-dialog-actions"><button type="button" id="copy-settings-code" class="text-muted-action">${p.actions.transfer.copy}</button><button type="button" class="text-muted-action" data-close-settings-dialog>${p.actions.transfer.close}</button></div><p id="export-settings-status" class="text-meta" role="status"></p></dialog><dialog id="import-settings-dialog" class="settings-dialog card-basic" aria-labelledby="import-settings-title"><h3 id="import-settings-title">${p.actions.transfer.restore}</h3><label class="text-standard" for="import-settings-code">${p.actions.transfer.label}</label><textarea id="import-settings-code" rows="7" spellcheck="false" placeholder="${p.actions.transfer.placeholder}"></textarea><div class="settings-dialog-actions"><button type="button" id="restore-settings" class="text-muted-action">${p.actions.transfer.restoreAction}</button><button type="button" class="text-muted-action" data-close-settings-dialog>${p.actions.transfer.close}</button></div><p id="import-settings-status" class="text-meta" role="status"></p></dialog><footer>${p.footer.text} <a class="text-external-link" href="${esc(p.footer.link)}" target="_blank" rel="noopener noreferrer">${esc(p.footer.link)}</a></footer></main>`;
  }
  root.SITE_CONTENT = CONTENT;
  if (typeof document !== 'undefined') {
    mount();
    const panel = document.createElement('section');
    panel.className = 'panel card-basic';
    panel.id = 'view-optimizer';
    panel.setAttribute('role', 'tabpanel');
    panel.dataset.viewPanel = 'optimizer';
    panel.hidden = true;
    panel.innerHTML = heading(CONTENT.page.sections.optimizer) + '<div id="optimizer-content"></div>';
    document.getElementById('view-other').before(panel);
  }
  if (typeof module !== 'undefined') module.exports = CONTENT;
})(globalThis);
