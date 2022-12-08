import { routing } from "../../utils/routing"

// pages/driving/index.ts
Page({
  timer: undefined as NodeJS.Timer | undefined,
  centsPerSec: 0.7 as number,
  data: {
    location: {
      latitude: 32.92,
      longitude: 118.46,
    },
    scale: 14,
    elapsed: 0 as number,
    fee: 0 as number,
  },

  onLoad(opt: Record<'trip_id', string>) {
    const o: routing.DrivingOpts = opt
    console.log('current trip', o.trip_id)
    this.setupLocationUpdator()
    this.setupTimer()
  },

  onUnload() {
    wx.stopLocationUpdate()
    if (this.timer) {
      clearInterval(this.timer)
    }
  },

  setupLocationUpdator() {
    wx.startLocationUpdate({
      fail: console.error,
    })
    wx.onLocationChange(loc => {
      this.setData({
        location: {
          latitude: loc.latitude,
          longitude: loc.longitude,
        }
      })
    })
  },
  setupTimer() {
    let elapsedSec = 0
    this.timer = setInterval(() => {
      elapsedSec++
      this.setData({
        elapsed: elapsedSec,
        fee: this.data.fee + this.centsPerSec
      })
    }, 1000)
  },

  onEndTripTap() {
    wx.redirectTo({
      url: routing.mytrips(),
    })
  }
})