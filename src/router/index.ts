import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/users'
import ProductsView from '@/views/ProductsView.vue'
import ProductDetailView from '@/views/ProductDetailView.vue'
import FeedbackView from '@/views/FeedbackView.vue'
import TrackOrderView from '@/views/TrackOrderView.vue'
const ShoppingCart = () => import('@/views/ShoppingCartView.vue')
const CheckoutComplete = () => import('@/views/CheckoutComplete.vue')
const AboutView = () => import('@/views/AboutView.vue')
const CareGuideView = () => import('@/views/CareGuideView.vue')
const LoginView = () => import('@/views/LoginView.vue')
const ResetPasswordView = () => import('@/views/ResetPasswordView.vue')
const EasterEggView = () => import('@/views/EasterEggView.vue')
const AccountView = () => import('@/views/AccountView.vue')
const GiveawayView = () => import('@/views/GiveawayView.vue')
const EbayLoginSuccess = () => import('@/views/EbayLoginSuccess.vue')
const AdminPanel = () => import('@/views/AdminPanelView.vue')
const routeData = [
  {
    path: "/",
    name: 'home',
    label: 'Home',
    component: ProductsView,
    meta: {
      showInNav: false,
      requiresLogin: false,
      requiresAdmin: false,
      hideHeader: false,
    }
  },
  {
    path: "/products",
    name: 'products',
    label: 'Shop',
    component: ProductsView,
    meta: {
      showInNav: true,
      requiresLogin: false,
      requiresAdmin: false,
    }
  },
  {
    path: "/plants/:id/:sku?",
    name: 'productDetails',
    label: 'Products Details',
    key: '$route.params.id',
    component: ProductDetailView,
    props: (route: any) => ({ query: route.query.showHidden }),
    meta: {
      showInNav: false,
      requiresLogin: false,
      requiresAdmin: false,
    }
  },
  {
    path: "/cart",
    name: 'shoppingCart',
    label: 'Shopping Cart',
    component: ShoppingCart,
    meta: {
      showInNav: false,
      requiresLogin: false,
      requiresAdmin: false,
    }
  },
  {
    path: "/care",
    name: 'care',
    label: 'Care',
    component: CareGuideView,
    meta: {
      showInNav: true,
      requiresLogin: false,
      requiresAdmin: false,
    }
  },
  {
    path: "/about",
    name: 'about',
    label: 'About',
    component: AboutView,
    meta: {
      showInNav: true,
      requiresLogin: false,
      requiresAdmin: false,
    }
  },
  {
    path: "/order-tracking/:id",
    name: 'tracking',
    label: 'Tracking',
    component: TrackOrderView,
    meta: {
      showInNav: false,
      requiresLogin: false,
      requiresAdmin: false,
    }
  },
  {
    path: "/feedback/:id/:great?",
    name: 'feedback',
    label: 'Feedback',
    component: FeedbackView,
    meta: {
      showInNav: false,
      requiresLogin: false,
      requiresAdmin: false
    }
  },
  {
    path: "/secret",
    name: 'secret',
    label: 'Secret',
    component: EasterEggView,
    meta: {
      showInNav: true,
      requiresLogin: true,
      requiresAdmin: false,
      requiresFamily: true,
    }
  },
  {
    path: "/account",
    name: 'account',
    label: 'Orders',
    component: AccountView,
    meta: {
      showInNav: true,
      requiresLogin: true,
      requiresAdmin: false,
    }
  },
  // {
  //   path: "/giveaway",
  //   name: 'giveaway',
  //   label: 'Giveaway',
  //   component: GiveawayView,
  //   meta: {
  //     showInNav: true,
  //     requiresLogin: false,
  //     requiresAdmin: false,
  //   }
  // },
  {
    path: "/adminPanel",
    name: 'Admin Panel',
    label: 'Admin Panel',
    component: AdminPanel,
    meta: {
      showInNav: true,
      requiresLogin: true,
      requiresAdmin: true,
    }
  },
  // {
  //   path: "/orderAdmin",
  //   name: 'Order Admin',
  //   label: 'Order Admin',
  //   component: AdminView,
  //   meta: {
  //     showInNav: false,
  //     requiresLogin: true,
  //     requiresAdmin: true,
  //   }
  // },
  // {
  //   path: "/plantAdmin",
  //   name: 'Plant Admin',
  //   label: 'Plant Admin',
  //   component: PlantAdminView,
  //   meta: {
  //     showInNav: true,
  //     requiresLogin: true,
  //     requiresAdmin: true,
  //   }
  // },
  {
    path: "/login",
    name: 'login',
    label: 'Login',
    component: LoginView,
    meta: {
      showInNav: false,
      requiresLogin: true,
      requiresAdmin: false,
    }
  },
  {
    path: "/resetpassword",
    name: 'resetPassword',
    label: 'Reset Password',
    component: ResetPasswordView,
    meta: {
      showInNav: false,
      requiresLogin: false,
      requiresAdmin: false,
    }
  },
  {
    path: "/checkoutComplete",
    name: "checkoutComplete",
    label: 'Checkout Complete',
    component: CheckoutComplete,
    meta: {
      showInNav: false,
      requiresLogin: false,
      requiresLoginOrAnon: true,
      requiresAdmin: false,
    }
  },
  {
    path: '/ebayLoginSuccess',
    name: 'ebayLoginSuccess',
    label: 'Ebay Login Success',
    component: EbayLoginSuccess,
    meta: {
      showInNav: false,
      requiresLogin: false,
      requiresLoginOrAnon: false,
      requiresAdmin: true,
    }
  },
]

//Ignore ES Lint barfing an unused variable error, this line is specifically to exclude that variable from the exported object
export const navData = routeData.map(({ component, ...rest }) => rest) //eslint-disable-line @typescript-eslint/no-unused-vars
export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routeData,
})

router.beforeEach((to) => {
  const userStore = useUserStore()
  if (to.meta.requiresAdmin) {
    return userStore.isAdmin
  }

  if (to.meta.requiresLogin && !userStore.isLoggedIn && to.name !== 'home' && to.name !== 'login') {
    return { name: 'home' }
  }
  if (to.meta.requiresLoginOrAnon && !userStore.isLoggedInOrAnonymous && to.name !== 'home' && to.name !== 'login') {
    return { name: 'home' }
  }
})
