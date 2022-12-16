import { auth } from "service/proto_gen/auth/auth_pb"
import { IAppOption } from "./appoption"
import camelcaseKeys from "camelcase-keys"
import { rental } from "service/proto_gen/rental/rental_pb"

// app.ts
App<IAppOption>({
  globalData: {
    userInfo: new Promise<WechatMiniprogram.UserInfo>(async () => {
      // try {
      //   const res = await getUserProfile()
      //   console.log(res)
      //   resolve(res.userInfo)
      // } catch (err) {
      //   reject(err)
      // }
    }),
  },

  async onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        console.log(res.code)
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        wx.request({
          url: 'http://localhost:8084/v1/auth/login',
          method: 'POST',
          data: {
            code: res.code,
          } as auth.v1.ILoginRequest,
          success: res => {
            const loginResp: auth.v1.ILoginResponse = auth.v1.LoginResponse.fromObject(
              camelcaseKeys(res.data as object, {
                deep: true,
              })
            )
            console.log(loginResp)
            wx.request({
              url: 'http://localhost:8084/v1/trip',
              method: 'POST',
              data: {
                start: 'abc',
              } as rental.v1.ICreateTripRequest,
              header: {
                authorization: 'Bearer ' + loginResp.accessToken,
              }
            })
          },
          fail: console.error,
        })
      },
    })
  },
})