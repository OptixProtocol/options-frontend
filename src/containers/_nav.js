export default [
  {
    _name: 'CSidebarNav',
    _children: [
      {
        _name: 'CSidebarNavItem',
        name: 'Home',
        to: '/'
      },
      {
        _name: 'CSidebarNavItem',
        name: 'Trade Options',
        to: '/trade-options'
      },
      {
        _name: 'CSidebarNavItem',
        name: 'Add Liquidity',
        to: '/add-liquidity'
      }
      ,
      {
        _name: 'CSidebarNavItem',
        name: 'Discord',
        target: '_blank',
        href: 'https://discord.gg/8ycMuYt7PS'
      }  ,
      {
        _name: 'CSidebarNavItem',
        name: 'Twitter',
        target: '_blank',
        href: 'https://twitter.com/CryptoOptyn'
      }     
    ]
  }
]