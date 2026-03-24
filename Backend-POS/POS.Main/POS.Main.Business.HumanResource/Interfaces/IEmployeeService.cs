using POS.Main.Business.HumanResource.Models;
using POS.Main.Business.HumanResource.Models.EmployeeAddress;
using POS.Main.Business.HumanResource.Models.EmployeeEducation;
using POS.Main.Business.HumanResource.Models.EmployeeWorkHistory;
using POS.Main.Business.HumanResource.Models.Profile;
using POS.Main.Business.HumanResource.Models.UserAccount;
using POS.Main.Core.Models;

namespace POS.Main.Business.HumanResource.Interfaces;

public interface IEmployeeService
{
    Task<PaginationResult<EmployeeResponseModel>> GetEmployeesAsync(PaginationModel param, bool? isActive = null, int? positionId = null, CancellationToken ct = default);
    Task<EmployeeResponseModel> GetEmployeeByIdAsync(int employeeId, CancellationToken ct = default);
    Task<EmployeeResponseModel> GetEmployeeByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task<MyProfileResponseModel?> GetMyProfileAsync(int employeeId, CancellationToken ct = default);
    Task<EmployeeResponseModel> GetMyFullProfileAsync(int employeeId, CancellationToken ct = default);
    Task<EmployeeResponseModel> UpdateMyProfileAsync(int employeeId, Guid userId, UpdateProfileRequestModel request, int? newImageFileId = null, CancellationToken ct = default);
    Task<EmployeeResponseModel> CreateEmployeeAsync(CreateEmployeeRequestModel request, int? imageFileId = null, CancellationToken ct = default);
    Task<EmployeeResponseModel> UpdateEmployeeAsync(int employeeId, UpdateEmployeeRequestModel request, int? newImageFileId = null, CancellationToken ct = default);
    Task DeleteEmployeeAsync(int employeeId, CancellationToken ct = default);
    Task<CreateUserAccountResponseModel> CreateUserAccountAsync(int employeeId, CancellationToken ct = default);

    Task<bool> CheckDuplicateAsync(string field, string value, int? excludeEmployeeId = null, CancellationToken ct = default);

    // Address
    Task<EmployeeAddressResponseModel> CreateAddressAsync(int employeeId, CreateEmployeeAddressRequestModel request, CancellationToken ct = default);
    Task<EmployeeAddressResponseModel> UpdateAddressAsync(int employeeId, int addressId, UpdateEmployeeAddressRequestModel request, CancellationToken ct = default);
    Task DeleteAddressAsync(int employeeId, int addressId, CancellationToken ct = default);

    // Education
    Task<EmployeeEducationResponseModel> CreateEducationAsync(int employeeId, CreateEmployeeEducationRequestModel request, CancellationToken ct = default);
    Task<EmployeeEducationResponseModel> UpdateEducationAsync(int employeeId, int educationId, UpdateEmployeeEducationRequestModel request, CancellationToken ct = default);
    Task DeleteEducationAsync(int employeeId, int educationId, CancellationToken ct = default);

    // Work History
    Task<EmployeeWorkHistoryResponseModel> CreateWorkHistoryAsync(int employeeId, CreateEmployeeWorkHistoryRequestModel request, CancellationToken ct = default);
    Task<EmployeeWorkHistoryResponseModel> UpdateWorkHistoryAsync(int employeeId, int workHistoryId, UpdateEmployeeWorkHistoryRequestModel request, CancellationToken ct = default);
    Task DeleteWorkHistoryAsync(int employeeId, int workHistoryId, CancellationToken ct = default);
}
