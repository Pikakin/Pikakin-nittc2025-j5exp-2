import { createRequire } from 'module';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const jsonServer = require('json-server');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// サーバーの設定
const server = jsonServer.create();
const router = jsonServer.router('mock/db.json');
const middlewares = jsonServer.defaults();

// リクエストボディのパーサーを追加
server.use(jsonServer.bodyParser);

// デバッグ用ミドルウェア
server.use((req, res, next) => {
  console.log('Request:', req.method, req.path);
  console.log('Request body:', req.body);
  next();
});

// デフォルトのミドルウェアを使用 (logger, static, cors)
server.use(middlewares);

// ログインエンドポイントのカスタム処理
server.post('/api/auth/login', (req, res) => {
  console.log('Login request received:', req.body);
  
  // リクエストボディからユーザー名とパスワードを取得
  const { username, password } = req.body;
  
  // 簡易的な認証チェック
  if (username && password) {
    const responseData = {
      token: "mock-jwt-token",
      refreshToken: "mock-refresh-token",
      user: {
        id: 1,
        username: username,
        name: "管理者",
        email: "admin@example.com",
        role: "admin"
      }
    };
    
    console.log('Sending response:', responseData);
    res.status(200).jsonp(responseData);
  } else {
    res.status(400).jsonp({
      success: false,
      message: "ユーザー名とパスワードを入力してください"
    });
  }
});


// 他のAPIエンドポイントはjson-serverのルーターで処理
server.use('/api', router);

// サーバーの起動
server.listen(3001, () => {
  console.log('JSON Server is running on port 3001');
  console.log('Available endpoints:');
  console.log('  http://localhost:3001/api/auth/login');
  console.log('  http://localhost:3001/api/users');
});
