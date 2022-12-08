import { coolcar } from "service/proto_gen/trip_pb"
import { IAppOption } from "./appoption"
import camelcaseKeys from "camelcase-keys"

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
    wx.request({
      url: 'http://localhost:8084/trip/trip123',
      method: 'GET',
      success: res => {
        const getTripRes = coolcar.GetTripResponse.fromObject(camelcaseKeys(res.data as object, {
          deep: true,
        }))
        console.log(getTripRes)
        console.log('status is ', coolcar.TripStatus[getTripRes.trip?.status!])
      },
      fail: console.error,
    })


    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        console.log(res.code)
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      },
    })
  },
})