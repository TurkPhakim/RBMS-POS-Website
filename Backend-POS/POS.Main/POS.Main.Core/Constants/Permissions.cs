namespace POS.Main.Core.Constants;

public static class Permissions
{
    public static class Dashboard
    {
        public const string Read = "dashboard.view.read";
    }

    public static class ServiceCharge
    {
        public const string Read = "service-charge.read";
        public const string Create = "service-charge.create";
        public const string Update = "service-charge.update";
        public const string Delete = "service-charge.delete";
    }

    public static class Position
    {
        public const string Read = "position.read";
        public const string Create = "position.create";
        public const string Update = "position.update";
        public const string Delete = "position.delete";
    }

    public static class Employee
    {
        public const string Read = "employee.read";
        public const string Create = "employee.create";
        public const string Update = "employee.update";
        public const string Delete = "employee.delete";
    }

    public static class Menu
    {
        public const string Read = "menu-item.read";
        public const string Create = "menu-item.create";
        public const string Update = "menu-item.update";
        public const string Delete = "menu-item.delete";
    }

    public static class Order
    {
        public const string Read = "order-manage.read";
        public const string Create = "order-manage.create";
        public const string Update = "order-manage.update";
        public const string Delete = "order-manage.delete";
    }

    public static class Table
    {
        public const string Read = "table-manage.read";
        public const string Create = "table-manage.create";
        public const string Update = "table-manage.update";
        public const string Delete = "table-manage.delete";
    }

    public static class Payment
    {
        public const string Read = "payment-manage.read";
        public const string Create = "payment-manage.create";
        public const string Update = "payment-manage.update";
        public const string Delete = "payment-manage.delete";
    }

    public static class KitchenDisplay
    {
        public const string Read = "kitchen-order.read";
        public const string Update = "kitchen-order.update";
    }
}
