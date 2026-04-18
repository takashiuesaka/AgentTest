# AgentTest
Agentの実験

## Webアプリケーション

.NET Aspire + ASP.NET Core WebAPI + React (Vite + TypeScript) の最小構成Webアプリです。

## 前提条件

- .NET 10 SDK
- Node.js 20 LTS 以降
- npm

## プロジェクト構成

```
AgentTest/
├── AppHost/          # .NET Aspire AppHost（オーケストレーション）
├── ServiceDefaults/  # Aspire 共通設定
├── Backend/          # ASP.NET Core WebAPI
└── frontend/         # React + Vite フロントエンド
```

## 起動方法

```bash
dotnet run --project AppHost
```

Aspire Dashboard が起動し、フロントエンド・バックエンドが一括起動されます。

## 機能

- ブラウザ上のボタンをクリックすると、バックエンドの `/api/hello` を呼び出し「こんにちは」と表示します。
