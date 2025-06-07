# 時間割変更システム - 完全開発プロンプト

## システム概要

**システム名称**: 時間割変更システム  
**目的**: 高専の時間割変更申請を効率化し、重複エラーの自動チェック、承認・管理、学生への周知を一括して行えるWebベースのシステム  
**納期**: プロトタイプ6月上旬、完成7月下旬  

## 開発フロー

### 1. 要件分析・提案段階
- ユーザーの要求を分析し、技術選択肢や実装方針を複数提案
- メリット・デメリットを含めて説明
- ユーザーの最終決定を待つ

### 2. 開発計画段階
- 開発を段階的なタスクに分割
- 各タスクに優先順位を付けて番号付きリストで提示
- プロジェクトのディレクトリ構造を提案
- **設計完了後、必ず「project-design-summary.md」ファイルを作成**

### 3. 実装段階
- ユーザーが「○番目を開発してください」と明確に指定するまで待機
- **実装前に必ずproject-design-summary.mdの内容を確認・参照**
- 指定されたタスクのコードのみを実装
- 必要に応じて説明とテスト方法も提供

## 承認済み技術スタック

### フロントエンド
- **フレームワーク**: React v19.1.0
- **言語**: TypeScript
- **UIライブラリ**: Material-UI v7.0.1
- **状態管理**: React Context API
- **ルーティング**: React Router
- **HTTP通信**: Axios

### バックエンド
- **言語**: Go (1.22.2)
- **フレームワーク**: Echo
- **データベースアクセス**: Squirrel (SQLビルダー)
- **認証**: JWT + bcrypt
- **メール送信**: gomail + Postfix

### データベース
- **RDBMS**: MariaDB 10.11
- **対象範囲**: 5学年×5クラス、月～金最大4コマ/日

### インフラ
- **コンテナ**: Docker + Docker Compose
- **OS**: Ubuntu 24.04
- **メールサーバー**: Postfix (契約済みサーバー・ドメイン使用)

## 確定プロジェクト構造

```
timetable-change-system/
├── frontend/                  # React + TypeScript
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/         # 認証関連コンポーネント
│   │   │   ├── timetable/    # 時間割関連コンポーネント
│   │   │   ├── request/      # 申請関連コンポーネント
│   │   │   ├── admin/        # 管理者関連コンポーネント
│   │   │   ├── student/      # 学生関連コンポーネント
│   │   │   └── common/       # 共通コンポーネント
│   │   ├── contexts/         # React Context
│   │   ├── services/         # API通信サービス
│   │   ├── types/            # TypeScript型定義
│   │   ├── utils/            # ユーティリティ関数
│   │   ├── pages/            # ページコンポーネント
│   │   │   ├── auth/         # 認証ページ
│   │   │   ├── dashboard/    # ダッシュボード
│   │   │   ├── schedule/     # 時間割ページ
│   │   │   ├── request/      # 申請ページ
│   │   │   └── profile/      # プロフィールページ
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── Dockerfile
│
├── backend/                   # Go + Echo
│   ├── cmd/
│   │   └── main.go           # アプリケーションエントリーポイント
│   ├── internal/
│   │   ├── api/              # APIハンドラー
│   │   │   ├── auth/         # 認証API
│   │   │   ├── timetable/    # 時間割API
│   │   │   ├── request/      # 申請API
│   │   │   ├── admin/        # 管理者API
│   │   │   └── student/      # 学生API
│   │   ├── models/           # データモデル
│   │   ├── services/         # ビジネスロジック
│   │   ├── middleware/       # ミドルウェア
│   │   ├── config/           # 設定管理
│   │   └── utils/            # ユーティリティ
│   ├── migrations/           # データベースマイグレーション
│   ├── tests/                # テストファイル
│   ├── go.mod
│   ├── go.sum
│   └── Dockerfile
│
├── docs/                      # ドキュメント
│   ├── test-specifications.md # テスト仕様書
│   └── api-documentation.md   # API仕様書
│
├── docker-compose.yml         # Docker構成
├── README.md
└── project-design-summary.md
```

## 番号付きタスクリスト（優先順位付き）

### フェーズ1: 基盤機能（完了済み）

**✅ 1. プロジェクト基盤構築** - 完了
- Go Echo プロジェクト初期化
- MariaDB データベース設計・作成
- Docker環境の調整（MariaDB対応）
- 基本的なAPI構造の構築

**✅ 2. 認証システム実装** - 完了
- JWT認証機能実装
- メールアドレスベースログイン
- ユーザー権限管理（管理者/教員/学生）
- パスワードハッシュ化（bcrypt）

**✅ 3. 基本データモデル実装** - 完了
- ユーザーテーブル設計・実装
- 科目テーブル設計・実装
- クラステーブル設計・実装
- 時間割テーブル設計・実装
- 変更申請テーブル設計・実装

### フェーズ2: 核心機能（6月上旬～6月中旬）

**4. 時間割表示機能**
- 時間割一覧API実装
- フィルタリング機能（学年/クラス/曜日）
- フロントエンド時間割表示コンポーネント
- レスポンシブデザイン対応

**5. CSV機能実装**
- 担当者データインポート機能
- 時間割データインポート機能
- データエクスポート機能
- CSVバリデーション機能

**6. 変更申請機能**
- 申請フォーム作成
- 重複チェックロジック実装
- 申請データ保存機能
- 申請状態管理

### フェーズ3: 高度機能（6月下旬～7月上旬）

**7. 承認・管理機能**
- 申請一覧表示機能
- 承認/却下機能
- 多段階承認フロー
- 状態管理システム

**8. メール通知機能**
- Postfix連携設定
- 申請通知メール機能
- 承認/却下通知メール機能
- 時間割変更通知メール機能

**9. 授業回数チェック機能**
- 授業回数カウント機能
- 前期/後期/通年の回数管理
- 不足回数アラート機能

### フェーズ4: 最終調整（7月中旬～7月下旬）

**10. 学生機能実装**
- 学生用時間割表示機能
- 学生用通知受信機能
- 学生用フィルタリング機能

**11. 性能最適化**
- データベースインデックス最適化
- API応答時間改善（目標1秒以内）
- フロントエンド最適化（目標3秒以内）

**12. テスト仕様書作成・テスト実行**
- **テスト仕様書作成** (品質担当者が作成)
- **単体テスト実行** (開発者とは別の担当者が実行)
- **統合テスト実行** (品質担当者が実行)
- **負荷テスト実行** (品質担当者が実行)
- **テスト結果の記録・評価**

## 現在の実装状況

### バックエンド実装済み機能

#### エンドポイント
```go
// ヘルスチェック
GET / 
→ {"message": "Kosen Schedule System API", "status": "running"}

// 認証エンドポイント
POST /api/auth/login
→ 入力: {"email": string, "password": string}
→ 出力: {"success": bool, "data": {"token": string, "refreshToken": string, "user": User}, "message": string}

GET /api/auth/me
→ 出力: {"success": bool, "data": User}
```

#### 認証可能なテストユーザー
```go
admin@test.com / password (role: admin)
teacher@test.com / password (role: teacher) 
student@test.com / password (role: student)
```

#### データベース接続
- MariaDB 10.11に接続済み
- 基本テーブル（users, subjects, classes, timetables, change_requests, notifications）は作成済み

### フロントエンド実装済み機能

#### 実装済みページ・コンポーネント
```typescript
// 認証関連
- LoginPage: ログイン画面（動作確認済み）
- AuthContext: 認証状態管理
- authService: 認証API通信

// メインページ
- DashboardPage: ダッシュボード（権限別メニュー表示）
- ProfilePage: プロフィール表示

// 部分実装
- ScheduleListPage: 時間割一覧（一部実装あり）

// 未実装ページ（空ファイル）
- NotFoundPage: 404ページ
- RequestCreatePage, RequestDetailPage, RequestListPage: 申請関連
```

#### ルーティング設定
```typescript
/ → /dashboard (認証後リダイレクト)
/login → ログイン画面
/dashboard → ダッシュボード
/schedules → 時間割一覧（未完成）
/requests → 申請一覧（未完成）
/requests/create → 申請作成（教員のみ、未完成）
/profile → プロフィール
```

#### 権限別メニュー
```typescript
// 管理者
- 時間割表示, 申請管理, ユーザー管理

// 教員  
- 時間割表示, 変更申請, 申請履歴

// 学生
- 時間割表示のみ
```

## API設計仕様

### 認証API（実装済み）
- POST /api/auth/login - ログイン
- GET /api/auth/me - 現在のユーザー情報取得

### 時間割API（未実装）
- GET /api/classes - クラス一覧取得
- GET /api/timetables - 時間割一覧取得
- GET /api/timetables/weekly/:class_id - 週間時間割取得
- GET /api/timetables/:id - 時間割詳細取得
- POST /api/timetables - 時間割作成（管理者のみ）
- PUT /api/timetables/:id - 時間割更新（管理者のみ）
- DELETE /api/timetables/:id - 時間割削除（管理者のみ）

### 申請API（未実装）
- GET /api/requests - 申請一覧取得
- GET /api/requests/:id - 申請詳細取得
- POST /api/requests - 申請作成（教員のみ）
- PUT /api/requests/:id/approve - 申請承認（管理者のみ）
- PUT /api/requests/:id/reject - 申請却下（管理者のみ）

### CSV API（未実装）
- POST /api/csv/import/subjects - 担当者CSVインポート
- POST /api/csv/import/timetables - 時間割CSVインポート
- GET /api/csv/export/timetables - 時間割CSVエクスポート

### 通知API（未実装）
- GET /api/notifications - 通知一覧取得
- PUT /api/notifications/:id/read - 通知既読更新
- POST /api/notifications/send - 通知送信（管理者のみ）

## データベース設計

### 主要テーブル
1. **users**: ユーザー情報（ID, email, password_hash, role, name, created_at）
2. **subjects**: 科目情報（ID, code, name, term, credits, created_at）
3. **classes**: クラス情報（ID, grade, class_name, created_at）
4. **timetables**: 時間割情報（ID, class_id, subject_id, teacher_id, day, period, room, created_at）
5. **change_requests**: 変更申請（ID, requester_id, status, request_data, created_at, updated_at）
6. **notifications**: 通知履歴（ID, user_id, message, sent_at, read_at）

### リレーション
- users ← change_requests (申請者)
- subjects ← timetables (科目)
- classes ← timetables (クラス)
- users ← timetables (教員)
- users ← notifications (通知先)

## TypeScript型定義

### 基本型定義
```typescript
// ユーザー関連
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  created_at: string;
}

// 認証関連
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

// 時間割関連
interface Class {
  id: number;
  grade: number;
  class_name: string;
  created_at: string;
}

interface Subject {
  id: number;
  code: string;
  name: string;
  term: 'first' | 'second' | 'full';
  credits: number;
  created_at: string;
}

interface Timetable {
  id: number;
  class_id: number;
  subject_id: number;
  teacher_id: number;
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
  period: 1 | 2 | 3 | 4;
  room: string;
  created_at: string;
  // リレーション
  class?: Class;
  subject?: Subject;
  teacher?: User;
}

interface WeeklyTimetable {
  class_id: number;
  class_name: string;
  schedule: {
    [key: string]: { // 'monday', 'tuesday', etc.
      [period: number]: Timetable | null; // 1, 2, 3, 4
    };
  };
}

// 申請関連
interface ChangeRequest {
  id: number;
  requester_id: number;
  status: 'pending' | 'approved' | 'rejected';
  request_data: {
    original_timetable_id: number;
    new_day: string;
    new_period: number;
    new_room: string;
    reason: string;
  };
  created_at: string;
  updated_at: string;
  // リレーション
  requester?: User;
  original_timetable?: Timetable;
}

// 通知関連
interface Notification {
  id: number;
  user_id: number;
  message: string;
  sent_at: string;
  read_at: string | null;
  // リレーション
  user?: User;
}

// API関連
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// フィルター関連
interface TimetableFilter {
  grade?: number;
  class_name?: string;
  day?: string;
  teacher_id?: number;
  subject_id?: number;
}

interface RequestFilter {
  status?: string;
  requester_id?: number;
  date_from?: string;
  date_to?: string;
}
```

## 決定済み機能要件

### ユーザー種別と権限
1. **変更管理者（admin）**: 承認・差戻し、全体管理、授業回数チェック、CSV操作、通知操作
2. **変更申請者（teacher）**: 授業変更申請、重複チェック、時間割確認
3. **学生（student）**: 最新時間割の閲覧、通知の受け取り

### 重複チェック機能
- 同一教員の時間重複チェック
- 同一クラスの時間重複チェック
- 授業場所の重複チェック
- リアルタイムエラー表示

### CSV機能仕様
- **担当者CSV**: 科目コード, クラス, 授業場所, 科目名, 科目区分, 担当者1-3
- **時間割CSV**: クラス, 月1-4, 火1-4, 水1-4, 木1-4, 金1-4
- インポート/エクスポート両対応
- 処理時間5秒以内

### メール通知仕様
- 申請時の関係者通知
- 承認/却下時の通知
- 時間割変更時の一斉通知
- HTMLメール対応

## 制約事項・注意点

### 技術制約
- API応答時間: 1秒以内
- ページロード時間: 3秒以内
- 同時接続: 通常100ユーザー、ピーク500ユーザー
- 稼働率: 99.5%以上

### 業務制約
- 対象: 5学年×5クラス
- 授業時間: 月～金、最大4コマ/日
- 開講期間: 前期/後期/通年
- 授業回数: 前期・後期15回以上、通年30回以上

### 開発制約
- 納期: プロトタイプ6月上旬、完成7月下旬
- 段階的開発の厳守
- 各フェーズでの動作確認必須

### セキュリティ制約
- JWT認証必須
- パスワードハッシュ化必須
- 権限チェック必須
- HTTPS通信推奨

## 重要な実装ルール

### 開発フロー厳守
- **絶対にいきなりコードを書き始めない**
- **各段階でユーザーの明確な承認を得る**
- **段階的な開発を厳格に守る**
- **実装前に必ずproject-design-summary.mdを参照する**
- **ファイルパスを明確に示す**
- **一度決定した機能や仕様を勝手に変更しない**
- **仕様変更が必要な場合は必ずユーザーに確認を取る**

### エラー対応ルール
- **エラーコードに対しては修正後のコード全体を示すと冗長になるため「修正箇所のみ」を示す**
- **修正前・修正後・コードのうちのどこだけを修正するのかを明確に示す**

### 曖昧な指示への対応
以下のような曖昧な指示を受けた場合は、必ず確認を取る：
- 「つづきおねがいします」
- 「進めてください」  
- 「やってください」
- その他具体的でない指示

**対応例：**
「どのタスクを開発しますか？番号でご指定ください」
「何についてのご相談でしょうか？」
「どの部分の続きをお求めでしょうか？」

## 現在の課題と対応関係

### API仕様の不一致
**フロントエンド期待**: 
```typescript
// timetableService, classService等が存在
await timetableService.getTimetables(filter)
await classService.getClasses()
```

**バックエンド現状**: 
```go
// 時間割・クラス関連のエンドポイントが未実装
// /api/timetables, /api/classes等が存在しない
```

### 未実装のサービス
```typescript
// 存在するが実装されていない
- timetableService
- classService  
- requestService
- csvService
```

## テスト仕様書フォーマット

### 必須項目
- **No**: テスト番号
- **区分**: テスト対象の機能区分
- **テスト手順**: 具体的な操作手順
- **期待される結果**: 期待する動作・表示内容
- **テスト結果**: 実際の結果
- **結果**: ○/×/△の判定
- **についての備考コメント**: 詳細な備考
- **テスト作成者**: テスト仕様を作成した担当者
- **対象部分開発者**: 該当機能の開発担当者
- **テスト実施者**: 実際にテストを実行した担当者

### テスト担当者の役割分担
- **品質担当者**: テスト仕様書作成、テスト実施
- **開発担当者**: 機能実装、修正対応
- **テスト作成者**: C,D列（テスト結果、結果判定）を記入
- **テスト実施者**: E,F列（備考、コメント）を記入

### テスト制約
- **テスト作成者とテスト実施者は原則別人とする**
- **開発者とテスト実施者は別人とする**

## 開発完了の定義

### 各タスクの完了条件
- **機能実装完了**: 仕様通りの動作確認
- **単体テスト完了**: 開発者による基本動作確認
- **品質テスト完了**: 品質担当者によるテスト仕様書に基づくテスト
- **修正対応完了**: 発見された不具合の修正とテスト
- **ドキュメント完成**: API仕様書、操作マニュアルの作成

### システム全体の完了条件
- **全機能のテスト完了**: テスト仕様書の全項目が○判定
- **性能要件達成**: API応答1秒以内、ページロード3秒以内
- **セキュリティ確認**: 認証、権限、データ保護の確認
- **運用準備完了**: デプロイ手順、バックアップ手順の確認

## 禁止事項
- ユーザーの明確な指示なしにコードを書くこと
- project-design-summary.mdを参照せずに実装すること
- 複数のタスクを同時に実装すること
- 承認されていない機能を追加すること
- 勝手に仕様を解釈して進めること

## 現在の開発状況サマリー

### ✅ 完了済み
- プロジェクト基盤構築（Docker環境、MariaDB接続）
- 認証システム（ログイン・ログアウト・JWT）
- 基本データモデル（6つのテーブル作成）
- フロントエンド・バックエンド接続確認

### 🔄 次の開発対象
- **タスク4**: 時間割表示機能
- **タスク5**: CSV機能実装
- **タスク6**: 変更申請機能

### 📋 実装待ちの重要な基盤
1. **バックエンドAPI追加**: /api/classes, /api/timetables等
2. **フロントエンドサービス実装**: timetableService, classService等
3. **型定義の統一**: 上記TypeScript型定義の適用

---

**注意**: このドキュメントは開発の基準となります。仕様変更が必要な場合は必ず確認を取ってから実装してください。

**最終更新**: 現在の実装状況と課題を反映した完全版プロンプト
