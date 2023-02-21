# MinePaint <a href="https://github.com/Apedy/MinePaint/blob/master/LICENSE"><img src="https://flat.badgen.net/badge/license/GPL-3.0/green"></a> <a href="https://github.com/Apedy/MinePaint/releases/"><img src="https://flat.badgen.net/github/release/Apedy/MinePaint"></a>

<p align="center"><img src="https://image01.seesaawiki.jp/s/o/serori-memo/7XQEqKhfBH.png" width=""></p>

# - ) LICENSE
MinePaintは、[***GNU General Public License v3.0***](https://github.com/Apedy/MinePaint/blob/master/LICENSE) の下で公開されています。


# ! ) Notes
1. MinePaintのマップ及びアドオンは、Minecraft非公式なものであり、これらの制作に *Mojang Sutudios*社 は関与していません。
1. そのため、MinePaintに関する全ての事柄を、*Mojang Sutudios*社 に問い合わせないでください。

### - ) Info
* ゲームが正常に動かないと思われる場合は [***Issues***](https://github.com/Apedy/MinePaint/issues) でそれに関連するタグをつけて問題を報告してください。

# - ) About Games
### - 勝利条件
* 制限時間内に、より多くの範囲を自身のチームの色で塗り上げることで、勝利することが出来ます。
* なお、プレイヤーのキル数やデス数が、勝利条件に直接影響することはありません。

### - SP(Serori Point)
* MinePaintでは、ポイントを使って様々なことが出来ます。例えば、KITを購入したり、それを強化、称号を手に入れるなどです。
* ポイントは試合終了時に配られ、キル数やデス数によって合計ポイントが決定します。
* 試合に勝利した場合は、ボーナスとして合計ポイントに加算がされ、それらすべてを獲得できます。
* 試合に敗北してしまった場合、ボーナスは無く、また、合計ポイントの50%しか獲得することが出来ません。

### - 鉱石
* 鉱石にはグレードがあり、上から、**ダイアモンド**, **金**, **鉄**, **石炭** の四つです。
* 鉱石を破壊することで、色を塗る際に必要になるアイテムが手に入ります。
* 鉱石によって手に入るアイテムの数は異なり、グレードが高いほど多く手に入ります。
* 全ての鉱石は、一度破壊すると鉱石が無くなり、復活するまでに時間がかかります。

|Ore|Items|Tick|
| :-: | -: | -: |
|Diamond|32|400|
|Gold|12|200|
|Iron|5|100|
|Coal|1|20|

# ? ) Technical
### ! Notes
1. スクリプトやそれらに関連する技術的な内容が含まれています。
2. これらの情報には間違いや個人的な感想が含まれている可能性があります。
3. 常に公式の提供する最新の情報を確認してください。これらの情報は古い可能性があります。

### - はじめに
ここでは今後のMinePaintであったり、Minecraftの二次創作に関して、私が次に行うことの方針などをまとめています。ここでいうMinecraftとは、**Minecraft bedrock-edition**(統合版)の事でJava-Editionとは違うことを把握してください。ここでは主に、開発やAPI(旧GameTest-Framework)、Ore-ui(React.js)などに関して少しだけ書いています。

### 開発
　現在、私がMinePaintを製作するにあたって、メインのシステムは全てAPIで構築され、管理しています。`PlayerStatus`、`WorldReport`などのJSONデータをワールド内のアマスタにタグとして保管し、それらを書き換える形で処理を行っています。これは、APIの変更によってこの機構が簡単に壊れてしまうことを意味します。
　いまだAPIの機能は充実しておらず、やむなくBeta-APIを使用していますが、それらの調整に時間を取られ、新機能の実装が遅れています。これには複数の要因がありますが、一番は人員不足でしょう。現在、MinePaintは私一人で全て開発しており、ほかに人手がいない状況です。そのためMinePaint(セロリ鯖)では、常にCreator(開発者)を集っています。
　Creatorの条件としては、`JS(JavaScrpt)`の基礎知識、`@minecraft/server`モジュールの知識があること、年齢性別は問いません。もし参加したい、開発に携わりたい思われましたら、DMへお願いします。

### Ore-ui
　恐らく現在でMinecraftを利用するユーザーのインターフェイスを変える場合は、JSON-UIを用いて変更を行うことでしょう。しかしこれらは非常に扱いづらく、また、標準的ではありません。そのため、Mojang Studiosは、新たにOre-uiと呼ばれるReactで構築されたゲームUIを管理するための仕組みを提供しようとしています。Minecraftでは、数年以内にJSON-UIが廃止されOre-uiへ移行し、今後さらにスクリプト要素が増える予定です。そのためMinePaintでは、JSON-UIでの変更は最小限に行われ、Ore-uiがuiの主流になった際に対応が可能なよう調整しています。<br>
　Ore-uiでは、Reactというui構築のためのJavaScriptライブラリで構築されたUIを管理するためのReact-Facetなどが提供される予定で、これらのパフォーマンスはゲームに最適でかつスマートで、創作性に優れています。
