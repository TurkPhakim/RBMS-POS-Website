using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using POS.Main.Business.Admin.Models.AdminSettings;
using POS.Main.Business.Admin.Services;
using POS.Main.Core.Constants;
using POS.Main.Core.Models;
using RBMS.POS.WebAPI.Filters;

namespace RBMS.POS.WebAPI.Controllers;

/// <summary>
/// Service charge management endpoints
/// </summary>
[Authorize]
[Route("api/admin/servicecharges")]
public class ServiceChargesController : BaseController
{
    private readonly IServiceChargeService _serviceChargeService;

    public ServiceChargesController(IServiceChargeService serviceChargeService)
    {
        _serviceChargeService = serviceChargeService;
    }

    /// <summary>
    /// Get all service charges
    /// </summary>
    [HttpGet]
    [PermissionAuthorize(Permissions.ServiceCharge.Read)]
    [ProducesResponseType(typeof(ListResponseModel<ServiceChargeResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken ct = default)
        => ListSuccess(await _serviceChargeService.GetAllServiceChargesAsync(ct));

    /// <summary>
    /// Get service charge by ID
    /// </summary>
    [HttpGet("{serviceChargeId}")]
    [PermissionAuthorize(Permissions.ServiceCharge.Read)]
    [ProducesResponseType(typeof(BaseResponseModel<ServiceChargeResponseModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int serviceChargeId, CancellationToken ct = default)
        => Success(await _serviceChargeService.GetServiceChargeByIdAsync(serviceChargeId, ct));

    /// <summary>
    /// Get active service charges for dropdown
    /// </summary>
    [HttpGet("dropdown")]
    [PermissionAuthorize(Permissions.ServiceCharge.Read)]
    [ProducesResponseType(typeof(ListResponseModel<ServiceChargeDropdownModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDropdownList(CancellationToken ct = default)
        => ListSuccess(await _serviceChargeService.GetServiceChargeDropdownListAsync(ct));

    /// <summary>
    /// Create a new service charge
    /// </summary>
    [HttpPost]
    [PermissionAuthorize(Permissions.ServiceCharge.Create)]
    [ProducesResponseType(typeof(BaseResponseModel<ServiceChargeResponseModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateServiceChargeRequestModel request, CancellationToken ct = default)
        => Success(await _serviceChargeService.CreateServiceChargeAsync(request, ct));

    /// <summary>
    /// Update an existing service charge
    /// </summary>
    [HttpPut("{serviceChargeId}")]
    [PermissionAuthorize(Permissions.ServiceCharge.Update)]
    [ProducesResponseType(typeof(BaseResponseModel<ServiceChargeResponseModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int serviceChargeId, [FromBody] UpdateServiceChargeRequestModel request, CancellationToken ct = default)
        => Success(await _serviceChargeService.UpdateServiceChargeAsync(serviceChargeId, request, ct));

    /// <summary>
    /// Permanently delete a service charge (hard delete)
    /// </summary>
    [HttpDelete("{serviceChargeId}")]
    [PermissionAuthorize(Permissions.ServiceCharge.Delete)]
    [ProducesResponseType(typeof(BaseResponseModel<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int serviceChargeId, CancellationToken ct = default)
    {
        await _serviceChargeService.DeleteServiceChargeAsync(serviceChargeId, ct);
        return Success("ลบ Service Charge สำเร็จ");
    }
}
