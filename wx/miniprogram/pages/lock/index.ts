import { constant } from "../../utils/constant"
import { routing } from "../../utils/routing"

Page({
  data: {
    licImgURL: '/resources/sedan.png' as string,
    avatarUrl: '' as string,
    shareLocation: true as boolean,
  },
  onLoad(opt: Record<'car_id', string>) {
    const o: routing.LockOpts = opt
    console.log('unlocking car ', o.car_id)
    const shareLocation = wx.getStorageSync(constant.shareLocationKey)
    const avatarUrl = wx.getStorageSync(constant.avatarUrlKey)
    this.setData({
      avatarUrl: avatarUrl || '',
      shareLocation: shareLocation || true,
    })
  },
  onChooseAvatar(e: { detail: { avatarUrl: string } }) {
    const { avatarUrl } = e.detail
    wx.setStorageSync(constant.avatarUrlKey, avatarUrl)
    this.setData({
      avatarUrl,
    })
  },
  onShareLocationChange(e: any) {
    const shareLocation: boolean = e.detail
    wx.setStorageSync(constant.shareLocationKey, shareLocation)
    this.setData({
      shareLocation,
    })
  },
  onUnlockTap() {
    wx.getLocation({
      type: 'gcj02',
      success: loc => {
        console.log('starting a trip', {
          location: {
            longitude: loc.longitude,
            latitude: loc.latitude,
          },
          avatarUrl: this.data.shareLocation ? this.data.avatarUrl : '',
          carID: '',
        })

        const tripID = 'trip456'

        wx.showLoading({
          title: '开锁中...',
          mask: true,
        })
        setTimeout(() => {
          wx.redirectTo({
            url: routing.driving({
              trip_id: tripID,
            }),
            complete: () => {
              wx.hideLoading()
            }
          })
        }, 2000);

      },
      fail: () => {
        wx.showToast({
          icon: 'none',
          title: "请前往设置页授权位置信息",
        })
      }
    })
  }
})