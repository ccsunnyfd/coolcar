import { ProfileService } from "../../service/profile"
import { rental } from "../../service/proto_gen/rental/rental_pb"
import { TripService } from "../../service/trip"
import { constant } from "../../utils/constant"
import { routing } from "../../utils/routing"

interface Trip {
  id: string
  shortId: string
  start: string
  end: string
  duration: number
  fee: number
  distance: number
  status: string
  inProgress: boolean
}

interface MainItem {
  id: string
  navId: string
  navScrollId: string
  data: Trip
}

interface NavItem {
  id: string
  mainId: string
  label: string
}

interface MainItemQueryResult {
  id: string
  top: number
  dataset: {
    navId: string
    navScrollId: string
  }
}

const tripStatusMap = new Map([
  [rental.v1.TripStatus.IN_PROGRESS, '进行中'],
  [rental.v1.TripStatus.FINISHED, '已完成'],
])

const licStatusMap = new Map([
  [rental.v1.IdentityStatus.UNSUBMITTED, '未认证'],
  [rental.v1.IdentityStatus.PENDING, '未认证'],
  [rental.v1.IdentityStatus.VERIFIED, '已认证'],
  [rental.v1.IdentityStatus.UNVERIFIED, '认证未通过'],
])

Page({
  scrollStates: {
    mainItems: [] as MainItemQueryResult[],
  },

  layoutResolver: undefined as (() => void) | undefined,

  data: {
    licStatus: licStatusMap.get(rental.v1.IdentityStatus.UNSUBMITTED),
    promotionItems: [
      {
        img: 'https://img.mukewang.com/5f7301d80001fdee18720764.jpg',
        promotionID: 1,
      },
      {
        img: 'https://img.mukewang.com/5f6805710001326c18720764.jpg',
        promotionID: 2,
      },
      {
        img: 'https://img.mukewang.com/5f6173b400013d4718720764.jpg',
        promotionID: 3,
      },
      {
        img: 'https://img.mukewang.com/5f7141ad0001b36418720764.jpg',
        promotionID: 4,
      },
    ],
    avatarUrl: '',
    tripsHeight: 0,
    navCount: 0,
    mainItems: [] as MainItem[],
    mainScroll: '',
    navItems: [] as NavItem[],
    navSel: '',
    navScroll: '',
  },

  async onLoad() {
    const trips = await TripService.GetTrips()
    this.populateTrips(trips.trips!)

    const avatarUrl = wx.getStorageSync(constant.avatarUrlKey)
    this.setData({
      avatarUrl: avatarUrl || '',
    })
  },
  onShow() {
    ProfileService.GetProfile().then(p => {
      this.setData({
        licStatus: licStatusMap.get(p.identityStatus || 0),
      })
    })
  },
  onReady() {
    wx.createSelectorQuery().select('#heading')
      .boundingClientRect(rect => {
        const height = wx.getSystemInfoSync().windowHeight - rect.height
        this.setData({
          tripsHeight: height,
          navCount: Math.round(height / 50),
        })
      }).exec()
  },

  populateTrips(trips: rental.v1.ITripEntity[]) {
    const mainItems: MainItem[] = []
    const navItems: NavItem[] = []
    let navSel = ''
    let prevNav = ''
    for (let i = 0; i < trips.length; i++) {
      const trip = trips[i]
      const mainId = 'main-' + i
      const navId = 'nav-' + i
      const shortId = trip.id?.substr(trip.id.length - 6)
      if (!prevNav) {
        prevNav = navId
      }

      const tripData: Trip = {
        id: trip.id!,
        shortId: '*****' + shortId,
        start: trip.trip?.start?.poiName || '未知',
        end: '',
        distance: 0,
        duration: 0,
        fee: 0,
        status: tripStatusMap.get(trip.trip?.status!) || '未知',
        inProgress: trip.trip?.status === rental.v1.TripStatus.IN_PROGRESS,
      }

      const end = trip.trip?.end
      if (end) {
        tripData.end = end.poiName || '未知'
        tripData.distance = end.kmDriven || 0
        tripData.fee = end.feeCent || 0
        tripData.duration = (end.timestampSec || 0) - (trip.trip?.start?.timestampSec || 0)
      }

      mainItems.push({
        id: mainId,
        navId: navId,
        navScrollId: prevNav,
        data: tripData,
      })
      navItems.push({
        id: navId,
        mainId: mainId,
        label: navId,
      })
      if (i === 0) {
        navSel = navId
      }
      prevNav = navId
    }

    for (let i = 0; i < this.data.navCount - 1; i++) {
      navItems.push({
        id: '',
        mainId: '',
        label: '',
      })
    }

    this.setData({
      mainItems,
      navItems,
      navSel,
    }, () => {
      this.prepareScrollStates()
    })
  },

  prepareScrollStates() {
    wx.createSelectorQuery().selectAll('.main-item')
      .fields({
        id: true,
        dataset: true,
        rect: true,
      }).exec(res => {
        this.scrollStates.mainItems = res[0]
      })
  },

  onPromotionItemTap(e: any) {
    const promotionID: number = e.currentTarget.dataset.promotionId
    if (promotionID) {
      console.log('claiming promotion', promotionID)
    }
  },

  onRegisterTap() {
    wx.navigateTo({
      url: routing.register(),
    })
  },

  onNavItemTap(e: any) {
    const mainId: string = e.currentTarget?.dataset?.mainId
    const navId: string = e.currentTarget?.id
    if (mainId && navId) {
      this.setData({
        mainScroll: mainId,
        navSel: navId,
      })
    }
  },

  onMainScroll(e: any) {
    const top: number = e.currentTarget?.offsetTop + e.detail?.scrollTop
    if (top === undefined) {
      return
    }

    const selItem = this.scrollStates.mainItems.find(
      v => v.top >= top)
    if (!selItem) {
      return
    }

    this.setData({
      navSel: selItem.dataset.navId,
      navScroll: selItem.dataset.navScrollId,
    })
  },

  onMainItemTap(e: any) {
    if (!e.currentTarget.dataset.tripInProgress) {
      return
    }
    const tripId = e.currentTarget.dataset.tripId
    if (tripId) {
      wx.redirectTo({
        url: routing.driving({
          trip_id: tripId,
        }),
      })
    }
  },

  onChooseAvatar(e: { detail: { avatarUrl: string } }) {
    const { avatarUrl } = e.detail
    wx.setStorageSync(constant.avatarUrlKey, avatarUrl)
    this.setData({
      avatarUrl,
    })
  },
})
