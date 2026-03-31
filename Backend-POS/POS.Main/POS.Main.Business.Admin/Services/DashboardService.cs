using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using POS.Main.Business.Admin.Interfaces;
using POS.Main.Business.Admin.Models.Dashboard;
using System.Linq.Expressions;
using POS.Main.Core.Enums;
using POS.Main.Core.Exceptions;
using POS.Main.Core.Helpers;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.UnitOfWork;

namespace POS.Main.Business.Admin.Services;

public class DashboardService : IDashboardService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<DashboardService> _logger;

    public DashboardService(IUnitOfWork unitOfWork, ILogger<DashboardService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<DashboardOverviewResponseModel> GetOverviewAsync(DateTime? date, int days = 7, CancellationToken ct = default)
    {
        var selectedDate = date?.Date ?? DateTimeHelper.BangkokToday();
        var previousDate = selectedDate.AddDays(-1);

        _logger.LogInformation("Get dashboard overview for {Date}, trend {Days} days", selectedDate, days);

        var selected = await GetKpiForDateAsync(selectedDate, ct);
        var previous = await GetKpiForDateAsync(previousDate, ct);
        var kitchenBreakdown = await GetKitchenBreakdownForDateAsync(selectedDate, ct);
        var revenueTrend = await GetRevenueTrendAsync(selectedDate, days, ct);
        var periodData = await GetPeriodRevenueTrendAsync(selectedDate, days, ct);

        return new DashboardOverviewResponseModel
        {
            Selected = selected,
            Previous = previous,
            KitchenBreakdown = kitchenBreakdown,
            RevenueTrend = revenueTrend,
            HasTwoPeriods = periodData.HasTwoPeriods,
            Period1Label = periodData.Period1Label,
            Period2Label = periodData.Period2Label,
            PeriodRevenueTrend = periodData.Trend
        };
    }

    public async Task<TopSellingResponseModel> GetTopSellingAsync(DateTime? date, int days = 30, CancellationToken ct = default)
    {
        var selectedDate = date?.Date ?? DateTimeHelper.BangkokToday();
        var startDate = selectedDate.AddDays(-days);

        _logger.LogInformation("Get top selling for {Date}, past {Days} days", selectedDate, days);

        var food = await GetTopSellingByCategoryAsync((int)EMenuCategory.Food, startDate, selectedDate, ct);
        var beverage = await GetTopSellingByCategoryAsync((int)EMenuCategory.Beverage, startDate, selectedDate, ct);
        var dessert = await GetTopSellingByCategoryAsync((int)EMenuCategory.Dessert, startDate, selectedDate, ct);

        return new TopSellingResponseModel
        {
            Food = food,
            Beverage = beverage,
            Dessert = dessert
        };
    }

    public async Task<PeakHoursResponseModel> GetPeakHoursAsync(DateTime? date, CancellationToken ct = default)
    {
        var selectedDate = date?.Date ?? DateTimeHelper.BangkokToday();

        _logger.LogInformation("Get peak hours for {Date}", selectedDate);

        var hours = await _unitOfWork.Orders.QueryNoTracking()
            .Where(o => o.CreatedAt.Date == selectedDate)
            .GroupBy(o => o.CreatedAt.Hour)
            .Select(g => new HourlyOrderModel
            {
                Hour = g.Key,
                OrderCount = g.Count()
            })
            .OrderBy(x => x.Hour)
            .ToListAsync(ct);

        return new PeakHoursResponseModel { Hours = hours };
    }

    public async Task<SalesReportResponseModel> GetSalesReportAsync(DateTime from, DateTime to, CancellationToken ct = default)
    {
        var fromDate = from.Date;
        var toDate = to.Date;

        if (fromDate > toDate)
            throw new ValidationException("วันเริ่มต้นต้องไม่เกินวันสิ้นสุด");

        if ((toDate - fromDate).TotalDays > 365)
            throw new ValidationException("ช่วงเวลาต้องไม่เกิน 365 วัน");

        _logger.LogInformation("Get sales report from {From} to {To}", fromDate, toDate);

        var summary = await GetKpiForRangeAsync(fromDate, toDate, ct);
        var dailyBreakdown = await GetDailyBreakdownAsync(fromDate, toDate, ct);
        var categoryBreakdown = await GetCategoryBreakdownAsync(fromDate, toDate, ct);
        var kitchenBreakdown = await GetKitchenBreakdownForRangeAsync(fromDate, toDate, ct);

        return new SalesReportResponseModel
        {
            Summary = summary,
            DailyBreakdown = dailyBreakdown,
            CategoryBreakdown = categoryBreakdown,
            KitchenBreakdown = kitchenBreakdown
        };
    }

    // ─── Private helpers ──────────────────────────────────────────

    private async Task<DashboardKpiModel> GetKpiForDateAsync(DateTime date, CancellationToken ct)
    {
        var totalSales = await _unitOfWork.OrderBills.QueryNoTracking()
            .Where(b => b.Status == EBillStatus.Paid && b.PaidAt != null && b.PaidAt.Value.Date == date)
            .SumAsync(b => (decimal?)b.GrandTotal, ct) ?? 0;

        var orderCount = await _unitOfWork.Orders.QueryNoTracking()
            .Where(o => o.CreatedAt.Date == date)
            .CountAsync(ct);

        var guestCount = await _unitOfWork.Orders.QueryNoTracking()
            .Where(o => o.CreatedAt.Date == date)
            .SumAsync(o => (int?)o.GuestCount, ct) ?? 0;

        var totalCost = await GetTotalCostAsync(
            i => i.CreatedAt.Date == date, ct);
        var grossProfit = totalSales - totalCost;

        return new DashboardKpiModel
        {
            TotalSales = totalSales,
            OrderCount = orderCount,
            GuestCount = guestCount,
            AveragePerOrder = orderCount > 0 ? Math.Round(totalSales / orderCount, 2) : 0,
            TotalCost = totalCost,
            GrossProfit = grossProfit,
            GrossMarginPercent = totalSales > 0 ? Math.Round(grossProfit / totalSales * 100, 1) : 0
        };
    }

    private async Task<DashboardKpiModel> GetKpiForRangeAsync(DateTime from, DateTime to, CancellationToken ct)
    {
        var totalSales = await _unitOfWork.OrderBills.QueryNoTracking()
            .Where(b => b.Status == EBillStatus.Paid && b.PaidAt != null
                && b.PaidAt.Value.Date >= from && b.PaidAt.Value.Date <= to)
            .SumAsync(b => (decimal?)b.GrandTotal, ct) ?? 0;

        var orderCount = await _unitOfWork.Orders.QueryNoTracking()
            .Where(o => o.CreatedAt.Date >= from && o.CreatedAt.Date <= to)
            .CountAsync(ct);

        var guestCount = await _unitOfWork.Orders.QueryNoTracking()
            .Where(o => o.CreatedAt.Date >= from && o.CreatedAt.Date <= to)
            .SumAsync(o => (int?)o.GuestCount, ct) ?? 0;

        var totalCost = await GetTotalCostAsync(
            i => i.CreatedAt.Date >= from && i.CreatedAt.Date <= to, ct);
        var grossProfit = totalSales - totalCost;

        return new DashboardKpiModel
        {
            TotalSales = totalSales,
            OrderCount = orderCount,
            GuestCount = guestCount,
            AveragePerOrder = orderCount > 0 ? Math.Round(totalSales / orderCount, 2) : 0,
            TotalCost = totalCost,
            GrossProfit = grossProfit,
            GrossMarginPercent = totalSales > 0 ? Math.Round(grossProfit / totalSales * 100, 1) : 0
        };
    }

    private async Task<List<KitchenBreakdownModel>> GetKitchenBreakdownForDateAsync(DateTime date, CancellationToken ct)
    {
        var items = await _unitOfWork.OrderItems.QueryNoTracking()
            .Where(i => i.CreatedAt.Date == date
                && i.Status != EOrderItemStatus.Voided
                && i.Status != EOrderItemStatus.Cancelled)
            .GroupBy(i => i.CategoryType)
            .Select(g => new KitchenBreakdownModel
            {
                CategoryType = g.Key,
                ItemCount = g.Sum(x => x.Quantity)
            })
            .ToListAsync(ct);

        foreach (var item in items)
            item.CategoryName = GetCategoryName(item.CategoryType);

        return items.OrderBy(x => x.CategoryType).ToList();
    }

    private async Task<List<KitchenBreakdownModel>> GetKitchenBreakdownForRangeAsync(DateTime from, DateTime to, CancellationToken ct)
    {
        var items = await _unitOfWork.OrderItems.QueryNoTracking()
            .Where(i => i.CreatedAt.Date >= from && i.CreatedAt.Date <= to
                && i.Status != EOrderItemStatus.Voided
                && i.Status != EOrderItemStatus.Cancelled)
            .GroupBy(i => i.CategoryType)
            .Select(g => new KitchenBreakdownModel
            {
                CategoryType = g.Key,
                ItemCount = g.Sum(x => x.Quantity)
            })
            .ToListAsync(ct);

        var totalItems = items.Sum(x => x.ItemCount);

        foreach (var item in items)
        {
            item.CategoryName = GetCategoryName(item.CategoryType);
            item.Percentage = totalItems > 0 ? Math.Round((decimal)item.ItemCount / totalItems * 100, 1) : 0;
        }

        return items.OrderBy(x => x.CategoryType).ToList();
    }

    private async Task<List<RevenueTrendModel>> GetRevenueTrendAsync(DateTime selectedDate, int days, CancellationToken ct)
    {
        var startDate = selectedDate.AddDays(-(days - 1));

        return await _unitOfWork.OrderBills.QueryNoTracking()
            .Where(b => b.Status == EBillStatus.Paid && b.PaidAt != null
                && b.PaidAt.Value.Date >= startDate && b.PaidAt.Value.Date <= selectedDate)
            .GroupBy(b => b.PaidAt!.Value.Date)
            .Select(g => new RevenueTrendModel
            {
                Date = g.Key,
                TotalSales = g.Sum(x => x.GrandTotal)
            })
            .OrderBy(x => x.Date)
            .ToListAsync(ct);
    }

    private async Task<List<TopSellingItemModel>> GetTopSellingByCategoryAsync(int categoryType, DateTime startDate, DateTime endDate, CancellationToken ct)
    {
        var topItems = await _unitOfWork.OrderItems.QueryNoTracking()
            .Where(i => i.CreatedAt.Date >= startDate && i.CreatedAt.Date <= endDate
                && i.CategoryType == categoryType
                && i.Status != EOrderItemStatus.Voided
                && i.Status != EOrderItemStatus.Cancelled)
            .GroupBy(i => new { i.MenuId, i.MenuNameThai })
            .Select(g => new TopSellingItemModel
            {
                MenuId = g.Key.MenuId,
                MenuName = g.Key.MenuNameThai,
                TotalQuantity = g.Sum(x => x.Quantity)
            })
            .OrderByDescending(x => x.TotalQuantity)
            .Take(5)
            .ToListAsync(ct);

        var menuIds = topItems.Select(x => x.MenuId).ToList();
        var menuImages = await _unitOfWork.Menus.QueryNoTracking()
            .Where(m => menuIds.Contains(m.MenuId))
            .Select(m => new { m.MenuId, m.ImageFileId })
            .ToListAsync(ct);

        var imageDict = menuImages.ToDictionary(m => m.MenuId, m => m.ImageFileId);
        foreach (var item in topItems)
            item.ImageFileId = imageDict.GetValueOrDefault(item.MenuId);

        return topItems;
    }

    private async Task<List<DailyBreakdownModel>> GetDailyBreakdownAsync(DateTime from, DateTime to, CancellationToken ct)
    {
        var salesByDate = await _unitOfWork.OrderBills.QueryNoTracking()
            .Where(b => b.Status == EBillStatus.Paid && b.PaidAt != null
                && b.PaidAt.Value.Date >= from && b.PaidAt.Value.Date <= to)
            .GroupBy(b => b.PaidAt!.Value.Date)
            .Select(g => new { Date = g.Key, TotalSales = g.Sum(x => x.GrandTotal) })
            .ToListAsync(ct);

        var ordersByDate = await _unitOfWork.Orders.QueryNoTracking()
            .Where(o => o.CreatedAt.Date >= from && o.CreatedAt.Date <= to)
            .GroupBy(o => o.CreatedAt.Date)
            .Select(g => new { Date = g.Key, OrderCount = g.Count(), GuestCount = g.Sum(x => x.GuestCount) })
            .ToListAsync(ct);

        var validItems = _unitOfWork.OrderItems.QueryNoTracking()
            .Where(i => i.CreatedAt.Date >= from && i.CreatedAt.Date <= to
                && i.Status != EOrderItemStatus.Voided
                && i.Status != EOrderItemStatus.Cancelled);

        var menuCostByDate = await validItems
            .GroupBy(i => i.CreatedAt.Date)
            .Select(g => new { Date = g.Key, Cost = g.Sum(i => (decimal?)((i.CostPrice ?? 0) * i.Quantity)) ?? 0 })
            .ToListAsync(ct);

        var optionCostByDate = await validItems
            .SelectMany(i => i.OrderItemOptions, (i, o) => new { i.CreatedAt, i.Quantity, o.CostPrice })
            .GroupBy(x => x.CreatedAt.Date)
            .Select(g => new { Date = g.Key, Cost = g.Sum(x => (decimal?)((x.CostPrice ?? 0) * x.Quantity)) ?? 0 })
            .ToListAsync(ct);

        var salesDict = salesByDate.ToDictionary(x => x.Date, x => x.TotalSales);
        var ordersDict = ordersByDate.ToDictionary(x => x.Date);
        var menuCostDict = menuCostByDate.ToDictionary(x => x.Date, x => x.Cost);
        var optionCostDict = optionCostByDate.ToDictionary(x => x.Date, x => x.Cost);

        var allDates = salesDict.Keys.Union(ordersDict.Keys).Distinct().OrderByDescending(d => d);

        return allDates.Select(date =>
        {
            var sales = salesDict.GetValueOrDefault(date, 0);
            var orders = ordersDict.TryGetValue(date, out var o) ? o : null;
            var orderCount = orders?.OrderCount ?? 0;
            var guestCount = orders?.GuestCount ?? 0;
            var totalCost = menuCostDict.GetValueOrDefault(date, 0) + optionCostDict.GetValueOrDefault(date, 0);
            var grossProfit = sales - totalCost;

            return new DailyBreakdownModel
            {
                Date = date,
                TotalSales = sales,
                OrderCount = orderCount,
                GuestCount = guestCount,
                AveragePerOrder = orderCount > 0 ? Math.Round(sales / orderCount, 2) : 0,
                TotalCost = totalCost,
                GrossProfit = grossProfit
            };
        }).ToList();
    }

    private async Task<List<CategoryBreakdownModel>> GetCategoryBreakdownAsync(DateTime from, DateTime to, CancellationToken ct)
    {
        var items = await _unitOfWork.OrderItems.QueryNoTracking()
            .Where(i => i.CreatedAt.Date >= from && i.CreatedAt.Date <= to
                && i.Status != EOrderItemStatus.Voided
                && i.Status != EOrderItemStatus.Cancelled)
            .GroupBy(i => i.CategoryType)
            .Select(g => new CategoryBreakdownModel
            {
                CategoryType = g.Key,
                TotalSales = g.Sum(x => x.TotalPrice)
            })
            .ToListAsync(ct);

        var totalSales = items.Sum(x => x.TotalSales);

        foreach (var item in items)
        {
            item.CategoryName = GetCategoryName(item.CategoryType);
            item.Percentage = totalSales > 0 ? Math.Round(item.TotalSales / totalSales * 100, 1) : 0;
        }

        return items.OrderBy(x => x.CategoryType).ToList();
    }

    private async Task<decimal> GetTotalCostAsync(
        Expression<Func<TbOrderItem, bool>> filter, CancellationToken ct)
    {
        var query = _unitOfWork.OrderItems.QueryNoTracking()
            .Where(filter)
            .Where(i => i.Status != EOrderItemStatus.Voided
                && i.Status != EOrderItemStatus.Cancelled);

        var menuCost = await query
            .SumAsync(i => (decimal?)((i.CostPrice ?? 0) * i.Quantity), ct) ?? 0;

        var optionCost = await query
            .SelectMany(i => i.OrderItemOptions, (i, o) => new { i.Quantity, o.CostPrice })
            .SumAsync(x => (decimal?)((x.CostPrice ?? 0) * x.Quantity), ct) ?? 0;

        return menuCost + optionCost;
    }

    private async Task<(List<PeriodRevenueTrendModel> Trend, bool HasTwoPeriods, string? Period1Label, string? Period2Label)>
        GetPeriodRevenueTrendAsync(DateTime selectedDate, int days, CancellationToken ct)
    {
        var shopSettings = await _unitOfWork.ShopSettings.QueryNoTracking()
            .Include(s => s.OperatingHours)
            .FirstOrDefaultAsync(ct);

        if (shopSettings == null || !shopSettings.HasTwoPeriods)
            return (new(), shopSettings?.HasTwoPeriods ?? false, null, null);

        var operatingHours = shopSettings.OperatingHours
            .ToDictionary(h => h.DayOfWeek);

        // สร้าง label จากวันแรกที่มีเวลาตั้งค่า
        var sampleHour = operatingHours.Values
            .FirstOrDefault(h => h.IsOpen && h.OpenTime1.HasValue && h.OpenTime2.HasValue);

        string? period1Label = null;
        string? period2Label = null;
        if (sampleHour != null)
        {
            period1Label = $"ช่วงที่ 1 ({sampleHour.OpenTime1!.Value:hh\\:mm}-{sampleHour.CloseTime1!.Value:hh\\:mm})";
            period2Label = $"ช่วงที่ 2 ({sampleHour.OpenTime2!.Value:hh\\:mm}-{sampleHour.CloseTime2!.Value:hh\\:mm})";
        }

        var startDate = selectedDate.AddDays(-(days - 1));

        var bills = await _unitOfWork.OrderBills.QueryNoTracking()
            .Where(b => b.Status == EBillStatus.Paid && b.PaidAt != null
                && b.PaidAt.Value.Date >= startDate && b.PaidAt.Value.Date <= selectedDate)
            .Select(b => new { b.PaidAt, b.GrandTotal })
            .ToListAsync(ct);

        var trend = new List<PeriodRevenueTrendModel>();

        for (var date = startDate; date <= selectedDate; date = date.AddDays(1))
        {
            var eDow = date.DayOfWeek == System.DayOfWeek.Sunday
                ? EDayOfWeek.Sunday
                : (EDayOfWeek)(int)date.DayOfWeek;

            operatingHours.TryGetValue(eDow, out var dayHours);

            decimal period1Sales = 0;
            decimal period2Sales = 0;

            var dayBills = bills.Where(b => b.PaidAt!.Value.Date == date);

            foreach (var bill in dayBills)
            {
                var time = bill.PaidAt!.Value.TimeOfDay;

                if (dayHours is { IsOpen: true })
                {
                    if (dayHours.OpenTime1.HasValue && dayHours.CloseTime1.HasValue
                        && time >= dayHours.OpenTime1.Value && time < dayHours.CloseTime1.Value)
                    {
                        period1Sales += bill.GrandTotal;
                    }
                    else if (dayHours.OpenTime2.HasValue && dayHours.CloseTime2.HasValue
                        && time >= dayHours.OpenTime2.Value && time < dayHours.CloseTime2.Value)
                    {
                        period2Sales += bill.GrandTotal;
                    }
                }
            }

            trend.Add(new PeriodRevenueTrendModel
            {
                Date = date,
                Period1Sales = period1Sales,
                Period2Sales = period2Sales
            });
        }

        return (trend, true, period1Label, period2Label);
    }

    private static string GetCategoryName(int categoryType) => categoryType switch
    {
        (int)EMenuCategory.Food => "อาหาร",
        (int)EMenuCategory.Beverage => "เครื่องดื่ม",
        (int)EMenuCategory.Dessert => "ของหวาน",
        _ => "อื่นๆ"
    };
}
