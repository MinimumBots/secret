# SECRET
Discord上でサーバー上のチャンネルを経由して、DMから複数のメンバーのDMへメッセージを転送するBOTです。  

## 使い方
### ステップ1
このBOTのDMに転送したいメッセージを送ります。  

### ステップ2
メッセージを共有したいサーバーのチャンネルで `/share` コマンドを入力し、送信します。  
(オプションとして、 `summary` にメッセージの要約、 `roles` にロールメンションを指定して受け取れるロールを制限できます。)  

### ステップ3
メッセージを受け取りたい相手に `メッセージを受け取る` ボタンを押してもらいます。  

## 注意事項
- 一度の送信できるメッセージは1つまでです。
- 一旦転送されたメッセージは、転送先のDMチャンネルから削除できません。
- 転送元のメッセージを削除すると、メッセージが転送されなくなります。
- `roles` オプションで受け取れるロールを制限しても、 `メッセージの管理` 以上の権限を持ったメンバーは全員メッセージを受け取れます。
- このBOTはDiscordの利用規約に違反する行為を助長するものではありません。

## 導入方法
以下のリンクからサーバーへ導入できます。  
https://discord.com/api/oauth2/authorize?client_id=653253608858583040&permissions=18432&scope=bot%20applications.commands  
