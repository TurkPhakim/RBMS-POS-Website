using POS.Main.Business.Table.Models.Zone;
using POS.Main.Core.Models;

namespace POS.Main.Business.Table.Interfaces;

public interface IZoneService
{
    Task<PaginationResult<ZoneResponseModel>> GetZonesAsync(PaginationModel param, CancellationToken ct = default);

    Task<ZoneResponseModel> GetZoneByIdAsync(int zoneId, CancellationToken ct = default);

    Task<ZoneResponseModel> CreateZoneAsync(CreateZoneRequestModel request, CancellationToken ct = default);

    Task<ZoneResponseModel> UpdateZoneAsync(int zoneId, UpdateZoneRequestModel request, CancellationToken ct = default);

    Task DeleteZoneAsync(int zoneId, CancellationToken ct = default);

    Task UpdateSortOrderAsync(UpdateZoneSortOrderRequestModel request, CancellationToken ct = default);

    Task<List<ZoneResponseModel>> GetActiveZonesAsync(CancellationToken ct = default);
}
