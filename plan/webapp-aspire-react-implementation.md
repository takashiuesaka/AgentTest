# Webアプリケーション実装計画

**対象Issue**: #1 Webアプリケーションの作成  
**作成日**: 2026-04-18

---

## 概要

### どの課題を、なぜ解決するのか

プロジェクトの雛形（スケルトン）として、フロントエンド・バックエンド・オーケストレーション基盤が連携する最小構成のWebアプリケーションを構築する。これにより、今後の機能開発をすぐに開始できる土台を整える。

### 成功基準（「完了」と言える状態は何か）

- ブラウザ上にボタンが1つ表示される
- ボタンをクリックすると、ASP.NET Core WebAPI が `"こんにちは"` を返す
- フロントエンド（React）がレスポンスを受け取り、画面に表示する
- .NET Aspire でフロントエンド・バックエンド両プロジェクトが一括起動・管理できる
- `dotnet run --project AppHost` 1コマンドで全サービスが起動する

### 誰が、どのように利用するのか

開発者が雛形として使用し、今後の機能追加の出発点とする。

---

## 技術アプローチ

### 高レベルアーキテクチャ

```
┌─────────────────────────────────────────────┐
│  .NET Aspire AppHost (オーケストレーション)   │
│                                             │
│  ┌─────────────────┐  ┌─────────────────┐  │
│  │  React Frontend │  │ ASP.NET Core    │  │
│  │  (Vite + React) │◄─┤ WebAPI Backend  │  │
│  │                 │  │                 │  │
│  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────┘
```

### 技術スタック

| 層 | 技術 | バージョン |
|---|---|---|
| オーケストレーション | .NET Aspire | 9.x (最新) |
| バックエンド | ASP.NET Core WebAPI | .NET 10 |
| フロントエンド | React + Vite | React 19.x, Vite 6.x |
| 言語 (フロント) | TypeScript | 5.x |
| HTTP通信 | Fetch API | ブラウザ標準 |

### 主要なAPI設計

#### バックエンドエンドポイント

```
GET /api/hello
Response: 200 OK
Body: { "message": "こんにちは" }
```

### プロジェクト構成

```
AgentTest/
├── AppHost/                  # .NET Aspire AppHost プロジェクト
│   ├── AppHost.csproj
│   └── Program.cs
├── ServiceDefaults/          # Aspire 共通設定 (オプション)
│   ├── ServiceDefaults.csproj
│   └── Extensions.cs
├── Backend/                  # ASP.NET Core WebAPI
│   ├── Backend.csproj
│   └── Program.cs
└── frontend/                 # React + Vite アプリ
    ├── package.json
    ├── vite.config.ts
    ├── src/
    │   ├── App.tsx
    │   └── main.tsx
    └── index.html
```

### 重要な技術判断とトレードオフ

| 判断 | 採用 | 理由 |
|---|---|---|
| フロント言語 | TypeScript | 型安全性・保守性 |
| フロントビルドツール | Vite | 高速HMR・Aspire連携が容易 |
| スタイリング | CSS Modules or インラインスタイル | 外部ライブラリ不要・シンプル |
| 状態管理 | useState のみ | 雛形なので最小構成 |
| CORS | 開発環境では AllowAll ポリシー | Aspire が環境変数でURL解決するため |

---

## 実装計画

### フェーズ1: 基盤構築（Small）

**目標**: Aspire ソリューション・バックエンド・フロントエンドの雛形を生成する

#### タスク

1. **Aspire ワークロードの確認・インストール**
   - `dotnet workload install aspire` を実行
   - `dotnet workload list` で確認
   - 工数: Small

2. **ソリューション & AppHost の作成**
   - `dotnet new aspire` でソリューション雛形を生成
   - または手動で `AppHost` / `ServiceDefaults` を作成
   - 工数: Small

3. **ASP.NET Core WebAPI プロジェクト作成**
   - `dotnet new webapi -n Backend`
   - ソリューションに追加: `dotnet sln add Backend/Backend.csproj`
   - AppHost の `Program.cs` に `AddProject<Projects.Backend>` を追加
   - 工数: Small

4. **React + Vite フロントエンド作成**
   - `npm create vite@latest frontend -- --template react-ts`
   - 依存パッケージインストール: `npm install`
   - 工数: Small

**完了条件**: 各プロジェクトが個別にビルド・起動できる

---

### フェーズ2: コア機能実装（Small〜Medium）

**目標**: バックエンドAPIの実装、フロントエンドのUI実装、Aspireによる統合

#### タスク

5. **バックエンド: Hello エンドポイント実装**

   ```csharp
   // Backend/Program.cs
   app.MapGet("/api/hello", () => Results.Ok(new { message = "こんにちは" }));
   ```
   
   - CORS設定を追加（フロントエンドのオリジンを許可）
   - Aspire の `ServiceDefaults` を適用
   - 工数: Small

6. **フロントエンド: ボタンとAPI呼び出しの実装**

   ```tsx
   // src/App.tsx
   const [message, setMessage] = useState<string | null>(null);
   
   const handleClick = async () => {
     const res = await fetch(`${import.meta.env.VITE_API_URL}/api/hello`);
     const data = await res.json();
     setMessage(data.message);
   };
   
   return (
     <div>
       <button onClick={handleClick}>クリック</button>
       {message && <p>{message}</p>}
     </div>
   );
   ```
   
   - 工数: Small

7. **Aspire AppHost: フロントエンド統合設定**

   ```csharp
   // AppHost/Program.cs
   var backend = builder.AddProject<Projects.Backend>("backend");
   
   builder.AddNpmApp("frontend", "../frontend")
          .WithReference(backend)
          .WithHttpEndpoint(env: "PORT");
   ```
   
   - バックエンドURLをフロントエンドへ環境変数として注入
   - 工数: Medium（Aspire の Node.js/Vite 連携設定が必要）

8. **Vite プロキシ or 環境変数設定**
   - `vite.config.ts` にプロキシ設定、またはAspireから注入される `VITE_API_URL` を使用
   - 工数: Small

**完了条件**: `dotnet run --project AppHost` でブラウザが開き、ボタンクリックで「こんにちは」が表示される

---

### フェーズ3: 品質向上と確認（Small）

**目標**: 動作確認・コード整理・ドキュメント更新

#### タスク

9. **エラーハンドリング追加**
   - API呼び出し失敗時のエラー表示（try/catch）
   - ローディング状態の表示
   - 工数: Small

10. **README 更新**
    - 起動手順・前提条件・プロジェクト構成の記載
    - 工数: Small

11. **動作確認**
    - Aspire Dashboard でサービス状態確認
    - ボタンクリックのE2E動作確認
    - 工数: Small

**完了条件**: ドキュメントが整備され、チームメンバーが手順通りに動かせる

---

## 検討事項

### 前提条件

- .NET 10 SDK がインストール済み
- Node.js 20 LTS 以降がインストール済み
- .NET Aspire ワークロードがインストール可能な環境

### 制約

- 機能は最小限（ボタン1つ・APIエンドポイント1つ）に限定
- 認証・データベース・状態管理ライブラリは含めない

### リスク

| リスク | 対処 |
|---|---|
| Aspire の Node.js/npm アプリ統合が複雑 | `AddNpmApp` の公式ドキュメント・サンプルを参照。動作しない場合は Vite プロキシで代替 |
| CORS エラー | 開発環境では `AllowAnyOrigin` ポリシーを適用。本番は要見直し |
| Aspire ワークロード未対応バージョン | `dotnet workload install aspire` で最新版を明示インストール |

---

## 対象外

- ユーザー認証・認可
- データベース連携
- テストコード（ユニット・統合・E2E）
- CI/CDパイプライン
- 本番環境へのデプロイ設定
- UIデザイン・スタイリングの本格実装
