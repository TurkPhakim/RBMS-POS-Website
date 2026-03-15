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

  private readonly allMenuItems: MenuItem[] = [
    {
      label: 'แดชบอร์ด',
      icon: 'dashboard',
      route: '/dashboard',
      permissions: ['dashboard.view.read'],
    },
    {
      label: 'ออเดอร์',
      icon: 'orders',
      route: '/order',
      permissions: ['order-manage.read'],
    },
    {
      label: 'เมนู',
      icon: 'menu-restaurant',
      permissions: ['menu-item.read'],
      children: [{ label: 'รายการเมนู', icon: 'food', route: '/menu/items' }],
    },
    {
      label: 'โต๊ะ',
      icon: 'table',
      route: '/table',
      permissions: ['table-manage.read'],
    },
    {
      label: 'ชำระเงิน',
      icon: 'cashier',
      route: '/payment',
      permissions: ['payment-manage.read'],
    },
    {
      label: 'ครัว',
      icon: 'kitchen',
      route: '/kitchen-display',
      permissions: ['kitchen-order.read'],
    },
    {
      label: 'ทรัพยากรบุคคล',
      icon: 'human-resource',
      permissions: ['employee.read'],
      children: [
        {
          label: 'รายการพนักงาน',
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
      ],
      children: [
        {
          label: 'ค่าบริการ',
          icon: 'coin',
          route: '/admin-setting/service-charges',
          permissions: ['service-charge.read'],
        },
        {
          label: 'จัดการตำแหน่ง',
          icon: 'human-resource',
          route: '/admin-setting/positions',
          permissions: ['position.read'],
        },
        {
          label: 'ตั้งค่าร้านค้า',
          icon: 'web-setting',
          route: '/admin-setting/shop-settings',
          permissions: ['shop-settings.read'],
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
    return this.router.url === route || this.router.url.startsWith(route + '/');
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
