using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using POS.Main.Business.Admin.Interfaces;
using POS.Main.Business.Admin.Models.Dashboard;
using POS.Main.Core.Constants;
using POS.Main.Core.Models;
using RBMS.POS.WebAPI.Filters;

namespace RBMS.POS.WebAPI.Controllers;

[Authorize]
[Route("api/dashboard")]
public class DashboardController : BaseController
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("overview")]
    [PermissionAuthorize(Permissions.Dashboard.Read)]
    [ProducesResponseType(typeof(BaseResponseModel<DashboardOverviewResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOverview(
        [FromQuery] DateTime? date, [FromQuery] int days = 7, CancellationToken ct = default)
        => Success(await _dashboardService.GetOverviewAsync(date, days, ct));

    [HttpGet("top-selling")]
    [PermissionAuthorize(Permissions.Dashboard.Read)]
    [ProducesResponseType(typeof(BaseResponseModel<TopSellingResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTopSelling(
        [FromQuery] DateTime? date, [FromQuery] int days = 30, CancellationToken ct = default)
        => Success(await _dashboardService.GetTopSellingAsync(date, days, ct));

    [HttpGet("peak-hours")]
    [PermissionAuthorize(Permissions.Dashboard.Read)]
    [ProducesResponseType(typeof(BaseResponseModel<PeakHoursResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPeakHours(
        [FromQuery] DateTime? date, CancellationToken ct = default)
        => Success(await _dashboardService.GetPeakHoursAsync(date, ct));

    [HttpGet("sales-report")]
    [PermissionAuthorize(Permissions.Dashboard.Read)]
    [ProducesResponseType(typeof(BaseResponseModel<SalesReportResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSalesReport(
        [FromQuery] DateTime from, [FromQuery] DateTime to, CancellationToken ct = default)
        => Success(await _dashboardService.GetSalesReportAsync(from, to, ct));
}
