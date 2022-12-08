import { constant } from "../../utils/constant"
import { routing } from "../../utils/routing"

interface Trip {
  id: string
  shortId: string
  start: string
  end: string
  duration: string
  fee: string
  distance: string
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

Page({
  scrollStates: {
    mainItems: [] as MainItemQueryResult[],
  },

  layoutResolver: undefined as (() => void) | undefined,

  data: {
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
    avatarURL: '',
    tripsHeight: 0,
    navCount: 0,
    mainItems: [] as MainItem[],
    mainScroll: '',
    navItems: [] as NavItem[],
    navSel: '',
    navScroll: '',
  },

  onLoad() {
    const avatarUrl = wx.getStorageSync(constant.avatarUrlKey)
    this.setData({
      avatarUrl: avatarUrl || '',
    })
    this.populateTrips()
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

  populateTrips() {
    const mainItems: MainItem[] = []
    const navItems: NavItem[] = []
    let navSel = ''
    let prevNav = ''
    for (let i = 0; i < 20; i++) {
      const mainId = 'main-' + i
      const navId = 'nav-' + i
      if (!prevNav) {
        prevNav = navId
      }

      const tripData: Trip = {
        id: 't-' + i,
        shortId: '****' + i,
        start: '保定',
        end: '石家庄',
        distance: '3000公里',
        duration: '5小时',
        fee: '17.34',
        status: i%2==0?'进行中':'已完成',
        inProgress: i%3==0?true:false,
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
