import { routing } from "../../utils/routing"

Page({
  redirectURL: '',
  data: {
    name: '' as string,
    licNo: '' as string,
    gender: {
      items: ['未知', '男', '女', '其他'],
      genderIndex: 0,
      showGenderPicker: false,
    },
    date: {
      minDate: -315648000000 as number,
      maxDate: 1956499200000 as number,
      curDate: undefined as Date | undefined,
      showDatePicker: false,
    },
    licImgURL: '' as string,
    state: 'UNSUBMITTED' as 'UNSUBMITTED' | 'PENDING' | 'VERIFIED' | 'UNVERIFIED',
  },
  onLoad(opt: Record<'redirect', string>) {
    const o: routing.RegisterOpts = opt
    if (o.redirect) {
      this.redirectURL = decodeURIComponent(o.redirect)
    }
    let cur = new Date(), minDate = new Date()
    minDate.setFullYear(cur.getFullYear() - 60)
    this.setData({
      'date.curDate': cur.valueOf(),
      'date.minDate': minDate.valueOf(),
      'date.maxDate': cur.valueOf(),
    })
  },
  onUploadLic() {
    if (!this.canModify()) {
      return
    }
    wx.chooseMedia({
      mediaType: ['image'],
      maxDuration: 30,
      camera: 'back',
      success: res => {
        if (res.tempFiles.length > 0) {
          this.setData({
            licImgURL: res.tempFiles[0].tempFilePath
          })
          setTimeout(() => {
            this.setData({
              name: 'fdkjf',
              licNo: 'dkfjk',
              'gender.genderIndex': 1,
              'date.curDate': new Date().valueOf(),
            })
          }, 1000)
        }
      }
    })
  },
  onGenderPickerShow() {
    if (!this.canModify()) {
      return
    }
    this.setData({
      'gender.showGenderPicker': true,
    })
  },
  onDatePickerShow() {
    if (!this.canModify()) {
      return
    }
    this.setData({
      'date.showDatePicker': true,
    })
  },
  onGenderConfirm(event: { detail: { index: number } }) {
    const { detail } = event
    this.setData({
      'gender.genderIndex': detail.index,
      'gender.showGenderPicker': false,
    })
  },
  onDateConfirm(event: { detail: number }) {
    const { detail } = event
    this.setData({
      'date.curDate': detail,
      'date.showDatePicker': false,
    })
  },
  onGenderPickerClose() {
    this.setData({
      'gender.showGenderPicker': false,
    })
  },
  onDatePickerClose() {
    this.setData({
      'date.showDatePicker': false,
    })
  },
  onSubmit() {
    this.setData({
      state: 'PENDING',
    })
    setTimeout(() => {
      this.onLicVerified()
    }, 3000)
  },
  onLicVerified() {
    this.setData({
      state: 'VERIFIED',
    })
    if (this.redirectURL) {
      setTimeout(() => {
        wx.redirectTo({
          url: this.redirectURL,
        })
      }, 2000)
    }
  },
  canModify() {
    const { state } = this.data
    return state === 'UNSUBMITTED' || state === 'UNVERIFIED'
  },
})
