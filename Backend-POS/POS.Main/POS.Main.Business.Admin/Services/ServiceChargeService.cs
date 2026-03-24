using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using POS.Main.Business.Admin.Models.AdminSettings;
using POS.Main.Core.Exceptions;
using POS.Main.Core.Models;
using POS.Main.Repositories.UnitOfWork;

namespace POS.Main.Business.Admin.Services;

public class ServiceChargeService : IServiceChargeService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ServiceChargeService> _logger;

    public ServiceChargeService(IUnitOfWork unitOfWork, ILogger<ServiceChargeService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<PaginationResult<ServiceChargeResponseModel>> GetAllServiceChargesAsync(PaginationModel param, bool? isActive = null, CancellationToken ct = default)
    {
        var query = _unitOfWork.ServiceCharges.QueryNoTracking()
            .Include(sc => sc.CreatedByEmployee)
            .Include(sc => sc.UpdatedByEmployee)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(param.Search))
        {
            var term = param.Search.Trim().ToLower();
            query = query.Where(sc => sc.Name.ToLower().Contains(term));
        }

        if (isActive.HasValue)
            query = query.Where(sc => sc.IsActive == isActive.Value);

        var total = await query.CountAsync(ct);

        var items = await query
            .OrderBy(sc => sc.Name)
            .Skip(param.Skip)
            .Take(param.Take)
            .ToListAsync(ct);

        return new PaginationResult<ServiceChargeResponseModel>
        {
            Results = items.Select(ServiceChargeMapper.ToResponse).ToList(),
            Page = param.Page,
            Total = total,
            ItemPerPage = param.ItemPerPage
        };
    }

    public async Task<ServiceChargeResponseModel> GetServiceChargeByIdAsync(int serviceChargeId, CancellationToken ct = default)
    {
        var serviceCharge = await _unitOfWork.ServiceCharges.GetByIdAsync(serviceChargeId, ct);

        if (serviceCharge == null)
            throw new EntityNotFoundException("ServiceCharge", serviceChargeId);

        return ServiceChargeMapper.ToResponse(serviceCharge);
    }

    public async Task<IEnumerable<ServiceChargeDropdownModel>> GetServiceChargeDropdownListAsync(CancellationToken ct = default)
    {
        var serviceCharges = await _unitOfWork.ServiceCharges.GetActiveInDateRangeForDropdownAsync(ct);
        return serviceCharges.Select(ServiceChargeMapper.ToDropdown);
    }

    public async Task<ServiceChargeResponseModel> CreateServiceChargeAsync(CreateServiceChargeRequestModel request, CancellationToken ct = default)
    {
        var nameExists = await _unitOfWork.ServiceCharges.IsNameExistsAsync(request.Name, ct: ct);
        if (nameExists)
            throw new ValidationException($"Service charge with name '{request.Name}' already exists");

        ValidateDateRange(request.StartDate, request.EndDate);

        var serviceCharge = ServiceChargeMapper.ToEntity(request);

        await _unitOfWork.ServiceCharges.AddAsync(serviceCharge, ct);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("ServiceCharge created: {ServiceChargeId} - {Name}", serviceCharge.ServiceChargeId, serviceCharge.Name);

        return ServiceChargeMapper.ToResponse(serviceCharge);
    }

    public async Task<ServiceChargeResponseModel> UpdateServiceChargeAsync(int serviceChargeId, UpdateServiceChargeRequestModel request, CancellationToken ct = default)
    {
        var serviceCharge = await _unitOfWork.ServiceCharges.GetByIdAsync(serviceChargeId, ct);

        if (serviceCharge == null)
            throw new EntityNotFoundException("ServiceCharge", serviceChargeId);

        var nameExists = await _unitOfWork.ServiceCharges.IsNameExistsAsync(request.Name, serviceChargeId, ct);
        if (nameExists)
            throw new ValidationException($"Service charge with name '{request.Name}' already exists");

        ValidateDateRange(request.StartDate, request.EndDate);

        ServiceChargeMapper.UpdateEntity(serviceCharge, request);

        _unitOfWork.ServiceCharges.Update(serviceCharge);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("ServiceCharge updated: {ServiceChargeId}", serviceChargeId);

        return ServiceChargeMapper.ToResponse(serviceCharge);
    }

    public async Task DeleteServiceChargeAsync(int serviceChargeId, CancellationToken ct = default)
    {
        var serviceCharge = await _unitOfWork.ServiceCharges.GetByIdAsync(serviceChargeId, ct)
            ?? throw new EntityNotFoundException("ServiceCharge", serviceChargeId);

        _unitOfWork.ServiceCharges.Delete(serviceCharge);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("ServiceCharge permanently deleted: {ServiceChargeId}", serviceChargeId);
    }

    private static void ValidateDateRange(DateTime? startDate, DateTime? endDate)
    {
        if (startDate.HasValue && endDate.HasValue && endDate.Value < startDate.Value)
            throw new ValidationException("วันที่สิ้นสุดต้องมากกว่าหรือเท่ากับวันที่เริ่มต้น");
    }
}
