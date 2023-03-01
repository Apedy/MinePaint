# MinePaint <a href="https://github.com/Apedy/MinePaint/blob/master/LICENSE"><img src="https://flat.badgen.net/badge/license/GPL-3.0/green"></a> <a href="https://github.com/Apedy/MinePaint/releases/"><img src="https://flat.badgen.net/github/release/Apedy/MinePaint"></a>

<a href="https://github.com/Apedy/MinePaint/wiki/MinePaint">![](https://raw.githubusercontent.com/Apedy/MinePaint/master/docs/image/banner_s1.png)</a>

# - ) LICENSE
MinePaintは、[***GNU General Public License v3.0***](https://github.com/Apedy/MinePaint/blob/master/LICENSE) の下で公開されています。

# ! ) Notes
### Mojang Studios
> 1. MinePaint は、Minecraft非公式なものであり、これらの制作に *Mojang Sutudios*社 は関与していません。
> 1. MinePaint に関する全ての事柄を、*Mojang Sutudios*社 に問い合わせないでください。

ゲームが正常に動かないと思われる場合は [***Issues***](https://github.com/Apedy/MinePaint/issues) で問題に関連するタグをつけて報告してください。

# ? ) WIKI
### - [MinePaint Wiki](https://github.com/Apedy/MinePaint/wiki/MinePaint)

# - ) Technical
### ! Notes
1. スクリプトやそれらに関連する技術的な内容が含まれています。
2. これらの情報には間違いや個人的な感想が含まれている可能性があります。
3. 常に公式の提供する最新の情報を確認してください。これらの情報は古い可能性があります。

### - はじめに
ここでは今後のMinePaintであったり、Minecraftの二次創作に関して、私が次に行うことの方針などをまとめています。ここでいうMinecraftとは、**Minecraft bedrock-edition**(統合版)の事でJava-Editionとは違うことを把握してください。ここでは主に、開発やAPI(旧GameTest-Framework)、Ore-ui(React.js)などに関して少しだけ書いています。

### - 開発
　現在、私がMinePaintを製作するにあたって、メインのシステムは全てAPIで構築され、管理しています。`PlayerStatus`、`WorldReport`などのJSONデータをワールド内のアマスタにタグとして保管し、それらを書き換える形で処理を行っています。これは、APIの変更によってこの機構が簡単に壊れてしまうことを意味します。
　いまだAPIの機能は充実しておらず、やむなくBeta-APIを使用していますが、それらの調整に時間を取られ、新機能の実装が遅れています。これには複数の要因がありますが、一番は人員不足でしょう。現在、MinePaintは私一人で全て開発しており、ほかに人手がいない状況です。そのためMinePaint(セロリ鯖)では、常にCreator(開発者)を集っています。
　Creatorの条件としては、`JS(JavaScrpt)`の基礎知識、`@minecraft/server`モジュールの知識があること、年齢性別は問いません。もし参加したい、開発に携わりたい思われましたら、DMへお願いします。

### - Ore-ui
　恐らく現在でMinecraftを利用するユーザーのインターフェイスを変える場合は、JSON-UIを用いて変更を行うことでしょう。しかしこれらは非常に扱いづらく、また、標準的ではありません。そのため、Mojang Studiosは、新たにOre-uiと呼ばれるReactで構築されたゲームUIを管理するための仕組みを提供しようとしています。Minecraftでは、数年以内にJSON-UIが廃止されOre-uiへ移行し、今後さらにスクリプト要素が増える予定です。そのためMinePaintでは、JSON-UIでの変更は最小限に行われ、Ore-uiがuiの主流になった際に対応が可能なよう調整しています。<br>
　Ore-uiでは、Reactというui構築のためのJavaScriptライブラリで構築されたUIを管理するためのReact-Facetなどが提供される予定で、これらのパフォーマンスはゲームに最適でかつスマートで、創作性に優れています。
