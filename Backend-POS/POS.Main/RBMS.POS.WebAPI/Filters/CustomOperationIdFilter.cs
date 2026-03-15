using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace RBMS.POS.WebAPI.Filters;

public class CustomOperationIdFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        if (context.ApiDescription.ActionDescriptor is ControllerActionDescriptor cad)
        {
            var http = context.ApiDescription.HttpMethod?.ToLower() ?? "unknown";
            operation.OperationId = $"{cad.ControllerName}_{cad.ActionName}_{http}";
        }
    }
}
