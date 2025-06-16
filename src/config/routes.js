import Dashboard from '@/components/pages/Dashboard';
import Menu from '@/components/pages/Menu';
import Orders from '@/components/pages/Orders';
import Reservations from '@/components/pages/Reservations';
import Inventory from '@/components/pages/Inventory';

export const routes = {
  dashboard: {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: 'LayoutDashboard',
    component: Dashboard
  },
  menu: {
    id: 'menu',
    label: 'Menu',
    path: '/menu',
    icon: 'ChefHat',
    component: Menu
  },
  orders: {
    id: 'orders',
    label: 'Orders',
    path: '/orders',
    icon: 'ClipboardList',
    component: Orders
  },
  reservations: {
    id: 'reservations',
    label: 'Reservations',
    path: '/reservations',
    icon: 'Calendar',
    component: Reservations
  },
  inventory: {
    id: 'inventory',
    label: 'Inventory',
    path: '/inventory',
    icon: 'Package',
    component: Inventory
  }
};

export const routeArray = Object.values(routes);
export default routes;