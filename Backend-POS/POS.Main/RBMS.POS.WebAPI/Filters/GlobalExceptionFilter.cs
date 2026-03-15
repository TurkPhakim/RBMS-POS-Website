using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using POS.Main.Core.Constants;
using POS.Main.Core.Exceptions;
using POS.Main.Core.Models;

namespace RBMS.POS.WebAPI.Filters;

public class GlobalExceptionFilter : IExceptionFilter
{
    private readonly ILogger<GlobalExceptionFilter> _logger;

    public GlobalExceptionFilter(ILogger<GlobalExceptionFilter> logger)
    {
        _logger = logger;
    }

    public void OnException(ExceptionContext context)
    {
        var (statusCode, code) = context.Exception switch
        {
            ValidationException => (400, "VALIDATION_ERROR"),
            EntityNotFoundException => (404, "NOT_FOUND"),
            BusinessException => (422, "BUSINESS_ERROR"),
            AccountLockedException => (423, "ACCOUNT_LOCKED"),
            AccountDisabledException => (403, "ACCOUNT_DISABLED"),
            InvalidCredentialsException => (401, "INVALID_CREDENTIALS"),
            InvalidRefreshTokenException => (401, "INVALID_REFRESH_TOKEN"),
            AuthenticationException => (401, "AUTHENTICATION_ERROR"),
            UnauthorizedAccessException => (401, "UNAUTHORIZED"),
            _ => (500, "INTERNAL_ERROR")
        };

        if (statusCode == 500)
            _logger.LogError(context.Exception, "Unhandled exception");
        else
            _logger.LogWarning(context.Exception, "Handled exception: {Code}", code);

        var response = new BaseResponseModel<object>
        {
            Status = constResultType.Fail,
            Code = code,
            Message = context.Exception.Message
        };

        if (context.Exception is ValidationException validationEx && validationEx.Errors != null)
        {
            response.Errors = validationEx.Errors;
        }

        if (context.Exception is AccountLockedException lockedEx && lockedEx.LockedUntil.HasValue)
        {
            var utc = DateTime.SpecifyKind(lockedEx.LockedUntil.Value, DateTimeKind.Utc);
            response.Result = new { lockedUntil = utc.ToString("O") };
        }

        context.Result = new ObjectResult(response)
        {
            StatusCode = statusCode
        };

        context.ExceptionHandled = true;
    }
}
