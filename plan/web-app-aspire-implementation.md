# Webアプリケーション実装計画

**Issue #1: Webアプリケーションの作成**
**作成日**: 2026-04-18

---

## 概要

### 解決する課題
プロジェクトの雛形として、ASP.NET Core WebAPI（バックエンド）とReact（フロントエンド）を .NET Aspire で統合したWebアプリケーションを構築する。

### 成功基準（完了の定義）
- React フロントエンドにボタンが1つ表示される
- ボタンクリック時に ASP.NET Core WebAPI へ HTTP リクエストが飛ぶ
- バックエンドが「こんにちは」という文字列を返す
- フロントエンドが受け取った「こんにちは」を画面に表示する
- `dotnet run` 1コマンドで Aspire ダッシュボード + バックエンド + フロントエンドが起動する

### 利用者
開発チームメンバー（プロジェクトのスターターテンプレートとして利用）

---

## 技術アプローチ

### 使用技術・バージョン

| レイヤー | 技術 | バージョン |
|---|---|---|
| バックエンド | ASP.NET Core WebAPI | .NET 10 |
| フロントエンド | React + Vite | React 19 / Vite 8 |
| オーケストレーション | .NET Aspire | 13.x |
| パッケージ管理 (JS) | npm | 最新 |
| パッケージ管理 (.NET) | NuGet | - |

### アーキテクチャ概要

```
┌─────────────────────────────────────────────┐
│  .NET Aspire AppHost                         │
│  ┌─────────────────┐  ┌──────────────────┐  │
│  │  React Frontend │  │ ASP.NET Core API │  │
│  │  (Vite dev / SPA│  │  /api/hello      │  │
│  │   static serve) │  │  → "こんにちは"  │  │
│  └────────┬────────┘  └────────┬─────────┘  │
│           │  HTTP GET          │             │
│           └───────────────────►│             │
└─────────────────────────────────────────────┘
```

### API設計

| メソッド | パス | レスポンス |
|---|---|---|
| GET | `/api/hello` | `{ "message": "こんにちは" }` |

### プロジェクト構成

```
AgentTest/
├── AgentTest.AppHost/          # Aspire オーケストレーター
│   ├── AppHost.cs
│   └── AgentTest.AppHost.csproj
├── AgentTest.Server/           # ASP.NET Core WebAPI（Extensions.cs で ServiceDefaults を内包）
│   ├── Program.cs
│   ├── Extensions.cs
│   └── AgentTest.Server.csproj
├── frontend/                   # React + Vite フロントエンド
│   ├── src/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
└── AgentTest.sln
```

---

## 実装計画

### フェーズ1: 基盤構築（Small）

**目標**: Aspire ソリューション雛形の生成

#### タスク一覧

1. **Aspire ソリューション生成**
   - `dotnet new aspire` テンプレートでソリューションを作成
   - 生成されたプロジェクト構成を確認
   - 依存関係: なし
   - 工数: Small

2. **React プロジェクトのセットアップ**
   - `npm create vite@latest` で React + TypeScript プロジェクトを作成
   - Aspire の Node.js リソースとして AppHost に登録
   - 依存関係: タスク1
   - 工数: Small

3. **ServiceDefaults の適用**
   - ApiService に `AddServiceDefaults()` / `MapDefaultEndpoints()` を適用
   - OpenTelemetry・ヘルスチェックの標準設定を有効化
   - 依存関係: タスク1
   - 工数: Small

---

### フェーズ2: コア機能実装（Medium）

**目標**: ボタン→API→「こんにちは」表示のエンドツーエンド実装

#### タスク一覧

4. **バックエンド: `/api/hello` エンドポイントの実装**
   - `Program.cs` に `MapGet("/api/hello", ...)` を追加
   - レスポンス: `{ "message": "こんにちは" }`
   - CORS設定（開発環境でフロントエンドからのアクセスを許可）
   - 依存関係: タスク3
   - 工数: Small

5. **フロントエンド: UIコンポーネントの実装**
   - `App.tsx` にボタンコンポーネントを実装
   - クリックハンドラで `/api/hello` へ `fetch` リクエスト
   - レスポンスの `message` を `useState` で管理し表示
   - 依存関係: タスク2、タスク4
   - 工数: Small

6. **Aspire AppHost: サービス間接続設定**
   - `AddProject<ApiService>()` でバックエンドを登録
   - `AddNpmApp("frontend", ...)` で React を登録
   - `WithReference()` でフロントエンドにバックエンドのURLを注入
   - 環境変数経由でAPIベースURLをフロントエンドへ渡す
   - 依存関係: タスク4、タスク5
   - 工数: Small

---

### フェーズ3: 動作確認とコミット（Small）

**目標**: エンドツーエンドの動作確認とコードの整理

#### タスク一覧

7. **エンドツーエンド動作確認**
   - AppHost から `dotnet run` で起動
   - Aspire ダッシュボードでサービス状態を確認
   - ブラウザでボタンクリック → 「こんにちは」表示を確認
   - 依存関係: タスク6
   - 工数: Small

8. **コードのクリーンアップ・コミット**
   - テンプレートの不要コードを削除
   - `README.md` に起動手順を追記
   - git commit でコードを保存
   - 依存関係: タスク7
   - 工数: Small

---

## 検討事項

### 前提条件
- .NET 10 SDK がインストール済みであること
- Node.js (LTS) と npm がインストール済みであること
- .NET Aspire workload が導入済みであること（`dotnet workload install aspire`）
- Docker または Podman が利用可能であること（Aspire ダッシュボードのコンテナ実行に必要）

### 制約
- 実装内容は雛形レベルに限定（ビジネスロジック・認証・DBは対象外）
- 最新バージョンを使用するため、ドキュメントやAPIが変わっている可能性がある

### リスク

| リスク | 影響 | 対処策 |
|---|---|---|
| Aspire の Node.js リソース対応バージョン差異 | 高 | 公式ドキュメント・サンプルで最新API確認 |
| CORS設定ミスによるAPIアクセス失敗 | 中 | 開発環境用に `AllowAnyOrigin` を設定 |
| Vite のプロキシ設定とAspire URL注入の競合 | 中 | 環境変数 `VITE_API_URL` でAPIアドレスを制御 |

---

## 対象外

- ユーザー認証・認可
- データベース接続
- 本番環境向けデプロイ設定（Kubernetes、Azure Container Apps等）
- テストコード（ユニットテスト・E2Eテスト）
- エラーハンドリングの本格実装
- UIスタイリング（CSS フレームワークの導入）
- CI/CD パイプライン
