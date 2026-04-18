# AgentTest
Agentの実験

## 概要

ASP.NET Core WebAPI（バックエンド）とReact（フロントエンド）を .NET Aspire で統合したWebアプリケーションのスターターテンプレートです。

ボタンをクリックするとバックエンドAPIへリクエストが飛び、「こんにちは」というメッセージが画面に表示されます。

## 前提条件

- [.NET 10 SDK](https://dotnet.microsoft.com/download) 以上
- [Node.js (LTS)](https://nodejs.org/) と npm
- Docker または Podman（Aspire ダッシュボードのコンテナ実行に必要）

## 起動方法

```bash
cd AgentTest.AppHost
dotnet run
```

コマンド1つで以下が起動します：
- **Aspire ダッシュボード** - サービス管理UI
- **バックエンド** (ASP.NET Core WebAPI) - `/api/hello` エンドポイント
- **フロントエンド** (React + Vite) - ボタンUIと応答表示

## プロジェクト構成

```
AgentTest/
├── AgentTest.AppHost/    # Aspire オーケストレーター
├── AgentTest.Server/     # ASP.NET Core WebAPI
│   └── GET /api/hello → { "message": "こんにちは" }
├── frontend/             # React + Vite フロントエンド
└── AgentTest.sln
```
