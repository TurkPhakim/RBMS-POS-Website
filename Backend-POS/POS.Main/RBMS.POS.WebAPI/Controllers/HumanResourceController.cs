using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using POS.Main.Business.Admin.Interfaces;
using POS.Main.Business.HumanResource.Models;
using POS.Main.Business.HumanResource.Models.EmployeeAddress;
using POS.Main.Business.HumanResource.Models.EmployeeEducation;
using POS.Main.Business.HumanResource.Models.EmployeeWorkHistory;
using POS.Main.Business.HumanResource.Models.Profile;
using POS.Main.Business.HumanResource.Models.UserAccount;
using POS.Main.Business.HumanResource.Interfaces;
using POS.Main.Core.Constants;
using POS.Main.Core.Exceptions;
using POS.Main.Core.Models;
using RBMS.POS.WebAPI.Filters;

namespace RBMS.POS.WebAPI.Controllers;

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
    /// ดึงข้อมูลโปรไฟล์ตัวเอง — ทุกคนที่ login ดูได้ (ไม่ต้อง permission)
    /// </summary>
    [HttpGet("me")]
    [ProducesResponseType(typeof(BaseResponseModel<MyProfileResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyProfile(CancellationToken ct = default)
    {
        var employeeIdClaim = User.FindFirst("employee_id")?.Value;
        if (string.IsNullOrEmpty(employeeIdClaim) || !int.TryParse(employeeIdClaim, out var employeeId))
            return Success<MyProfileResponseModel?>(null);

        return Success(await _employeeService.GetMyProfileAsync(employeeId, ct));
    }

    /// <summary>
    /// ดึงข้อมูลโปรไฟล์ตัวเองแบบเต็ม (รวม sub-entities)
    /// </summary>
    [HttpGet("me/profile")]
    [ProducesResponseType(typeof(BaseResponseModel<EmployeeResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyFullProfile(CancellationToken ct = default)
    {
        var employeeIdClaim = User.FindFirst("employee_id")?.Value;
        if (string.IsNullOrEmpty(employeeIdClaim) || !int.TryParse(employeeIdClaim, out var employeeId))
            throw new BusinessException("ไม่พบข้อมูลพนักงานของคุณ");

        return Success(await _employeeService.GetMyFullProfileAsync(employeeId, ct));
    }

    /// <summary>
    /// อัพเดตโปรไฟล์ตัวเอง — เฉพาะ fields ที่อนุญาต
    /// </summary>
    [HttpPut("me/profile")]
    [RequestSizeLimit(10_485_760)]
    [ProducesResponseType(typeof(BaseResponseModel<EmployeeResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateMyProfile(
        [FromForm] UpdateProfileRequestModel request, IFormFile? imageFile, CancellationToken ct = default)
    {
        var employeeIdClaim = User.FindFirst("employee_id")?.Value;
        if (string.IsNullOrEmpty(employeeIdClaim) || !int.TryParse(employeeIdClaim, out var employeeId))
            throw new BusinessException("ไม่พบข้อมูลพนักงานของคุณ");

        var userId = GetUserId();

        int? newImageFileId = null;
        if (imageFile != null)
        {
            var fileResult = await _fileService.UploadAsync(imageFile, ct);
            newImageFileId = fileResult.FileId;
        }

        return Success(await _employeeService.UpdateMyProfileAsync(employeeId, userId, request, newImageFileId, ct));
    }

    [HttpGet]
    [PermissionAuthorize(Permissions.Employee.Read)]
    [ProducesResponseType(typeof(PaginationResult<EmployeeResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetEmployees(
        [FromQuery] PaginationModel param,
        [FromQuery] bool? isActive,
        [FromQuery] int? positionId,
        CancellationToken ct = default)
        => PagedSuccess(await _employeeService.GetEmployeesAsync(param, isActive, positionId, ct));

    [HttpGet("{employeeId}")]
    [PermissionAuthorize(Permissions.Employee.Read)]
    [ProducesResponseType(typeof(BaseResponseModel<EmployeeResponseModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int employeeId, CancellationToken ct = default)
        => Success(await _employeeService.GetEmployeeByIdAsync(employeeId, ct));

    [HttpGet("user/{userId}")]
    [PermissionAuthorize(Permissions.Employee.Read)]
    [ProducesResponseType(typeof(BaseResponseModel<EmployeeResponseModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByUserId(Guid userId, CancellationToken ct = default)
        => Success(await _employeeService.GetEmployeeByUserIdAsync(userId, ct));

    /// <summary>
    /// ตรวจสอบข้อมูลซ้ำ (เลขบัตรประชาชน / อีเมล) — รวม soft-deleted records
    /// </summary>
    [HttpGet("check-duplicate")]
    [PermissionAuthorize(Permissions.Employee.Read)]
    [ProducesResponseType(typeof(BaseResponseModel<bool>), StatusCodes.Status200OK)]
    public async Task<IActionResult> CheckDuplicate(
        [FromQuery] string field,
        [FromQuery] string value,
        [FromQuery] int? excludeEmployeeId,
        CancellationToken ct = default)
        => Success(await _employeeService.CheckDuplicateAsync(field, value, excludeEmployeeId, ct));

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

    [HttpDelete("{employeeId}")]
    [PermissionAuthorize(Permissions.Employee.Delete)]
    [ProducesResponseType(typeof(BaseResponseModel<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int employeeId, CancellationToken ct = default)
    {
        await _employeeService.DeleteEmployeeAsync(employeeId, ct);
        return Success("Employee deleted successfully");
    }

    [HttpPost("{employeeId}/create-user")]
    [PermissionAuthorize(Permissions.Employee.Create)]
    [ProducesResponseType(typeof(BaseResponseModel<CreateUserAccountResponseModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> CreateUserAccount(int employeeId, CancellationToken ct = default)
        => Success(await _employeeService.CreateUserAccountAsync(employeeId, ct));

    // === Address Endpoints ===
    [HttpPost("{employeeId}/addresses")]
    [PermissionAuthorize(Permissions.Employee.Update)]
    [ProducesResponseType(typeof(BaseResponseModel<EmployeeAddressResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> CreateAddress(int employeeId, [FromBody] CreateEmployeeAddressRequestModel request, CancellationToken ct = default)
        => Success(await _employeeService.CreateAddressAsync(employeeId, request, ct));

    [HttpPut("{employeeId}/addresses/{addressId}")]
    [PermissionAuthorize(Permissions.Employee.Update)]
    [ProducesResponseType(typeof(BaseResponseModel<EmployeeAddressResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateAddress(int employeeId, int addressId, [FromBody] UpdateEmployeeAddressRequestModel request, CancellationToken ct = default)
        => Success(await _employeeService.UpdateAddressAsync(employeeId, addressId, request, ct));

    [HttpDelete("{employeeId}/addresses/{addressId}")]
    [PermissionAuthorize(Permissions.Employee.Update)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> DeleteAddress(int employeeId, int addressId, CancellationToken ct = default)
    {
        await _employeeService.DeleteAddressAsync(employeeId, addressId, ct);
        return Success("Address deleted successfully");
    }

    // === Education Endpoints ===
    [HttpPost("{employeeId}/educations")]
    [PermissionAuthorize(Permissions.Employee.Update)]
    [ProducesResponseType(typeof(BaseResponseModel<EmployeeEducationResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> CreateEducation(int employeeId, [FromBody] CreateEmployeeEducationRequestModel request, CancellationToken ct = default)
        => Success(await _employeeService.CreateEducationAsync(employeeId, request, ct));

    [HttpPut("{employeeId}/educations/{educationId}")]
    [PermissionAuthorize(Permissions.Employee.Update)]
    [ProducesResponseType(typeof(BaseResponseModel<EmployeeEducationResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateEducation(int employeeId, int educationId, [FromBody] UpdateEmployeeEducationRequestModel request, CancellationToken ct = default)
        => Success(await _employeeService.UpdateEducationAsync(employeeId, educationId, request, ct));

    [HttpDelete("{employeeId}/educations/{educationId}")]
    [PermissionAuthorize(Permissions.Employee.Update)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> DeleteEducation(int employeeId, int educationId, CancellationToken ct = default)
    {
        await _employeeService.DeleteEducationAsync(employeeId, educationId, ct);
        return Success("Education deleted successfully");
    }

    // === Work History Endpoints ===
    [HttpPost("{employeeId}/work-histories")]
    [PermissionAuthorize(Permissions.Employee.Update)]
    [ProducesResponseType(typeof(BaseResponseModel<EmployeeWorkHistoryResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> CreateWorkHistory(int employeeId, [FromBody] CreateEmployeeWorkHistoryRequestModel request, CancellationToken ct = default)
        => Success(await _employeeService.CreateWorkHistoryAsync(employeeId, request, ct));

    [HttpPut("{employeeId}/work-histories/{workHistoryId}")]
    [PermissionAuthorize(Permissions.Employee.Update)]
    [ProducesResponseType(typeof(BaseResponseModel<EmployeeWorkHistoryResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateWorkHistory(int employeeId, int workHistoryId, [FromBody] UpdateEmployeeWorkHistoryRequestModel request, CancellationToken ct = default)
        => Success(await _employeeService.UpdateWorkHistoryAsync(employeeId, workHistoryId, request, ct));

    [HttpDelete("{employeeId}/work-histories/{workHistoryId}")]
    [PermissionAuthorize(Permissions.Employee.Update)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> DeleteWorkHistory(int employeeId, int workHistoryId, CancellationToken ct = default)
    {
        await _employeeService.DeleteWorkHistoryAsync(employeeId, workHistoryId, ct);
        return Success("Work history deleted successfully");
    }
}
