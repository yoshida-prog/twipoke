# twipoke

Twitterフォロワーをポケモンとしてバトルさせるアプリケーションです。

# ローカル環境での環境構築

Dockerを使います。  
下記をターミナルで実行してください。  

任意のフォルダに移動してクローンを作成します。  
①本リポジトリのmasterブランチからクローンURLをコピーして下記を実行してください。
```
git clone <HTTPS clone URL>
```

②クローンを作成したフォルダに移動します
```
cd <clone dir>
```

③リモートブランチの取得をします。  
現在の最新verのブランチ名を<branch name>に入力します。  
2021/7/22現在の最新verは「ver1.0.0」です。
```
git checkout -b <branch name> origin/<branch name>
```

これでローカル環境に最新verのtwipokeを取得できました。  

④Dockerでtwipokeを動作させます。  
現在の階層が②で移動した階層になっていることを確認し、下記を実行します。
```
docker-compose up build
```

⑤localhost:3000にアクセスします。

# 動作確認における注意点

通信対戦ゲームですので、例えばGoogleChromeとfirefoxの2つのブラウザを立ち上げて動作させてみてください。  
動作確認にはツイッターアカウントが2つ必要になります。  
対戦画面のみ動作確認をしたい場合はデバッグルームボタンを押してください。

# 機能一覧

開発前に作成したtwipokeの機能をまとめたスプレッドシートです。  
[機能一覧](https://docs.google.com/spreadsheets/d/1Lajdma8ZqX2pmIf_VoF5XJNJdnnG_xgy2XnMFGsgjx8/edit?usp=sharing)

# 各画面のワイヤーフレーム・画面遷移図

開発前に作成したtwipokeの各画面のワイヤーフレームです。  
Adobe XDで作成しました。  
[ワイヤーフレーム・画面遷移図](https://xd.adobe.com/view/77701980-13a2-4e14-95ee-fd9257a35606-2223/)

# DB設計図・ER図

開発前に作成したDB設計図・ER図です。  
今回はDBとしてfirestoreを使用しました。  
[DB設計図・ER図](https://docs.google.com/spreadsheets/d/1Mk95IVWdlr_ZGHiJRsYCLSo0QroySSKoAmmSxp1fp3A/edit?usp=sharing)
