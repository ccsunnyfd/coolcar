import { Coolcar } from "service/request"
import { IAppOption } from "./appoption"

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
    // 登录
    Coolcar.login()
  },
})