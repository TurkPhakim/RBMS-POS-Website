using Microsoft.Extensions.Logging;
using POS.Main.Business.HumanResource.Interfaces;
using POS.Main.Business.HumanResource.Models;
using POS.Main.Business.HumanResource.Models.UserAccount;
using POS.Main.Core.Enums;
using POS.Main.Core.Exceptions;
using POS.Main.Core.Helpers;
using POS.Main.Core.Interfaces;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.UnitOfWork;

namespace POS.Main.Business.HumanResource.Services;

public class EmployeeService : IEmployeeService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<EmployeeService> _logger;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IEmailService _emailService;

    public EmployeeService(
        IUnitOfWork unitOfWork,
        ILogger<EmployeeService> logger,
        IPasswordHasher passwordHasher,
        IEmailService emailService)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _passwordHasher = passwordHasher;
        _emailService = emailService;
    }

    public async Task<IEnumerable<EmployeeResponseModel>> GetAllActiveEmployeesAsync(CancellationToken ct = default)
    {
        var employees = await _unitOfWork.Employees.GetAllActiveAsync(ct);
        return employees.Select(EmployeeMapper.ToResponse);
    }

    public async Task<EmployeeResponseModel> GetEmployeeByIdAsync(int employeeId, CancellationToken ct = default)
    {
        var employee = await _unitOfWork.Employees.GetByIdAsync(employeeId, ct);

        if (employee == null)
            throw new EntityNotFoundException("Employee", employeeId);

        return EmployeeMapper.ToResponse(employee);
    }

    public async Task<IEnumerable<EmployeeResponseModel>> GetEmployeesByStatusAsync(EEmploymentStatus status, CancellationToken ct = default)
    {
        var employees = await _unitOfWork.Employees.GetByEmploymentStatusAsync(status, ct);
        return employees.Select(EmployeeMapper.ToResponse);
    }

    public async Task<EmployeeResponseModel> GetEmployeeByUserIdAsync(Guid userId, CancellationToken ct = default)
    {
        var employee = await _unitOfWork.Employees.GetByUserIdAsync(userId, ct);

        if (employee == null)
            throw new EntityNotFoundException("Employee", userId);

        return EmployeeMapper.ToResponse(employee);
    }

    public async Task<IEnumerable<EmployeeResponseModel>> SearchEmployeesAsync(string searchTerm, CancellationToken ct = default)
    {
        var employees = await _unitOfWork.Employees.SearchAsync(searchTerm, ct);
        return employees.Select(EmployeeMapper.ToResponse);
    }

    public async Task<EmployeeResponseModel> CreateEmployeeAsync(CreateEmployeeRequestModel request, int? imageFileId = null, CancellationToken ct = default)
    {
        if (!string.IsNullOrWhiteSpace(request.NationalId))
        {
            var nationalIdExists = await _unitOfWork.Employees.IsNationalIdExistsAsync(request.NationalId, ct: ct);
            if (nationalIdExists)
                throw new ValidationException($"Employee with National ID '{request.NationalId}' already exists");
        }

        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            var emailExists = await _unitOfWork.Employees.IsEmailExistsAsync(request.Email, ct: ct);
            if (emailExists)
                throw new ValidationException($"Employee with Email '{request.Email}' already exists");
        }

        var employee = EmployeeMapper.ToEntity(request);
        employee.ImageFileId = imageFileId;

        await _unitOfWork.Employees.AddAsync(employee, ct);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Employee created: {EmployeeId} - {FirstNameThai} {LastNameThai}", employee.EmployeeId, employee.FirstNameThai, employee.LastNameThai);

        return EmployeeMapper.ToResponse(employee);
    }

    public async Task<EmployeeResponseModel> UpdateEmployeeAsync(int employeeId, UpdateEmployeeRequestModel request, int? newImageFileId = null, CancellationToken ct = default)
    {
        var employee = await _unitOfWork.Employees.GetByIdAsync(employeeId, ct);

        if (employee == null)
            throw new EntityNotFoundException("Employee", employeeId);

        if (!string.IsNullOrWhiteSpace(request.NationalId))
        {
            var nationalIdExists = await _unitOfWork.Employees.IsNationalIdExistsAsync(request.NationalId, employeeId, ct);
            if (nationalIdExists)
                throw new ValidationException($"Employee with National ID '{request.NationalId}' already exists");
        }

        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            var emailExists = await _unitOfWork.Employees.IsEmailExistsAsync(request.Email, employeeId, ct);
            if (emailExists)
                throw new ValidationException($"Employee with Email '{request.Email}' already exists");
        }

        // Soft-delete old image if replacing
        if (newImageFileId.HasValue && employee.ImageFileId.HasValue && employee.ImageFileId != newImageFileId)
        {
            var oldFile = await _unitOfWork.Files.GetByIdAsync(employee.ImageFileId.Value, ct);
            if (oldFile != null)
                oldFile.DeleteFlag = true;
        }

        EmployeeMapper.UpdateEntity(employee, request);

        if (newImageFileId.HasValue)
            employee.ImageFileId = newImageFileId;

        _unitOfWork.Employees.Update(employee);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Employee updated: {EmployeeId}", employeeId);

        return EmployeeMapper.ToResponse(employee);
    }

    public async Task DeleteEmployeeAsync(int employeeId, CancellationToken ct = default)
    {
        var employee = await _unitOfWork.Employees.GetByIdAsync(employeeId, ct)
            ?? throw new EntityNotFoundException("Employee", employeeId);

        employee.DeleteFlag = true;
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Employee deleted: {EmployeeId}", employeeId);
    }

    public async Task<CreateUserAccountResponseModel> CreateUserAccountAsync(int employeeId, CancellationToken ct = default)
    {
        var employee = await _unitOfWork.Employees.GetByIdAsync(employeeId, ct)
            ?? throw new EntityNotFoundException("Employee", employeeId);

        if (employee.UserId.HasValue)
            throw new BusinessException("พนักงานมีบัญชีผู้ใช้อยู่แล้ว");

        if (string.IsNullOrWhiteSpace(employee.Email))
            throw new ValidationException("พนักงานไม่มีอีเมล กรุณาเพิ่มอีเมลก่อนสร้างผู้ใช้");

        var existingUser = await _unitOfWork.Users.GetByUsernameAsync(employee.Email, ct);
        if (existingUser != null)
            throw new ValidationException("อีเมลนี้ถูกใช้เป็นชื่อผู้ใช้ในระบบแล้ว");

        var plainPassword = GenerateRandomPassword(8);
        var passwordHash = _passwordHasher.HashPassword(plainPassword);

        var user = new TbUser
        {
            UserId = Guid.NewGuid(),
            Username = employee.Email,
            Email = employee.Email,
            PasswordHash = passwordHash,
            IsActive = true,
            LastPasswordChangedDate = DateTime.UtcNow
        };

        await _unitOfWork.Users.AddAsync(user, ct);
        employee.UserId = user.UserId;
        _unitOfWork.Employees.Update(employee);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("User account created for Employee {EmployeeId}, Username: {Username}", employeeId, user.Username);

        var employeeName = $"{employee.FirstNameThai} {employee.LastNameThai}";
        var emailHtml = BuildCredentialEmailHtml(employeeName, user.Username, plainPassword);
        var emailSent = await _emailService.SendEmailAsync(
            employee.Email,
            employeeName,
            "RBMS POS - บัญชีผู้ใช้ของคุณพร้อมใช้งานแล้ว",
            emailHtml,
            ct);

        return new CreateUserAccountResponseModel
        {
            UserId = user.UserId,
            Username = user.Username,
            Password = plainPassword,
            EmployeeName = employeeName,
            EmailSent = emailSent
        };
    }

    private static string GenerateRandomPassword(int length)
    {
        const string uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        const string lowercase = "abcdefghjkmnpqrstuvwxyz";
        const string digits = "23456789";
        var allChars = uppercase + lowercase + digits;

        var random = Random.Shared;
        var password = new char[length];

        password[0] = uppercase[random.Next(uppercase.Length)];
        password[1] = lowercase[random.Next(lowercase.Length)];
        password[2] = digits[random.Next(digits.Length)];

        for (var i = 3; i < length; i++)
            password[i] = allChars[random.Next(allChars.Length)];

        random.Shuffle(password);
        return new string(password);
    }

    private static string BuildCredentialEmailHtml(string name, string username, string password)
    {
        return $"""
        <div style="font-family: 'Sarabun', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1e293b;">RBMS POS - บัญชีผู้ใช้ของคุณ</h2>
            <p>สวัสดี {name},</p>
            <p>บัญชีผู้ใช้ของคุณถูกสร้างเรียบร้อยแล้ว กรุณาใช้ข้อมูลด้านล่างเพื่อเข้าสู่ระบบ:</p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
                <p style="margin: 4px 0;"><strong>ชื่อผู้ใช้:</strong> {username}</p>
                <p style="margin: 4px 0;"><strong>รหัสผ่าน:</strong> {password}</p>
            </div>
            <p style="color: #ef4444; font-size: 14px;">กรุณาเปลี่ยนรหัสผ่านหลังเข้าสู่ระบบครั้งแรก</p>
            <p style="color: #94a3b8; font-size: 12px;">อีเมลนี้ส่งอัตโนมัติจากระบบ RBMS POS</p>
        </div>
        """;
    }
}
