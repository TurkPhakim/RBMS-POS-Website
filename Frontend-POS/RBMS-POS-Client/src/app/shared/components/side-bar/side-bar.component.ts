import { Component, DestroyRef, Signal, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';
import { SidebarService } from '@app/core/services/sidebar.service';
import { MenuItem } from '@app/shared/component-interfaces';

@Component({
  selector: 'app-side-bar',
  standalone: false,
  templateUrl: './side-bar.component.html',
})
export class SideBarComponent {
  isCollapsed: Signal<boolean>;
  menuItems = signal<MenuItem[]>([]);
  expandedKeys = signal<Set<string>>(new Set());

  private readonly allChildRoutes: string[] = [];

  private readonly allMenuItems: MenuItem[] = [
    {
      label: 'แดชบอร์ด',
      icon: 'dashboard',
      permissions: ['dashboard.view.read'],
      children: [
        {
          label: 'ภาพรวม',
          icon: 'dashboard',
          route: '/dashboard',
          permissions: ['dashboard.view.read'],
        },
        {
          label: 'รายงานยอดขาย',
          icon: 'coin',
          route: '/dashboard/sales',
          permissions: ['dashboard.view.read'],
        },
      ],
    },
    {
      label: 'ออเดอร์',
      icon: 'order-dinner',
      route: '/order',
      permissions: ['order-manage.read'],
    },
    {
      label: 'เมนู',
      icon: 'menu-restaurant',
      permissions: [
        'menu-category.read',
        'menu-food.read',
        'menu-beverage.read',
        'menu-dessert.read',
        'menu-option.read',
      ],
      children: [
        {
          label: 'หมวดหมู่เมนู',
          icon: 'category',
          route: '/menu/categories',
          permissions: ['menu-category.read'],
        },
        {
          label: 'เมนูอาหาร',
          icon: 'chicken-drumstick',
          route: '/menu/food',
          permissions: ['menu-food.read'],
        },
        {
          label: 'เมนูเครื่องดื่ม',
          icon: 'drinks-glass',
          route: '/menu/beverage',
          permissions: ['menu-beverage.read'],
        },
        {
          label: 'เมนูของหวาน',
          icon: 'dessert',
          route: '/menu/dessert',
          permissions: ['menu-dessert.read'],
        },
        {
          label: 'ตัวเลือกเสริม',
          icon: 'option-extra',
          route: '/menu/options',
          permissions: ['menu-option.read'],
        },
      ],
    },
    {
      label: 'โต๊ะ',
      icon: 'table-set',
      permissions: ['table-manage.read', 'floor-plan.read', 'reservation.read'],
      children: [
        {
          label: 'ผังร้าน',
          icon: 'table-dinner',
          route: '/table/floor-plan',
          permissions: ['floor-plan.read'],
        },
        {
          label: 'โซน / โต๊ะ',
          icon: 'table-restaurant',
          route: '/table/zones',
          permissions: ['table-manage.read'],
        },
        {
          label: 'จองโต๊ะ',
          icon: 'reservation',
          route: '/table/reservations',
          permissions: ['reservation.read'],
        },
      ],
    },
    {
      label: 'ชำระเงิน',
      icon: 'cashier',
      permissions: ['payment-manage.read', 'cashier-session.read'],
      children: [
        {
          label: 'รอบการขาย',
          icon: 'bill-rastaurant',
          route: '/payment',
          permissions: ['payment-manage.read'],
        },
        {
          label: 'ประวัติรอบขาย',
          icon: 'bill-invoice',
          route: '/payment/session-history',
          permissions: ['cashier-session.read'],
        },
      ],
    },
    {
      label: 'ครัว',
      icon: 'chef-human',
      permissions: [
        'kitchen-food.read',
        'kitchen-beverage.read',
        'kitchen-dessert.read',
      ],
      children: [
        {
          label: 'ครัวอาหาร',
          icon: 'cook-chef',
          route: '/kitchen-display/food',
          permissions: ['kitchen-food.read'],
        },
        {
          label: 'บาร์เครื่องดื่ม',
          icon: 'bartender',
          route: '/kitchen-display/beverage',
          permissions: ['kitchen-beverage.read'],
        },
        {
          label: 'ครัวขนมหวาน',
          icon: 'pastry-chef',
          route: '/kitchen-display/dessert',
          permissions: ['kitchen-dessert.read'],
        },
      ],
    },
    {
      label: 'ทรัพยากรบุคคล',
      icon: 'human-resource',
      permissions: ['employee.read'],
      children: [
        {
          label: 'รายชื่อพนักงาน',
          icon: 'human',
          route: '/human-resource/employees',
        },
      ],
    },
    {
      label: 'ตั้งค่าระบบ',
      icon: 'admin-setting',
      permissions: [
        'service-charge.read',
        'position.read',
        'shop-settings.read',
        'user-management.read',
      ],
      children: [
        {
          label: 'รายชื่อผู้ใช้งาน',
          icon: 'user-octagon',
          route: '/admin-setting/users',
          permissions: ['user-management.read'],
        },
        {
          label: 'จัดการตำแหน่ง',
          icon: 'lock-protect',
          route: '/admin-setting/positions',
          permissions: ['position.read'],
        },
        {
          label: 'ตั้งค่าร้านค้า',
          icon: 'restaurant',
          route: '/admin-setting/shop-settings',
          permissions: ['shop-settings.read'],
        },
        {
          label: 'ค่าบริการ',
          icon: 'coin',
          route: '/admin-setting/service-charges',
          permissions: ['service-charge.read'],
        },
      ],
    },
  ];

  constructor(
    private readonly authService: AuthService,
    private readonly destroyRef: DestroyRef,
    private readonly router: Router,
    private readonly sidebarService: SidebarService,
  ) {
    this.isCollapsed = toSignal(this.sidebarService.isCollapsed$, {
      initialValue: false,
    });
    this.allChildRoutes = this.allMenuItems
      .flatMap((item) => item.children ?? [])
      .map((child) => child.route!)
      .filter(Boolean);
    this.menuItems.set(this.filterByPermissions(this.allMenuItems));
    this.autoExpandActiveParent();

    this.authService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.menuItems.set(this.filterByPermissions(this.allMenuItems));
        this.autoExpandActiveParent();
      });
  }

  toggleMenu(itemLabel: string): void {
    const keys = new Set(this.expandedKeys());
    if (keys.has(itemLabel)) {
      keys.delete(itemLabel);
    } else {
      keys.add(itemLabel);
    }
    this.expandedKeys.set(keys);
  }

  isExpanded(itemLabel: string): boolean {
    return this.expandedKeys().has(itemLabel);
  }

  isActive(route: string): boolean {
    const url = this.router.url.split('?')[0];
    if (url === route) return true;
    if (url.startsWith(route + '/')) {
      const hasMoreSpecific = this.allChildRoutes.some(
        (r) => r !== route && r.length > route.length && url.startsWith(r),
      );
      return !hasMoreSpecific;
    }
    return false;
  }

  getHomeRoute(item: MenuItem): string {
    if (item.route) return item.route;
    if (item.children && item.children.length > 0)
      return item.children[0].route || '/';
    return '/';
  }

  isChildActive(item: MenuItem): boolean {
    return (
      item.children?.some(
        (child) => child.route && this.isActive(child.route),
      ) ?? false
    );
  }

  private filterByPermissions(items: MenuItem[]): MenuItem[] {
    return items
      .filter((item) => {
        if (!item.permissions || item.permissions.length === 0) return true;
        return this.authService.hasAnyPermission(item.permissions);
      })
      .map((item) => {
        if (item.children) {
          const filteredChildren = this.filterByPermissions(item.children);
          if (filteredChildren.length === 0) return null;
          return { ...item, children: filteredChildren };
        }
        return item;
      })
      .filter((item): item is MenuItem => item !== null);
  }

  private autoExpandActiveParent(): void {
    const keys = new Set<string>();
    for (const item of this.menuItems()) {
      if (
        item.children?.some(
          (child) => child.route && this.isActive(child.route),
        )
      ) {
        keys.add(item.label);
      }
    }
    if (keys.size > 0) {
      this.expandedKeys.set(keys);
    }
  }
}
