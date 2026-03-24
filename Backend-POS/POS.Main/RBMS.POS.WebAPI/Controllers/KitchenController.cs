using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using POS.Main.Business.Authorization.Interfaces;
using POS.Main.Business.Order.Interfaces;
using POS.Main.Business.Order.Models.Kitchen;
using POS.Main.Core.Constants;
using POS.Main.Core.Exceptions;
using POS.Main.Core.Models;

namespace RBMS.POS.WebAPI.Controllers;

[Authorize]
[Route("api/kitchen")]
public class KitchenController : BaseController
{
    private readonly IKitchenService _kitchenService;
    private readonly IPermissionService _permissionService;

    public KitchenController(IKitchenService kitchenService, IPermissionService permissionService)
    {
        _kitchenService = kitchenService;
        _permissionService = permissionService;
    }

    [HttpGet("orders")]
    [ProducesResponseType(typeof(ListResponseModel<KitchenOrderModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetKitchenItems(
        [FromQuery] int categoryType, [FromQuery] bool includeReady = false, CancellationToken ct = default)
    {
        await CheckCategoryPermissionAsync(categoryType, "read", ct);
        return ListSuccess(await _kitchenService.GetKitchenItemsAsync(categoryType, includeReady, ct));
    }

    [HttpPut("items/prepare")]
    public async Task<IActionResult> StartPreparing(
        [FromBody] BatchItemRequestModel request, CancellationToken ct = default)
    {
        await CheckCategoryPermissionAsync(request.CategoryType, "update", ct);
        await _kitchenService.StartPreparingAsync(request.OrderItemIds, ct);
        return Success("เริ่มทำอาหารสำเร็จ");
    }

    [HttpPut("items/ready")]
    public async Task<IActionResult> MarkReady(
        [FromBody] BatchItemRequestModel request, CancellationToken ct = default)
    {
        await CheckCategoryPermissionAsync(request.CategoryType, "update", ct);
        await _kitchenService.MarkReadyAsync(request.OrderItemIds, ct);
        return Success("รายการพร้อมเสิร์ฟ");
    }

    private static string GetCategoryPermission(int categoryType, string action) => categoryType switch
    {
        1 => $"kitchen-food.{action}",
        2 => $"kitchen-beverage.{action}",
        3 => $"kitchen-dessert.{action}",
        _ => throw new ValidationException("ประเภทครัวไม่ถูกต้อง")
    };

    private async Task CheckCategoryPermissionAsync(int categoryType, string action, CancellationToken ct)
    {
        var employeeId = int.Parse(User.FindFirst("employee_id")!.Value);
        var perm = GetCategoryPermission(categoryType, action);
        if (!await _permissionService.HasAnyPermissionAsync(employeeId, [perm], ct))
            throw new ForbiddenException("ไม่มีสิทธิ์เข้าถึงครัวประเภทนี้");
    }
}
