using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using POS.Main.Business.Admin.Interfaces;
using POS.Main.Business.HumanResource.Models;
using POS.Main.Business.HumanResource.Models.UserAccount;
using POS.Main.Business.HumanResource.Interfaces;
using POS.Main.Core.Constants;
using POS.Main.Core.Enums;
using POS.Main.Core.Models;
using RBMS.POS.WebAPI.Filters;

namespace RBMS.POS.WebAPI.Controllers;

/// <summary>
/// Employee management endpoints
/// </summary>
[Authorize]
[Route("api/humanresource")]
public class HumanResourceController : BaseController
{
    private readonly IEmployeeService _employeeService;
    private readonly IFileService _fileService;

    public HumanResourceController(IEmployeeService employeeService, IFileService fileService)
    {
        _employeeService = employeeService;
        _fileService = fileService;
    }

    /// <summary>
    /// Get all active employees
    /// </summary>
    [HttpGet]
    [PermissionAuthorize(Permissions.Employee.Read)]
    [ProducesResponseType(typeof(ListResponseModel<EmployeeResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllActive(CancellationToken ct = default)
        => ListSuccess(await _employeeService.GetAllActiveEmployeesAsync(ct));

    /// <summary>
    /// Get employee by ID
    /// </summary>
    [HttpGet("{employeeId}")]
    [PermissionAuthorize(Permissions.Employee.Read)]
    [ProducesResponseType(typeof(BaseResponseModel<EmployeeResponseModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int employeeId, CancellationToken ct = default)
        => Success(await _employeeService.GetEmployeeByIdAsync(employeeId, ct));

    /// <summary>
    /// Get employees by employment status
    /// </summary>
    [HttpGet("status/{status}")]
    [PermissionAuthorize(Permissions.Employee.Read)]
    [ProducesResponseType(typeof(ListResponseModel<EmployeeResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByStatus(EEmploymentStatus status, CancellationToken ct = default)
        => ListSuccess(await _employeeService.GetEmployeesByStatusAsync(status, ct));

    /// <summary>
    /// Get employee by linked user ID
    /// </summary>
    [HttpGet("user/{userId}")]
    [PermissionAuthorize(Permissions.Employee.Read)]
    [ProducesResponseType(typeof(BaseResponseModel<EmployeeResponseModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByUserId(Guid userId, CancellationToken ct = default)
        => Success(await _employeeService.GetEmployeeByUserIdAsync(userId, ct));

    /// <summary>
    /// Search employees by name, national ID, or phone
    /// </summary>
    [HttpGet("search")]
    [PermissionAuthorize(Permissions.Employee.Read)]
    [ProducesResponseType(typeof(ListResponseModel<EmployeeResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Search([FromQuery] string searchTerm, CancellationToken ct = default)
        => ListSuccess(await _employeeService.SearchEmployeesAsync(searchTerm, ct));

    /// <summary>
    /// Create a new employee
    /// </summary>
    [HttpPost]
    [PermissionAuthorize(Permissions.Employee.Create)]
    [RequestSizeLimit(10_485_760)]
    [ProducesResponseType(typeof(BaseResponseModel<EmployeeResponseModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromForm] CreateEmployeeRequestModel request, IFormFile? imageFile, CancellationToken ct = default)
    {
        int? imageFileId = null;
        if (imageFile != null)
        {
            var fileResult = await _fileService.UploadAsync(imageFile, ct);
            imageFileId = fileResult.FileId;
        }

        var result = await _employeeService.CreateEmployeeAsync(request, imageFileId, ct);
        return Success(result);
    }

    /// <summary>
    /// Update an existing employee
    /// </summary>
    [HttpPut("{employeeId}")]
    [PermissionAuthorize(Permissions.Employee.Update)]
    [RequestSizeLimit(10_485_760)]
    [ProducesResponseType(typeof(BaseResponseModel<EmployeeResponseModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int employeeId, [FromForm] UpdateEmployeeRequestModel request, IFormFile? imageFile, CancellationToken ct = default)
    {
        int? newImageFileId = null;
        if (imageFile != null)
        {
            var fileResult = await _fileService.UploadAsync(imageFile, ct);
            newImageFileId = fileResult.FileId;
        }

        var result = await _employeeService.UpdateEmployeeAsync(employeeId, request, newImageFileId, ct);
        return Success(result);
    }

    /// <summary>
    /// Delete an employee (soft delete)
    /// </summary>
    [HttpDelete("{employeeId}")]
    [PermissionAuthorize(Permissions.Employee.Delete)]
    [ProducesResponseType(typeof(BaseResponseModel<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int employeeId, CancellationToken ct = default)
    {
        await _employeeService.DeleteEmployeeAsync(employeeId, ct);
        return Success("Employee deleted successfully");
    }

    /// <summary>
    /// Create user account for employee
    /// </summary>
    [HttpPost("{employeeId}/create-user")]
    [PermissionAuthorize(Permissions.Employee.Create)]
    [ProducesResponseType(typeof(BaseResponseModel<CreateUserAccountResponseModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> CreateUserAccount(int employeeId, CancellationToken ct = default)
        => Success(await _employeeService.CreateUserAccountAsync(employeeId, ct));
}
