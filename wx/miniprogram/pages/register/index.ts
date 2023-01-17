import { ProfileService } from "../../service/profile"
import { rental } from "../../service/proto_gen/rental/rental_pb"
import { routing } from "../../utils/routing"

Page({
  redirectURL: '',
  profileRefresher: undefined as NodeJS.Timer | undefined,
  data: {
    name: '' as string,
    licNo: '' as string,
    gender: {
      items: ['未知', '男', '女'],
      genderIndex: 0,
      showGenderPicker: false,
    },
    date: {
      minDate: -315648000000 as number,
      maxDate: 1956499200000 as number,
      curDate: new Date().valueOf() as number,
      showDatePicker: false,
    },
    licImgURL: '' as string,
    state: rental.v1.IdentityStatus[rental.v1.IdentityStatus.UNSUBMITTED],
  },
  renderProfile(p: rental.v1.IProfile) {
    this.setData({
      licNo: p.Identity?.licNumber || '',
      name: p.Identity?.name || '',
      "gender.genderIndex": p.Identity?.gender || 0,
      "date.curDate": p.Identity?.birthDateMillis || new Date().valueOf(),
      state: rental.v1.IdentityStatus[p.identityStatus || 0],
    })
  },
  onLoad(opt: Record<'redirect', string>) {
    const o: routing.RegisterOpts = opt
    if (o.redirect) {
      this.redirectURL = decodeURIComponent(o.redirect)
    }
    let cur = new Date(), minDate = new Date()
    minDate.setFullYear(cur.getFullYear() - 60)
    this.setData({
      'date.minDate': minDate.valueOf(),
      'date.maxDate': cur.valueOf(),
    })

    ProfileService.GetProfile().then(p => {
      this.renderProfile(p)
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
    ProfileService.SubmitProfile({
      licNumber: this.data.licNo,
      name: this.data.name,
      gender: this.data.gender.genderIndex,
      birthDateMillis: this.data.date.curDate?.valueOf(),
    }).then(p => {
      this.renderProfile(p)
      this.scheduleProfileRefresher()
    })
  },
  onUnload() {
    this.clearProfileRefresher()
  },
  scheduleProfileRefresher() {
    this.profileRefresher = setInterval(() => {
      ProfileService.GetProfile().then(p => {
        this.renderProfile(p)
        if (p.identityStatus !== rental.v1.IdentityStatus.PENDING) {
          this.clearProfileRefresher()
        }
        if (p.identityStatus === rental.v1.IdentityStatus.VERIFIED) {
          this.onLicVerified()
        }
      })
    }, 1000)
  },
  clearProfileRefresher() {
    if (this.profileRefresher) {
      clearInterval(this.profileRefresher)
      this.profileRefresher = undefined
    }
  },
  onLicVerified() {
    // if (this.redirectURL) {
    //   wx.redirectTo({
    //     url: this.redirectURL,
    //   })
    // }
  },
  canModify() {
    const { state } = this.data
    return state === rental.v1.IdentityStatus[rental.v1.IdentityStatus.UNSUBMITTED] || state === rental.v1.IdentityStatus[rental.v1.IdentityStatus.UNVERIFIED]
  },
})
