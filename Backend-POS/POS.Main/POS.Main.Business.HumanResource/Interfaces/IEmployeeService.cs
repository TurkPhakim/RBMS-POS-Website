using POS.Main.Business.HumanResource.Models;
using POS.Main.Business.HumanResource.Models.UserAccount;
using POS.Main.Core.Enums;

namespace POS.Main.Business.HumanResource.Interfaces;

/// <summary>
/// Interface for employee management
/// </summary>
public interface IEmployeeService
{
    /// <summary>
    /// Get all active employees (excluding soft deleted)
    /// </summary>
    Task<IEnumerable<EmployeeResponseModel>> GetAllActiveEmployeesAsync(CancellationToken ct = default);

    /// <summary>
    /// Get employee by ID
    /// </summary>
    Task<EmployeeResponseModel> GetEmployeeByIdAsync(int employeeId, CancellationToken ct = default);

    /// <summary>
    /// Get employees by employment status
    /// </summary>
    Task<IEnumerable<EmployeeResponseModel>> GetEmployeesByStatusAsync(EEmploymentStatus status, CancellationToken ct = default);

    /// <summary>
    /// Get employee by linked user ID
    /// </summary>
    Task<EmployeeResponseModel> GetEmployeeByUserIdAsync(Guid userId, CancellationToken ct = default);

    /// <summary>
    /// Search employees by name, nickname, national ID, or phone
    /// </summary>
    Task<IEnumerable<EmployeeResponseModel>> SearchEmployeesAsync(string searchTerm, CancellationToken ct = default);

    /// <summary>
    /// Create new employee
    /// </summary>
    Task<EmployeeResponseModel> CreateEmployeeAsync(CreateEmployeeRequestModel request, int? imageFileId = null, CancellationToken ct = default);

    /// <summary>
    /// Update existing employee
    /// </summary>
    Task<EmployeeResponseModel> UpdateEmployeeAsync(int employeeId, UpdateEmployeeRequestModel request, int? newImageFileId = null, CancellationToken ct = default);

    /// <summary>
    /// Soft delete employee
    /// </summary>
    Task DeleteEmployeeAsync(int employeeId, CancellationToken ct = default);

    /// <summary>
    /// Create user account for employee
    /// </summary>
    Task<CreateUserAccountResponseModel> CreateUserAccountAsync(int employeeId, CancellationToken ct = default);
}
