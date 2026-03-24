using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using POS.Main.Business.HumanResource.Interfaces;
using POS.Main.Business.HumanResource.Models;
using POS.Main.Business.HumanResource.Models.EmployeeAddress;
using POS.Main.Business.HumanResource.Models.EmployeeEducation;
using POS.Main.Business.HumanResource.Models.EmployeeWorkHistory;
using POS.Main.Business.HumanResource.Models.Profile;
using POS.Main.Business.HumanResource.Models.UserAccount;
using POS.Main.Core.Constants;
using POS.Main.Core.Exceptions;
using POS.Main.Core.Helpers;
using POS.Main.Core.Interfaces;
using POS.Main.Core.Models;
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

    public async Task<PaginationResult<EmployeeResponseModel>> GetEmployeesAsync(
        PaginationModel param, bool? isActive = null, int? positionId = null, CancellationToken ct = default)
    {
        var query = _unitOfWork.Employees.GetEmployeesQuery(param.Search, isActive, positionId);

        var total = await query.CountAsync(ct);
        var employees = await query
            .Skip(param.Skip)
            .Take(param.Take)
            .ToListAsync(ct);

        return new PaginationResult<EmployeeResponseModel>
        {
            Status = constResultType.Success,
            Results = employees.Select(EmployeeMapper.ToResponse).ToList(),
            Page = param.Page,
            Total = total,
            ItemPerPage = param.ItemPerPage
        };
    }

    public async Task<EmployeeResponseModel> GetEmployeeByIdAsync(int employeeId, CancellationToken ct = default)
    {
        var employee = await _unitOfWork.Employees.GetByIdWithDetailsAsync(employeeId, ct)
            ?? throw new EntityNotFoundException("Employee", employeeId);

        return EmployeeMapper.ToResponse(employee);
    }

    public async Task<EmployeeResponseModel> GetEmployeeByUserIdAsync(Guid userId, CancellationToken ct = default)
    {
        var employee = await _unitOfWork.Employees.GetByUserIdAsync(userId, ct)
            ?? throw new EntityNotFoundException("Employee", userId);

        return EmployeeMapper.ToResponse(employee);
    }

    public async Task<MyProfileResponseModel?> GetMyProfileAsync(int employeeId, CancellationToken ct = default)
    {
        var employee = await _unitOfWork.Employees
            .QueryNoTracking()
            .Include(e => e.Position)
            .FirstOrDefaultAsync(e => e.EmployeeId == employeeId, ct);

        if (employee == null)
            return null;

        return EmployeeMapper.ToMyProfileResponse(employee);
    }

    public async Task<EmployeeResponseModel> GetMyFullProfileAsync(int employeeId, CancellationToken ct = default)
    {
        var employee = await _unitOfWork.Employees.GetByIdWithDetailsAsync(employeeId, ct)
            ?? throw new EntityNotFoundException("Employee", employeeId);

        return EmployeeMapper.ToResponse(employee);
    }

    public async Task<EmployeeResponseModel> UpdateMyProfileAsync(
        int employeeId, Guid userId, UpdateProfileRequestModel request,
        int? newImageFileId = null, CancellationToken ct = default)
    {
        var employee = await _unitOfWork.Employees.GetByIdWithDetailsAsync(employeeId, ct)
            ?? throw new EntityNotFoundException("Employee", employeeId);

        if (employee.UserId != userId)
            throw new BusinessException("ไม่สามารถแก้ไขโปรไฟล์ของผู้อื่นได้");

        // Image handling
        if (request.RemoveImage && employee.ImageFileId.HasValue)
        {
            var oldFile = await _unitOfWork.Files.GetByIdAsync(employee.ImageFileId.Value, ct);
            if (oldFile != null)
                oldFile.DeleteFlag = true;
            employee.ImageFileId = null;
        }
        else if (newImageFileId.HasValue)
        {
            if (employee.ImageFileId.HasValue && employee.ImageFileId != newImageFileId)
            {
                var oldFile = await _unitOfWork.Files.GetByIdAsync(employee.ImageFileId.Value, ct);
                if (oldFile != null)
                    oldFile.DeleteFlag = true;
            }
            employee.ImageFileId = newImageFileId;
        }

        // Update allowed employee fields
        EmployeeMapper.UpdateProfileEntity(employee, request);

        // Update Username in TbUser if changed
        if (!string.IsNullOrWhiteSpace(request.Username))
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId, ct)
                ?? throw new EntityNotFoundException("User", userId);

            if (user.Username != request.Username)
            {
                var existing = await _unitOfWork.Users.GetByUsernameAsync(request.Username, ct);
                if (existing != null && existing.UserId != userId)
                    throw new ValidationException("Username นี้ถูกใช้งานแล้ว");
                user.Username = request.Username;
                _unitOfWork.Users.Update(user);
            }
        }

        // Replace-all sub-entities: addresses
        if (request.Addresses != null)
        {
            var existingAddresses = await _unitOfWork.EmployeeAddresses.GetByEmployeeIdAsync(employeeId, ct);
            foreach (var addr in existingAddresses)
                _unitOfWork.EmployeeAddresses.Delete(addr);

            foreach (var addrReq in request.Addresses)
            {
                var newAddr = EmployeeMapper.ToAddressEntity(addrReq, employeeId);
                await _unitOfWork.EmployeeAddresses.AddAsync(newAddr, ct);
            }
        }

        // Replace-all sub-entities: educations
        if (request.Educations != null)
        {
            var existingEducations = await _unitOfWork.EmployeeEducations.GetByEmployeeIdAsync(employeeId, ct);
            foreach (var edu in existingEducations)
                _unitOfWork.EmployeeEducations.Delete(edu);

            foreach (var eduReq in request.Educations)
            {
                var newEdu = EmployeeMapper.ToEducationEntity(eduReq, employeeId);
                await _unitOfWork.EmployeeEducations.AddAsync(newEdu, ct);
            }
        }

        // Replace-all sub-entities: work histories
        if (request.WorkHistories != null)
        {
            var existingWorkHistories = await _unitOfWork.EmployeeWorkHistories.GetByEmployeeIdAsync(employeeId, ct);
            foreach (var wh in existingWorkHistories)
                _unitOfWork.EmployeeWorkHistories.Delete(wh);

            foreach (var whReq in request.WorkHistories)
            {
                var newWh = EmployeeMapper.ToWorkHistoryEntity(whReq, employeeId);
                await _unitOfWork.EmployeeWorkHistories.AddAsync(newWh, ct);
            }
        }

        _unitOfWork.Employees.Update(employee);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Profile updated by Employee {EmployeeId}", employeeId);

        // Reload with details for response
        var updated = await _unitOfWork.Employees.GetByIdWithDetailsAsync(employeeId, ct);
        return EmployeeMapper.ToResponse(updated!);
    }

    public async Task<bool> CheckDuplicateAsync(string field, string value, int? excludeEmployeeId = null, CancellationToken ct = default)
    {
        return field.ToLower() switch
        {
            "nationalid" => await _unitOfWork.Employees.IsNationalIdExistsAsync(value, excludeEmployeeId, ct),
            "email" => await _unitOfWork.Employees.IsEmailExistsAsync(value, excludeEmployeeId, ct),
            _ => throw new ValidationException($"Invalid field '{field}'. Supported: nationalId, email")
        };
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

        // Save nested collections
        await SaveNestedCollectionsAsync(employee.EmployeeId, request.Addresses, request.Educations, request.WorkHistories, ct);

        _logger.LogInformation("Employee created: {EmployeeId} - {FirstNameThai} {LastNameThai}", employee.EmployeeId, employee.FirstNameThai, employee.LastNameThai);

        var created = await _unitOfWork.Employees.GetByIdWithDetailsAsync(employee.EmployeeId, ct);
        return EmployeeMapper.ToResponse(created!);
    }

    public async Task<EmployeeResponseModel> UpdateEmployeeAsync(int employeeId, UpdateEmployeeRequestModel request, int? newImageFileId = null, CancellationToken ct = default)
    {
        var employee = await _unitOfWork.Employees.GetByIdAsync(employeeId, ct)
            ?? throw new EntityNotFoundException("Employee", employeeId);

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

        if (request.RemoveImage && employee.ImageFileId.HasValue)
        {
            var oldFile = await _unitOfWork.Files.GetByIdAsync(employee.ImageFileId.Value, ct);
            if (oldFile != null)
                oldFile.DeleteFlag = true;

            employee.ImageFileId = null;
        }
        else if (newImageFileId.HasValue)
        {
            if (employee.ImageFileId.HasValue && employee.ImageFileId != newImageFileId)
            {
                var oldFile = await _unitOfWork.Files.GetByIdAsync(employee.ImageFileId.Value, ct);
                if (oldFile != null)
                    oldFile.DeleteFlag = true;
            }

            employee.ImageFileId = newImageFileId;
        }

        EmployeeMapper.UpdateEntity(employee, request);

        _unitOfWork.Employees.Update(employee);
        await _unitOfWork.CommitAsync(ct);

        // Replace-all nested collections
        await ReplaceNestedCollectionsAsync(employeeId, request.Addresses, request.Educations, request.WorkHistories, ct);

        _logger.LogInformation("Employee updated: {EmployeeId}", employeeId);

        var updated = await _unitOfWork.Employees.GetByIdWithDetailsAsync(employeeId, ct);
        return EmployeeMapper.ToResponse(updated!);
    }

    public async Task DeleteEmployeeAsync(int employeeId, CancellationToken ct = default)
    {
        var employee = await _unitOfWork.Employees.GetByIdAsync(employeeId, ct)
            ?? throw new EntityNotFoundException("Employee", employeeId);

        if (employee.UserId.HasValue)
        {
            employee.DeleteFlag = true;
            await _unitOfWork.CommitAsync(ct);
            _logger.LogInformation("Employee soft deleted: {EmployeeId}", employeeId);
        }
        else
        {
            var addresses = await _unitOfWork.EmployeeAddresses.GetByEmployeeIdAsync(employeeId, ct);
            foreach (var addr in addresses)
                _unitOfWork.EmployeeAddresses.Delete(addr);

            var educations = await _unitOfWork.EmployeeEducations.GetByEmployeeIdAsync(employeeId, ct);
            foreach (var edu in educations)
                _unitOfWork.EmployeeEducations.Delete(edu);

            var workHistories = await _unitOfWork.EmployeeWorkHistories.GetByEmployeeIdAsync(employeeId, ct);
            foreach (var wh in workHistories)
                _unitOfWork.EmployeeWorkHistories.Delete(wh);

            _unitOfWork.Employees.Delete(employee);
            await _unitOfWork.CommitAsync(ct);
            _logger.LogInformation("Employee hard deleted: {EmployeeId}", employeeId);
        }
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
        var employeeName = $"{employee.FirstNameThai} {employee.LastNameThai}";

        // ส่งอีเมลก่อน — ถ้าส่งไม่ได้จะไม่สร้าง user
        var emailHtml = BuildCredentialEmailHtml(employeeName, employee.Email, plainPassword);
        var emailSent = await _emailService.SendEmailAsync(
            employee.Email,
            employeeName,
            "RBMS POS - บัญชีผู้ใช้ของคุณพร้อมใช้งานแล้ว",
            emailHtml,
            ct);

        if (!emailSent)
            throw new BusinessException("ไม่สามารถส่งอีเมลได้ กรุณาตรวจสอบการตั้งค่า SMTP");

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

        return new CreateUserAccountResponseModel
        {
            UserId = user.UserId,
            Username = user.Username,
            Password = plainPassword,
            EmployeeName = employeeName,
            EmailSent = true
        };
    }

    // === Address CRUD ===
    public async Task<EmployeeAddressResponseModel> CreateAddressAsync(int employeeId, CreateEmployeeAddressRequestModel request, CancellationToken ct = default)
    {
        await EnsureEmployeeExistsAsync(employeeId, ct);

        var address = EmployeeMapper.ToAddressEntity(request, employeeId);
        await _unitOfWork.EmployeeAddresses.AddAsync(address, ct);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Address created for Employee {EmployeeId}: {AddressId}", employeeId, address.AddressId);
        return EmployeeMapper.ToAddressResponse(address);
    }

    public async Task<EmployeeAddressResponseModel> UpdateAddressAsync(int employeeId, int addressId, UpdateEmployeeAddressRequestModel request, CancellationToken ct = default)
    {
        var address = await GetAddressOrThrowAsync(employeeId, addressId, ct);

        EmployeeMapper.UpdateAddressEntity(address, request);
        _unitOfWork.EmployeeAddresses.Update(address);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Address updated: {AddressId} for Employee {EmployeeId}", addressId, employeeId);
        return EmployeeMapper.ToAddressResponse(address);
    }

    public async Task DeleteAddressAsync(int employeeId, int addressId, CancellationToken ct = default)
    {
        var address = await GetAddressOrThrowAsync(employeeId, addressId, ct);

        _unitOfWork.EmployeeAddresses.Delete(address);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Address hard deleted: {AddressId} for Employee {EmployeeId}", addressId, employeeId);
    }

    // === Education CRUD ===
    public async Task<EmployeeEducationResponseModel> CreateEducationAsync(int employeeId, CreateEmployeeEducationRequestModel request, CancellationToken ct = default)
    {
        await EnsureEmployeeExistsAsync(employeeId, ct);

        var education = EmployeeMapper.ToEducationEntity(request, employeeId);
        await _unitOfWork.EmployeeEducations.AddAsync(education, ct);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Education created for Employee {EmployeeId}: {EducationId}", employeeId, education.EducationId);
        return EmployeeMapper.ToEducationResponse(education);
    }

    public async Task<EmployeeEducationResponseModel> UpdateEducationAsync(int employeeId, int educationId, UpdateEmployeeEducationRequestModel request, CancellationToken ct = default)
    {
        var education = await GetEducationOrThrowAsync(employeeId, educationId, ct);

        EmployeeMapper.UpdateEducationEntity(education, request);
        _unitOfWork.EmployeeEducations.Update(education);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Education updated: {EducationId} for Employee {EmployeeId}", educationId, employeeId);
        return EmployeeMapper.ToEducationResponse(education);
    }

    public async Task DeleteEducationAsync(int employeeId, int educationId, CancellationToken ct = default)
    {
        var education = await GetEducationOrThrowAsync(employeeId, educationId, ct);

        _unitOfWork.EmployeeEducations.Delete(education);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Education hard deleted: {EducationId} for Employee {EmployeeId}", educationId, employeeId);
    }

    // === Work History CRUD ===
    public async Task<EmployeeWorkHistoryResponseModel> CreateWorkHistoryAsync(int employeeId, CreateEmployeeWorkHistoryRequestModel request, CancellationToken ct = default)
    {
        await EnsureEmployeeExistsAsync(employeeId, ct);

        var workHistory = EmployeeMapper.ToWorkHistoryEntity(request, employeeId);
        await _unitOfWork.EmployeeWorkHistories.AddAsync(workHistory, ct);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("WorkHistory created for Employee {EmployeeId}: {WorkHistoryId}", employeeId, workHistory.WorkHistoryId);
        return EmployeeMapper.ToWorkHistoryResponse(workHistory);
    }

    public async Task<EmployeeWorkHistoryResponseModel> UpdateWorkHistoryAsync(int employeeId, int workHistoryId, UpdateEmployeeWorkHistoryRequestModel request, CancellationToken ct = default)
    {
        var workHistory = await GetWorkHistoryOrThrowAsync(employeeId, workHistoryId, ct);

        EmployeeMapper.UpdateWorkHistoryEntity(workHistory, request);
        _unitOfWork.EmployeeWorkHistories.Update(workHistory);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("WorkHistory updated: {WorkHistoryId} for Employee {EmployeeId}", workHistoryId, employeeId);
        return EmployeeMapper.ToWorkHistoryResponse(workHistory);
    }

    public async Task DeleteWorkHistoryAsync(int employeeId, int workHistoryId, CancellationToken ct = default)
    {
        var workHistory = await GetWorkHistoryOrThrowAsync(employeeId, workHistoryId, ct);

        _unitOfWork.EmployeeWorkHistories.Delete(workHistory);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("WorkHistory hard deleted: {WorkHistoryId} for Employee {EmployeeId}", workHistoryId, employeeId);
    }

    // === Nested collection helpers ===
    private async Task SaveNestedCollectionsAsync(
        int employeeId,
        List<CreateEmployeeAddressRequestModel>? addresses,
        List<CreateEmployeeEducationRequestModel>? educations,
        List<CreateEmployeeWorkHistoryRequestModel>? workHistories,
        CancellationToken ct)
    {
        var hasData = (addresses?.Count > 0) || (educations?.Count > 0) || (workHistories?.Count > 0);
        if (!hasData) return;

        if (addresses != null)
            foreach (var req in addresses)
                await _unitOfWork.EmployeeAddresses.AddAsync(EmployeeMapper.ToAddressEntity(req, employeeId), ct);

        if (educations != null)
            foreach (var req in educations)
                await _unitOfWork.EmployeeEducations.AddAsync(EmployeeMapper.ToEducationEntity(req, employeeId), ct);

        if (workHistories != null)
            foreach (var req in workHistories)
                await _unitOfWork.EmployeeWorkHistories.AddAsync(EmployeeMapper.ToWorkHistoryEntity(req, employeeId), ct);

        await _unitOfWork.CommitAsync(ct);
    }

    private async Task ReplaceNestedCollectionsAsync(
        int employeeId,
        List<CreateEmployeeAddressRequestModel>? addresses,
        List<CreateEmployeeEducationRequestModel>? educations,
        List<CreateEmployeeWorkHistoryRequestModel>? workHistories,
        CancellationToken ct)
    {
        if (addresses != null)
        {
            var existing = await _unitOfWork.EmployeeAddresses.GetByEmployeeIdAsync(employeeId, ct);
            foreach (var item in existing) _unitOfWork.EmployeeAddresses.Delete(item);
            foreach (var req in addresses)
                await _unitOfWork.EmployeeAddresses.AddAsync(EmployeeMapper.ToAddressEntity(req, employeeId), ct);
        }

        if (educations != null)
        {
            var existing = await _unitOfWork.EmployeeEducations.GetByEmployeeIdAsync(employeeId, ct);
            foreach (var item in existing) _unitOfWork.EmployeeEducations.Delete(item);
            foreach (var req in educations)
                await _unitOfWork.EmployeeEducations.AddAsync(EmployeeMapper.ToEducationEntity(req, employeeId), ct);
        }

        if (workHistories != null)
        {
            var existing = await _unitOfWork.EmployeeWorkHistories.GetByEmployeeIdAsync(employeeId, ct);
            foreach (var item in existing) _unitOfWork.EmployeeWorkHistories.Delete(item);
            foreach (var req in workHistories)
                await _unitOfWork.EmployeeWorkHistories.AddAsync(EmployeeMapper.ToWorkHistoryEntity(req, employeeId), ct);
        }

        if (addresses != null || educations != null || workHistories != null)
            await _unitOfWork.CommitAsync(ct);
    }

    // === Private helpers ===
    private async Task EnsureEmployeeExistsAsync(int employeeId, CancellationToken ct)
    {
        var exists = await _unitOfWork.Employees.ExistsAsync(e => e.EmployeeId == employeeId, ct);
        if (!exists)
            throw new EntityNotFoundException("Employee", employeeId);
    }

    private async Task<TbEmployeeAddress> GetAddressOrThrowAsync(int employeeId, int addressId, CancellationToken ct)
    {
        var address = await _unitOfWork.EmployeeAddresses.FirstOrDefaultAsync(
            a => a.AddressId == addressId && a.EmployeeId == employeeId, ct)
            ?? throw new EntityNotFoundException("EmployeeAddress", addressId);
        return address;
    }

    private async Task<TbEmployeeEducation> GetEducationOrThrowAsync(int employeeId, int educationId, CancellationToken ct)
    {
        var education = await _unitOfWork.EmployeeEducations.FirstOrDefaultAsync(
            e => e.EducationId == educationId && e.EmployeeId == employeeId, ct)
            ?? throw new EntityNotFoundException("EmployeeEducation", educationId);
        return education;
    }

    private async Task<TbEmployeeWorkHistory> GetWorkHistoryOrThrowAsync(int employeeId, int workHistoryId, CancellationToken ct)
    {
        var workHistory = await _unitOfWork.EmployeeWorkHistories.FirstOrDefaultAsync(
            w => w.WorkHistoryId == workHistoryId && w.EmployeeId == employeeId, ct)
            ?? throw new EntityNotFoundException("EmployeeWorkHistory", workHistoryId);
        return workHistory;
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
        <!DOCTYPE html>
        <html lang="th">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta name="color-scheme" content="light only">
            <meta name="supported-color-schemes" content="light only">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Sarabun', 'Segoe UI', Arial, sans-serif; -webkit-text-size-adjust: 100%;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9;">
                <tr>
                    <td align="center" style="padding: 24px 12px;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
                            <!-- Header -->
                            <tr>
                                <td style="background-color: #ea580c; padding: 24px 20px; text-align: center;">
                                    <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 4px 0; font-weight: 800;">RBMS POS</h1>
                                    <p style="color: #ffffff; font-size: 14px; margin: 0; opacity: 0.85;">ระบบจัดการร้านอาหาร</p>
                                </td>
                            </tr>
                            <!-- Body -->
                            <tr>
                                <td style="padding: 20px;">
                                    <p style="color: #334155; font-size: 15px; margin: 0 0 6px 0;">สวัสดี <strong>{name}</strong>,</p>
                                    <p style="color: #64748b; font-size: 13px; margin: 0 0 16px 0; line-height: 1.5;">บัญชีผู้ใช้ของคุณถูกสร้างเรียบร้อยแล้ว กรุณาใช้ข้อมูลด้านล่างเพื่อเข้าสู่ระบบ POS</p>

                                    <!-- Credentials -->
                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff7ed; border-radius: 8px; border-left: 4px solid #f97316; margin-bottom: 12px;">
                                        <tr>
                                            <td style="padding: 12px 14px; border-bottom: 1px solid #fed7aa;">
                                                <div style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Username</div>
                                                <div style="color: #ea580c; font-size: 15px; font-weight: 600; margin-top: 3px; word-break: break-all;">{username}</div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 12px 14px;">
                                                <div style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Password</div>
                                                <div style="color: #334155; font-size: 16px; font-weight: 700; font-family: 'Courier New', monospace; letter-spacing: 2px; margin-top: 3px;">{password}</div>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Warning -->
                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff1f2; border-radius: 8px;">
                                        <tr>
                                            <td style="padding: 10px 14px; text-align: center;">
                                                <p style="color: #e11d48; font-size: 12px; font-weight: 600; margin: 0;">กรุณาเปลี่ยนรหัสผ่านหลังเข้าสู่ระบบครั้งแรก</p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #f8fafc; padding: 14px 20px; border-top: 1px solid #e2e8f0; text-align: center;">
                                    <p style="color: #94a3b8; font-size: 11px; margin: 0;">อีเมลนี้ส่งอัตโนมัติจากระบบ RBMS POS</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """;
    }
}
