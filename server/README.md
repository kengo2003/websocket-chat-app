セットアップ

```zsh
# server/に移動
cd server

# 仮想環境の作成と依存関係のインストール
uv sync

# 仮想環境のアクティベート
source .venv/bin/activate  # Linux/macOS
# または
.venv\Scripts\activate     # Windows
```

サーバー起動

```
uvicorn main:app --reload
```
