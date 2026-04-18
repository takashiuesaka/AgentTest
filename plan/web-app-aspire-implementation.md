# Webアプリケーション実装計画

Issue #1 対応

---

## 概要

### 課題と目的
ASP.NET Core WebAPI + React + .NET Aspire を用いた Webアプリケーションの雛形を作成する。  
将来の機能開発を進めるにあたっての出発点となる最小構成のプロジェクトを整備する。

### 成功基準（完了条件）
- ブラウザ上にボタンが1つ表示される
- ボタンをクリックするとバックエンド API が呼ばれる
- バックエンドは `"こんにちは"` という文字列を返す
- フロントエンドがその文字列を画面に表示する
- Aspire ダッシュボードから各サービスを一元管理できる

### 利用者
開発チーム（このリポジトリを起点に機能追加を行う開発者）

---

## 技術アプローチ

### 使用技術（すべて最新安定版）
| レイヤー | 技術 | バージョン目安 |
|---|---|---|
| オーケストレーション | .NET Aspire | 9.x |
| バックエンド | ASP.NET Core Web API | .NET 9 |
| フロントエンド | React + Vite | React 19 / Vite 6 |
| フロントエンド言語 | TypeScript | 5.x |

### アーキテクチャ概要

```
┌─────────────────────────────────────────────┐
│            .NET Aspire AppHost               │
│  ┌───────────────┐   ┌─────────────────────┐ │
│  │  React (Vite) │──▶│  ASP.NET Core API   │ │
│  │  :3000        │   │  :5000              │ │
│  └───────────────┘   └─────────────────────┘ │
│         Aspire Dashboard (:18888)             │
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
├── AgentTest.ServiceDefaults/  # 共通設定（OpenTelemetry等）
├── AgentTest.Api/              # ASP.NET Core Web API
└── AgentTest.Web/              # React (Vite + TypeScript)
```

---

## 実装計画

### フェーズ 1: 基盤構築（Small）

**目標**: Aspire ソリューション構造を作成し、各プロジェクトの骨格を整える

#### タスク
- [ ] `dotnet new aspire` で AppHost / ServiceDefaults を生成
- [ ] `dotnet new webapi` で `AgentTest.Api` プロジェクトを作成
- [ ] AppHost に API プロジェクトを Aspire リソースとして登録
- [ ] `npm create vite@latest` で React + TypeScript プロジェクトを `AgentTest.Web/` に作成
- [ ] AppHost に React (npm) プロジェクトを Aspire リソースとして登録
- [ ] `.gitignore` の整備（`node_modules/`, `bin/`, `obj/` 等）

**依存関係**: なし  
**工数**: Small（半日〜1日）

---

### フェーズ 2: コア機能実装（Small）

**目標**: バックエンド API とフロントエンド UI を実装し、End-to-End の動作を実現する

#### バックエンド（AgentTest.Api）
- [ ] `HelloController` を作成し `GET /api/hello` エンドポイントを実装
  ```csharp
  [HttpGet("/api/hello")]
  public IActionResult GetHello() => Ok(new { message = "こんにちは" });
  ```
- [ ] CORS ポリシーを設定（React 開発サーバーからのリクエストを許可）
- [ ] Aspire ServiceDefaults の `AddServiceDefaults()` / `MapDefaultEndpoints()` を適用

#### フロントエンド（AgentTest.Web）
- [ ] `App.tsx` にボタンを配置
- [ ] ボタンクリック時に `fetch("/api/hello")` を呼び出す処理を実装
- [ ] レスポンスの `message` を状態管理し画面に表示
- [ ] Vite の `server.proxy` でバックエンドへのプロキシを設定（開発時）

#### Aspire 設定
- [ ] AppHost で React の環境変数 `VITE_API_URL` または Aspire の Service Discovery を用いてバックエンド URL を注入

**依存関係**: フェーズ 1 完了後  
**工数**: Small（半日〜1日）

---

### フェーズ 3: 品質向上と確認（Small）

**目標**: 動作確認・最終調整を行い、コードをリポジトリにコミットする

#### タスク
- [ ] `dotnet run --project AgentTest.AppHost` で全サービス起動を確認
- [ ] ブラウザでボタンをクリック → `"こんにちは"` が表示されることを確認
- [ ] Aspire ダッシュボードでログ・トレースが確認できることを検証
- [ ] README に起動手順を追記
- [ ] 変更をコミット・プッシュし Issue #1 をクローズ

**依存関係**: フェーズ 2 完了後  
**工数**: Small（2〜3時間）

---

## 検討事項

### 前提条件
- .NET 9 SDK がインストール済みであること
- Node.js (LTS) と npm がインストール済みであること
- .NET Aspire workload (`dotnet workload install aspire`) がインストール済みであること

### 制約
- 機能は最小限（雛形）に留める
- 認証・データベース・テストは対象外

### リスク
| リスク | 対処方法 |
|---|---|
| Aspire の React (npm) プロジェクト連携が期待通り動作しない | Aspire ドキュメントの NodeApp / ExecutableResource を参照し手動設定で対応 |
| CORS 設定ミスによりフロントエンドから API が呼べない | 開発時は `AllowAnyOrigin` を一時許可し、後続フェーズで絞り込む |
| 最新バージョン間の互換性問題 | 各公式ドキュメントのリリースノートを確認して対応 |

---

## 対象外

- ユーザー認証・認可
- データベース連携
- 自動テスト（ユニット・統合テスト）
- CI/CD パイプライン
- 本番環境へのデプロイ設定
- エラーハンドリングの高度化
- UI のスタイリング（CSS フレームワーク等）
