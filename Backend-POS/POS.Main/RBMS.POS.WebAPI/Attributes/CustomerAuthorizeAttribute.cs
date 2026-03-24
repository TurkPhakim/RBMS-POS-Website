using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using POS.Main.Core.Enums;
using POS.Main.Dal;

namespace RBMS.POS.WebAPI.Attributes;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class CustomerAuthorizeAttribute : Attribute, IAsyncAuthorizationFilter
{
    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var config = context.HttpContext.RequestServices.GetRequiredService<IConfiguration>();
        var dbContext = context.HttpContext.RequestServices.GetRequiredService<POSMainContext>();

        var authHeader = context.HttpContext.Request.Headers.Authorization.ToString();
        if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
        {
            context.Result = new UnauthorizedObjectResult(new { message = "ไม่พบ Token" });
            return;
        }

        var token = authHeader["Bearer ".Length..].Trim();

        // Validate JWT
        var secret = config["Jwt:Secret"] ?? "";
        var issuer = config["Jwt:Issuer"] ?? "RBMS.POS.API";
        var audience = config["Jwt:Audience"] ?? "RBMS.POS.Client";

        var tokenHandler = new JwtSecurityTokenHandler();
        try
        {
            var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)),
                ValidateIssuer = true,
                ValidIssuer = issuer,
                ValidateAudience = true,
                ValidAudience = audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            }, out _);

            var sessionIdClaim = principal.FindFirst("session_id")?.Value;
            var tableIdClaim = principal.FindFirst("table_id")?.Value;
            var roleClaim = principal.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

            if (roleClaim != "customer" || sessionIdClaim == null || tableIdClaim == null)
            {
                context.Result = new UnauthorizedObjectResult(new { message = "Token ไม่ถูกต้อง" });
                return;
            }

            var sessionId = int.Parse(sessionIdClaim);
            var tableId = int.Parse(tableIdClaim);

            // Validate session is active
            var session = await dbContext.CustomerSessions
                .AsNoTracking()
                .FirstOrDefaultAsync(cs => cs.CustomerSessionId == sessionId && cs.IsActive && cs.ExpiresAt > DateTime.UtcNow);

            if (session == null)
            {
                context.Result = new UnauthorizedObjectResult(new { message = "Session หมดอายุหรือถูกปิดแล้ว" });
                return;
            }

            // Validate table is still OCCUPIED
            var table = await dbContext.Tables
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.TableId == tableId && !t.DeleteFlag);

            if (table == null || table.Status != ETableStatus.Occupied)
            {
                context.Result = new UnauthorizedObjectResult(new { message = "โต๊ะถูกปิดแล้ว" });
                return;
            }

            // Store session info in HttpContext for downstream use
            context.HttpContext.Items["CustomerSessionId"] = sessionId;
            context.HttpContext.Items["CustomerTableId"] = tableId;
            context.HttpContext.Items["CustomerNickname"] = session.Nickname;
        }
        catch (SecurityTokenException)
        {
            context.Result = new UnauthorizedObjectResult(new { message = "Token ไม่ถูกต้องหรือหมดอายุ" });
        }
    }
}
