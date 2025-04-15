import { 
  Avatar, 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Container, 
  Divider, 
  Grid, 
  TextField, 
  Typography 
} from '@mui/material'
import { Field, Form, Formik } from 'formik'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import * as Yup from 'yup'
import { useAuth } from '../../contexts/AuthContext'

// プロフィール更新のバリデーションスキーマ
const ProfileSchema = Yup.object().shape({
  name: Yup.string().required('氏名は必須です'),
  email: Yup.string().email('有効なメールアドレスを入力してください').required('メールアドレスは必須です'),
  currentPassword: Yup.string().when('newPassword', {
    is: (val: string) => val && val.length > 0,
    then: (schema) => schema.required('現在のパスワードは必須です'),
    otherwise: (schema) => schema,
  }),
  newPassword: Yup.string()
    .min(8, 'パスワードは8文字以上である必要があります')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'パスワードには少なくとも1つの大文字、1つの小文字、1つの数字が必要です'
    ),
  confirmPassword: Yup.string().when('newPassword', {
    is: (val: string) => val && val.length > 0,
    then: (schema) => schema
      .required('パスワードの確認は必須です')
      .oneOf([Yup.ref('newPassword')], 'パスワードが一致しません'),
    otherwise: (schema) => schema,
  }),
})

export const ProfilePage: React.FC = () => {
  const { authState, updateProfile, updatePassword } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // ユーザー情報が読み込まれるまで待機
  if (authState.loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>読み込み中...</Box>
  }

  // ユーザーが認証されていない場合
  if (!authState.isAuthenticated || !authState.user) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>ログインしてください</Box>
  }

  const user = authState.user
  const userRole = user.role === 'admin' ? '管理者' : user.role === 'teacher' ? '教員' : '学生'

  // プロフィール更新の処理
  const handleProfileUpdate = async (values: any) => {
    try {
      await updateProfile({
        name: values.name,
        email: values.email,
      })
      toast.success('プロフィールを更新しました')
      setIsEditing(false)
    } catch (error) {
      toast.error('プロフィールの更新に失敗しました')
      console.error(error)
    }
  }

  // パスワード更新の処理
  const handlePasswordUpdate = async (values: any) => {
    try {
      await updatePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      toast.success('パスワードを更新しました')
      setIsChangingPassword(false)
    } catch (error) {
      toast.error('パスワードの更新に失敗しました')
      console.error(error)
    }
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          プロフィール
        </Typography>
        
        <Grid container spacing={4}>
          {/* プロフィール情報カード */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar
                    sx={{ width: 80, height: 80, mr: 3 }}
                    alt={user.name}
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                  />
                  <Box>
                    <Typography variant="h5">{user.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {userRole}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {isEditing ? (
                  <Formik
                    initialValues={{
                      name: user.name,
                      email: user.email,
                    }}
                    validationSchema={Yup.object({
                      name: Yup.string().required('氏名は必須です'),
                      email: Yup.string().email('有効なメールアドレスを入力してください').required('メールアドレスは必須です'),
                    })}
                    onSubmit={handleProfileUpdate}
                  >
                    {({ errors, touched, handleChange, handleBlur, values }) => (
                      <Form>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              id="name"
                              name="name"
                              label="氏名"
                              value={values.name}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={touched.name && Boolean(errors.name)}
                              helperText={touched.name && errors.name}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              id="email"
                              name="email"
                              label="メールアドレス"
                              value={values.email}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={touched.email && Boolean(errors.email)}
                              helperText={touched.email && errors.email}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                              <Button
                                variant="outlined"
                                onClick={() => setIsEditing(false)}
                              >
                                キャンセル
                              </Button>
                              <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                              >
                                保存
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                      </Form>
                    )}
                  </Formik>
                ) : (
                  <>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        ユーザー名
                      </Typography>
                      <Typography variant="body1">{user.username}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        氏名
                      </Typography>
                      <Typography variant="body1">{user.name}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        メールアドレス
                      </Typography>
                      <Typography variant="body1">{user.email}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        役割
                      </Typography>
                      <Typography variant="body1">{userRole}</Typography>
                    </Box>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => setIsEditing(true)}
                      sx={{ mt: 2 }}
                    >
                      プロフィールを編集
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* パスワード変更カード */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  パスワード変更
                </Typography>
                <Divider sx={{ my: 2 }} />

                {isChangingPassword ? (
                  <Formik
                    initialValues={{
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    }}
                    validationSchema={Yup.object({
                      currentPassword: Yup.string().required('現在のパスワードは必須です'),
                      newPassword: Yup.string()
                        .min(8, 'パスワードは8文字以上である必要があります')
                        .matches(
                          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                          'パスワードには少なくとも1つの大文字、1つの小文字、1つの数字が必要です'
                        )
                        .required('新しいパスワードは必須です'),
                      confirmPassword: Yup.string()
                        .oneOf([Yup.ref('newPassword')], 'パスワードが一致しません')
                        .required('パスワードの確認は必須です'),
                    })}
                    onSubmit={handlePasswordUpdate}
                  >
                    {({ errors, touched, handleChange, handleBlur }) => (
                      <Form>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              id="currentPassword"
                              name="currentPassword"
                              label="現在のパスワード"
                              type="password"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={touched.currentPassword && Boolean(errors.currentPassword)}
                              helperText={touched.currentPassword && errors.currentPassword}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              id="newPassword"
                              name="newPassword"
                              label="新しいパスワード"
                              type="password"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={touched.newPassword && Boolean(errors.newPassword)}
                              helperText={touched.newPassword && errors.newPassword}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              id="confirmPassword"
                              name="confirmPassword"
                              label="パスワードの確認"
                              type="password"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                              helperText={touched.confirmPassword && errors.confirmPassword}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                              <Button
                                variant="outlined"
                                onClick={() => setIsChangingPassword(false)}
                              >
                                キャンセル
                              </Button>
                              <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                              >
                                パスワードを変更
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                      </Form>
                    )}
                  </Formik>
                ) : (
                  <>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      セキュリティを保つために、定期的にパスワードを変更することをお勧めします。
                    </Typography>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => setIsChangingPassword(true)}
                    >
                      パスワードを変更
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  )
}