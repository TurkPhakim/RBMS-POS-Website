using Microsoft.Extensions.Logging;
using POS.Main.Business.Admin.Models.AdminSettings;
using POS.Main.Core.Exceptions;
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

    public async Task<IEnumerable<ServiceChargeResponseModel>> GetAllServiceChargesAsync(CancellationToken ct = default)
    {
        var serviceCharges = await _unitOfWork.ServiceCharges.GetAllActiveAsync(ct);
        return serviceCharges.Select(ServiceChargeMapper.ToResponse);
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
        var serviceCharges = await _unitOfWork.ServiceCharges.GetActiveForDropdownAsync(ct);
        return serviceCharges.Select(ServiceChargeMapper.ToDropdown);
    }

    public async Task<ServiceChargeResponseModel> CreateServiceChargeAsync(CreateServiceChargeRequestModel request, CancellationToken ct = default)
    {
        var nameExists = await _unitOfWork.ServiceCharges.IsNameExistsAsync(request.Name, ct: ct);
        if (nameExists)
            throw new ValidationException($"Service charge with name '{request.Name}' already exists");

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

        serviceCharge.DeleteFlag = true;
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("ServiceCharge deleted: {ServiceChargeId}", serviceChargeId);
    }
}
