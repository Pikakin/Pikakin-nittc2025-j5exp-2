const jsonServer = require('../node_modules/json-server');
const server = jsonServer.create();
const router = jsonServer.router('mock/db.json');
const middlewares = jsonServer.defaults();

// リクエストボディのパーサーを追加
server.use(jsonServer.bodyParser);

// デフォルトのミドルウェアを使用 (logger, static, cors)
server.use(middlewares);

// API プレフィックスを追加するためのカスタムルート
server.use('/api', router);

// カスタムレスポンスを返すミドルウェア
server.use((req, res, next) => {
  if (req.method === 'POST' && req.path === '/api/auth/login') {
    // ログインリクエストの処理
    return res.status(200).jsonp({
      token: "mock-jwt-token",
      refreshToken: "mock-refresh-token",
      user: {
        id: 1,
        username: "admin",
        name: "管理者",
        email: "admin@example.com",
        role: "admin"
      }
    });
  }
  next();
});

// サーバーを起動
server.listen(3001, () => {
  console.log('JSON Server is running on port 3001');
});
