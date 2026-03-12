using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using POS.Main.Business.Authorization.Interfaces;
using POS.Main.Core.Constants;
using POS.Main.Core.Models;

namespace RBMS.POS.WebAPI.Filters;

[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
public class PermissionAuthorizeAttribute : Attribute, IAsyncAuthorizationFilter
{
    private readonly string[] _permissions;

    public PermissionAuthorizeAttribute(params string[] permissions)
    {
        _permissions = permissions;
    }

    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        if (context.HttpContext.User.Identity?.IsAuthenticated != true)
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        var employeeIdClaim = context.HttpContext.User.FindFirst("employee_id")?.Value;
        if (string.IsNullOrEmpty(employeeIdClaim) || !int.TryParse(employeeIdClaim, out var employeeId))
        {
            context.Result = new ObjectResult(new BaseResponseModel<object>
            {
                Status = constResultType.Fail,
                Code = "FORBIDDEN",
                Message = "ไม่มีสิทธิ์เข้าถึง"
            })
            { StatusCode = 403 };
            return;
        }

        var permissionService = context.HttpContext.RequestServices.GetRequiredService<IPermissionService>();
        var hasPermission = await permissionService.HasAnyPermissionAsync(
            employeeId, _permissions, context.HttpContext.RequestAborted);

        if (!hasPermission)
        {
            context.Result = new ObjectResult(new BaseResponseModel<object>
            {
                Status = constResultType.Fail,
                Code = "FORBIDDEN",
                Message = "ไม่มีสิทธิ์เข้าถึง"
            })
            { StatusCode = 403 };
        }
    }
}
