using POS.Main.Business.Admin.Models.Dashboard;

namespace POS.Main.Business.Admin.Interfaces;

public interface IDashboardService
{
    Task<DashboardOverviewResponseModel> GetOverviewAsync(DateTime? date, int days = 7, CancellationToken ct = default);
    Task<TopSellingResponseModel> GetTopSellingAsync(DateTime? date, int days = 30, CancellationToken ct = default);
    Task<PeakHoursResponseModel> GetPeakHoursAsync(DateTime? date, CancellationToken ct = default);
    Task<SalesReportResponseModel> GetSalesReportAsync(DateTime from, DateTime to, CancellationToken ct = default);
}
