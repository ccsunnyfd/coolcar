import { constant } from "../../utils/constant"
import { routing } from "../../utils/routing"

Page({
  isPageShowing: false,

  data: {
    avatarUrl: '' as string,
    setting: {
      skew: 0,
      rotate: 0,
      showLocation: true,
      showScale: true,
      subKey: '',
      layerStyle: -1,
      enableZoom: true,
      enableScroll: true,
      enableRotate: false,
      showCompass: false,
      enable3D: false,
      enableOverlooking: false,
      enableSatellite: false,
      enableTraffic: false,
    },
    location: {
      latitude: 23.0999994,
      longitude: 113.324520,
    },
    scale: 10,
    markers: [
      {
        iconPath: "/resources/car.png",
        id: 0,
        latitude: 23.0999994,
        longitude: 113.324520,
        width: 50,
        height: 50
      },
      {
        iconPath: "/resources/car.png",
        id: 1,
        latitude: 23.099994,
        longitude: 114.324520,
        width: 50,
        height: 50
      }
    ],
    showCancel: true,
    showModal: false,
  },

  onMyLocationTap() {
    wx.getLocation({
      type: 'gcj02',
      success: res => {
        this.setData({
          location: {
            longitude: res.longitude,
            latitude: res.latitude,
          }
        })
      },
      fail: () => {
        wx.showToast({
          icon: 'none',
          title: "请前往设置页授权",
        })
      }
    })
  },

  onShow() {
    this.isPageShowing = true
    const avatarUrl = wx.getStorageSync(constant.avatarUrlKey)
    this.setData({
      avatarUrl,
    })
  },

  onHide() {
    this.isPageShowing = false
  },

  onScanTap() {
    wx.scanCode({
      success: async () => {
        await this.selectComponent('#licModal').showModal()
        const carID = 'car123'
        const redirectURL = routing.lock({
          car_id: carID,
        })
        wx.navigateTo({
          url: routing.register({
            redirectURL,
          })
        })
      },
      fail: console.error
    })
  },
  onMyTripsTap() {
    wx.navigateTo({
      url: routing.mytrips(),
    })
  },

  moveCars() {
    const map = wx.createMapContext("map")
    const dest = {
      latitude: 23.099994,
      longtitude: 113.324520,
    }

    const moveCar = () => {
      dest.latitude += 0.1
      dest.longtitude += 0.1
      map.translateMarker({
        destination: {
          latitude: dest.latitude,
          longitude: dest.longtitude,
        },
        markerId: 0,
        autoRotate: false,
        rotate: 0,
        duration: 5000,
        animationEnd: () => {
          if (this.isPageShowing) {
            moveCar()
          }
        },
      })
    }

    moveCar()
  },
  onModalOK() {
    console.log('ok clicked')
  }
})
