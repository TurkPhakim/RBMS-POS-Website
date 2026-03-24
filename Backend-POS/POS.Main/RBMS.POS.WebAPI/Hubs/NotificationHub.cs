using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using POS.Main.Repositories.UnitOfWork;

namespace RBMS.POS.WebAPI.Hubs;

[Authorize]
public class NotificationHub : Hub
{
    private readonly IUnitOfWork _unitOfWork;

    public NotificationHub(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
        {
            Context.Abort();
            return;
        }

        var groups = await ResolveGroupsAsync(userId);
        foreach (var group in groups)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, group);
        }

        await base.OnConnectedAsync();
    }

    private Guid GetUserId()
    {
        var claim = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? Context.User?.FindFirst("sub")?.Value;
        return Guid.TryParse(claim, out var id) ? id : Guid.Empty;
    }

    private async Task<List<string>> ResolveGroupsAsync(Guid userId)
    {
        var user = await _unitOfWork.Users
            .QueryNoTracking()
            .Include(u => u.Employee)
            .FirstOrDefaultAsync(u => u.UserId == userId);

        if (user?.Employee?.PositionId == null) return new List<string>();

        var permissions = await _unitOfWork.AuthorizeMatrixPositions
            .QueryNoTracking()
            .Include(amp => amp.AuthorizeMatrix)
                .ThenInclude(am => am.Module)
            .Include(amp => amp.AuthorizeMatrix)
                .ThenInclude(am => am.Permission)
            .Where(amp => amp.PositionId == user.Employee.PositionId.Value)
            .Select(amp => amp.AuthorizeMatrix.Module.ModuleCode + "." + amp.AuthorizeMatrix.Permission.PermissionCode)
            .ToListAsync();

        var groups = new List<string>();

        if (permissions.Any(p => p == "kitchen-food.read" || p == "kitchen-beverage.read" || p == "kitchen-dessert.read"))
            groups.Add("Kitchen");

        if (permissions.Any(p => p == "order-manage.read"))
            groups.Add("Floor");

        if (permissions.Any(p => p == "payment-manage.read"))
            groups.Add("Cashier");

        if (groups.Count >= 3 || permissions.Count > 15)
            groups = new List<string> { "Kitchen", "Floor", "Cashier", "Manager" };

        if (!groups.Contains("Manager") && permissions.Count > 10)
            groups.Add("Manager");

        return groups.Distinct().ToList();
    }
}
