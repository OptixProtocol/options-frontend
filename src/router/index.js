import Vue from 'vue'
import Router from 'vue-router'


// Containers
const TheContainer = () => import('@/containers/TheContainer')


// Views
const Home = () => import('@/views/options/Home')
const TradeOptions = () => import('@/views/options/TradeOptions')
const AddLiquidity = () => import('@/views/options/AddLiquidity')
const Markets = () => import('@/views/options/Markets')
const Page404 = () => import('@/views/pages/Page404')


Vue.use(Router)

export default new Router({
  mode: 'history', // https://router.vuejs.org/api/#mode
  linkActiveClass: 'active',
  scrollBehavior: () => ({ y: 0 }),
  routes: configRoutes()
})

function configRoutes () {
  return [
    {
      path: '/',
      component: TheContainer,
      children: [        
        {
          path: '/',
          name: 'Home',
          component: Home
        },
        {
          path: 'trade-options',
          name: 'Trade Options',
          component: TradeOptions
        },
        {
          path: 'add-liquidity',
          name: 'Add Liquidity',
          component: AddLiquidity
        },
        {
          path: 'markets',
          name: 'Markets',
          component: Markets
        }
      ]
    },
    {
      path: '/pages',
      redirect: '/pages/404',
      name: 'Pages',
      component: {
        render (c) { return c('router-view') }
      },
      children: [
        {
          path: '404',
          name: 'Page404',
          component: Page404
        }
      ]
    }
  ]
}

