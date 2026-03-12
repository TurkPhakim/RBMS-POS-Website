import { Component, Signal, signal } from '@angular/core';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { SidebarService } from '@app/core/services/sidebar.service';
import { AuthService } from '@app/core/services/auth.service';
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
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard', permissions: ['dashboard.view.read'] },
    { label: 'Order', icon: 'orders', route: '/order', permissions: ['order-manage.read'] },
    {
      label: 'Menu', icon: 'menu-restaurant', permissions: ['menu-item.read'],
      children: [
        { label: 'รายการเมนู', icon: 'food', route: '/menu/items' },
      ],
    },
    { label: 'Table', icon: 'table', route: '/table', permissions: ['table-manage.read'] },
    { label: 'Payment', icon: 'cashier', route: '/payment', permissions: ['payment-manage.read'] },
    { label: 'Kitchen Display', icon: 'kitchen', route: '/kitchen-display', permissions: ['kitchen-order.read'] },
    {
      label: 'Human Resource', icon: 'human-resource', permissions: ['employee.read'],
      children: [
        { label: 'รายการพนักงาน', icon: 'human', route: '/hr/employees' },
      ],
    },
    {
      label: 'Admin Setting', icon: 'admin-setting', permissions: ['service-charge.read', 'position.read'],
      children: [
        { label: 'Service Charges', icon: 'coin', route: '/admin-setting/service-charges', permissions: ['service-charge.read'] },
        { label: 'จัดการตำแหน่ง', icon: 'human-resource', route: '/admin-setting/positions', permissions: ['position.read'] },
      ],
    },
  ];

  constructor(
    private readonly sidebarService: SidebarService,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {
    this.isCollapsed = toSignal(this.sidebarService.isCollapsed$, { initialValue: false });
    this.menuItems.set(this.filterByPermissions(this.allMenuItems));
    this.autoExpandActiveParent();
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

  isChildActive(item: MenuItem): boolean {
    if (!item.children) return false;
    return item.children.some(child =>
      (child.route && this.isActive(child.route)) || this.isChildActive(child)
    );
  }

  private filterByPermissions(items: MenuItem[]): MenuItem[] {
    return items
      .filter(item => {
        if (!item.permissions || item.permissions.length === 0) return true;
        return this.authService.hasAnyPermission(item.permissions);
      })
      .map(item => {
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
    this.expandParentsRecursive(this.menuItems(), keys);
    if (keys.size > 0) {
      this.expandedKeys.set(keys);
    }
  }

  private expandParentsRecursive(items: MenuItem[], keys: Set<string>): boolean {
    for (const item of items) {
      if (item.route && this.isActive(item.route)) {
        return true;
      }
      if (item.children) {
        const childActive = this.expandParentsRecursive(item.children, keys);
        if (childActive) {
          keys.add(item.label);
          return true;
        }
      }
    }
    return false;
  }
}
